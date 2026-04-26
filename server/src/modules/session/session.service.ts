import { v4 as uuidv4 } from 'uuid';
import { getRedis } from '../../db/redis';
import { SessionModel } from './session.model';
import { AppError } from '../../middleware/errorHandler';
import { config } from '../../config';
import { STARTING_CREDITS } from '@casino/shared';

export interface ActiveSession {
  sessionId: string;
  credits: number;
  totalSpins: number;
  createdAt: string;
}

/** Builds the Redis key used to store a session by its ID. */
function sessionKey(sessionId: string): string {
  return `session:${sessionId}`;
}

/**
 * Creates a new anonymous game session and stores it in Redis.
 * Purpose: give a player a fresh slate — 10 starting credits, zero spins,
 * and a UUID that acts as their session token for all subsequent requests.
 * The session expires automatically after the configured TTL (default 24 h).
 */
export async function createSession(): Promise<ActiveSession> {
  const session: ActiveSession = {
    sessionId: uuidv4(),
    credits: STARTING_CREDITS,
    totalSpins: 0,
    createdAt: new Date().toISOString(),
  };

  await getRedis().setex(
    sessionKey(session.sessionId),
    config.sessionTtlSeconds,
    JSON.stringify(session),
  );

  return session;
}

/**
 * Retrieves an active session from Redis by its ID.
 * Purpose: read the current game state for a player before each spin or
 * cash-out. Throws 404 if the session does not exist or has expired.
 */
export async function getSession(sessionId: string): Promise<ActiveSession> {
  const raw = await getRedis().get(sessionKey(sessionId));

  if (!raw) {
    throw new AppError(404, `Session '${sessionId}' not found or expired.`);
  }

  return JSON.parse(raw) as ActiveSession;
}

/**
 * Applies a partial update to an existing session in Redis.
 * Purpose: persist credit changes and spin counts after each spin without
 * resetting the session's expiry — the remaining TTL is preserved so a
 * long-playing session does not silently time out mid-game.
 */
export async function updateSession(
  sessionId: string,
  patch: Partial<Pick<ActiveSession, 'credits' | 'totalSpins'>>,
): Promise<ActiveSession> {
  const session = await getSession(sessionId);
  const updated: ActiveSession = { ...session, ...patch };

  const ttl = await getRedis().ttl(sessionKey(sessionId));
  const remainingTtl = ttl > 0 ? ttl : config.sessionTtlSeconds;

  await getRedis().setex(sessionKey(sessionId), remainingTtl, JSON.stringify(updated));

  return updated;
}

/**
 * Permanently closes a session — archives it to MongoDB and removes it from Redis.
 * Purpose: record a permanent, auditable history of the session's outcome
 * (start/final credits, total spins) and free the Redis slot. Called at
 * cash-out. Returns the final session state so the caller can use the credit
 * balance before it is gone.
 */
export async function closeSession(sessionId: string): Promise<ActiveSession> {
  const session = await getSession(sessionId);

  await SessionModel.create({
    sessionId: session.sessionId,
    startCredits: STARTING_CREDITS,
    finalCredits: session.credits,
    totalSpins: session.totalSpins,
    status: 'closed',
    closedAt: new Date(),
  });

  await getRedis().del(sessionKey(sessionId));

  return session;
}
