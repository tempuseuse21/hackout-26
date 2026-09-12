import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  RECRecord, 
  UserProfile, 
  FraudAlert, 
  LedgerBlock, 
  ModelMetrics, 
  AlertStatus, 
  InvestigationNote, 
  UserRole,
  AuditLogEntry,
  toCanonicalRole 
} from '../types';
import { 
  DEMO_USERS, 
  generateSyntheticDataset, 
  SEEDED_ALERTS, 
  SEEDED_LEDGER_BLOCKS, 
  CRITICAL_FLAGGED_REC_10231,
  INITIAL_AUDIT_LOGS 
} from '../data/seedData';
import { getOrTrainModel } from '../services/aiAnomalyEngine';
import { evaluateRules } from '../services/rulesEngine';
import { ledgerSingleton } from '../services/ledgerService';
import { computeBlockHash } from '../services/ledgerService';
import { fallbackSha256 } from '../services/cryptoService';
import { authService, DEMO_CREDENTIALS, DemoCredential, DemoRoleKey } from '../services/authService';

export { DEMO_CREDENTIALS };
export type { DemoCredential, DemoRoleKey };

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
}

export type AppTab = 
  | 'dashboard' 
  | 'rec-analysis' 
  | 'risk-intelligence' 
  | 'passport' 
  | 'ledger' 
  | 'investigations' 
  | 'fraud-network' 
  | 'reports' 
  | 'settings'
  | 'audit-logs'
  | 'users'
  | 'login'
  // Backwards compatibility aliases:
  | 'landing'
  | 'registry' 
  | 'details' 
  | 'rec-details'
  | 'fraud-rules' 
  | 'fraud-center'
  | 'ai-intelligence' 
  | 'verification' 
  | 'network' 
  | 'alerts' 
  | 'auditor-workspace' 
  | 'analytics' 
  | 'data-import' 
  | 'docs';

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  login: (identifier: string, password?: string) => boolean;
  registerUser: (params: { name: string; email: string; password?: string; role: UserRole; organization: string; badge?: string }) => boolean;
  logout: () => void;
  demoCredentials: Record<DemoRoleKey, DemoCredential>;

  isAddRecOpen: boolean;
  setIsAddRecOpen: (open: boolean) => void;

  auditLogs: AuditLogEntry[];
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  addNewRec: (recData: Partial<RECRecord>, analyzeImmediately: boolean) => { success: boolean; rec: RECRecord };

  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  
  recs: RECRecord[];
  setRecs: React.Dispatch<React.SetStateAction<RECRecord[]>>;
  
  selectedRecId: string;
  setSelectedRecId: (id: string) => void;
  selectedRec: RECRecord;
  
  alerts: FraudAlert[];
  updateAlertStatus: (alertId: string, status: AlertStatus, noteText?: string) => void;
  addInvestigationNote: (alertId: string, content: string, action?: string) => void;
  assignAuditor: (alertId: string, auditorName: string) => void;
  openInvestigationCase: (recId: string, alertType: string, summary: string, auditor?: string) => void;
  
  ledgerBlocks: LedgerBlock[];
  tamperBlock: (blockNumber: number, field?: string, value?: any) => void;
  restoreBlock: (blockNumber: number) => void;
  verifyLedger: () => { isValid: boolean; brokenBlockNumber?: number; reason?: string; totalBlocksVerified: number };
  verifyLedgerIntegrity: () => Promise<{ valid: boolean; corruptedIndex?: number }>;
  restoreLedger: () => void;
  isLedgerValid: boolean;
  
  modelMetrics: ModelMetrics;
  runAiDetection: (contamination?: number) => void;
  isAiTraining: boolean;
  
  // Quick Search & Notifications
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  
  // Reset & Generation actions
  regenerateData: (count: number) => void;
  inspectRec: (recId: string) => void;

  // RBAC Routing & Navigation
  currentPath: string;
  navigateToPath: (path: string) => void;
  navigateToRoleDashboard: () => void;

  // Responsive Layout State
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebarCollapsed: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user / session state from authoritative auth service
  const initialSessionUser = authService.getCurrentUser();
  const [currentUser, setCurrentUser] = useState<UserProfile>(initialSessionUser || DEMO_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [isAddRecOpen, setIsAddRecOpen] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Browser URL / Path State for RBAC Routing
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.pathname && window.location.pathname !== '/') {
      return window.location.pathname;
    }
    // If authenticated, default to role dashboard; otherwise /login
    if (initialSessionUser) {
      return `/${toCanonicalRole(initialSessionUser.role).toLowerCase()}/dashboard`;
    }
    return '/login';
  });

  // Responsive Drawer & Sidebar Collapsed States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const toggleSidebarCollapsed = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  const navigateToPath = useCallback((path: string) => {
    setCurrentPath(path);
    setIsMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
    }
  }, []);

  const navigateToRoleDashboard = useCallback(() => {
    const canonical = toCanonicalRole(currentUser.role).toLowerCase();
    const targetPath = `/${canonical}/dashboard`;
    navigateToPath(targetPath);
  }, [currentUser.role, navigateToPath]);

  // Sync with browser back / forward navigation
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        setCurrentPath(window.location.pathname || '/');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  // REC Data: initialize with 1000 records
  const [recs, setRecs] = useState<RECRecord[]>(() => {
    return generateSyntheticDataset(1000);
  });
  
  const [selectedRecId, setSelectedRecId] = useState<string>('REC-10231');
  const [alerts, setAlerts] = useState<FraudAlert[]>(SEEDED_ALERTS);
  const [ledgerBlocks, setLedgerBlocks] = useState<LedgerBlock[]>(SEEDED_LEDGER_BLOCKS);
  
  // AI Model metrics
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics>(() => {
    return {
      algorithm: 'Isolation Forest (Ensemble iTrees)',
      trainingRecords: 1000,
      featureCount: 10,
      contaminationRate: 0.08,
      anomaliesDetected: 74,
      precision: 94.2,
      recall: 91.8,
      f1Score: 93.0,
      accuracy: 96.4,
      status: 'READY',
      lastRunTimestamp: 'Initial Calibration',
      processingTimeMs: 142
    };
  });
  
  const [isAiTraining, setIsAiTraining] = useState(false);
  
  // Search & Toasts
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = {
      ...toast,
      id,
      timestamp: new Date().toLocaleTimeString()
    };
    setToasts(prev => [newToast, ...prev.slice(0, 5)]);
    
    // Auto-dismiss after 6s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addAuditLog = useCallback((entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  }, []);

  const login = useCallback((identifier: string, password?: string): boolean => {
    const result = authService.authenticate(identifier, password);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      setIsAuthenticated(true);
      const canonical = toCanonicalRole(result.user.role).toLowerCase();
      const targetPath = `/${canonical}/dashboard`;
      setCurrentPath(targetPath);
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', targetPath);
      }
      setActiveTab('dashboard');
      addToast({
        type: 'success',
        title: 'Authenticated Successfully',
        message: `Signed in as ${result.user.name} (${canonical.toUpperCase()})`
      });
      addAuditLog({
        userId: result.user.id,
        userName: result.user.name,
        userRole: result.user.role,
        action: 'USER_LOGIN',
        ipAddress: '192.168.1.10',
        result: 'SUCCESS',
        details: `Signed into REC-GUARD AI via secure role authentication (${result.user.role}). Redirected to ${targetPath}.`
      });
      return true;
    }
    return false;
  }, [addToast, addAuditLog]);

  const registerUser = useCallback((params: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    organization: string;
    badge?: string;
  }): boolean => {
    const result = authService.registerUser(params);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      setIsAuthenticated(true);
      const canonical = toCanonicalRole(result.user.role).toLowerCase();
      const targetPath = `/${canonical}/dashboard`;
      setCurrentPath(targetPath);
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', targetPath);
      }
      setActiveTab('dashboard');
      addToast({
        type: 'success',
        title: 'Account Registered Successfully',
        message: `Welcome, ${result.user.name}! Registered as ${canonical.toUpperCase()}.`
      });
      addAuditLog({
        userId: result.user.id,
        userName: result.user.name,
        userRole: result.user.role,
        action: 'USER_REGISTER',
        ipAddress: '192.168.1.10',
        result: 'SUCCESS',
        details: `Registered account as ${result.user.role} for ${result.user.organization}. Redirected to ${targetPath}.`
      });
      return true;
    }
    return false;
  }, [addToast, addAuditLog]);

  const logout = useCallback(() => {
    authService.logout();
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'USER_LOGOUT',
      ipAddress: '192.168.1.10',
      result: 'SUCCESS',
      details: 'Session terminated gracefully.'
    });
    setIsAuthenticated(false);
    setActiveTab('login');
    setCurrentPath('/login');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/login');
    }
    addToast({
      type: 'info',
      title: 'Signed Out',
      message: 'Session closed securely.'
    });
  }, [currentUser, addAuditLog, addToast]);

  const addNewRec = useCallback((recData: Partial<RECRecord>, analyzeImmediately: boolean) => {
    const recId = recData.id || `REC-${Math.floor(10000 + Math.random() * 90000)}`;
    const plantId = recData.plantId || 'SOLAR-017';
    const genId = recData.generationId || `GEN-${Math.floor(10000 + Math.random() * 90000)}`;
    const claimed = Number(recData.claimedGenerationMWh || 10000);
    const verified = Number(recData.verifiedGenerationMWh || claimed);
    const cap = Number(recData.plantCapacityMW || 100);

    // Compute SHA-256 fingerprint
    const fingerprint = fallbackSha256(`${recId}|${plantId}|${genId}|${claimed}|${recData.issuanceDate || new Date().toISOString().slice(0, 10)}|${recData.issuerId || 'ISS-WEST-01'}`);

    // AI model prediction
    const { model } = getOrTrainModel(recs);
    const tempRec: RECRecord = {
      id: recId,
      plantId,
      plantName: recData.plantName || 'Generation Facility',
      plantCapacityMW: cap,
      energySource: recData.energySource || 'SOLAR',
      location: recData.location || 'California, US',
      generationId: genId,
      claimedGenerationMWh: claimed,
      verifiedGenerationMWh: verified,
      eligibleRenewableMWh: verified,
      energyQuantityMWh: Number(recData.energyQuantityMWh || claimed),
      issuerId: recData.issuerId || 'ISS-WEST-01',
      issuerName: recData.issuerName || 'WestGrid Registries',
      currentOwnerId: recData.currentOwnerId || 'BUY-NEW-01',
      currentOwnerName: recData.currentOwnerName || 'AeroTech Global Technologies',
      generationDate: recData.generationDate || new Date().toISOString().slice(0, 10),
      issuanceDate: recData.issuanceDate || new Date().toISOString().slice(0, 10),
      status: recData.status || (claimed > verified * 1.15 ? 'FLAGGED' : 'ACTIVE'),
      riskScore: 10,
      riskBand: 'LOW',
      anomalyScore: 0.15,
      isAnomaly: false,
      scoreBreakdown: {
        duplicateClaim: 0,
        generationMismatch: 0,
        aiAnomaly: 0,
        transferAnomaly: 0,
        historicalPattern: 0,
        overIssuance: 0,
        retirementReuse: 0
      },
      flagReasons: [],
      recommendedAction: 'PENDING_EVALUATION',
      fingerprintSha256: fingerprint,
      sha256Fingerprint: fingerprint,
      digitalSignature: fallbackSha256(`SIG-${fingerprint}`).slice(0, 32),
      transferCount: Number(recData.transferCount || 1),
      issuanceFrequencyDays: Number(recData.issuanceFrequencyDays || 30),
      transferFrequencyDays: Number(recData.transferFrequencyDays || 14),
      lifecycleEvents: [
        {
          id: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
          eventType: 'GENERATION',
          timestamp: new Date().toISOString(),
          actor: recData.plantName || 'Facility Operator',
          details: `Metered generation recorded: ${verified.toLocaleString()} MWh verified SCADA output.`
        },
        {
          id: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
          eventType: 'ISSUANCE',
          timestamp: new Date().toISOString(),
          actor: recData.issuerName || 'Accredited Issuer',
          details: `Certificate created for claimed ${claimed.toLocaleString()} MWh with SHA-256 fingerprint ${fingerprint.slice(0, 12)}...`
        }
      ]
    };

    let finalRec = tempRec;

    if (analyzeImmediately) {
      const fv = model.extractFeatures(tempRec);
      const { anomalyScore, isAnomaly } = model.predict(fv);
      const audit = evaluateRules(tempRec, [tempRec, ...recs], anomalyScore, isAnomaly);

      finalRec = {
        ...tempRec,
        anomalyScore,
        isAnomaly,
        riskScore: audit.riskScore,
        riskBand: audit.riskBand,
        scoreBreakdown: audit.breakdown,
        flagReasons: audit.flagReasons,
        recommendedAction: audit.recommendedAction,
        status: audit.riskScore > 60 ? 'FLAGGED' : tempRec.status
      };
    }

    // Add Ledger block
    const prevHead = ledgerBlocks[ledgerBlocks.length - 1];
    const newBlockNum = prevHead ? prevHead.blockNumber + 1 : 1;
    const prevHash = prevHead ? prevHead.currentHash : '0000000000000000000000000000000000000000000000000000000000000000';
    const blockTime = new Date().toISOString();
    const newBlockHash = computeBlockHash(
      newBlockNum,
      prevHash,
      blockTime,
      currentUser.name,
      recId,
      finalRec.riskScore > 60 ? 'FLAGGED' : 'ISSUED',
      { plantId, claimed, verified, riskScore: finalRec.riskScore }
    );

    const newBlock: LedgerBlock = {
      blockNumber: newBlockNum,
      transactionId: `TX-${Math.floor(1000 + Math.random() * 9000)}-${recId.slice(-4)}`,
      timestamp: blockTime,
      actor: currentUser.name,
      recId,
      event: finalRec.riskScore > 60 ? 'FLAGGED' : 'ISSUED',
      previousHash: prevHash,
      currentHash: newBlockHash,
      status: 'VALID',
      dataPayload: { plantId, claimed, verified, riskScore: finalRec.riskScore }
    };

    setLedgerBlocks(prev => [...prev, newBlock]);
    setRecs(prev => [finalRec, ...prev]);

    // Audit Log
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: analyzeImmediately ? 'REC_INTAKE_AND_ANALYSIS' : 'REC_INTAKE_SAVED',
      recId,
      ipAddress: '192.168.1.10',
      result: finalRec.riskScore > 60 ? 'FLAGGED' : 'SUCCESS',
      details: `Created REC ${recId} for ${finalRec.plantName}. Risk Score: ${finalRec.riskScore}/100 (${finalRec.riskBand}). SHA-256 Fingerprint generated.`
    });

    if (analyzeImmediately) {
      setSelectedRecId(recId);
      setActiveTab('risk-intelligence');
      addToast({
        type: finalRec.riskScore > 60 ? 'warning' : 'success',
        title: finalRec.riskScore > 60 ? 'REC Flagged by Pipeline' : 'REC Verified & Issued',
        message: `Risk Score: ${finalRec.riskScore}/100 (${finalRec.riskBand}). ${finalRec.flagReasons.length} anomaly flags identified.`
      });
    } else {
      addToast({
        type: 'success',
        title: 'REC Intake Stored',
        message: `Certificate ${recId} registered in registry.`
      });
    }

    return { success: true, rec: finalRec };
  }, [recs, ledgerBlocks, currentUser, addAuditLog, addToast]);

  const selectedRec = useMemo(() => {
    const found = recs.find(r => r.id === selectedRecId);
    return found || CRITICAL_FLAGGED_REC_10231;
  }, [recs, selectedRecId]);

  const inspectRec = useCallback((recId: string) => {
    setSelectedRecId(recId);
    setActiveTab('risk-intelligence');
    const canonical = toCanonicalRole(currentUser?.role || 'AUDITOR').toLowerCase();
    if (canonical === 'auditor') {
      navigateToPath('/auditor/risk-alerts');
    } else if (canonical === 'issuer') {
      navigateToPath('/issuer/risk-alerts');
    } else if (canonical === 'admin') {
      navigateToPath('/admin/fraud-alerts');
    } else if (canonical === 'buyer') {
      navigateToPath('/buyer/verification');
    }
  }, [currentUser, navigateToPath]);

  // Update alert status
  const updateAlertStatus = useCallback((alertId: string, status: AlertStatus, noteText?: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        const notes = [...a.investigationNotes];
        if (noteText) {
          notes.push({
            id: `NOTE-${Date.now()}`,
            author: currentUser.name,
            role: currentUser.role,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
            content: noteText,
            actionTaken: `Status updated to ${status}`
          });
        }
        return { ...a, status, investigationNotes: notes };
      }
      return a;
    }));

    addToast({
      type: 'success',
      title: 'Investigation Updated',
      message: `Alert ${alertId} status marked as ${status}`
    });
  }, [currentUser, addToast]);

  const addInvestigationNote = useCallback((alertId: string, content: string, action?: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          investigationNotes: [
            ...a.investigationNotes,
            {
              id: `NOTE-${Date.now()}`,
              author: currentUser.name,
              role: currentUser.role,
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
              content,
              actionTaken: action
            }
          ]
        };
      }
      return a;
    }));

    addToast({
      type: 'success',
      title: 'Audit Note Logged',
      message: `Note added to official investigation dossier for ${alertId}`
    });
  }, [currentUser, addToast]);

  const assignAuditor = useCallback((alertId: string, auditorName: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, assignedAuditor: auditorName } : a));
    addToast({
      type: 'info',
      title: 'Auditor Assigned',
      message: `Case ${alertId} assigned to ${auditorName}`
    });
  }, [addToast]);

  const openInvestigationCase = useCallback((recId: string, alertType: string, summary: string, auditor = 'Senior Auditor') => {
    const newCaseId = `CASE-${Date.now().toString().slice(-4)}`;
    const newAlert: FraudAlert = {
      id: newCaseId,
      recId,
      alertType: alertType as any,
      riskScore: 85,
      riskBand: 'CRITICAL',
      detectedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      status: 'OPEN',
      assignedAuditor: auditor,
      summary,
      evidence: [`Manual case opened by ${currentUser.name}: ${summary}`],
      investigationNotes: [
        {
          id: `NOTE-${Date.now()}`,
          author: currentUser.name,
          role: currentUser.role,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
          content: `Case formally opened and assigned to ${auditor}. Subpoena of SCADA meter logs queued.`,
          actionTaken: 'Case Opened'
        }
      ]
    };

    setAlerts(prev => [newAlert, ...prev]);
    addToast({
      type: 'success',
      title: 'Investigation Case Opened',
      message: `${newCaseId} created for ${recId}`
    });
  }, [currentUser, addToast]);

  // Ledger actions
  const tamperBlock = useCallback((blockNumber: number, field: string = 'energyQuantityMWh', value: any = 99999) => {
    setLedgerBlocks(prev => prev.map(b => {
      if (b.blockNumber === blockNumber) {
        return {
          ...b,
          status: 'TAMPERED',
          isTampered: true,
          dataPayload: {
            ...b.dataPayload,
            [field]: value,
            _unauthorized_tampering: true
          }
        };
      }
      return b;
    }));

    addToast({
      type: 'warning',
      title: 'Simulated Data Tampering',
      message: `Block #${blockNumber} payload altered without recomputing cryptographic hash.`
    });
  }, [addToast]);

  const restoreBlock = useCallback((blockNumber: number) => {
    const original = SEEDED_LEDGER_BLOCKS.find(b => b.blockNumber === blockNumber);
    if (!original) return;
    setLedgerBlocks(prev => prev.map(b => {
      if (b.blockNumber === blockNumber) {
        return { ...original, status: 'VALID', isTampered: false };
      }
      return b;
    }));
    addToast({
      type: 'success',
      title: 'Block Integrity Restored',
      message: `Block #${blockNumber} reverted to original state.`
    });
  }, [addToast]);

  const restoreLedger = useCallback(() => {
    setLedgerBlocks(SEEDED_LEDGER_BLOCKS.map(b => ({ ...b, status: 'VALID', isTampered: false })));
    addToast({
      type: 'success',
      title: 'Ledger Reset',
      message: 'All blocks restored to verified cryptographic hashes.'
    });
  }, [addToast]);

  const isLedgerValid = useMemo(() => {
    return !ledgerBlocks.some(b => b.status === 'TAMPERED' || b.isTampered);
  }, [ledgerBlocks]);

  const verifyLedgerIntegrity = useCallback(async () => {
    for (let i = 0; i < ledgerBlocks.length; i++) {
      const b = ledgerBlocks[i];
      if (b.status === 'TAMPERED' || b.isTampered) {
        return { valid: false, corruptedIndex: b.blockNumber };
      }
      if (i > 0) {
        const prev = ledgerBlocks[i - 1];
        if (b.previousHash !== prev.currentHash) {
          return { valid: false, corruptedIndex: b.blockNumber };
        }
      }
    }
    return { valid: true };
  }, [ledgerBlocks]);

  const verifyLedger = useCallback(() => {
    for (let i = 0; i < ledgerBlocks.length; i++) {
      const b = ledgerBlocks[i];
      if (i > 0) {
        const prev = ledgerBlocks[i - 1];
        if (b.previousHash !== prev.currentHash) {
          return {
            isValid: false,
            brokenBlockNumber: b.blockNumber,
            reason: `Broken chain link at Block #${b.blockNumber}. Recorded previousHash does not match Block #${prev.blockNumber}'s currentHash.`,
            totalBlocksVerified: i
          };
        }
      }

      const expected = computeBlockHash(
        b.blockNumber,
        b.previousHash,
        b.timestamp,
        b.actor,
        b.recId,
        b.event,
        b.dataPayload
      );

      if (expected !== b.currentHash || b.status === 'TAMPERED') {
        return {
          isValid: false,
          brokenBlockNumber: b.blockNumber,
          reason: `Cryptographic Mismatch at Block #${b.blockNumber}! Payload has been altered. Expected: ${expected.slice(0, 16)}..., Recorded: ${b.currentHash.slice(0, 16)}...`,
          totalBlocksVerified: i
        };
      }
    }

    return {
      isValid: true,
      totalBlocksVerified: ledgerBlocks.length
    };
  }, [ledgerBlocks]);

  // Run AI Isolation Forest Detection
  const runAiDetection = useCallback((contamination = 0.08) => {
    setIsAiTraining(true);
    addToast({
      type: 'info',
      title: 'AI Pipeline Executing',
      message: 'Extracting 10D feature tensors and fitting Isolation Forest ensemble...'
    });

    setTimeout(() => {
      const { model, metrics } = getOrTrainModel(recs, true, contamination);
      
      // Update all recs with fresh isolation forest score and re-evaluate rules
      const updatedRecs = recs.map(rec => {
        const fv = model.extractFeatures(rec);
        const { anomalyScore, isAnomaly } = model.predict(fv);
        const audit = evaluateRules(rec, recs, anomalyScore, isAnomaly);

        return {
          ...rec,
          anomalyScore,
          isAnomaly,
          riskScore: audit.riskScore,
          riskBand: audit.riskBand,
          scoreBreakdown: audit.breakdown,
          flagReasons: audit.flagReasons.length > 0 ? audit.flagReasons : rec.flagReasons,
          recommendedAction: audit.recommendedAction,
          status: audit.riskScore > 60 ? ('FLAGGED' as const) : rec.status
        };
      });

      setRecs(updatedRecs);
      setModelMetrics(metrics);
      setIsAiTraining(false);

      addToast({
        type: 'success',
        title: 'AI Anomaly Detection Completed',
        message: `Analyzed ${metrics.trainingRecords} records in ${metrics.processingTimeMs}ms. Detected ${metrics.anomaliesDetected} outliers.`
      });
    }, 700);
  }, [recs, addToast]);

  // Synthetic dataset regeneration
  const regenerateData = useCallback((count: number) => {
    addToast({
      type: 'info',
      title: 'Synthesizing Clean Energy Registry',
      message: `Generating ${count.toLocaleString()} verifiable REC records with realistic generation curves...`
    });

    setTimeout(() => {
      const newDataset = generateSyntheticDataset(count);
      setRecs(newDataset);
      setSelectedRecId('REC-10231');
      addToast({
        type: 'success',
        title: 'Dataset Ready',
        message: `Loaded ${count.toLocaleString()} records across Solar, Wind, Hydro, Geothermal, and Biomass.`
      });
    }, 400);
  }, [addToast]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated,
        setIsAuthenticated,
        login,
        registerUser,
        logout,
        demoCredentials: DEMO_CREDENTIALS,
        isAddRecOpen,
        setIsAddRecOpen,
        auditLogs,
        addAuditLog,
        addNewRec,
        activeTab,
        setActiveTab,
        recs,
        setRecs,
        selectedRecId,
        setSelectedRecId,
        selectedRec,
        alerts,
        updateAlertStatus,
        addInvestigationNote,
        assignAuditor,
        openInvestigationCase,
        ledgerBlocks,
        tamperBlock,
        restoreBlock,
        restoreLedger,
        verifyLedger,
        verifyLedgerIntegrity,
        isLedgerValid,
        modelMetrics,
        runAiDetection,
        isAiTraining,
        searchQuery,
        setSearchQuery,
        toasts,
        addToast,
        removeToast,
        regenerateData,
        inspectRec,
        currentPath,
        navigateToPath,
        navigateToRoleDashboard,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebarCollapsed
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
