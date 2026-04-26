import Redis from 'ioredis';
import { config } from '../config';

let client: Redis | null = null;

/**
 * Returns the singleton Redis client, creating it on first call.
 * Purpose: ensure a single shared connection is reused across the entire
 * server rather than opening a new connection per request. The client is
 * configured with lazyConnect so it does not attempt to connect until
 * connectRedis() is explicitly called at startup.
 */
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

/**
 * Opens the Redis connection at server startup.
 * Purpose: trigger the initial TCP handshake with Redis before the HTTP server
 * starts so the first incoming request never has to wait for the connection.
 */
export async function connectRedis(): Promise<void> {
  await getRedis().connect();
}

/**
 * Gracefully closes the Redis connection.
 * Purpose: used during testing and clean shutdown to send the QUIT command
 * and release the connection, then nulls the singleton so it can be
 * re-initialised if needed.
 */
export async function disconnectRedis(): Promise<void> {
  await getRedis().quit();
  client = null;
}
