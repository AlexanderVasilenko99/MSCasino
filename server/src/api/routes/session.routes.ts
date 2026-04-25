import { Router, Request, Response } from 'express';
import * as sessionService from '../../modules/session/session.service';

const router = Router();

router.post('/', async (_req: Request, res: Response) => {
  const session = await sessionService.createSession();
  res.status(201).json({ sessionId: session.sessionId, credits: session.credits });
});

router.get('/:sessionId', async (req: Request, res: Response) => {
  const session = await sessionService.getSession(req.params.sessionId);
  res.json({ sessionId: session.sessionId, credits: session.credits, status: 'active' });
});

export default router;
