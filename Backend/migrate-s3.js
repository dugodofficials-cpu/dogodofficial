/**
 * S3 Migration Guide & Script
 * 
 * This script helps migrate S3 buckets from an old AWS account to a new one.
 * It copies all objects from the old buckets to the new buckets while preserving
 * the folder structure and metadata.
 */

const { S3Client, ListObjectsV2Command, GetObjectCommand, HeadBucketCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const dotenvPath = `.env.${process.env.NODE_ENV || 'development'}`;
require('dotenv').config({ path: dotenvPath });

const oldCredentials = {
  accessKeyId: process.env.OLD_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.OLD_AWS_SECRET_ACCESS_KEY,
  region: process.env.OLD_AWS_REGION || process.env.AWS_REGION || 'eu-north-1',
};

const newCredentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'eu-north-1',
};

// OLD ACCOUNT (source)
const oldS3 = new S3Client({
  region: oldCredentials.region,
  credentials: {
    accessKeyId: oldCredentials.accessKeyId,
    secretAccessKey: oldCredentials.secretAccessKey,
  },
});

const newS3 = new S3Client({
  region: newCredentials.region,
  credentials: {
    accessKeyId: newCredentials.accessKeyId,
    secretAccessKey: newCredentials.secretAccessKey,
  },
});

// Bucket names
const oldBuckets = {
  media: process.env.OLD_AWS_S3_BUCKET,
  public: process.env.OLD_AWS_S3_PUBLIC_BUCKET,
};

const newBuckets = {
  media: process.env.AWS_S3_BUCKET,
  public: process.env.AWS_S3_PUBLIC_BUCKET,
};

// Progress tracking
let totalFiles = 0;
let processedFiles = 0;
let copiedFiles = 0;
let skippedFiles = 0;
let failedFiles = [];
const COPY_TIMEOUT_MS = 15 * 60 * 1000;
const skipTokens = (process.env.S3_MIGRATION_SKIP_KEYS || '')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

function shouldSkip(key) {
  if (skipTokens.length === 0) {
    return false;
  }
  const normalizedKey = key.toLowerCase();
  return skipTokens.some((token) => normalizedKey.includes(token));
}

function logProgress() {
  const percent = totalFiles === 0 ? 100 : (processedFiles / totalFiles) * 100;
  process.stdout.write(
    `\rProgress: ${processedFiles}/${totalFiles} processed (${percent.toFixed(1)}%) | copied: ${copiedFiles}, skipped: ${skippedFiles}, failed: ${failedFiles.length}`
  );
}

/**
 * List all objects in a bucket
 */
async function listAllObjects(s3Client, bucketName) {
  const objects = [];
  let continuationToken = null;
  
  do {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      ContinuationToken: continuationToken,
    });
    
    const response = await s3Client.send(command);
    objects.push(...(response.Contents || []));
    continuationToken = response.NextContinuationToken;
  } while (continuationToken);
  
  return objects;
}

/**
 * Copy a single object from old to new bucket
 */
async function copyObject(oldKey, sourceBucket, destBucket) {
  try {
    if (shouldSkip(oldKey)) {
      skippedFiles++;
      console.log(`\n⏭️ Skipping ${sourceBucket}/${oldKey} (matched skip token)`);
      return;
    }

    try {
      await newS3.send(new HeadObjectCommand({ Bucket: destBucket, Key: oldKey }));
      skippedFiles++;
      console.log(`\n⏭️ Skipping ${destBucket}/${oldKey} (already copied)`);
      return;
    } catch (error) {
      const statusCode = error?.$metadata?.httpStatusCode;
      if (statusCode && statusCode !== 404) {
        throw error;
      }
    }

    console.log(`\n➡️ Copying ${sourceBucket}/${oldKey}`);
    // Get object from old bucket
    const getCommand = new GetObjectCommand({
      Bucket: sourceBucket,
      Key: oldKey,
    });
    
    const response = await oldS3.send(getCommand);
    if (!response.Body) {
      throw new Error('Empty response body from S3');
    }
    
    const upload = new Upload({
      client: newS3,
      params: {
        Bucket: destBucket,
        Key: oldKey,
        Body: response.Body,
        ContentType: response.ContentType,
        CacheControl: response.CacheControl,
        Metadata: response.Metadata,
      },
      queueSize: 4,
      partSize: 10 * 1024 * 1024,
      leavePartsOnError: false,
    });
    
    const uploadPromise = upload.done();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Upload timeout after 15 minutes')), COPY_TIMEOUT_MS);
    });
    
    await Promise.race([uploadPromise, timeoutPromise]);
    copiedFiles++;
  } catch (error) {
    failedFiles.push({ key: oldKey, error: error.message });
    console.error(`\n❌ Failed to copy ${oldKey}:`, error.message);
  } finally {
    processedFiles++;
    logProgress();
  }
}

