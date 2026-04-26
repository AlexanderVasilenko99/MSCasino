import { useState, useCallback, useEffect } from 'react';
import { gameApi, TOKEN_KEY } from '../api/gameApi';

interface AuthState {
  token: string | null;
  username: string | null;
  isLoading: boolean;
  error: string | null;
}

const INITIAL_STATE: AuthState = {
  token: null,
  username: null,
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
      .then(({ username }) => {
        setState({ token, username, isLoading: false, error: null });
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setState({ token: null, username: null, isLoading: false, error: null });
      });
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const { token, username: name } = await gameApi.login(username, password);
      localStorage.setItem(TOKEN_KEY, token);
      setState({ token, username: name, isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed.';
      setState((s) => ({ ...s, isLoading: false, error: message }));
    }
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const { token, username: name } = await gameApi.register(username, password);
      localStorage.setItem(TOKEN_KEY, token);
      setState({ token, username: name, isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed.';
      setState((s) => ({ ...s, isLoading: false, error: message }));
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem('casino_session_id');
    setState({ token: null, username: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    isLoggedIn: !!state.token && !!state.username,
    login,
    register,
    logout,
  };
}
