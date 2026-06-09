import mongoose from 'mongoose';
import dotenv from 'dotenv';
import countdownModel from '../modules/countdown/countdown.model';

dotenv.config({ path: '.env.development' });

async function printActiveCountdown() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);

    const activeCountdown = await countdownModel.findOne({ isActive: true, status: 'active' }).sort({ createdAt: -1 });
    console.log('Active Countdown:', activeCountdown);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error fetching active countdown:', error);
    process.exit(1);
  }
}

printActiveCountdown();
