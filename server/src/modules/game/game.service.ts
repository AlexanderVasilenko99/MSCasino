import { SpinResult } from '@casino/shared';
import { AppError } from '../../middleware/errorHandler';
import * as sessionService from '../session/session.service';
import * as userService from '../user/user.service';
import * as logic from './game.logic';

export async function spin(sessionId: string): Promise<SpinResult> {
  const session = await sessionService.getSession(sessionId);

  if (session.credits < 1) {
    throw new AppError(400, 'Insufficient credits to spin.');
  }

  let symbols = logic.randomSpin();
  symbols = logic.applyCheatLogic(symbols, session.credits);

  const won = logic.isWin(symbols);
  const reward = won ? logic.getReward(symbols[0]) : 0;
  const creditsAfter = won ? session.credits + reward : session.credits - 1;

  await sessionService.updateSession(sessionId, {
    credits: creditsAfter,
    totalSpins: session.totalSpins + 1,
  });

  return { symbols, isWin: won, reward, creditsAfter };
}

export async function cashOut(
  sessionId: string,
): Promise<{ creditsCollected: number; newAccountBalance: number }> {
  const session = await sessionService.closeSession(sessionId);
  const newAccountBalance = await userService.creditBalance(session.userId, session.credits);
  return { creditsCollected: session.credits, newAccountBalance };
}
