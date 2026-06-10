import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

async function printActiveCountdown() {
  const uri = process.env.MONGODB_URI || '';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const countdown = await db.collection('countdowns').findOne(
      { isActive: true, status: 'active' },
      { sort: { createdAt: -1 } }
    );
    console.log('Active Countdown:', countdown);
  } catch (error) {
    console.error('Error fetching active countdown:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

printActiveCountdown();