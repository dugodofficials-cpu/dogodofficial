const { S3Client, ListBucketsCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');

// Load environment variables
require('dotenv').config();

// Test S3 connection
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testS3Buckets() {
  try {
    console.log('🔄 Testing S3 connection...');
    console.log('🔑 Using credentials:', process.env.AWS_ACCESS_KEY_ID?.substring(0, 10) + '...');
    console.log('🌍 Region:', process.env.AWS_REGION);
    
    // List buckets
    const listCommand = new ListBucketsCommand({});
    const buckets = await s3Client.send(listCommand);
    console.log('✅ S3 connected successfully!');
    console.log('📁 Your buckets:');
    buckets.Buckets.forEach(bucket => {
      console.log(`  - ${bucket.Name} (created: ${bucket.CreationDate})`);
    });
    
    // Test access to your specific buckets
    const publicBucket = 'dugod-public';
    const mediaBucket = 'dugod-media';
    
    // Check if buckets exist and are accessible
    for (const bucketName of [publicBucket, mediaBucket]) {
      try {
        const headCommand = new HeadBucketCommand({ Bucket: bucketName });
        await s3Client.send(headCommand);
        console.log(`✅ Bucket '${bucketName}' is accessible`);
      } catch (error) {
        console.log(`❌ Bucket '${bucketName}' error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ S3 connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testS3Buckets();
