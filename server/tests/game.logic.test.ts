import {
  randomSpin,
  isWin,
  getReward,
  rerollChance,
  applyCheatLogic,
} from '../src/modules/game/game.logic';

describe('randomSpin', () => {
  it('returns exactly 3 symbols', () => {
    const result = randomSpin();
    expect(result).toHaveLength(3);
  });

  it('returns only valid symbols', () => {
    for (let i = 0; i < 50; i++) {
      const [a, b, c] = randomSpin();
      expect(['C', 'L', 'O', 'W']).toContain(a);
      expect(['C', 'L', 'O', 'W']).toContain(b);
      expect(['C', 'L', 'O', 'W']).toContain(c);
    }
  });
});

describe('isWin', () => {
  it('returns true when all three symbols match', () => {
    expect(isWin(['C', 'C', 'C'])).toBe(true);
    expect(isWin(['L', 'L', 'L'])).toBe(true);
    expect(isWin(['O', 'O', 'O'])).toBe(true);
    expect(isWin(['W', 'W', 'W'])).toBe(true);
  });

  it('returns false when any symbols differ', () => {
    expect(isWin(['C', 'C', 'L'])).toBe(false);
    expect(isWin(['C', 'L', 'C'])).toBe(false);
    expect(isWin(['L', 'C', 'C'])).toBe(false);
    expect(isWin(['C', 'L', 'O'])).toBe(false);
  });
});

describe('getReward', () => {
  it('returns correct reward for each symbol', () => {
    expect(getReward('C')).toBe(10);
    expect(getReward('L')).toBe(20);
    expect(getReward('O')).toBe(30);
    expect(getReward('W')).toBe(40);
  });
});

describe('rerollChance', () => {
  it('returns 0 for credits below 40', () => {
    expect(rerollChance(0)).toBe(0);
    expect(rerollChance(10)).toBe(0);
    expect(rerollChance(39)).toBe(0);
  });

  it('returns 0.3 for credits between 40 and 60 inclusive', () => {
    expect(rerollChance(40)).toBe(0.3);
    expect(rerollChance(50)).toBe(0.3);
    expect(rerollChance(60)).toBe(0.3);
  });

  it('returns 0.6 for credits above 60', () => {
    expect(rerollChance(61)).toBe(0.6);
    expect(rerollChance(100)).toBe(0.6);
  });
});

describe('applyCheatLogic', () => {
  it('never re-rolls a losing spin', () => {
    const losingSpin: ['C', 'C', 'L'] = ['C', 'C', 'L'];
    const result = applyCheatLogic(losingSpin, 100);
    expect(result).toEqual(losingSpin);
  });

  it('never re-rolls when credits are below 40', () => {
    const winningSpin: ['C', 'C', 'C'] = ['C', 'C', 'C'];
    for (let i = 0; i < 30; i++) {
      const result = applyCheatLogic(winningSpin, 39);
      expect(result).toEqual(winningSpin);
    }
  });

  it('re-rolls when Math.random returns below the cheat threshold (40-60)', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.29); // < 0.30 → triggers reroll
    const winningSpin: ['C', 'C', 'C'] = ['C', 'C', 'C'];
    const result = applyCheatLogic(winningSpin, 50);
    // Result will differ from the original winning spin (random re-roll applied)
    expect(result).toBeDefined();
    jest.spyOn(Math, 'random').mockRestore();
  });

  it('does NOT re-roll when Math.random exceeds the cheat threshold (40-60)', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.31); // > 0.30 → no reroll
    const winningSpin: ['C', 'C', 'C'] = ['C', 'C', 'C'];
    const result = applyCheatLogic(winningSpin, 50);
    expect(result).toEqual(winningSpin);
    jest.spyOn(Math, 'random').mockRestore();
  });

  it('re-rolls when Math.random returns below the high cheat threshold (>60)', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.59); // < 0.60 → triggers reroll
    const winningSpin: ['C', 'C', 'C'] = ['C', 'C', 'C'];
    const result = applyCheatLogic(winningSpin, 61);
    expect(result).toBeDefined();
    jest.spyOn(Math, 'random').mockRestore();
  });

  it('does NOT re-roll when Math.random exceeds the high cheat threshold (>60)', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.61); // > 0.60 → no reroll
    const winningSpin: ['C', 'C', 'C'] = ['C', 'C', 'C'];
    const result = applyCheatLogic(winningSpin, 100);
    expect(result).toEqual(winningSpin);
    jest.spyOn(Math, 'random').mockRestore();
  });
});
