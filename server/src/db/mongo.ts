import mongoose from 'mongoose';
import { config } from '../config';

/**
 * Opens the Mongoose connection to MongoDB.
 * Purpose: establish the persistent database connection at server startup so
 * all Mongoose models are ready before the HTTP server begins accepting requests.
 */
export async function connectMongo(): Promise<void> {
  await mongoose.connect(config.mongoUri);
  console.log('[mongo] connected:', config.mongoUri);
}

/**
 * Gracefully closes the Mongoose connection.
 * Purpose: used during testing and clean shutdown to release the DB connection
 * without leaving dangling handles that would prevent the process from exiting.
 */
export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}
