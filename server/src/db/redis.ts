import Redis from 'ioredis';
import { config } from '../config';

let client: Redis | null = null;

export function getRedis(): Redis {
  if (!client) {
    client = new Redis(config.redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });

    client.on('connect', () => console.log('[redis] connected'));
    client.on('error', (err) => console.error('[redis] error:', err.message));
  }
  return client;
}

export async function connectRedis(): Promise<void> {
  await getRedis().connect();
}

export async function disconnectRedis(): Promise<void> {
  await getRedis().quit();
  client = null;
}
