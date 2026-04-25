import SlotBlock from './SlotBlock';
import { SlotSymbol } from '@casino/shared';

interface GameState {
  phase: string;
  credits: number;
  symbols: [SlotSymbol | null, SlotSymbol | null, SlotSymbol | null];
  revealedCount: number;
  isWin: boolean | null;
  message: string | null;
  error: string | null;
}

interface SlotMachineProps {
  state: GameState;
  onSpin: () => void;
  onCashOut: () => void;
  onNewGame: () => void;
}

export default function SlotMachine({ state, onSpin, onCashOut, onNewGame }: SlotMachineProps) {
  const { phase, credits, symbols, revealedCount, isWin, message, error } = state;

  const isSpinning = phase === 'spinning';
  const isRevealing = phase === 'revealing';
  const isBusy = isSpinning || isRevealing;
  const isCashedOut = phase === 'cashed_out';
  const isBroke = phase === 'broke';

  return (
    <div className="slot-machine">
      <div className="slot-machine__credits">
        <span className="credits__label">CREDITS</span>
        <span className="credits__value">{credits}</span>
      </div>

      <div className="slot-machine__reels">
        {([0, 1, 2] as const).map((i) => {
          const blockSpinning = isSpinning || (isRevealing && revealedCount <= i);
          const revealedSymbol = isSpinning ? null : revealedCount > i ? symbols[i] : null;
          return (
            <SlotBlock
              key={i}
              symbol={revealedSymbol}
              isSpinning={blockSpinning}
            />
          );
        })}
      </div>

      {(message || error) && (
        <div
          className={`slot-machine__message ${
            error ? 'slot-machine__message--error' : isWin ? 'slot-machine__message--win' : 'slot-machine__message--loss'
          }`}
        >
          {error ?? message}
        </div>
      )}

      <div className="slot-machine__controls">
        {isCashedOut || isBroke ? (
          <button className="btn btn--primary" onClick={onNewGame}>
            New Game
          </button>
        ) : (
          <>
            <button
              className="btn btn--primary"
              onClick={onSpin}
              disabled={isBusy || credits < 1}
            >
              {isBusy ? 'Rolling…' : 'Pull Lever'}
            </button>
            <button
              className="btn btn--secondary"
              onClick={onCashOut}
              disabled={isBusy}
            >
              Cash Out
            </button>
          </>
        )}
      </div>

      {isBroke && (
        <p className="slot-machine__broke">No credits remaining.</p>
      )}
    </div>
  );
}
