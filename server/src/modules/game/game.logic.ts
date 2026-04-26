import { SlotSymbol, SYMBOL_REWARDS } from '@casino/shared';

const SYMBOLS: SlotSymbol[] = ['C', 'L', 'O', 'W'];

const CHEAT_THRESHOLDS = {
  LOW: 40,
  HIGH: 60,
} as const;

const REROLL_CHANCE = {
  MEDIUM: 0.3,
  HIGH: 0.6,
} as const;

/** Picks a single random slot symbol. */
export function randomSymbol(): SlotSymbol {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

/** Generates a full spin result. */
export function randomSpin(): [SlotSymbol, SlotSymbol, SlotSymbol] {
  return [randomSymbol(), randomSymbol(), randomSymbol()];
}

/** Returns true if all three symbols are identical. (round won) */
export function isWin(symbols: [SlotSymbol, SlotSymbol, SlotSymbol]): boolean {
  return symbols[0] === symbols[1] && symbols[1] === symbols[2];
}

/** Returns the credit reward for a winning symbol. */
export function getReward(symbol: SlotSymbol): number {
  return SYMBOL_REWARDS[symbol];
}

/**
 * Returns the probability that the house will re-roll a winning spin, based
 * on how many credits the player currently holds.
 * - <40 credits: 0% cheat
 * - 40–60 credits: 30% cheat.
 * - 60< credits: 60% cheat.
 */
export function rerollChance(credits: number): number {
  if (credits > CHEAT_THRESHOLDS.HIGH) return REROLL_CHANCE.HIGH;
  if (credits >= CHEAT_THRESHOLDS.LOW) return REROLL_CHANCE.MEDIUM;
  return 0;
}

/**
 * Applies house cheating logic to each completed spin.
 * If the spin is a win and a random roll falls within the cheat threshold,
 * the result is silently replaced with a fresh random spin. The re-rolled
 * result is final regardless of whether it is also a win.
 */
export function applyCheatLogic(
  symbols: [SlotSymbol, SlotSymbol, SlotSymbol],
  credits: number,
): [SlotSymbol, SlotSymbol, SlotSymbol] {
  if (!isWin(symbols)) return symbols;

  const chance = rerollChance(credits);
  if (chance > 0 && Math.random() < chance) {
    return randomSpin();
  }

  return symbols;
}
