/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const SESSION_TOKEN_KEY = 'rg_auth_session_token';

export function getStoredSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(SESSION_TOKEN_KEY);
}

export function setStoredSessionToken(token: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_TOKEN_KEY, token);
}

export function clearStoredSessionToken(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
}

/**
 * Robust fetch wrapper that attaches Authorization Bearer token
 * and returns structured typed response.
 */
export async function apiFetch<T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  const token = getStoredSessionToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers
    });

    const contentType = res.headers.get('content-type');
    let data: any = null;
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    }

    if (!res.ok) {
      const errorMsg = data?.error || `API error ${res.status}: ${res.statusText}`;
      return { ok: false, status: res.status, error: errorMsg, data };
    }

    return { ok: true, status: res.status, data };
  } catch (err: any) {
    return { 
      ok: false, 
      status: 0, 
      error: err?.message || 'Network request failed' 
    };
  }
}
