import { Request, Response, NextFunction } from 'express';
import { getSession, ActiveSession } from '../modules/session/session.service';

declare global {
  namespace Express {
    interface Request {
      gameSession?: ActiveSession;
    }
  }
}

/**
 * Express middleware that loads and validates the active game session.
 * Purpose: centralise session lookup so game route handlers receive a
 * ready-to-use session object on req.gameSession rather than each fetching
 * it individually.
 * Automatically throws 404 via getSession if the session
 * ID in the URL does not exist or has expired in Redis.
 */
export async function validateSession(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const session = await getSession(req.params.sessionId);
  req.gameSession = session;
  next();
}
