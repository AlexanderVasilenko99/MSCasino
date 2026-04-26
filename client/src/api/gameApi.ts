import {
  CreateSessionResponse,
  SpinResult,
  SessionState,
  CashOutResponse,
  AuthResponse,
  MeResponse,
} from '@casino/shared';

const BASE = '/api';
export const TOKEN_KEY = 'casino_token';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    ...options,
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }

  return body as T;
}

export const gameApi = {
  register: (username: string, password: string) =>
    request<AuthResponse>(`${BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  login: (username: string, password: string) =>
    request<AuthResponse>(`${BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  me: () => request<MeResponse>(`${BASE}/auth/me`),

  createSession: () =>
    request<CreateSessionResponse>(`${BASE}/session`, { method: 'POST' }),

  getSession: (sessionId: string) =>
    request<SessionState>(`${BASE}/session/${sessionId}`),

  spin: (sessionId: string) =>
    request<SpinResult>(`${BASE}/session/${sessionId}/spin`, { method: 'POST' }),

  cashOut: (sessionId: string) =>
    request<CashOutResponse>(`${BASE}/session/${sessionId}/cashout`, { method: 'POST' }),
};
