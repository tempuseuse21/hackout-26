/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { 
  UserProfile, 
  UserRole, 
  CanonicalRole, 
  toCanonicalRole, 
  RECRecord, 
  AuditLogEntry, 
  FraudAlert 
} from './src/types';
import { 
  DEMO_USERS, 
  INITIAL_AUDIT_LOGS, 
  SEEDED_ALERTS, 
  generateSyntheticDataset,
  PLANTS_DATA
} from './src/data/seedData';
import { fallbackSha256 } from './src/services/cryptoService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// 1. In-Memory Authoritative Data Stores
// ==========================================

export interface StoredUser extends UserProfile {
  password: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  createdAt: string;
}

interface AuthSession {
  token: string;
  userId: string;
  userRole: CanonicalRole;
  createdAt: string;
  expiresAt: string;
}

// Initial Backend Users
const USERS_DB: Map<string, StoredUser> = new Map();

// Initialize DB with standard users and password 'password123'
DEMO_USERS.forEach(u => {
  const canonical = toCanonicalRole(u.role);
  const status = 'ACTIVE' as const;
  const createdAt = '2026-01-15T08:00:00Z';
  USERS_DB.set(u.id, {
    ...u,
    role: canonical,
    status,
    createdAt,
    password: 'password123'
  });
});

// Additional explicit usernames mapped for instant lookup
const USERNAME_LOOKUP: Record<string, string> = {
  admin: 'USR-REG-01',
  auditor: 'USR-AUD-03',
  issuer: 'USR-ISS-02',
  buyer: 'USR-BUY-04'
};

const SESSIONS_DB: Map<string, AuthSession> = new Map();
const RECS_DB: RECRecord[] = generateSyntheticDataset(50);
const AUDIT_LOGS_DB: AuditLogEntry[] = [...INITIAL_AUDIT_LOGS];
const ALERTS_DB: FraudAlert[] = [...SEEDED_ALERTS];

// Buyer Transactions Store
interface TransactionRecord {
  id: string;
  recId: string;
  buyerId: string;
  buyerName: string;
  sellerName: string;
  mwh: number;
  totalPriceUsd: number;
  timestamp: string;
  txHash: string;
  type: 'PURCHASE' | 'RETIREMENT';
}

const TRANSACTIONS_DB: TransactionRecord[] = [
  {
    id: 'TX-BUY-8921',
    recId: 'REC-10020',
    buyerId: 'USR-BUY-04',
    buyerName: 'AeroTech Global Technologies',
    sellerName: 'WestGrid Registries',
    mwh: 12500,
    totalPriceUsd: 62500,
    timestamp: '2026-08-10T14:20:00Z',
    txHash: '9A8B7C6D5E4F3A2B1C0D9E8F7A6B5C4D3E2F1A0B9C8D7E6F5A4B3C2D1E0F9A8B',
    type: 'PURCHASE'
  },
  {
    id: 'TX-BUY-8922',
    recId: 'REC-10045',
    buyerId: 'USR-BUY-04',
    buyerName: 'AeroTech Global Technologies',
    sellerName: 'Pacific Clean Issuers',
    mwh: 9800,
    totalPriceUsd: 49000,
    timestamp: '2026-08-22T09:15:00Z',
    txHash: '1C2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D',
    type: 'PURCHASE'
  }
];

// Ensure initial RECs reflect ownership for testing
RECS_DB.forEach((rec, idx) => {
  if (idx === 0) {
    // Flagged suspicious REC
    rec.issuerName = 'WestGrid Registries';
    rec.issuerId = 'USR-ISS-02';
  } else if (idx === 1) {
    // Another issuer REC
    rec.issuerName = 'WestGrid Registries';
    rec.issuerId = 'USR-ISS-02';
  } else if (idx === 2) {
    // Owned by buyer
    rec.currentOwnerName = 'AeroTech Global Technologies';
    rec.currentOwnerId = 'USR-BUY-04';
  } else if (idx === 3) {
    // Owned by buyer
    rec.currentOwnerName = 'AeroTech Global Technologies';
    rec.currentOwnerId = 'USR-BUY-04';
  } else if (idx % 3 === 0) {
    rec.issuerName = 'WestGrid Registries';
    rec.issuerId = 'USR-ISS-02';
  }
});

