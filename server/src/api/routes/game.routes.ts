import { Router, Request, Response } from 'express';
import { validateSession } from '../../middleware/validateSession';
import { authenticate } from '../../middleware/authenticate';
import * as gameService from '../../modules/game/game.service';

const router = Router({ mergeParams: true });

/**
 * POST /api/sessions/:sessionId/spin
 * Executes one spin for the given session, applying cheat logic and returning the result.
 * Requires an active session; no authentication needed.
 */
router.post('/spin', validateSession, async (req: Request, res: Response) => {
  const result = await gameService.spin(req.params.sessionId);
  res.json(result);
});

/**
 * POST /api/sessions/:sessionId/cashout
 * Closes the session and credits the user's account with the remaining balance.
 * Requires a valid Bearer token — cash-out is the only action that demands authentication.
 */
router.post('/cashout', authenticate, validateSession, async (req: Request, res: Response) => {
  const result = await gameService.cashOut(req.params.sessionId, req.user!.userId);
  res.json({
    creditsCollected: result.creditsCollected,
    newAccountBalance: result.newAccountBalance,
    message: `Cashed out ${result.creditsCollected} credits.
    Your Balance is now ${result.newAccountBalance}. Thanks for playing!`,
  });
});

export default router;
