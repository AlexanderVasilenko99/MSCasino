import { useState, useCallback, useEffect } from 'react';
import { gameApi } from '../api/gameApi';

const TOKEN_KEY = 'casino_token';

interface AuthState {
  token: string | null;
  username: string | null;
  accountBalance: number;
  isLoading: boolean;
  error: string | null;
}

const INITIAL_STATE: AuthState = {
  token: null,
  username: null,
  accountBalance: 0,
  isLoading: true,
  error: null,
};

export function useAuth() {
  const [state, setState] = useState<AuthState>(INITIAL_STATE);

  // On mount: validate stored token by fetching /me
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }

    gameApi
      .me()
      .then(({ username, accountBalance }) => {
        setState({ token, username, accountBalance, isLoading: false, error: null });
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setState({ token: null, username: null, accountBalance: 0, isLoading: false, error: null });
      });
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const { token, username: name, accountBalance } = await gameApi.login(username, password);
      localStorage.setItem(TOKEN_KEY, token);
      setState({ token, username: name, accountBalance, isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed.';
      setState((s) => ({ ...s, isLoading: false, error: message }));
    }
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const { token, username: name, accountBalance } = await gameApi.register(username, password);
      localStorage.setItem(TOKEN_KEY, token);
      setState({ token, username: name, accountBalance, isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed.';
      setState((s) => ({ ...s, isLoading: false, error: message }));
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem('casino_session_id');
    setState({ token: null, username: null, accountBalance: 0, isLoading: false, error: null });
  }, []);

  const refreshBalance = useCallback(async () => {
    try {
      const { accountBalance } = await gameApi.me();
      setState((s) => ({ ...s, accountBalance }));
    } catch {
      // silently ignore — balance will refresh on next login
    }
  }, []);

  return {
    ...state,
    isLoggedIn: !!state.token && !!state.username,
    login,
    register,
    logout,
    refreshBalance,
  };
}
