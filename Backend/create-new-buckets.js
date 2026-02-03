/**
 * Create S3 buckets in the new AWS account
 * Run this script first to ensure the target buckets exist
 */

const { S3Client, CreateBucketCommand, PutBucketAclCommand, PutBucketCorsCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

// NEW ACCOUNT credentials - UPDATE THESE
const newCredentials = {
  accessKeyId: 'NEW_AWS_ACCESS_KEY_ID', // <-- REPLACE
  secretAccessKey: 'NEW_AWS_SECRET_ACCESS_KEY', // <-- REPLACE
  region: 'eu-north-1', // <-- UPDATE if different
};

const s3Client = new S3Client({
  region: newCredentials.region,
  credentials: {
    accessKeyId: newCredentials.accessKeyId,
    secretAccessKey: newCredentials.secretAccessKey,
  },
});

// Bucket names
const buckets = {
  media: 'dugod-media', // <-- UPDATE if using different names
  public: 'dugod-public', // <-- UPDATE if using different names
};

// CORS configuration for public bucket
const corsConfig = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'HEAD'],
      AllowedOrigins: ['*'],
      MaxAgeSeconds: 3600,
    },
  ],
};

/**
 * Create a bucket with proper configuration
 */
async function createBucket(bucketName, isPublic = false) {
  try {
    console.log(`🪣 Creating bucket: ${bucketName}`);
    
    // Create bucket
    const createCommand = new CreateBucketCommand({
      Bucket: bucketName,
      CreateBucketConfiguration: newCredentials.region === 'us-east-1' ? undefined : {
        LocationConstraint: newCredentials.region,
      },
    });
    
    await s3Client.send(createCommand);
    console.log(`✅ Bucket '${bucketName}' created successfully`);

    // Set public access if needed
    if (isPublic) {
      // Wait a bit for bucket to be fully created
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set bucket ACL to public-read
      const aclCommand = new PutBucketAclCommand({
        Bucket: bucketName,
        ACL: 'public-read',
      });
      
      await s3Client.send(aclCommand);
      console.log(`🌐 Set '${bucketName}' to public-read`);

      // Set CORS configuration
      const corsCommand = new PutBucketCorsCommand({
        Bucket: bucketName,
        CORSConfiguration: corsConfig,
      });
      
      await s3Client.send(corsCommand);
      console.log(`🔧 Set CORS for '${bucketName}'`);
    }

  } catch (error) {
    if (error.name === 'BucketAlreadyExists' || error.name === 'BucketAlreadyOwnedByYou') {
      console.log(`ℹ️  Bucket '${bucketName}' already exists`);
    } else {
      console.error(`❌ Failed to create bucket '${bucketName}':`, error.message);
      throw error;
    }
  }
}

/**
 * Create all required buckets
 */
async function createAllBuckets() {
  console.log('🚀 Creating S3 buckets in new AWS account...\n');

  await createBucket(buckets.media, false); // Private bucket
  await createBucket(buckets.public, true); // Public bucket

  console.log('\n✅ All buckets created successfully!');
  console.log('\n📝 Bucket configuration:');
  console.log(`- Media bucket: ${buckets.media} (private)`);
  console.log(`- Public bucket: ${buckets.public} (public-read with CORS)`);
}

// Run script
if (require.main === module) {
  createAllBuckets().catch(console.error);
}

module.exports = { createBucket, createAllBuckets };
