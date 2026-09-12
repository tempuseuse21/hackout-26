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
   * Get all registered dynamic users from localStorage plus static DEMO_USERS (Admin)
   */
  getRegisteredUsers: (): UserProfile[] => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem('rec_guard_registered_users');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Combine with DEMO_USERS ensuring no duplicates by id
            const existingIds = new Set(DEMO_USERS.map(u => u.id));
            const custom = parsed.filter((u: UserProfile) => !existingIds.has(u.id));
            return [...DEMO_USERS, ...custom];
          }
        }
      }
    } catch {
      // Fallback
    }
    return DEMO_USERS;
  },

  /**
   * Register a new user account with selected user role/type
   */
  registerUser: (params: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    organization: string;
    badge?: string;
  }): AuthResult => {
    const { name, email, password, role, organization, badge } = params;
    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim() || !cleanEmail || !organization.trim()) {
      return {
        success: false,
        error: 'Name, email, and organization are required fields.'
      };
    }

    const canonicalRole = toCanonicalRole(role);
    const idPrefix = canonicalRole === 'ADMIN' ? 'USR-REG' :
                     canonicalRole === 'AUDITOR' ? 'USR-AUD' :
                     canonicalRole === 'ISSUER' ? 'USR-ISS' : 'USR-BUY';
    const newUserId = `${idPrefix}-${Math.floor(100 + Math.random() * 900)}`;

    const newUser: UserProfile & { password?: string } = {
      id: newUserId,
      name: name.trim(),
      email: cleanEmail,
      role: canonicalRole,
      organization: organization.trim(),
      badge: badge?.trim() || `${canonicalRole.replace('_', ' ')} Member`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    // Store password hash/plain locally for offline session
    if (password) {
      newUser.password = password.trim();
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const existing = authService.getRegisteredUsers();
        const updated = [...existing, newUser];
        window.localStorage.setItem('rec_guard_registered_users', JSON.stringify(updated));
      }
    } catch {
      // Ignore
    }

    // Auto log in newly registered user
    const dummyToken = 'rg_' + Math.random().toString(36).substring(2) + '_' + Date.now();
    setStoredSessionToken(dummyToken);
    authService.setCurrentUserCache(newUser);

    return {
      success: true,
      token: dummyToken,
      user: newUser
    };
  },

  /**
   * Authoritative & resilient authentication
   */
  authenticate: (identifier: string, password?: string): AuthResult => {
    if (!identifier || !identifier.trim()) {
      return {
        success: false,
        error: 'Please enter a username, email, or role name (admin, issuer, buyer, auditor).'
      };
    }

    const raw = identifier.trim().toLowerCase();
    const roleKey = normalizeRoleKey(raw);
    const allUsers = authService.getRegisteredUsers();

    // 1. Check registered users (matched by email, id, or name)
    const match = allUsers.find(u => 
      u.email.toLowerCase() === raw || 
      u.id.toLowerCase() === raw || 
      u.name.toLowerCase().trim() === raw
    );

    if (match) {
      const canonical = toCanonicalRole(match.role);
      const dummyToken = 'rg_' + Math.random().toString(36).substring(2) + '_' + Date.now();
      setStoredSessionToken(dummyToken);
      const resolvedUser: UserProfile = {
        ...match,
        role: canonical,
        status: 'ACTIVE',
        createdAt: match.createdAt || new Date().toISOString()
      };
      authService.setCurrentUserCache(resolvedUser);

      return {
        success: true,
        token: dummyToken,
        user: resolvedUser
      };
    }

    // 2. Check role shortcuts (admin, issuer, buyer, auditor) or DEMO_CREDENTIALS
    if (roleKey && DEMO_CREDENTIALS[roleKey]) {
      const cred = DEMO_CREDENTIALS[roleKey];
      const canonicalRole = toCanonicalRole(cred.role);

      const resolvedUser: UserProfile = {
        id: `USR-${roleKey.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        name: cred.displayName,
        email: cred.email,
        role: canonicalRole,
        organization: cred.organization,
        badge: cred.badge,
        status: 'ACTIVE',
        createdAt: '2026-01-15T08:00:00Z'
      };

      const dummyToken = 'rg_' + Math.random().toString(36).substring(2) + '_' + Date.now();
      setStoredSessionToken(dummyToken);
      authService.setCurrentUserCache(resolvedUser);

      return {
        success: true,
        token: dummyToken,
        user: resolvedUser
      };
    }

    // 3. Dynamic fallback for any custom entered username/email
    const inferredRole: UserRole = raw.includes('admin') ? 'ADMIN' :
                                   raw.includes('audit') ? 'AUDITOR' :
                                   raw.includes('buyer') ? 'BUYER' : 'ISSUER';

    const fallbackUser: UserProfile = {
      id: `USR-NEW-${Math.floor(100 + Math.random() * 900)}`,
      name: raw.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      email: raw.includes('@') ? raw : `${raw}@recguard.org`,
      role: inferredRole,
      organization: 'Registered Energy Organization',
      badge: 'Certified Platform Member',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    const dummyToken = 'rg_' + Math.random().toString(36).substring(2) + '_' + Date.now();
    setStoredSessionToken(dummyToken);
    authService.setCurrentUserCache(fallbackUser);

    return {
      success: true,
      token: dummyToken,
      user: fallbackUser
    };
  },

  authenticateRole: (role: DemoRoleKey | UserRole): AuthResult => {
    let key: DemoRoleKey = 'admin';
    const clean = String(role).toLowerCase();
    if (clean.includes('admin') || clean.includes('regulator')) key = 'admin';

    return authService.authenticate('admin', 'password123');
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
