import { SpinResult } from '@casino/shared';
import { AppError } from '../../middleware/errorHandler';
import * as sessionService from '../session/session.service';
import * as userService from '../user/user.service';
import * as logic from './game.logic';

/**
 * Executes a single spin for the given session.
 * Throws 400 if the session has fewer than 1 credit remaining.
 */
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

/**
 * Closes the session and transfers the remaining credits to the user's account.
 * Finalise the game, archive the session to Mongo, remove it from Redis, and
 * atomically increment the user's persistent account balance by the
 * amount of credits they had when they cashed out.
 * Returns the number of credits collected and the user's new total balance.
 */
export async function cashOut(
  sessionId: string,
  userId: string,
): Promise<{ creditsCollected: number; newAccountBalance: number }> {
  const session = await sessionService.closeSession(sessionId);
  const newAccountBalance = await userService.creditBalance(userId, session.credits);
  return { creditsCollected: session.credits, newAccountBalance };
}
