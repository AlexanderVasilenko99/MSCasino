import * as sessionService from '../src/modules/session/session.service';
import * as gameService from '../src/modules/game/game.service';
import * as logic from '../src/modules/game/game.logic';

jest.mock('../src/modules/session/session.service');
jest.mock('../src/modules/game/game.logic');

const mockSession = (credits: number) => ({
  sessionId: 'test-session',
  credits,
  totalSpins: 0,
  createdAt: new Date().toISOString(),
});

describe('gameService.spin', () => {
  beforeEach(() => jest.clearAllMocks());

  it('throws 400 when session has insufficient credits', async () => {
    (sessionService.getSession as jest.Mock).mockResolvedValue(mockSession(0));

    await expect(gameService.spin('test-session')).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('Insufficient'),
    });
  });

  it('deducts 1 credit on a losing spin', async () => {
    (sessionService.getSession as jest.Mock).mockResolvedValue(mockSession(10));
    (logic.randomSpin as jest.Mock).mockReturnValue(['C', 'L', 'O']);
    (logic.applyCheatLogic as jest.Mock).mockReturnValue(['C', 'L', 'O']);
    (logic.isWin as jest.Mock).mockReturnValue(false);
    (logic.getReward as jest.Mock).mockReturnValue(0);
    (sessionService.updateSession as jest.Mock).mockResolvedValue({});

    const result = await gameService.spin('test-session');

    expect(result.isWin).toBe(false);
    expect(result.creditsAfter).toBe(9);
    expect(result.reward).toBe(0);
    expect(sessionService.updateSession).toHaveBeenCalledWith('test-session', {
      credits: 9,
      totalSpins: 1,
    });
  });

  it('adds reward credits on a winning spin', async () => {
    (sessionService.getSession as jest.Mock).mockResolvedValue(mockSession(10));
    (logic.randomSpin as jest.Mock).mockReturnValue(['W', 'W', 'W']);
    (logic.applyCheatLogic as jest.Mock).mockReturnValue(['W', 'W', 'W']);
    (logic.isWin as jest.Mock).mockReturnValue(true);
    (logic.getReward as jest.Mock).mockReturnValue(40);
    (sessionService.updateSession as jest.Mock).mockResolvedValue({});

    const result = await gameService.spin('test-session');

    expect(result.isWin).toBe(true);
    expect(result.reward).toBe(40);
    expect(result.creditsAfter).toBe(50);
  });

  it('passes current credits to applyCheatLogic', async () => {
    const credits = 55;
    (sessionService.getSession as jest.Mock).mockResolvedValue(mockSession(credits));
    (logic.randomSpin as jest.Mock).mockReturnValue(['C', 'C', 'C']);
    (logic.applyCheatLogic as jest.Mock).mockReturnValue(['C', 'C', 'C']);
    (logic.isWin as jest.Mock).mockReturnValue(true);
    (logic.getReward as jest.Mock).mockReturnValue(10);
    (sessionService.updateSession as jest.Mock).mockResolvedValue({});

    await gameService.spin('test-session');

    expect(logic.applyCheatLogic).toHaveBeenCalledWith(['C', 'C', 'C'], credits);
  });
});

describe('gameService.cashOut', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns the correct number of credits collected', async () => {
    (sessionService.closeSession as jest.Mock).mockResolvedValue(mockSession(42));

    const result = await gameService.cashOut('test-session');

    expect(result.creditsCollected).toBe(42);
    expect(sessionService.closeSession).toHaveBeenCalledWith('test-session');
  });
});
