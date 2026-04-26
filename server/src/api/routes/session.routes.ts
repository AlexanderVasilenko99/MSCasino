import { Router, Request, Response } from 'express';
import * as sessionService from '../../modules/session/session.service';

const router = Router();

/**
 * POST /api/sessions
 * Creates a new anonymous game session and returns its ID and starting credit balance.
 */
router.post('/', async (_req: Request, res: Response) => {
  const session = await sessionService.createSession();
  res.status(201).json({ sessionId: session.sessionId, credits: session.credits });
});

/**
 * GET /api/sessions/:sessionId
 * Retrieves the current credit balance and status of an active session.
 */
router.get('/:sessionId', async (req: Request, res: Response) => {
  const session = await sessionService.getSession(req.params.sessionId);
  res.json({ sessionId: session.sessionId, credits: session.credits, status: 'active' });
});

export default router;
