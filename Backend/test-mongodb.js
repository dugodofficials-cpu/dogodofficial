const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.development' });

const uri = process.env.MONGODB_URI;

async function testMongoDB() {
  try {
    if (!uri) {
      throw new Error('MONGODB_URI is not set');
    }

    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(uri);
    
    console.log('✅ MongoDB connection successful!');
    
    // Test database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📁 Found ${collections.length} collections`);
    
    // Create a test document
    const testCollection = db.collection('test');
    await testCollection.insertOne({ message: 'DuGod platform test', timestamp: new Date() });
    console.log('✅ Test document created successfully!');
    
    // Clean up
    await testCollection.deleteMany({});
    console.log('🧹 Test data cleaned up');
    
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
}

testMongoDB();
