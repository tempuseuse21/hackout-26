/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, UserRole } from '../types';
import { DEMO_USERS } from '../data/seedData';

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
    role: 'CERTIFICATE_ISSUER',
    displayName: 'Marcus Vance',
    organization: 'GreenAttribute Registry Services',
    badge: 'Accredited Issuer Admin',
    email: 'issuer@cleanenergy.com'
  },
  buyer: {
    username: 'buyer',
    password: 'password123',
    role: 'CORPORATE_BUYER',
    displayName: 'David K. Miller',
    organization: 'AeroTech Global Technologies (Scope 2 Procurement)',
    badge: 'Sustainability Director',
    email: 'buyer@greentech.corp'
  }
};

/**
 * Map flexible role/username strings into normalized DemoRoleKey
 */
export function normalizeRoleKey(input: string): DemoRoleKey | null {
  const clean = input.trim().toLowerCase();
  if (clean === 'admin' || clean === 'administrator' || clean === 'regulator') return 'admin';
  if (clean === 'auditor' || clean === 'audit') return 'auditor';
  if (clean === 'issuer' || clean === 'certificate_issuer') return 'issuer';
  if (clean === 'buyer' || clean === 'corporate_buyer') return 'buyer';
  return null;
}

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  error?: string;
}

/**
 * Authentication service with role-based login logic
 * Accepts 'admin', 'auditor', 'issuer', and 'buyer' roles or usernames,
 * as well as emails and standard passwords ('password123' or existing demo passwords).
 */
export const authService = {
  getDemoCredentials: () => DEMO_CREDENTIALS,

  getCredentialForRole: (role: DemoRoleKey): DemoCredential => {
    return DEMO_CREDENTIALS[role];
  },

  /**
   * Role-based login function
   * Accepts identifier ('admin', 'auditor', 'issuer', 'buyer', role names, or email)
   * and optional password (defaulting or checking 'password123').
   */
  authenticate: (identifier: string, password?: string): AuthResult => {
    const raw = identifier.trim().toLowerCase();
    
    // 1. Direct role key check ('admin', 'auditor', 'issuer', 'buyer')
    const roleKey = normalizeRoleKey(raw);
    
    if (roleKey && DEMO_CREDENTIALS[roleKey]) {
      const cred = DEMO_CREDENTIALS[roleKey];
      
      // If password provided, verify against standard demo password or bypass if empty/quick login
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

      const matchedProfile = DEMO_USERS.find(u => u.role === cred.role) || {
        id: `USR-${cred.username.toUpperCase()}`,
        name: cred.displayName,
        email: cred.email,
        role: cred.role,
        organization: cred.organization,
        badge: cred.badge
      };

      return {
        success: true,
        user: matchedProfile
      };
    }

    // 2. Email matching fallback (e.g. admin@recguard.gov, etc.)
    const emailMatch = DEMO_USERS.find(u => u.email.toLowerCase() === raw);
    if (emailMatch) {
      if (password && password.trim() !== '') {
        const cleanPass = password.trim();
        const validPasswords = ['password123', 'admin@2025!', 'audit@2025!', 'issuer@2025!', 'buyer@2025!'];
        if (!validPasswords.includes(cleanPass.toLowerCase()) && cleanPass !== 'password123') {
          return {
            success: false,
            error: 'Invalid password. Expected "password123".'
          };
        }
      }
      return {
        success: true,
        user: emailMatch
      };
    }

    return {
      success: false,
      error: 'Invalid credentials. Accepted usernames/roles: "admin", "auditor", "issuer", "buyer".'
    };
  },

  /**
   * Quick authenticate directly by role
   */
  authenticateRole: (role: DemoRoleKey | UserRole): AuthResult => {
    let key: DemoRoleKey = 'admin';
    if (role === 'ADMIN' || role === 'REGULATOR' || role === 'admin') key = 'admin';
    else if (role === 'AUDITOR' || role === 'auditor') key = 'auditor';
    else if (role === 'CERTIFICATE_ISSUER' || role === 'issuer') key = 'issuer';
    else if (role === 'CORPORATE_BUYER' || role === 'buyer') key = 'buyer';

    const cred = DEMO_CREDENTIALS[key];
    const user = DEMO_USERS.find(u => u.role === cred.role) || {
      id: `USR-${cred.username.toUpperCase()}`,
      name: cred.displayName,
      email: cred.email,
      role: cred.role,
      organization: cred.organization,
      badge: cred.badge
    };

    return {
      success: true,
      user
    };
  }
};
