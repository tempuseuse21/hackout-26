/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, UserRole, CanonicalRole, toCanonicalRole } from '../types';
import { DEMO_USERS } from '../data/seedData';
import { 
  apiFetch, 
  getStoredSessionToken, 
  setStoredSessionToken, 
  clearStoredSessionToken 
} from './apiClient';

export type DemoRoleKey = 'admin' | 'auditor' | 'issuer' | 'buyer';

export interface DemoCredential {
  username: DemoRoleKey;
  password: 'password123';
  role: UserRole;
  displayName: string;
  organization: string;
  badge: string;
  email: string;
}

/**
 * Constant object for demo credentials:
 * Usernames: 'admin', 'auditor', 'issuer', 'buyer'
 * Passwords: 'password123'
 */
export const DEMO_CREDENTIALS: Record<DemoRoleKey, DemoCredential> = {
  admin: {
    username: 'admin',
    password: 'password123',
    role: 'ADMIN',
    displayName: 'Dr. Elena Rostova',
    organization: 'Federal Clean Energy Regulatory Commission (FCERC)',
    badge: 'Chief Regulatory Officer',
    email: 'admin@recguard.gov'
  },
  auditor: {
    username: 'auditor',
    password: 'password123',
    role: 'AUDITOR',
    displayName: 'Sarah Chen, CISA',
    organization: 'Veritas Energy Auditing & Forensics',
    badge: 'Lead Environmental Auditor',
    email: 'auditor@recguard.org'
  },
  issuer: {
    username: 'issuer',
    password: 'password123',
    role: 'ISSUER',
    displayName: 'Marcus Vance',
    organization: 'GreenAttribute Registry Services',
    badge: 'Accredited Issuer Admin',
    email: 'issuer@cleanenergy.com'
  },
  buyer: {
    username: 'buyer',
    password: 'password123',
    role: 'BUYER',
    displayName: 'David K. Miller',
    organization: 'AeroTech Global Technologies (Scope 2 Procurement)',
    badge: 'Sustainability Director',
    email: 'buyer@greentech.corp'
  }
};

export function normalizeRoleKey(input: string): DemoRoleKey | null {
  const clean = input.trim().toLowerCase();
  if (clean === 'admin' || clean === 'administrator' || clean === 'regulator') return 'admin';
  if (clean === 'auditor' || clean === 'audit') return 'auditor';
  if (clean === 'issuer' || clean === 'certificate_issuer') return 'issuer';
  if (clean === 'buyer' || clean === 'corporate_buyer') return 'buyer';
  return null;
}

export function getRoleDashboardPath(role: UserRole | string): string {
  const canonical = toCanonicalRole(role);
  return `/${canonical.toLowerCase()}/dashboard`;
}

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  token?: string;
  error?: string;
}

