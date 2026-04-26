import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from './errorHandler';
import { UserPayload } from '../modules/user/user.service';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

/**
 * Express middleware that enforces JWT authentication.
 * Purpose: protect routes that require a known user identity (cash-out).
 * Passes a 401 error to next if the header is missing or token is invalid.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Authentication required.'));
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret) as UserPayload;
    req.user = payload;
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token.'));
  }
}
