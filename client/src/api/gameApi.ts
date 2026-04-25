import {
  CreateSessionResponse,
  SpinResult,
  SessionState,
  CashOutResponse,
} from '@casino/shared';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }

  return body as T;
}

export const gameApi = {
  createSession: () =>
    request<CreateSessionResponse>(`${BASE}/session`, { method: 'POST' }),

  getSession: (sessionId: string) =>
    request<SessionState>(`${BASE}/session/${sessionId}`),

  spin: (sessionId: string) =>
    request<SpinResult>(`${BASE}/session/${sessionId}/spin`, { method: 'POST' }),

  cashOut: (sessionId: string) =>
    request<CashOutResponse>(`${BASE}/session/${sessionId}/cashout`, { method: 'POST' }),
};
