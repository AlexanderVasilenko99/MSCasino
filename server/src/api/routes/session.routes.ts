import { Router, Request, Response } from 'express';
import * as sessionService from '../../modules/session/session.service';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.post('/', authenticate, async (req: Request, res: Response) => {
  const session = await sessionService.createSession(req.user!.userId);
  res.status(201).json({ sessionId: session.sessionId, credits: session.credits });
});

router.get('/:sessionId', authenticate, async (req: Request, res: Response) => {
  const session = await sessionService.getSession(req.params.sessionId);
  res.json({ sessionId: session.sessionId, credits: session.credits, status: 'active' });
});

export default router;
