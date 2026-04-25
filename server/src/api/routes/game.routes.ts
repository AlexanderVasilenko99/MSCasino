import { Router, Request, Response } from 'express';
import { validateSession } from '../../middleware/validateSession';
import * as gameService from '../../modules/game/game.service';

const router = Router({ mergeParams: true });

router.post('/spin', validateSession, async (req: Request, res: Response) => {
  const result = await gameService.spin(req.params.sessionId);
  res.json(result);
});

router.post('/cashout', validateSession, async (req: Request, res: Response) => {
  const result = await gameService.cashOut(req.params.sessionId);
  res.json({
    creditsCollected: result.creditsCollected,
    newAccountBalance: result.newAccountBalance,
    message: `Cashed out ${result.creditsCollected} credits. Thanks for playing!`,
  });
});

export default router;
