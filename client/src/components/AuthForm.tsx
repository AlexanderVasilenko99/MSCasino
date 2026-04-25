import { useState, FormEvent } from 'react';

interface AuthFormProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, password: string) => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

export default function AuthForm({ onLogin, onRegister, error, isLoading }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      await onLogin(username, password);
    } else {
      await onRegister(username, password);
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
  };

  return (
    <div className="auth-form">
      <h2 className="auth-form__title">
        {mode === 'login' ? 'Sign In to Play' : 'Create Account'}
      </h2>

      <form onSubmit={handleSubmit} className="auth-form__body">
        <input
          className="auth-input"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          disabled={isLoading}
        />
        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          disabled={isLoading}
        />

        {error && <p className="auth-form__error">{error}</p>}

        <button className="btn btn--primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Register'}
        </button>
      </form>

      <button className="btn btn--ghost" type="button" onClick={toggleMode} disabled={isLoading}>
        {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign In'}
      </button>
    </div>
  );
}
