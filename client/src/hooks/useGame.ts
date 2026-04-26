import { useState, useEffect, useCallback, useRef } from 'react';
import { SlotSymbol } from '@casino/shared';
import { gameApi } from '../api/gameApi';

const SESSION_KEY = 'casino_session_id';

const REVEAL_DELAY_MS = 1000;

export type GamePhase = 'loading' | 'ready' | 'spinning' | 'revealing' | 'cashed_out' | 'broke';

export interface GameState {
  phase: GamePhase;
  sessionId: string | null;
  credits: number;
  symbols: [SlotSymbol | null, SlotSymbol | null, SlotSymbol | null];
  revealedCount: number;
  isWin: boolean | null;
  message: string | null;
  error: string | null;
}

const INITIAL_STATE: GameState = {
  phase: 'loading',
  sessionId: null,
  credits: 0,
  symbols: [null, null, null],
  revealedCount: 0,
  isWin: null,
  message: null,
  error: null,
};

export function useGame() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const revealTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearRevealTimers = () => {
    revealTimers.current.forEach(clearTimeout);
    revealTimers.current = [];
  };

  const startSession = useCallback(async () => {
    setState((s) => ({ ...s, phase: 'loading', error: null, message: null }));
    try {
      const { sessionId, credits } = await gameApi.createSession();
      sessionStorage.setItem(SESSION_KEY, sessionId);
      setState((s) => ({ ...s, phase: 'ready', sessionId, credits, symbols: [null, null, null] }));
    } catch {
      setState((s) => ({ ...s, phase: 'ready', error: 'Failed to start session.' }));
    }
  }, []);

  // On mount: restore or create session
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);

    if (!saved) {
      startSession();
      return;
    }

    gameApi
      .getSession(saved)
      .then(({ sessionId, credits }) => {
        setState((s) => ({ ...s, phase: 'ready', sessionId, credits }));
      })
      .catch(() => {
        sessionStorage.removeItem(SESSION_KEY);
        startSession();
      });
  }, [startSession]);

  const spin = useCallback(async () => {
    if (!state.sessionId || state.phase !== 'ready') return;

    clearRevealTimers();
    setState((s) => ({
      ...s,
      phase: 'spinning',
      symbols: [null, null, null],
      revealedCount: 0,
      isWin: null,
      message: null,
      error: null,
    }));

    try {
      const result = await gameApi.spin(state.sessionId);

      setState((s) => ({ ...s, phase: 'revealing' }));

      // Sequentially reveal each symbol with 1s gaps
      [0, 1, 2].forEach((i) => {
        const t = setTimeout(() => {
          setState((s) => ({
            ...s,
            symbols: s.symbols.map((sym, idx) =>
              idx <= i ? result.symbols[idx] : sym,
            ) as [SlotSymbol | null, SlotSymbol | null, SlotSymbol | null],
            revealedCount: i + 1,
            ...(i === 2
              ? {
                  phase: result.creditsAfter < 1 ? 'broke' : 'ready',
                  credits: result.creditsAfter,
                  isWin: result.isWin,
                  message: result.isWin
                    ? `You won ${result.reward} credits!`
                    : 'No luck this time.',
                }
              : {}),
          }));
        }, REVEAL_DELAY_MS * (i + 1));

        revealTimers.current.push(t);
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Spin failed.';
      setState((s) => ({ ...s, phase: 'ready', error: message }));
    }
  }, [state.sessionId, state.phase]);

  const cashOut = useCallback(async () => {
    if (!state.sessionId || state.phase !== 'ready') return;

    try {
      const { creditsCollected, message } = await gameApi.cashOut(state.sessionId);
      sessionStorage.removeItem(SESSION_KEY);
      setState((s) => ({
        ...s,
        phase: 'cashed_out',
        credits: creditsCollected,
        message,
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Cash out failed.';
      setState((s) => ({ ...s, error: message }));
    }
  }, [state.sessionId, state.phase]);

  const newGame = useCallback(() => {
    clearRevealTimers();
    sessionStorage.removeItem(SESSION_KEY);
    startSession();
  }, [startSession]);

  return { state, spin, cashOut, newGame };
}
