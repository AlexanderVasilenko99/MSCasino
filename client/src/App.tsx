import { useState, useEffect, useCallback } from 'react';
import { useGame } from './hooks/useGame';
import { useAuth } from './hooks/useAuth';
import SlotMachine from './components/SlotMachine';
import AuthForm from './components/AuthForm';

export default function App() {
  const auth = useAuth();
  const { state, spin, cashOut, newGame } = useGame();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [cashOutPending, setCashOutPending] = useState(false);
  const doCashOut = useCallback(async () => {
    await cashOut();
  }, [cashOut]);

  // Once the user logs in while a cash-out is pending, execute it
  useEffect(() => {
    if (auth.isLoggedIn && cashOutPending && state.phase === 'ready') {
      setCashOutPending(false);
      setShowAuthModal(false);
      doCashOut();
    }
  }, [auth.isLoggedIn, cashOutPending, state.phase, doCashOut]);

  // Auto-logout after cash-out
  useEffect(() => {
    if (state.phase === 'cashed_out' && auth.isLoggedIn) {
      auth.logout();
    }
  }, [state.phase, auth.isLoggedIn, auth.logout]);

  const handleCashOut = () => {
    if (auth.isLoggedIn) {
      doCashOut();
    } else {
      setCashOutPending(true);
      setShowAuthModal(true);
    }
  };

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
            onCashOut={handleCashOut}
            onNewGame={newGame}
          />
        )}
      </main>

      {showAuthModal && (
        <div className="modal-overlay" onClick={() => { setShowAuthModal(false); setCashOutPending(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AuthForm
              onLogin={auth.login}
              onRegister={auth.register}
              error={auth.error}
              isLoading={auth.isLoading}
            />
            <button
              className="btn btn--ghost"
              onClick={() => { setShowAuthModal(false); setCashOutPending(false); }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
