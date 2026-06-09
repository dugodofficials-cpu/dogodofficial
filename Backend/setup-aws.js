const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '.env.development');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupAWS() {
  console.log('🔑 AWS Credentials Setup\n');
  
  const accessKeyId = await question('Enter your AWS Access Key ID: ');
  const secretAccessKey = await question('Enter your AWS Secret Access Key: ');
  const region = await question('Enter AWS Region (press Enter for eu-north-1): ') || 'eu-north-1';
  
  rl.close();
  
  // Read existing .env.development
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Update or add AWS credentials
  const lines = envContent.split('\n');
  const updatedLines = [];
  let foundAccessKey = false;
  let foundSecretKey = false;
  let foundRegion = false;
  
  for (const line of lines) {
    if (line.startsWith('AWS_ACCESS_KEY_ID=')) {
      updatedLines.push(`AWS_ACCESS_KEY_ID=${accessKeyId}`);
      foundAccessKey = true;
    } else if (line.startsWith('AWS_SECRET_ACCESS_KEY=')) {
      updatedLines.push(`AWS_SECRET_ACCESS_KEY=${secretAccessKey}`);
      foundSecretKey = true;
    } else if (line.startsWith('AWS_REGION=')) {
      updatedLines.push(`AWS_REGION=${region}`);
      foundRegion = true;
    } else {
      updatedLines.push(line);
    }
  }
  
  // Add missing variables
  if (!foundAccessKey) {
    updatedLines.push(`AWS_ACCESS_KEY_ID=${accessKeyId}`);
  }
  if (!foundSecretKey) {
    updatedLines.push(`AWS_SECRET_ACCESS_KEY=${secretAccessKey}`);
  }
  if (!foundRegion) {
    updatedLines.push(`AWS_REGION=${region}`);
  }
  
  // Write back
  fs.writeFileSync(envPath, updatedLines.join('\n'));
  console.log('\n✅ AWS credentials saved to .env.development');
  console.log('🔄 Testing connection...\n');
  
  // Test the connection
  const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
  require('dotenv').config({ path: envPath });
  
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  
  try {
    const result = await s3Client.send(new ListBucketsCommand({}));
    console.log('✅ AWS S3 connected successfully!');
    console.log('📁 Your buckets:');
    result.Buckets.forEach(bucket => {
      console.log(`  - ${bucket.Name}`);
    });
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
  }
}

setupAWS();
