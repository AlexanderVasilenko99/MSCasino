import { useGame } from './hooks/useGame';
import { useAuth } from './hooks/useAuth';
import SlotMachine from './components/SlotMachine';
import AuthForm from './components/AuthForm';

export default function App() {
  const auth = useAuth();
  const { state, spin, cashOut, newGame } = useGame({ enabled: auth.isLoggedIn });

  const handleCashOut = async () => {
    await cashOut();
    await auth.refreshBalance();
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">MS CASINO Jackpot</h1>

        {auth.isLoggedIn ? (
          <div className="app__user-bar">
            <span className="app__username">{auth.username}</span>
            <span className="app__account">
              Account: <strong>{auth.accountBalance}</strong> credits
            </span>
            <button className="btn btn--ghost btn--sm" onClick={auth.logout}>
              Sign Out
            </button>
          </div>
        ) : (
          <p className="app__subtitle">Definitely not rigged, By Alex.</p>
        )}
      </header>

      <main className="app__main">
        {auth.isLoading ? (
          <p className="status-text">Loading…</p>
        ) : !auth.isLoggedIn ? (
          <AuthForm
            onLogin={auth.login}
            onRegister={auth.register}
            error={auth.error}
            isLoading={auth.isLoading}
          />
        ) : state.phase === 'loading' ? (
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
    </div>
  );
}
