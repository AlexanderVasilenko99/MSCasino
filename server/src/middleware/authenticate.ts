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
 * Purpose: protect routes that require a known user identity (e.g. cash-out).
 * Reads the Bearer token from the Authorization header, verifies it against
 * the JWT secret, and attaches the decoded payload to req.user so downstream
 * handlers can access the userId and username without re-querying the database.
 * Passes a 401 error to next() if the header is missing or the token is invalid.
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