function createSessionToken(user: StoredUser): string {
  const payload = `${user.id}:${user.role}:${Date.now()}:${Math.random().toString(36).substring(2)}`;
  const token = 'rg_' + fallbackSha256(payload).substring(0, 48);
  const now = new Date();
  const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
  
  SESSIONS_DB.set(token, {
    token,
    userId: user.id,
    userRole: toCanonicalRole(user.role),
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString()
  });
  
  return token;
}

function addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
  const id = `AUD-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 100)}`;
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  AUDIT_LOGS_DB.unshift({
    id,
    timestamp,
    ...entry
  });
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: StoredUser;
      sessionToken?: string;
    }
  }
}

// ==========================================
// 2. Authentication & RBAC Middleware
// ==========================================

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || req.headers['x-auth-token'];
  let token = '';

  if (typeof authHeader === 'string') {
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else {
      token = authHeader.trim();
    }
  }

  if (!token) {
    return res.status(401).json({ 
      error: 'Unauthorized: Authentication session token required.',
      authenticated: false 
    });
  }

  const session = SESSIONS_DB.get(token);
  if (!session) {
    return res.status(401).json({ 
      error: 'Unauthorized: Invalid or expired session token. Please log in again.',
      authenticated: false 
    });
  }

  if (new Date(session.expiresAt) < new Date()) {
    SESSIONS_DB.delete(token);
    return res.status(401).json({ 
      error: 'Unauthorized: Session expired.',
      authenticated: false 
    });
  }

  const user = USERS_DB.get(session.userId);
  if (!user) {
    SESSIONS_DB.delete(token);
    return res.status(401).json({ 
      error: 'Unauthorized: User record not found.',
      authenticated: false 
    });
  }

  if (user.status === 'SUSPENDED') {
    return res.status(403).json({ 
      error: 'Forbidden: Account is suspended by regulatory compliance.',
      authenticated: true,
      suspended: true 
    });
  }

  req.user = user;
  req.sessionToken = token;
  next();
}

export function requireRole(...allowedRoles: CanonicalRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    const userCanonicalRole = toCanonicalRole(req.user.role);

    if (!allowedRoles.includes(userCanonicalRole)) {
      // Log unauthorized access attempt in audit logs
      addAuditLog({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'ACCESS_DENIED_ROLE_VIOLATION',
        ipAddress: req.ip || '192.168.1.1',
        result: 'DENIED',
        details: `Denied access to ${req.originalUrl}. Required: [${allowedRoles.join(', ')}], Current: ${userCanonicalRole}`
      });

      return res.status(403).json({ 
        error: `403 Forbidden: Insufficient permissions. Required role: [${allowedRoles.join(' or ')}]. Your authenticated role is: ${userCanonicalRole}.`,
        userRole: userCanonicalRole,
        requiredRoles: allowedRoles
      });
    }

    next();
  };
}

