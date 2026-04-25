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

export function randomSymbol(): SlotSymbol {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

export function randomSpin(): [SlotSymbol, SlotSymbol, SlotSymbol] {
  return [randomSymbol(), randomSymbol(), randomSymbol()];
}

export function isWin(symbols: [SlotSymbol, SlotSymbol, SlotSymbol]): boolean {
  return symbols[0] === symbols[1] && symbols[1] === symbols[2];
}

export function getReward(symbol: SlotSymbol): number {
  return SYMBOL_REWARDS[symbol];
}

export function rerollChance(credits: number): number {
  if (credits > CHEAT_THRESHOLDS.HIGH) return REROLL_CHANCE.HIGH;
  if (credits >= CHEAT_THRESHOLDS.LOW) return REROLL_CHANCE.MEDIUM;
  return 0;
}

/**
 * Applies house cheating: if the spin is a win and the house decides to
 * intervene (based on credit threshold probabilities), the spin is re-rolled
 * once. The re-rolled result is final regardless of outcome.
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
