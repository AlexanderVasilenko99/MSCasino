export type SlotSymbol = 'C' | 'L' | 'O' | 'W';

export const SYMBOL_LABELS: Record<SlotSymbol, string> = {
  C: 'Cherry',
  L: 'Lemon',
  O: 'Orange',
  W: 'Watermelon',
};

export const SYMBOL_REWARDS: Record<SlotSymbol, number> = {
  C: 10,
  L: 20,
  O: 30,
  W: 40,
};

export const STARTING_CREDITS = 10;

export interface SessionState {
  sessionId: string;
  credits: number;
  status: 'active' | 'closed';
}

export interface SpinResult {
  symbols: [SlotSymbol, SlotSymbol, SlotSymbol];
  isWin: boolean;
  reward: number;
  creditsAfter: number;
}

export interface CreateSessionResponse {
  sessionId: string;
  credits: number;
}

export interface CashOutResponse {
  creditsCollected: number;
  message: string;
  newAccountBalance: number;
}

export interface AuthResponse {
  token: string;
  username: string;
  accountBalance: number;
}

export interface MeResponse {
  username: string;
  accountBalance: number;
}

export interface ApiError {
  error: string;
  message: string;
}
