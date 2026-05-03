import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });
import app from './app';
import { connectMongo } from './db/mongo';
import { connectRedis } from './db/redis';
import { config } from './config';

async function start(): Promise<void> {
  await connectMongo();
  await connectRedis();

  app.listen(config.port, () => {
    console.log(`[server] listening on http://localhost:${config.port}`);
  });
}

start().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});
