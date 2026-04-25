import { SlotSymbol, SYMBOL_LABELS } from '@casino/shared';

interface SlotBlockProps {
  symbol: SlotSymbol | null;
  isSpinning: boolean;
}

const SYMBOL_COLORS: Record<SlotSymbol, string> = {
  C: '#e74c3c',
  L: '#f1c40f',
  O: '#e67e22',
  W: '#27ae60',
};

export default function SlotBlock({ symbol, isSpinning }: SlotBlockProps) {
  const isEmpty = symbol === null;
  const label = symbol ? SYMBOL_LABELS[symbol] : '';
  const color = symbol ? SYMBOL_COLORS[symbol] : 'var(--color-muted)';

  return (
    <div
      className={`slot-block ${isSpinning ? 'slot-block--spinning' : ''} ${
        symbol && !isSpinning ? 'slot-block--revealed' : ''
      }`}
      aria-label={isSpinning ? 'Spinning' : label || 'Empty'}
    >
      <span
        className="slot-block__letter"
        style={{ color: isSpinning || isEmpty ? undefined : color }}
      >
        {isSpinning ? 'X' : (symbol ?? '?')}
      </span>
      {symbol && !isSpinning && (
        <span className="slot-block__label">{label}</span>
      )}
    </div>
  );
}
