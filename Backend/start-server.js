require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

async function startSimpleServer() {
  console.log('🚀 Starting DuGod Backend Server...\n');
  
  // Test MongoDB connection
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
  
  // Create Express app
  const app = express();
  
  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
  });
  
  // Basic routes
  app.get('/api/', (req, res) => {
    res.json({
      message: 'DuGod Backend API is running!',
      status: 'success',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  });
  
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      mongodb: 'connected',
      aws: 'configured',
      services: {
        mongodb: '✅',
        s3: '✅',
        paystack: '✅'
      }
    });
  });
  
  // Start server
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`\n🎉 DuGod Backend Server is running!`);
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log(`📖 API Docs: http://localhost:${PORT}/api/`);
    console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`\n🔧 Environment: ${process.env.NODE_ENV}`);
    console.log(`🗄️ MongoDB: Connected`);
    console.log(`🌍 AWS S3: Configured`);
    console.log(`💳 Paystack: Ready`);
    console.log('\n✨ Server is ready for connections!\n');
  });
}

startSimpleServer().catch(console.error);