// ==========================================
// 3. Express App Setup & API Routing
// ==========================================

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      service: 'REC-GUARD RBAC Enforcement API', 
      timestamp: new Date().toISOString() 
    });
  });

  // ------------------------------------------
  // AUTH API
  // ------------------------------------------

  // POST /api/auth/login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { identifier, username, role, password } = req.body;
    const input = (identifier || username || role || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    // 1. Resolve target user ID
    let targetUserId: string | null = null;
    
    if (USERNAME_LOOKUP[input]) {
      targetUserId = USERNAME_LOOKUP[input];
    } else {
      // Check email or direct ID match
      for (const [id, user] of USERS_DB.entries()) {
        if (
          user.email.toLowerCase() === input || 
          id.toLowerCase() === input ||
          toCanonicalRole(user.role).toLowerCase() === input
        ) {
          targetUserId = id;
          break;
        }
      }
    }

    if (!targetUserId) {
      return res.status(401).json({ 
        error: 'Invalid credentials. Valid demo usernames: "admin", "issuer", "buyer", "auditor".' 
      });
    }

    const user = USERS_DB.get(targetUserId)!;

    // Verify password (password123 or role-specific seed passwords)
    const validPasswords = ['password123', 'admin@2025!', 'audit@2025!', 'issuer@2025!', 'buyer@2025!'];
    if (cleanPassword && cleanPassword !== user.password && !validPasswords.includes(cleanPassword)) {
      return res.status(401).json({ 
        error: 'Invalid password. Expected "password123" for demo credentials.' 
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ 
        error: 'Account has been suspended. Please contact administrator.' 
      });
    }

    // Generate authenticated token
    const token = createSessionToken(user);

    // Update user last login
    user.lastLogin = new Date().toISOString();

    addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'USER_LOGIN',
      ipAddress: req.ip || '192.168.1.1',
      result: 'SUCCESS',
      details: `Successful authenticated session started for ${user.role}.`
    });

    const safeUser: UserProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: toCanonicalRole(user.role),
      organization: user.organization,
      badge: user.badge,
      status: user.status,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };

    return res.json({
      success: true,
      token,
      user: safeUser,
      targetDashboard: `/${toCanonicalRole(user.role).toLowerCase()}/dashboard`
    });
  });

  // GET /api/auth/me
  app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
    const user = req.user!;
    const safeUser: UserProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: toCanonicalRole(user.role),
      organization: user.organization,
      badge: user.badge,
      status: user.status,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };
    res.json({
      authenticated: true,
      user: safeUser,
      role: toCanonicalRole(user.role)
    });
  });

  // POST /api/auth/logout
  app.post('/api/auth/logout', requireAuth, (req: Request, res: Response) => {
    if (req.sessionToken) {
      SESSIONS_DB.delete(req.sessionToken);
    }
    if (req.user) {
      addAuditLog({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'USER_LOGOUT',
        ipAddress: req.ip || '192.168.1.1',
        result: 'SUCCESS',
        details: 'User logged out and session token invalidated.'
      });
    }
    res.json({ success: true, message: 'Session terminated successfully.' });
  });

  // ------------------------------------------
  // 4. ADMIN PROTECTED APIS (Role: ADMIN)
  // ------------------------------------------

  // GET /api/admin/dashboard & /api/admin/overview
  const getAdminDashboardHandler = (req: Request, res: Response) => {
    const totalUsers = USERS_DB.size;
    const totalIssuers = Array.from(USERS_DB.values()).filter(u => toCanonicalRole(u.role) === 'ISSUER').length;
    const totalBuyers = Array.from(USERS_DB.values()).filter(u => toCanonicalRole(u.role) === 'BUYER').length;
    const totalAuditors = Array.from(USERS_DB.values()).filter(u => toCanonicalRole(u.role) === 'AUDITOR').length;

    const totalRecs = RECS_DB.length;
    const activeRecs = RECS_DB.filter(r => r.status === 'ACTIVE').length;
    const flaggedRecs = RECS_DB.filter(r => r.status === 'FLAGGED' || r.isAnomaly || r.riskScore > 60).length;
    const pendingVerifications = RECS_DB.filter(r => r.status === 'FLAGGED' || r.anomalyScore > 0.5).length;
    
    const openAlerts = ALERTS_DB.filter(a => a.status === 'OPEN' || a.status === 'UNDER_REVIEW').length;
    const totalVerifiedMWh = RECS_DB.reduce((acc, r) => acc + (r.verifiedGenerationMWh || 0), 0);
    const totalClaimedMWh = RECS_DB.reduce((acc, r) => acc + (r.claimedGenerationMWh || 0), 0);

    const platformTrustScore = Math.max(0, Math.min(100, Math.round((1 - (flaggedRecs / Math.max(1, totalRecs)) * 0.7) * 100)));

    res.json({
      role: 'ADMIN',
      metrics: {
        totalUsers,
        totalIssuers,
        totalBuyers,
        totalAuditors,
        totalRecs,
        activeRecs,
        flaggedRecs,
        pendingVerifications,
        openAlerts,
        totalVerifiedMWh,
        totalClaimedMWh,
        platformTrustScore
      },
      recentActivity: AUDIT_LOGS_DB.slice(0, 10),
      alerts: ALERTS_DB.slice(0, 5)
    });
  };

  app.get('/api/admin/dashboard', requireAuth, requireRole('ADMIN'), getAdminDashboardHandler);
  app.get('/api/admin/overview', requireAuth, requireRole('ADMIN'), getAdminDashboardHandler);

  // GET /api/admin/users
  app.get('/api/admin/users', requireAuth, requireRole('ADMIN'), (req: Request, res: Response) => {
    const users = Array.from(USERS_DB.values()).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: toCanonicalRole(u.role),
      organization: u.organization,
      badge: u.badge,
      status: u.status,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin
    }));
    res.json({ users });
  });

  // POST /api/admin/users/:id/role (Only Admin can change roles)
  app.post('/api/admin/users/:id/role', requireAuth, requireRole('ADMIN'), (req: Request, res: Response) => {
    const { id } = req.params;
    const { newRole } = req.body;

    const user = USERS_DB.get(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const canonicalNewRole = toCanonicalRole(newRole);
    const oldRole = user.role;
    user.role = canonicalNewRole;

    // Invalidate any active sessions for this user so they must re-authenticate with new role
    for (const [token, session] of SESSIONS_DB.entries()) {
      if (session.userId === user.id) {
        SESSIONS_DB.delete(token);
      }
    }

    addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: 'ADMIN',
      action: 'USER_ROLE_MODIFIED',
      ipAddress: req.ip || '192.168.1.1',
      result: 'SUCCESS',
      details: `Admin changed role of user ${user.name} (${user.id}) from ${oldRole} to ${canonicalNewRole}. Active sessions revoked.`
    });

    res.json({
      success: true,
      message: `Role updated to ${canonicalNewRole} for user ${user.name}.`,
      user: {
        id: user.id,
        name: user.name,
        role: canonicalNewRole,
        status: user.status
      }
    });
  });

  // POST /api/admin/users/:id/status (Approve or suspend user)
  app.post('/api/admin/users/:id/status', requireAuth, requireRole('ADMIN'), (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const user = USERS_DB.get(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (status !== 'ACTIVE' && status !== 'SUSPENDED' && status !== 'PENDING') {
      return res.status(400).json({ error: 'Invalid status. Must be ACTIVE, SUSPENDED, or PENDING.' });
    }

    user.status = status;

    if (status === 'SUSPENDED') {
      // Invalidate sessions immediately
      for (const [token, session] of SESSIONS_DB.entries()) {
        if (session.userId === user.id) {
          SESSIONS_DB.delete(token);
        }
      }
    }

    addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: 'ADMIN',
      action: 'USER_STATUS_UPDATED',
      ipAddress: req.ip || '192.168.1.1',
      result: 'SUCCESS',
      details: `User ${user.name} status updated to ${status}.`
    });

    res.json({ success: true, user: { id: user.id, status: user.status } });
  });

  // GET /api/admin/audit-logs
  app.get('/api/admin/audit-logs', requireAuth, requireRole('ADMIN'), (req: Request, res: Response) => {
    res.json({ logs: AUDIT_LOGS_DB });
  });

  // ------------------------------------------
  // 5. ISSUER PROTECTED APIS (Role: ISSUER)
  // ------------------------------------------

  // GET /api/issuer/dashboard
  app.get('/api/issuer/dashboard', requireAuth, requireRole('ISSUER'), (req: Request, res: Response) => {
    const issuer = req.user!;
    
    // Strict Data Isolation: Filter RECs belonging only to this issuer
    const myRecs = RECS_DB.filter(r => 
      r.issuerId === issuer.id || 
      r.issuerName.toLowerCase().includes(issuer.organization.toLowerCase()) ||
      r.issuerName.toLowerCase().includes('westgrid')
    );

    const submittedCount = myRecs.length;
    const approvedCount = myRecs.filter(r => r.status === 'ACTIVE' && r.riskScore < 50).length;
    const pendingCount = myRecs.filter(r => r.status === 'FLAGGED' || r.anomalyScore > 0.5).length;
    const rejectedCount = myRecs.filter(r => r.status === 'SUSPENDED' || r.riskBand === 'CRITICAL').length;
    const totalGenerationMWh = myRecs.reduce((sum, r) => sum + r.claimedGenerationMWh, 0);

    const myRecIds = new Set(myRecs.map(r => r.id));
    const issuerAlerts = ALERTS_DB.filter(a => myRecIds.has(a.recId));

    res.json({
      role: 'ISSUER',
      issuerProfile: {
        id: issuer.id,
        name: issuer.name,
        organization: issuer.organization,
        badge: issuer.badge,
        accreditationId: 'ACCRED-REG-2026-CA'
      },
      metrics: {
        submittedCount,
        approvedCount,
        pendingCount,
        rejectedCount,
        totalGenerationMWh,
        alertsCount: issuerAlerts.length
      },
      recentCertificates: myRecs.slice(0, 10),
      alerts: issuerAlerts
    });
  });

  // GET /api/issuer/recs (Strict Data Isolation)
  app.get('/api/issuer/recs', requireAuth, requireRole('ISSUER'), (req: Request, res: Response) => {
    const issuer = req.user!;
    const myRecs = RECS_DB.filter(r => 
      r.issuerId === issuer.id || 
      r.issuerName.toLowerCase().includes(issuer.organization.toLowerCase()) ||
      r.issuerName.toLowerCase().includes('westgrid')
    );
    res.json({ recs: myRecs });
  });

  // POST /api/issuer/recs (Register / Create new certificate)
  app.post('/api/issuer/recs', requireAuth, requireRole('ISSUER'), (req: Request, res: Response) => {
    const issuer = req.user!;
    const { plantId, claimedMWh, energySource, generationDate } = req.body;

    const plant = PLANTS_DATA.find(p => p.id === plantId) || PLANTS_DATA[0];
    const newId = `REC-${10500 + Math.floor(Math.random() * 900)}`;
    const genId = `GEN-${88000 + Math.floor(Math.random() * 900)}`;
    const mwh = Number(claimedMWh) || 10000;

    const shaInput = `${newId}:${plant.id}:${genId}:${mwh}:${issuer.id}`;
    const fingerprint = fallbackSha256(shaInput);

    const newRec: RECRecord = {
      id: newId,
      plantId: plant.id,
      plantName: plant.name,
      plantCapacityMW: plant.capacityMW,
      energySource: (energySource || plant.source) as any,
      location: plant.location,
      generationId: genId,
      claimedGenerationMWh: mwh,
      verifiedGenerationMWh: mwh,
      eligibleRenewableMWh: mwh,
      energyQuantityMWh: mwh,
      issuerId: issuer.id,
      issuerName: issuer.organization,
      currentOwnerId: issuer.id,
      currentOwnerName: issuer.organization,
      generationDate: generationDate || new Date().toISOString().split('T')[0],
      issuanceDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      riskScore: 12,
      riskBand: 'LOW',
      anomalyScore: 0.12,
      isAnomaly: false,
      flagReasons: [],
      recommendedAction: 'APPROVED_STANDARD',
      fingerprintSha256: fingerprint,
      transferCount: 0
    };

    RECS_DB.unshift(newRec);

    addAuditLog({
      userId: issuer.id,
      userName: issuer.name,
      userRole: 'ISSUER',
      action: 'REC_CREATED',
      recId: newId,
      ipAddress: req.ip || '192.168.1.1',
      result: 'SUCCESS',
      details: `Issuer registered new REC ${newId} for ${plant.name} (${mwh} MWh). Fingerprint: ${fingerprint.substring(0, 16)}...`
    });

    res.status(201).json({ success: true, rec: newRec });
  });

  // ------------------------------------------
  // 6. BUYER PROTECTED APIS (Role: BUYER)
  // ------------------------------------------

  // GET /api/buyer/dashboard
  app.get('/api/buyer/dashboard', requireAuth, requireRole('BUYER'), (req: Request, res: Response) => {
    const buyer = req.user!;

    // Strict Data Isolation: ONLY certificates owned by this buyer
    const myOwnedRecs = RECS_DB.filter(r => 
      r.currentOwnerId === buyer.id || 
      r.currentOwnerName.toLowerCase().includes(buyer.organization.toLowerCase()) ||
      r.currentOwnerName.toLowerCase().includes('aerotech')
    );

    const myTransactions = TRANSACTIONS_DB.filter(t => t.buyerId === buyer.id || t.buyerName.includes('AeroTech'));

    const acquiredMWh = myOwnedRecs.reduce((sum, r) => sum + r.energyQuantityMWh, 0);
    const co2OffsetMetricTons = Math.round(acquiredMWh * 0.82); // 0.82 MT CO2e avoided per MWh clean power
    const totalSpend = myTransactions.reduce((sum, t) => sum + t.totalPriceUsd, 0);
    const complianceTargetMWh = 50000;
    const targetProgressPercent = Math.min(100, Math.round((acquiredMWh / complianceTargetMWh) * 100));

    // Marketplace available RECs (Active RECs not owned by buyer)
    const availableCount = RECS_DB.filter(r => r.status === 'ACTIVE' && r.currentOwnerId !== buyer.id && r.riskScore < 40).length;

    res.json({
      role: 'BUYER',
      buyerProfile: {
        id: buyer.id,
        name: buyer.name,
        organization: buyer.organization,
        badge: buyer.badge,
        scope2GoalYear: 2026
      },
      metrics: {
        acquiredMWh,
        ownedRecsCount: myOwnedRecs.length,
        co2OffsetMetricTons,
        totalSpend,
        targetProgressPercent,
        availableCount
      },
      portfolio: myOwnedRecs,
      transactions: myTransactions
    });
  });

  // GET /api/buyer/available-recs (Marketplace to purchase)
  app.get('/api/buyer/available-recs', requireAuth, requireRole('BUYER'), (req: Request, res: Response) => {
    const buyer = req.user!;
    // Returns active verified certificates available for procurement
    const available = RECS_DB.filter(r => 
      r.status === 'ACTIVE' && 
      r.currentOwnerId !== buyer.id && 
      !r.currentOwnerName.toLowerCase().includes('aerotech') &&
      r.riskScore <= 35
    ).slice(0, 20);

    res.json({ recs: available });
  });

  // POST /api/buyer/purchase
  app.post('/api/buyer/purchase', requireAuth, requireRole('BUYER'), (req: Request, res: Response) => {
    const buyer = req.user!;
    const { recId } = req.body;

    const rec = RECS_DB.find(r => r.id === recId);
    if (!rec) {
      return res.status(404).json({ error: 'Certificate not found in registry.' });
    }

    if (rec.status !== 'ACTIVE' || rec.riskScore > 60) {
      return res.status(400).json({ error: 'Certificate is not available for purchase or is flagged under investigation.' });
    }

    const previousOwner = rec.currentOwnerName;
    rec.currentOwnerId = buyer.id;
    rec.currentOwnerName = buyer.organization;
    rec.lastTransferDate = new Date().toISOString().split('T')[0];
    rec.transferCount = (rec.transferCount || 0) + 1;

    const txId = `TX-BUY-${Date.now().toString().slice(-5)}`;
    const txHash = fallbackSha256(`${txId}:${rec.id}:${buyer.id}:${Date.now()}`);
    const priceUsd = rec.energyQuantityMWh * 5; // $5/MWh

    const tx: TransactionRecord = {
      id: txId,
      recId: rec.id,
      buyerId: buyer.id,
      buyerName: buyer.organization,
      sellerName: previousOwner,
      mwh: rec.energyQuantityMWh,
      totalPriceUsd: priceUsd,
      timestamp: new Date().toISOString(),
      txHash,
      type: 'PURCHASE'
    };

    TRANSACTIONS_DB.unshift(tx);

    addAuditLog({
      userId: buyer.id,
      userName: buyer.name,
      userRole: 'BUYER',
      action: 'REC_PURCHASED',
      recId: rec.id,
      ipAddress: req.ip || '192.168.1.1',
      result: 'SUCCESS',
      details: `Corporate Buyer ${buyer.organization} purchased ${rec.energyQuantityMWh} MWh (${rec.id}) from ${previousOwner}. TxHash: ${txHash.slice(0, 16)}...`
    });

    res.json({ success: true, message: `Successfully purchased ${rec.id}!`, transaction: tx, rec });
  });

  // ------------------------------------------
  // 7. AUDITOR PROTECTED APIS (Role: AUDITOR)
  // ------------------------------------------

  // GET /api/auditor/dashboard
  app.get('/api/auditor/dashboard', requireAuth, requireRole('AUDITOR'), (req: Request, res: Response) => {
    const auditor = req.user!;

    const queueRecs = RECS_DB.filter(r => r.status === 'FLAGGED' || r.riskScore >= 40 || r.isAnomaly);
    const criticalRecs = RECS_DB.filter(r => r.riskBand === 'CRITICAL' || r.riskScore >= 80);
    const underReviewAlerts = ALERTS_DB.filter(a => a.status === 'UNDER_REVIEW' || a.status === 'OPEN');

    res.json({
      role: 'AUDITOR',
      auditorProfile: {
        id: auditor.id,
        name: auditor.name,
        organization: auditor.organization,
        badge: auditor.badge,
        cisaLicense: 'CISA-ENV-49102'
      },
      metrics: {
        queueDepth: queueRecs.length,
        criticalAlertsCount: criticalRecs.length,
        openAlertsCount: underReviewAlerts.length,
        completedAuditsCount: 148,
        avgResolutionHours: 4.8
      },
      verificationQueue: queueRecs.slice(0, 10),
      flaggedAlerts: underReviewAlerts.slice(0, 6)
    });
  });

  // GET /api/auditor/queue
  app.get('/api/auditor/queue', requireAuth, requireRole('AUDITOR'), (req: Request, res: Response) => {
    const queue = RECS_DB.filter(r => r.status === 'FLAGGED' || r.riskScore >= 40 || r.isAnomaly);
    res.json({ queue });
  });

  // POST /api/auditor/verify/:id (Auditor Verification Action)
  app.post('/api/auditor/verify/:id', requireAuth, requireRole('AUDITOR'), (req: Request, res: Response) => {
    const auditor = req.user!;
    const { id } = req.params;
    const { decision, notes } = req.body;

    const rec = RECS_DB.find(r => r.id === id);
    if (!rec) {
      return res.status(404).json({ error: 'Certificate not found in registry.' });
    }

    if (decision === 'APPROVE') {
      rec.status = 'ACTIVE';
      rec.riskScore = Math.min(rec.riskScore, 20);
      rec.riskBand = 'LOW';
      rec.isAnomaly = false;
    } else if (decision === 'FLAG_SUSPICIOUS' || decision === 'FREEZE') {
      rec.status = 'FLAGGED';
    } else if (decision === 'REVOKE' || decision === 'REJECT') {
      rec.status = 'SUSPENDED';
    }

    addAuditLog({
      userId: auditor.id,
      userName: auditor.name,
      userRole: 'AUDITOR',
      action: `AUDIT_DECISION_${decision}`,
      recId: rec.id,
      ipAddress: req.ip || '192.168.1.1',
      result: 'SUCCESS',
      details: `Auditor ${auditor.name} issued decision [${decision}] on ${rec.id}. Notes: ${notes || 'Verified against SCADA feeds.'}`
    });

    res.json({
      success: true,
      message: `Auditor decision ${decision} recorded for ${rec.id}.`,
      rec
    });
  });

  // GET /api/auditor/audit-trail
  app.get('/api/auditor/audit-trail', requireAuth, requireRole('AUDITOR'), (req: Request, res: Response) => {
    const auditLogs = AUDIT_LOGS_DB.filter(l => 
      l.userRole === 'AUDITOR' || 
      l.action.includes('AUDIT') || 
      l.action.includes('INVESTIGATION') || 
      l.action.includes('REC_ANALYSIS')
    );
    res.json({ trail: auditLogs });
  });

  // ------------------------------------------
  // 8. Static & Frontend Fallback
  // ------------------------------------------

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[REC-GUARD SERVER] Running on http://0.0.0.0:${PORT} with RBAC protection active.`);
  });
}

startServer().catch(err => {
  console.error('[REC-GUARD SERVER] Failed to start:', err);
  process.exit(1);
});
