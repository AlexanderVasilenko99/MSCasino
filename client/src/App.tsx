import { useGame } from './hooks/useGame';
import SlotMachine from './components/SlotMachine';

export default function App() {
  const { state, spin, cashOut, newGame } = useGame();

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">MS CASINO Jackpot</h1>
        <p className="app__subtitle">Definitely not rigged, By Alex.</p>
      </header>

      <main className="app__main">
        {state.phase === 'loading' ? (
          <p className="status-text">Starting session…</p>
        ) : (
          <SlotMachine
            state={state}
            onSpin={spin}
            onCashOut={cashOut}
            onNewGame={newGame}
          />
        )}
      </main>
    </div>
  );
}
