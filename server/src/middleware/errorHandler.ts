import { Request, Response, NextFunction } from 'express';

/**
 * A typed application error that carries an HTTP status code.
 * Purpose: allow any layer of the server to throw a structured error that the
 * global error handler can translate directly into the correct HTTP response,
 * without leaking internal stack traces to the client.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Global Express error-handling middleware.
 * Purpose: provide a single, consistent place where all errors are caught and
 * serialised into JSON responses.
 * Known AppErrors are returned with their intended status code. Everything
 * else is treated as an unexpected server fault and logged before returning a generic 500.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.name, message: err.message });
    return;
  }

  console.error('[unhandled error]', err);
  res.status(500).json({ error: 'InternalServerError', message: 'An unexpected error occurred :(' });
}