/**
 * Check if bucket exists and is accessible
 */
async function checkBucketAccess(s3Client, bucketName, label) {
  try {
    const command = new HeadBucketCommand({ Bucket: bucketName });
    await s3Client.send(command);
    console.log(`✅ ${label} bucket '${bucketName}' is accessible`);
    return true;
  } catch (error) {
    console.error(`❌ ${label} bucket '${bucketName}' error:`, error.message);
    return false;
  }
}

/**
 * Main migration function
 */
async function migrateBuckets() {
  console.log('🚀 Starting S3 migration...\n');

  const required = [
    ['OLD_AWS_ACCESS_KEY_ID', oldCredentials.accessKeyId],
    ['OLD_AWS_SECRET_ACCESS_KEY', oldCredentials.secretAccessKey],
    ['OLD_AWS_S3_BUCKET', oldBuckets.media],
    ['OLD_AWS_S3_PUBLIC_BUCKET', oldBuckets.public],
    ['AWS_ACCESS_KEY_ID', newCredentials.accessKeyId],
    ['AWS_SECRET_ACCESS_KEY', newCredentials.secretAccessKey],
    ['AWS_S3_BUCKET', newBuckets.media],
    ['AWS_S3_PUBLIC_BUCKET', newBuckets.public],
  ];

  const missing = required.filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) {
    console.error(`❌ Missing required env vars: ${missing.join(', ')}`);
    console.error('Add these to your .env.development (or export them in your shell) and retry.');
    process.exit(1);
  }

  // Check access to all buckets
  console.log('🔍 Checking bucket access...');
  const oldMediaOk = await checkBucketAccess(oldS3, oldBuckets.media, 'Old media');
  const oldPublicOk = await checkBucketAccess(oldS3, oldBuckets.public, 'Old public');
  const newMediaOk = await checkBucketAccess(newS3, newBuckets.media, 'New media');
  const newPublicOk = await checkBucketAccess(newS3, newBuckets.public, 'New public');

  if (!oldMediaOk || !oldPublicOk) {
    console.error('\n❌ Cannot access old buckets. Check credentials.');
    process.exit(1);
  }

  if (!newMediaOk || !newPublicOk) {
    console.error('\n❌ Cannot access new buckets. Create them first or check credentials.');
    process.exit(1);
  }

  // Count total files
  console.log('\n📊 Counting files to copy...');
  const mediaObjects = await listAllObjects(oldS3, oldBuckets.media);
  const publicObjects = await listAllObjects(oldS3, oldBuckets.public);
  totalFiles = mediaObjects.length + publicObjects.length;
  
  console.log(`Found ${mediaObjects.length} files in media bucket`);
  console.log(`Found ${publicObjects.length} files in public bucket`);
  console.log(`Total: ${totalFiles} files to copy\n`);

  if (totalFiles === 0) {
    console.log('✅ No files to copy. Migration complete!');
    return;
  }

  // Copy files
  console.log('📦 Starting file copy...');
  
  // Copy media files
  for (const object of mediaObjects) {
    await copyObject(object.Key, oldBuckets.media, newBuckets.media);
  }
  
  // Copy public files
  for (const object of publicObjects) {
    await copyObject(object.Key, oldBuckets.public, newBuckets.public);
  }

  console.log('\n\n🎉 Migration completed!');
  console.log(`✅ Successfully copied: ${copiedFiles} files`);
  
  if (failedFiles.length > 0) {
    console.log(`❌ Failed to copy: ${failedFiles.length} files`);
    console.log('Failed files:', failedFiles);
  }
}

/**
 * Generate updated .env file
 */
function generateEnvFile() {
  const envContent = `
# Updated AWS credentials for new account
AWS_ACCESS_KEY_ID=${newCredentials.accessKeyId}
AWS_SECRET_ACCESS_KEY=${newCredentials.secretAccessKey}
AWS_REGION=${newCredentials.region}
AWS_S3_BUCKET=${newBuckets.media}
AWS_S3_PUBLIC_BUCKET=${newBuckets.public}

# Keep other existing env vars below...
`;

  console.log('\n📝 Updated environment variables:');
  console.log(envContent);
  console.log('💡 Save these to your Backend/.env file');
}

// Run migration
if (require.main === module) {
  migrateBuckets()
    .then(() => generateEnvFile())
    .catch(console.error);
}

module.exports = { migrateBuckets, generateEnvFile };
