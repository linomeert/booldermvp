import mongoose from 'mongoose';
import { config } from './config';

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
};
