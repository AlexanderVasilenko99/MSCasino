import mongoose from 'mongoose';
import { config } from '../config';

export async function connectMongo(): Promise<void> {
  await mongoose.connect(config.mongoUri);
  console.log('[mongo] connected:', config.mongoUri);
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}
