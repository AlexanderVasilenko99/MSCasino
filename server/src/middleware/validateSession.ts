import { Request, Response, NextFunction } from 'express';
import { getSession, ActiveSession } from '../modules/session/session.service';

declare global {
  namespace Express {
    interface Request {
      gameSession?: ActiveSession;
    }
  }
}

export async function validateSession(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const session = await getSession(req.params.sessionId);
  req.gameSession = session;
  next();
}
