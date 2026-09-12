export type RiskBand = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type RECStatus = 'ACTIVE' | 'FLAGGED' | 'SUSPENDED' | 'TRANSFERRED' | 'RETIRED';

export type CanonicalRole = 'ADMIN' | 'ISSUER' | 'BUYER' | 'AUDITOR';

export type UserRole = 
  | 'ADMIN' 
  | 'REGULATOR' 
  | 'ISSUER' 
  | 'CERTIFICATE_ISSUER' 
  | 'AUDITOR' 
  | 'BUYER' 
  | 'CORPORATE_BUYER';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';

export function toCanonicalRole(role?: string): CanonicalRole {
  if (!role) return 'BUYER';
  const clean = role.trim().toUpperCase();
  if (clean === 'ADMIN' || clean === 'REGULATOR') return 'ADMIN';
  if (clean === 'ISSUER' || clean === 'CERTIFICATE_ISSUER') return 'ISSUER';
  if (clean === 'BUYER' || clean === 'CORPORATE_BUYER') return 'BUYER';
  if (clean === 'AUDITOR') return 'AUDITOR';
  return 'BUYER';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  badge: string;
  status?: UserStatus;
  createdAt?: string;
  lastLogin?: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  recId?: string;
  timestamp: string;
  ipAddress: string;
  result: 'SUCCESS' | 'FAILURE' | 'DENIED' | 'FLAGGED';
  details?: string;
}

export type EnergySource = 'SOLAR' | 'WIND' | 'HYDRO' | 'GEOTHERMAL' | 'BIOMASS' | 'Solar' | 'Wind' | 'Hydro';

export interface RECRecord {
  id: string; // e.g. "REC-10231"
  plantId: string; // e.g. "SOLAR-017"
  plantName: string;
  plantCapacityMW: number;
  energySource: EnergySource;
  location: string;
  
  generationId: string; // e.g. "GEN-88421"
  claimedGenerationMWh: number;
  verifiedGenerationMWh: number;
  eligibleRenewableMWh: number;
  energyQuantityMWh: number; // 1 REC = 1 MWh typically
  
  issuerId: string;
  issuerName: string;
  currentOwnerId: string;
  currentOwnerName: string;
  initialOwnerName?: string;
  
  generationDate: string;
  issuanceDate: string;
  lastTransferDate?: string;
  retirementDate?: string;
  
  status: RECStatus;
  
  // Risk & Detection
  riskScore: number; // 0 - 100
  riskBand: RiskBand;
  anomalyScore: number; // 0.0 - 1.0
  isAnomaly: boolean;
  
  // Breakdown of score
  scoreBreakdown?: {
    duplicateClaim?: number;
    duplicateRecId?: number;
    duplicateGenId?: number;
    generationMismatch?: number;
    aiAnomaly?: number;
    transferAnomaly?: number;
    suspiciousTransfer?: number;
    historicalPattern?: number;
    invalidTransition?: number;
    overIssuance?: number;
    retirementReuse?: number;
    [key: string]: number | undefined;
  };
  
  flagReasons: string[];
  recommendedAction: string;
  
  // Cryptography & Integrity
  fingerprintSha256: string;
  sha256Fingerprint?: string;
  digitalSignature?: string;
  previousHash?: string;
  tampered?: boolean;
  
  // Tracking
  transferCount: number;
  issuanceFrequencyDays?: number;
  transferFrequencyDays?: number;
  isRetiredReused?: boolean;
  lifecycleEvents?: any[];
  
  // AI Feature vector
  features?: {
    plantCapacityMW: number;
    historicalGenMWh: number;
    currentGenMWh: number;
    genFrequencyDays: number;
    recQuantity: number;
    issuanceFreqDays: number;
    transferFrequency: number;
    timeBetweenTransfersHours: number;
    historicalDeviationPercent: number;
    claimedVsVerifiedRatio: number;
  };
}

export interface LifecycleEvent {
  id: string;
  recId: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  event: 'GENERATION_RECORDED' | 'VERIFIED' | 'ISSUED' | 'TRANSFERRED' | 'RETIRED' | 'FLAGGED' | 'AUDIT_REVIEW';
  location?: string;
  transactionId: string;
  previousHash: string;
  currentHash: string;
  details: string;
}

export interface LedgerBlock {
  blockNumber: number;
  index?: number;
  transactionId: string;
  timestamp: string;
  actor: string;
  recId: string;
  event: 'CREATED' | 'ISSUED' | 'TRANSFERRED' | 'RETIRED' | 'FLAGGED';
  eventType?: string;
  previousHash: string;
  currentHash: string;
  hash?: string;
  status: 'VALID' | 'TAMPERED';
  isTampered?: boolean;
  details?: string;
  dataPayload: Record<string, any>;
}

export type AlertType = 
  | 'Duplicate Claim' 
  | 'Generation Mismatch' 
  | 'Over-Issuance' 
  | 'Retirement Reuse' 
  | 'Transfer Anomaly' 
  | 'AI Anomaly';

export type AlertStatus = 'OPEN' | 'UNDER_REVIEW' | 'IN_REVIEW' | 'ESCALATED' | 'RESOLVED' | 'FALSE_POSITIVE' | 'DISMISSED';

export interface FraudAlert {
  id: string; // e.g. "ALT-4091"
  recId: string;
  alertType: AlertType;
  title?: string;
  description?: string;
  severity?: AlertSeverity;
  riskScore: number;
  riskBand: RiskBand;
  detectedAt: string;
  timestamp?: string;
  status: AlertStatus;
  assignedAuditor: string;
  summary: string;
  evidence: string[];
  investigationNotes: InvestigationNote[];
}

export interface InvestigationNote {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  content: string;
  actionTaken?: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  type: 'PLANT' | 'ISSUER' | 'TRADER' | 'BUYER' | 'REC';
  riskScore?: number;
  isSuspicious?: boolean;
  subtext?: string;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  relation: 'ISSUED' | 'TRANSFERRED' | 'OWNED' | 'RETIRED';
  isSuspicious?: boolean;
  label?: string;
}

export interface SuspiciousNetworkCluster {
  id: string;
  name: string;
  certificatesCount: number;
  entitiesCount: number;
  transfersCount: number;
  anomaliesCount: number;
  riskBand: RiskBand;
  description: string;
  involvedEntityIds: string[];
  involvedRecIds: string[];
}

export interface ModelMetrics {
  algorithm: string;
  trainingRecords: number;
  featureCount: number;
  contaminationRate: number;
  anomaliesDetected: number;
  precision: number;
  recall: number;
  f1Score: number;
  accuracy: number;
  status: 'READY' | 'TRAINING' | 'EVALUATING';
  lastRunTimestamp: string;
  processingTimeMs: number;
}