export const authService = {
  getDemoCredentials: () => DEMO_CREDENTIALS,

  getCredentialForRole: (role: DemoRoleKey): DemoCredential => {
    return DEMO_CREDENTIALS[role];
  },

  getRoleDashboardPath,

  getToken: (): string | null => {
    return getStoredSessionToken();
  },

  isAuthenticated: (): boolean => {
    return !!getStoredSessionToken();
  },

  getCurrentUser: (): UserProfile | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem('rec_guard_user_session');
        if (raw) {
          return JSON.parse(raw);
        }
      }
    } catch {
      // Ignore parse failure
    }
    return null;
  },

  setCurrentUserCache: (user: UserProfile | null) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (user) {
          window.localStorage.setItem('rec_guard_user_session', JSON.stringify(user));
        } else {
          window.localStorage.removeItem('rec_guard_user_session');
        }
      }
    } catch {
      // Ignore storage failure
    }
  },

  /**
   * Authoritative backend login.
   * Calls POST /api/auth/login and stores session token.
   */
  loginWithBackend: async (identifier: string, password?: string): Promise<AuthResult> => {
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      });

      if (res.ok && res.data?.token && res.data?.user) {
        setStoredSessionToken(res.data.token);
        authService.setCurrentUserCache(res.data.user);
        return {
          success: true,
          token: res.data.token,
          user: res.data.user
        };
      }

      // If backend responded with explicit error
      if (res.status === 401 || res.status === 403) {
        return {
          success: false,
          error: res.error || 'Invalid credentials'
        };
      }
    } catch {
      // Network or offline fallback
    }

    // Fallback to local synchronous validation if server endpoint is unreachable
    return authService.authenticate(identifier, password);
  },

  /**
   * Verify currently stored token with backend /api/auth/me
   */
  fetchCurrentUser: async (): Promise<UserProfile | null> => {
    const token = getStoredSessionToken();
    if (!token) return null;

    try {
      const res = await apiFetch('/api/auth/me');
      if (res.ok && res.data?.user) {
        return res.data.user;
      }
    } catch {
      // Ignore network errors
    }

    return null;
  },

  /**
   * Synchronous validation fallback
   */
  authenticate: (identifier: string, password?: string): AuthResult => {
    const raw = identifier.trim().toLowerCase();
    const roleKey = normalizeRoleKey(raw);
    
    if (roleKey && DEMO_CREDENTIALS[roleKey]) {
      const cred = DEMO_CREDENTIALS[roleKey];
      
      if (password && password.trim() !== '') {
        const cleanPass = password.trim();
        const validPasswords = ['password123', 'admin@2025!', 'audit@2025!', 'issuer@2025!', 'buyer@2025!'];
        if (cleanPass !== cred.password && !validPasswords.includes(cleanPass.toLowerCase())) {
          return {
            success: false,
            error: 'Invalid password. Expected "password123" for demo credentials.'
          };
        }
      }

      const canonicalRole = toCanonicalRole(cred.role);
      const matchedProfile = DEMO_USERS.find(u => toCanonicalRole(u.role) === canonicalRole) || {
        id: `USR-${cred.username.toUpperCase()}`,
        name: cred.displayName,
        email: cred.email,
        role: canonicalRole,
        organization: cred.organization,
        badge: cred.badge,
        status: 'ACTIVE' as const,
        createdAt: '2026-01-15T08:00:00Z'
      };

      const dummyToken = 'rg_' + Math.random().toString(36).substring(2) + '_' + Date.now();
      setStoredSessionToken(dummyToken);

      const resolvedUser: UserProfile = {
        ...matchedProfile,
        role: canonicalRole,
        status: 'ACTIVE',
        createdAt: '2026-01-15T08:00:00Z'
      };
      authService.setCurrentUserCache(resolvedUser);

      return {
        success: true,
        token: dummyToken,
        user: resolvedUser
      };
    }

    // Email match fallback
    const emailMatch = DEMO_USERS.find(u => u.email.toLowerCase() === raw);
    if (emailMatch) {
      const canonical = toCanonicalRole(emailMatch.role);
      const dummyToken = 'rg_' + Math.random().toString(36).substring(2) + '_' + Date.now();
      setStoredSessionToken(dummyToken);
      const resolvedUser: UserProfile = {
        ...emailMatch,
        role: canonical,
        status: 'ACTIVE',
        createdAt: '2026-01-15T08:00:00Z'
      };
      authService.setCurrentUserCache(resolvedUser);
      return {
        success: true,
        token: dummyToken,
        user: resolvedUser
      };
    }

    return {
      success: false,
      error: 'Invalid credentials. Accepted demo usernames: "admin", "auditor", "issuer", "buyer". Password: "password123".'
    };
  },

  authenticateRole: (role: DemoRoleKey | UserRole): AuthResult => {
    let key: DemoRoleKey = 'admin';
    const clean = String(role).toLowerCase();
    if (clean.includes('admin') || clean.includes('regulator')) key = 'admin';
    else if (clean.includes('audit')) key = 'auditor';
    else if (clean.includes('issuer')) key = 'issuer';
    else if (clean.includes('buyer')) key = 'buyer';

    return authService.authenticate(key, 'password123');
  },

  logout: async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    clearStoredSessionToken();
    authService.setCurrentUserCache(null);
  }
};
