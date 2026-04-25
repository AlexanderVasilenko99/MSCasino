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

function sessionKey(sessionId: string): string {
  return `session:${sessionId}`;
}

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

export async function getSession(sessionId: string): Promise<ActiveSession> {
  const raw = await getRedis().get(sessionKey(sessionId));

  if (!raw) {
    throw new AppError(404, `Session '${sessionId}' not found or expired.`);
  }

  return JSON.parse(raw) as ActiveSession;
}

export async function updateSession(
  sessionId: string,
  patch: Partial<Pick<ActiveSession, 'credits' | 'totalSpins'>>,
): Promise<ActiveSession> {
  const session = await getSession(sessionId);
  const updated: ActiveSession = { ...session, ...patch };

  // Preserve remaining TTL so updates don't silently reset expiry
  const ttl = await getRedis().ttl(sessionKey(sessionId));
  const remainingTtl = ttl > 0 ? ttl : config.sessionTtlSeconds;

  await getRedis().setex(sessionKey(sessionId), remainingTtl, JSON.stringify(updated));

  return updated;
}

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
