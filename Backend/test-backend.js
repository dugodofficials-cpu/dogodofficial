require('dotenv').config();
const mongoose = require('mongoose');
const { S3Client } = require('@aws-sdk/client-s3');

async function testBackendServices() {
  console.log('🧪 Testing DuGod Backend Services...\n');
  
  // Test 1: MongoDB Connection
  console.log('1. 📊 Testing MongoDB Connection...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');
    await mongoose.connection.close();
  } catch (error) {
    console.log('❌ MongoDB failed:', error.message);
  }
  
  // Test 2: AWS S3 Connection
  console.log('\n2. 🗄️ Testing AWS S3 Connection...');
  try {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    console.log('✅ S3 client created successfully!');
  } catch (error) {
    console.log('❌ S3 failed:', error.message);
  }
  
  // Test 3: Environment Variables
  console.log('\n3. 🔧 Checking Environment Variables...');
  const requiredVars = [
    'MONGODB_URI',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_S3_BUCKET',
    'AWS_S3_PUBLIC_BUCKET',
    'PAYSTACK_SECRET_KEY',
    'PAYSTACK_PUBLIC_KEY'
  ];
  
  let missingVars = [];
  requiredVars.forEach(varName => {
    if (!process.env[varName] || process.env[varName].includes('your-')) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length === 0) {
    console.log('✅ All required environment variables are set!');
  } else {
    console.log('⚠️ Missing or placeholder variables:', missingVars);
  }
  
  console.log('\n🎯 Backend Services Test Complete!');
}

testBackendServices();
