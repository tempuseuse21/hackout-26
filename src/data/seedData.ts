import { RECRecord, FraudAlert, LedgerBlock, SuspiciousNetworkCluster, UserProfile } from '../types';
import { fallbackSha256 } from '../services/cryptoService';
import { GENESIS_HASH } from '../services/ledgerService';

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'USR-REG-01',
    name: 'Dr. Elena Rostova',
    email: 'admin@recguard.gov',
    role: 'ADMIN',
    organization: 'Federal Clean Energy Regulatory Commission (FCERC)',
    badge: 'Chief Regulatory Officer'
  },
  {
    id: 'USR-AUD-03',
    name: 'Sarah Chen, CISA',
    email: 'auditor@recguard.org',
    role: 'AUDITOR',
    organization: 'Veritas Energy Auditing & Forensics',
    badge: 'Lead Environmental Auditor'
  },
  {
    id: 'USR-ISS-02',
    name: 'Marcus Vance',
    email: 'issuer@cleanenergy.com',
    role: 'CERTIFICATE_ISSUER',
    organization: 'GreenAttribute Registry Services',
    badge: 'Accredited Issuer Admin'
  },
  {
    id: 'USR-BUY-04',
    name: 'David K. Miller',
    email: 'buyer@greentech.corp',
    role: 'CORPORATE_BUYER',
    organization: 'AeroTech Global Technologies (Scope 2 Procurement)',
    badge: 'Sustainability Director'
  }
];

export const INITIAL_AUDIT_LOGS: import('../types').AuditLogEntry[] = [
  {
    id: 'AUD-901',
    userId: 'USR-REG-01',
    userName: 'Dr. Elena Rostova',
    userRole: 'ADMIN',
    action: 'SYSTEM_BOOTSTRAP',
    timestamp: '2026-09-12 04:00:12 UTC',
    ipAddress: '192.168.1.10',
    result: 'SUCCESS',
    details: 'Calibrated Isolation Forest model with 1,000 baseline generation profiles.'
  },
  {
    id: 'AUD-902',
    userId: 'USR-ISS-02',
    userName: 'Marcus Vance',
    userRole: 'CERTIFICATE_ISSUER',
    action: 'REC_SUBMISSION',
    recId: 'REC-10231',
    timestamp: '2026-09-12 04:15:30 UTC',
    ipAddress: '172.16.0.45',
    result: 'SUCCESS',
    details: 'Submitted REC batch for Mojave Helios Array IV (Claimed: 18,500 MWh).'
  },
  {
    id: 'AUD-903',
    userId: 'USR-REG-01',
    userName: 'Dr. Elena Rostova',
    userRole: 'ADMIN',
    action: 'REC_ANALYSIS_EXECUTED',
    recId: 'REC-10231',
    timestamp: '2026-09-12 04:15:38 UTC',
    ipAddress: '192.168.1.10',
    result: 'FLAGGED',
    details: 'Risk score 91/100 (CRITICAL). Triggered RULE-002 and RULE-003 (+62.3% mismatch).'
  },
  {
    id: 'AUD-904',
    userId: 'USR-REG-01',
    userName: 'Dr. Elena Rostova',
    userRole: 'ADMIN',
    action: 'INVESTIGATION_OPENED',
    recId: 'REC-10231',
    timestamp: '2026-09-12 04:16:05 UTC',
    ipAddress: '192.168.1.10',
    result: 'SUCCESS',
    details: 'Case CASE-1023 opened and assigned to Senior Auditor Sarah Chen.'
  },
  {
    id: 'AUD-905',
    userId: 'USR-AUD-03',
    userName: 'Sarah Chen, CISA',
    userRole: 'AUDITOR',
    action: 'CASE_NOTE_ADDED',
    recId: 'REC-10231',
    timestamp: '2026-09-12 04:22:18 UTC',
    ipAddress: '10.0.4.88',
    result: 'SUCCESS',
    details: 'Subpoenaed CAISO hourly inverter SCADA meters. Generation mismatch confirmed.'
  },
  {
    id: 'AUD-906',
    userId: 'USR-REG-01',
    userName: 'Dr. Elena Rostova',
    userRole: 'ADMIN',
    action: 'LEDGER_INTEGRITY_VERIFIED',
    timestamp: '2026-09-12 04:30:00 UTC',
    ipAddress: '192.168.1.10',
    result: 'SUCCESS',
    details: 'Cryptographic hash-chain traversal complete: 100% blocks verified (GENESIS -> HEAD).'
  }
];

export const PLANTS_DATA = [
  { id: 'SOLAR-017', name: 'Mojave Helios Array IV', capacityMW: 120, source: 'SOLAR' as const, location: 'California, US', issuer: 'WestGrid Registries' },
  { id: 'WIND-004', name: 'Columbia Gorge Wind Farm', capacityMW: 85, source: 'WIND' as const, location: 'Oregon, US', issuer: 'Pacific Clean Issuers' },
  { id: 'HYDRO-009', name: 'Cascadia Hydroelectric Facility', capacityMW: 240, source: 'HYDRO' as const, location: 'Washington, US', issuer: 'Boreal Registry Group' },
  { id: 'GEO-002', name: 'Salton Sea Geothermal Complex', capacityMW: 60, source: 'GEOTHERMAL' as const, location: 'California, US', issuer: 'WestGrid Registries' },
  { id: 'SOLAR-031', name: 'Desert Sun PV Station Alpha', capacityMW: 95, source: 'SOLAR' as const, location: 'Nevada, US', issuer: 'Southwest REC Clearing' },
  { id: 'WIND-012', name: 'Midwest Prairie Wind Turbine 8', capacityMW: 150, source: 'WIND' as const, location: 'Iowa, US', issuer: 'Heartland Renewable Authority' },
  { id: 'BIOMASS-005', name: 'Evergreen Forest Biomass Co-Gen', capacityMW: 45, source: 'BIOMASS' as const, location: 'Maine, US', issuer: 'Atlantic Green Registry' },
  { id: 'SOLAR-008', name: 'Sonoran Radiant Park II', capacityMW: 180, source: 'SOLAR' as const, location: 'Arizona, US', issuer: 'Southwest REC Clearing' }
];

export const ISSUERS_DATA = [
  'WestGrid Registries',
  'Pacific Clean Issuers',
  'Boreal Registry Group',
  'Southwest REC Clearing',
  'Heartland Renewable Authority',
  'Atlantic Green Registry'
];

export const BUYERS_DATA = [
  'AeroTech Global Technologies',
  'CloudMatrix Data Centers',
  'Nexus Logistics Corp',
  'Hyperion Electric Vehicles',
  'Vanguard Biotech Laboratories',
  'Zenith Financial Group'
];

export const TRADERS_DATA = [
  'Apex Energy Traders Inc',
  'EcoClear Brokerage',
  'Nordic Carbon Exchange',
  'Global REC Liquidity LP'
];

// Helper to calculate deterministic seed fingerprint
function makeFingerprint(rec: { id: string; plantId: string; generationId: string; energyQuantityMWh: number; issuanceDate: string; issuerId: string }): string {
  const payload = `${rec.id}|${rec.plantId}|${rec.generationId}|${rec.energyQuantityMWh}|${rec.issuanceDate}|${rec.issuerId}`;
  return fallbackSha256(payload);
}

// Famous showcase critical record
export const CRITICAL_FLAGGED_REC_10231: RECRecord = {
  id: 'REC-10231',
  plantId: 'SOLAR-017',
  plantName: 'Mojave Helios Array IV',
  plantCapacityMW: 120,
  energySource: 'SOLAR',
  location: 'California, US',
  
  generationId: 'GEN-88421',
  claimedGenerationMWh: 18500,
  verifiedGenerationMWh: 11390,
  eligibleRenewableMWh: 11390,
  energyQuantityMWh: 18500,
  
  issuerId: 'ISS-WEST-01',
  issuerName: 'WestGrid Registries',
  currentOwnerId: 'TRD-APEX-01',
  currentOwnerName: 'Apex Energy Traders Inc',
  
  generationDate: '2026-08-14',
  issuanceDate: '2026-08-20',
  lastTransferDate: '2026-08-25',
  
  status: 'FLAGGED',
  riskScore: 91,
  riskBand: 'CRITICAL',
  anomalyScore: 0.884,
  isAnomaly: true,
  
  scoreBreakdown: {
    duplicateClaim: 30,
    generationMismatch: 25,
    aiAnomaly: 20,
    transferAnomaly: 10,
    historicalPattern: 6,
    overIssuance: 0,
    retirementReuse: 0
  },
  
  flagReasons: [
    'Duplicate Claim: Generation ID GEN-88421 appears in duplicate certificate REC-10452.',
    'Generation Mismatch: Claimed generation (18,500 MWh) exceeds verified smart-meter output (11,390 MWh) by 62.4%.',
    'AI Anomaly: Isolation Forest detected severe outlier across plant capacity, generation spikes, and issuance timing.',
    'Suspicious Transfer: Rapid velocity of 4 ownership changes within 120 hours prior to scheduled retirement.',
    'Historical Pattern: Generation claim deviates by +78% from 5-year seasonal output curves for Mojave Helios IV.'
  ],
  
  recommendedAction: 'URGENT: Issue regulatory freeze on certificate REC-10231. Prevent retirement claim by corporate buyer. Refer to forensic energy auditor.',
  fingerprintSha256: makeFingerprint({
    id: 'REC-10231',
    plantId: 'SOLAR-017',
    generationId: 'GEN-88421',
    energyQuantityMWh: 18500,
    issuanceDate: '2026-08-20',
    issuerId: 'ISS-WEST-01'
  }),
  transferCount: 4,
  features: {
    plantCapacityMW: 120,
    historicalGenMWh: 11200,
    currentGenMWh: 18500,
    genFrequencyDays: 30,
    recQuantity: 18500,
    issuanceFreqDays: 6,
    transferFrequency: 4,
    timeBetweenTransfersHours: 24,
    historicalDeviationPercent: 62.4,
    claimedVsVerifiedRatio: 1.624
  }
};

export const DUPLICATE_TWIN_REC_10452: RECRecord = {
  id: 'REC-10452',
  plantId: 'SOLAR-017',
  plantName: 'Mojave Helios Array IV',
  plantCapacityMW: 120,
  energySource: 'SOLAR',
  location: 'California, US',
  generationId: 'GEN-88421', // Duplicate claim!
  claimedGenerationMWh: 11390,
  verifiedGenerationMWh: 11390,
  eligibleRenewableMWh: 11390,
  energyQuantityMWh: 11390,
  issuerId: 'ISS-PACIFIC-02',
  issuerName: 'Pacific Clean Issuers',
  currentOwnerId: 'BUY-CLOUD-02',
  currentOwnerName: 'CloudMatrix Data Centers',
  generationDate: '2026-08-14',
  issuanceDate: '2026-08-22',
  status: 'FLAGGED',
  riskScore: 78,
  riskBand: 'HIGH',
  anomalyScore: 0.74,
  isAnomaly: true,
  scoreBreakdown: {
    duplicateClaim: 30,
    generationMismatch: 0,
    aiAnomaly: 20,
    transferAnomaly: 0,
    historicalPattern: 0,
    overIssuance: 28,
    retirementReuse: 0
  },
  flagReasons: [
    'Duplicate Claim: Meter Generation ID GEN-88421 was already issued to REC-10231.',
    'Multi-Registry Issuance: Cross-registry claim between WestGrid and Pacific Clean Issuers.'
  ],
  recommendedAction: 'Freeze cross-registry clearing. Request simultaneous verification affidavit from both registry boards.',
  fingerprintSha256: makeFingerprint({
    id: 'REC-10452',
    plantId: 'SOLAR-017',
    generationId: 'GEN-88421',
    energyQuantityMWh: 11390,
    issuanceDate: '2026-08-22',
    issuerId: 'ISS-PACIFIC-02'
  }),
  transferCount: 1,
  features: {
    plantCapacityMW: 120,
    historicalGenMWh: 11200,
    currentGenMWh: 11390,
    genFrequencyDays: 30,
    recQuantity: 11390,
    issuanceFreqDays: 8,
    transferFrequency: 1,
    timeBetweenTransfersHours: 120,
    historicalDeviationPercent: 1.7,
    claimedVsVerifiedRatio: 1.0
  }
};

export const RETIREMENT_REUSE_REC_10115: RECRecord = {
  id: 'REC-10115',
  plantId: 'HYDRO-009',
  plantName: 'Cascadia Hydroelectric Facility',
  plantCapacityMW: 240,
  energySource: 'HYDRO',
  location: 'Washington, US',
  generationId: 'GEN-77192',
  claimedGenerationMWh: 5000,
  verifiedGenerationMWh: 5000,
  eligibleRenewableMWh: 5000,
  energyQuantityMWh: 5000,
  issuerId: 'ISS-BOREAL-03',
  issuerName: 'Boreal Registry Group',
  currentOwnerId: 'BUY-NEXUS-03',
  currentOwnerName: 'Nexus Logistics Corp',
  generationDate: '2026-07-10',
  issuanceDate: '2026-07-15',
  retirementDate: '2026-08-01',
  lastTransferDate: '2026-08-18', // Transferred AFTER retirement!
  status: 'FLAGGED',
  isRetiredReused: true,
  riskScore: 85,
  riskBand: 'CRITICAL',
  anomalyScore: 0.81,
  isAnomaly: true,
  scoreBreakdown: {
    duplicateClaim: 0,
    generationMismatch: 0,
    aiAnomaly: 20,
    transferAnomaly: 10,
    historicalPattern: 0,
    overIssuance: 0,
    retirementReuse: 35
  },
  flagReasons: [
    'Retirement Reuse: Certificate was formally retired on 2026-08-01 but subsequent transfer transaction was logged on 2026-08-18.',
    'Double-Counting Hazard: Scope 2 retirement claims already logged for primary corporate reporting period.'
  ],
  recommendedAction: 'Nullify post-retirement transfer. Issue non-compliance warning to broker and notify GHG Protocol auditor.',
  fingerprintSha256: makeFingerprint({
    id: 'REC-10115',
    plantId: 'HYDRO-009',
    generationId: 'GEN-77192',
    energyQuantityMWh: 5000,
    issuanceDate: '2026-07-15',
    issuerId: 'ISS-BOREAL-03'
  }),
  transferCount: 3,
  features: {
    plantCapacityMW: 240,
    historicalGenMWh: 5000,
    currentGenMWh: 5000,
    genFrequencyDays: 30,
    recQuantity: 5000,
    issuanceFreqDays: 5,
    transferFrequency: 3,
    timeBetweenTransfersHours: 12,
    historicalDeviationPercent: 0,
    claimedVsVerifiedRatio: 1.0
  }
};

export const OVER_ISSUANCE_REC_10088: RECRecord = {
  id: 'REC-10088',
  plantId: 'WIND-004',
  plantName: 'Columbia Gorge Wind Farm',
  plantCapacityMW: 85,
  energySource: 'WIND',
  location: 'Oregon, US',
  generationId: 'GEN-66231',
  claimedGenerationMWh: 14200,
  verifiedGenerationMWh: 8100,
  eligibleRenewableMWh: 8100,
  energyQuantityMWh: 14200,
  issuerId: 'ISS-PACIFIC-02',
  issuerName: 'Pacific Clean Issuers',
  currentOwnerId: 'TRD-ECO-02',
  currentOwnerName: 'EcoClear Brokerage',
  generationDate: '2026-07-28',
  issuanceDate: '2026-08-05',
  status: 'FLAGGED',
  riskScore: 75,
  riskBand: 'HIGH',
  anomalyScore: 0.72,
  isAnomaly: true,
  scoreBreakdown: {
    duplicateClaim: 0,
    generationMismatch: 20,
    aiAnomaly: 20,
    transferAnomaly: 5,
    historicalPattern: 0,
    overIssuance: 30,
    retirementReuse: 0
  },
  flagReasons: [
    'Over-Issuance: Certificate volume (14,200 MWh) surpasses maximum theoretical nameplate capacity for 85MW turbine field.',
    'Discrepancy of 75.3% over verified plant feeder metering.'
  ],
  recommendedAction: 'Rescind surplus REC quantities down to verified 8,100 MWh generation baseline.',
  fingerprintSha256: makeFingerprint({
    id: 'REC-10088',
    plantId: 'WIND-004',
    generationId: 'GEN-66231',
    energyQuantityMWh: 14200,
    issuanceDate: '2026-08-05',
    issuerId: 'ISS-PACIFIC-02'
  }),
  transferCount: 2,
  features: {
    plantCapacityMW: 85,
    historicalGenMWh: 8000,
    currentGenMWh: 14200,
    genFrequencyDays: 30,
    recQuantity: 14200,
    issuanceFreqDays: 8,
    transferFrequency: 2,
    timeBetweenTransfersHours: 48,
    historicalDeviationPercent: 77.5,
    claimedVsVerifiedRatio: 1.75
  }
};

/**
 * Generator for realistic baseline dataset
 */
export function generateSyntheticDataset(count = 1000): RECRecord[] {
  const records: RECRecord[] = [
    CRITICAL_FLAGGED_REC_10231,
    DUPLICATE_TWIN_REC_10452,
    RETIREMENT_REUSE_REC_10115,
    OVER_ISSUANCE_REC_10088
  ];

  const statuses: RECRecord['status'][] = ['ACTIVE', 'TRANSFERRED', 'RETIRED'];

  for (let i = 5; i <= count; i++) {
    const idNum = 10000 + i;
    const recId = `REC-${idNum}`;
    const plant = PLANTS_DATA[i % PLANTS_DATA.length];
    const issuer = plant.issuer;
    const genId = `GEN-${70000 + i * 3}`;
    
    // Inject ~6% anomalous / suspicious cases
    const isSuspicious = (i % 16 === 0);
    const isDuplicateInject = (i % 45 === 0);
    const isMismatchInject = (i % 22 === 0);

    let claimedMWh = Math.round(plant.capacityMW * (90 + (i % 60)));
    let verifiedMWh = claimedMWh;
    let eligibleMWh = claimedMWh;
    let recQuantity = claimedMWh;
    let transferCount = (i % 4) + 1;
    let status = statuses[i % statuses.length];
    let isRetiredReused = false;
    let anomalyScore = 0.15 + (i % 20) * 0.01;
    let isAnomaly = false;

    let duplicateScore = 0;
    let mismatchScore = 0;
    let overIssuanceScore = 0;
    let retirementReuseScore = 0;
    let transferScore = 0;
    let histScore = 0;
    let aiScore = 0;
    const flagReasons: string[] = [];

    if (isMismatchInject) {
      // 25% to 45% mismatch
      verifiedMWh = Math.round(claimedMWh * 0.72);
      eligibleMWh = verifiedMWh;
      mismatchScore = 20;
      flagReasons.push(`Generation Mismatch: Claimed output exceeds verified meter feed by 38.9%.`);
      anomalyScore = 0.68;
      isAnomaly = true;
      aiScore = 20;
    }

    if (isDuplicateInject) {
      duplicateScore = 30;
      flagReasons.push(`Duplicate Claim: Generation identifier ${genId} registered across external state tally.`);
    }

    if (isSuspicious && !isMismatchInject && !isDuplicateInject) {
      if (i % 3 === 0) {
        // retirement reuse
        status = 'FLAGGED';
        isRetiredReused = true;
        retirementReuseScore = 35;
        flagReasons.push(`Retirement Reuse: Historical retired balance detected in current trade ledger.`);
      } else {
        // over-issuance
        recQuantity = Math.round(claimedMWh * 1.4);
        overIssuanceScore = 30;
        flagReasons.push(`Over-Issuance: Batch quantity exceeds plant generation ceiling.`);
      }
      anomalyScore = 0.76;
      isAnomaly = true;
      aiScore = 20;
    }

    const rawScore = duplicateScore + mismatchScore + overIssuanceScore + retirementReuseScore + transferScore + histScore + aiScore;
    const riskScore = Math.min(100, Math.max(8 + (i % 18), rawScore));

    let riskBand: RECRecord['riskBand'] = 'LOW';
    if (riskScore > 80) riskBand = 'CRITICAL';
    else if (riskScore > 60) riskBand = 'HIGH';
    else if (riskScore > 30) riskBand = 'MEDIUM';

    if (riskScore > 60) {
      status = 'FLAGGED';
    }

    const genDate = new Date(Date.now() - (i * 3600 * 1000 * 8)).toISOString().slice(0, 10);
    const issueDate = new Date(Date.now() - (i * 3600 * 1000 * 7)).toISOString().slice(0, 10);

    const owner = (status === 'RETIRED') 
      ? BUYERS_DATA[i % BUYERS_DATA.length] 
      : (transferCount > 1 ? TRADERS_DATA[i % TRADERS_DATA.length] : BUYERS_DATA[i % BUYERS_DATA.length]);

    const rec: RECRecord = {
      id: recId,
      plantId: plant.id,
      plantName: plant.name,
      plantCapacityMW: plant.capacityMW,
      energySource: plant.source,
      location: plant.location,
      generationId: genId,
      claimedGenerationMWh: claimedMWh,
      verifiedGenerationMWh: verifiedMWh,
      eligibleRenewableMWh: eligibleMWh,
      energyQuantityMWh: recQuantity,
      issuerId: `ISS-${plant.id.slice(0, 4)}-01`,
      issuerName: issuer,
      currentOwnerId: `OWN-${i % 20}`,
      currentOwnerName: owner,
      generationDate: genDate,
      issuanceDate: issueDate,
      lastTransferDate: new Date(Date.now() - (i * 3600 * 1000 * 2)).toISOString().slice(0, 10),
      retirementDate: status === 'RETIRED' ? new Date().toISOString().slice(0, 10) : undefined,
      status,
      riskScore,
      riskBand,
      anomalyScore: parseFloat(anomalyScore.toFixed(3)),
      isAnomaly,
      scoreBreakdown: {
        duplicateClaim: duplicateScore,
        generationMismatch: mismatchScore,
        aiAnomaly: aiScore,
        transferAnomaly: transferScore,
        historicalPattern: histScore,
        overIssuance: overIssuanceScore,
        retirementReuse: retirementReuseScore
      },
      flagReasons: flagReasons.length > 0 ? flagReasons : ['All telemetry parameters verified against smart-meter feeds.'],
      recommendedAction: riskScore > 60 ? 'Submit to compliance desk for audit.' : 'Certificate fully cleared for Scope 2 environmental reporting.',
      fingerprintSha256: makeFingerprint({
        id: recId,
        plantId: plant.id,
        generationId: genId,
        energyQuantityMWh: recQuantity,
        issuanceDate: issueDate,
        issuerId: `ISS-${plant.id.slice(0, 4)}-01`
      }),
      transferCount,
      isRetiredReused,
      features: {
        plantCapacityMW: plant.capacityMW,
        historicalGenMWh: Math.round(plant.capacityMW * 135),
        currentGenMWh: claimedMWh,
        genFrequencyDays: 30,
        recQuantity,
        issuanceFreqDays: 5,
        transferFrequency: transferCount,
        timeBetweenTransfersHours: 48,
        historicalDeviationPercent: parseFloat((((claimedMWh - verifiedMWh) / verifiedMWh) * 100).toFixed(1)),
        claimedVsVerifiedRatio: parseFloat((claimedMWh / Math.max(1, verifiedMWh)).toFixed(2))
      }
    };

    records.push(rec);
  }

  return records;
}

export const SEEDED_ALERTS: FraudAlert[] = [
  {
    id: 'ALT-4091',
    recId: 'REC-10231',
    alertType: 'Generation Mismatch',
    riskScore: 91,
    riskBand: 'CRITICAL',
    detectedAt: '2026-08-25 14:32:09 UTC',
    status: 'OPEN',
    assignedAuditor: 'Sarah Chen, CISA',
    summary: 'Claimed generation exceeds verified smart-meter by 62.4% + Duplicate Gen ID GEN-88421.',
    evidence: [
      'Smart meter feed ID #MTR-MOJAVE-04 logged 11,390 MWh output during billing cycle.',
      'REC batch claimed 18,500 MWh on WestGrid registry.',
      'GEN-88421 also attached to REC-10452 on Pacific Clean Issuers registry.',
      'Isolation Forest anomaly score: 0.884 (Threshold: 0.600).'
    ],
    investigationNotes: [
      {
        id: 'NOTE-1',
        author: 'Sarah Chen, CISA',
        role: 'AUDITOR',
        timestamp: '2026-08-26 09:15:00 UTC',
        content: 'Cross-checked SCADA inverter telemetry from Mojave IV. Output confirms verified 11,390 MWh. Claimed 18,500 MWh appears inflated by 62%. Flagging for regulator freeze.',
        actionTaken: 'Flagged for freeze'
      }
    ]
  },
  {
    id: 'ALT-4092',
    recId: 'REC-10452',
    alertType: 'Duplicate Claim',
    riskScore: 78,
    riskBand: 'HIGH',
    detectedAt: '2026-08-25 15:10:44 UTC',
    status: 'UNDER_REVIEW',
    assignedAuditor: 'Sarah Chen, CISA',
    summary: 'Cross-registry duplicate generation ID GEN-88421 matching REC-10231.',
    evidence: [
      'Identical generation window August 1-14 2026.',
      'Claimed independently at Pacific Clean Issuers and WestGrid Registries.'
    ],
    investigationNotes: []
  },
  {
    id: 'ALT-4093',
    recId: 'REC-10115',
    alertType: 'Retirement Reuse',
    riskScore: 85,
    riskBand: 'CRITICAL',
    detectedAt: '2026-08-22 11:04:12 UTC',
    status: 'OPEN',
    assignedAuditor: 'Dr. Elena Rostova',
    summary: 'Post-retirement transfer execution logged after corporate retirement certificate was issued.',
    evidence: [
      'Retired formally in Registry block #219 on 2026-08-01.',
      'Secondary transfer executed to Nexus Logistics on 2026-08-18.'
    ],
    investigationNotes: []
  },
  {
    id: 'ALT-4094',
    recId: 'REC-10088',
    alertType: 'Over-Issuance',
    riskScore: 75,
    riskBand: 'HIGH',
    detectedAt: '2026-08-20 08:44:21 UTC',
    status: 'UNDER_REVIEW',
    assignedAuditor: 'Marcus Vance',
    summary: 'Batch volume (14,200 MWh) exceeds plant capacity ceiling for Columbia Gorge Wind.',
    evidence: [
      'Plant capacity 85 MW cannot produce 14,200 MWh within logged 10-day period (Max theoretical: 20,400 at 100% capacity factor, actual average capacity factor 39.7%).'
    ],
    investigationNotes: []
  }
];

export const SEEDED_LEDGER_BLOCKS: LedgerBlock[] = [
  {
    blockNumber: 0,
    transactionId: 'TX-0000-GENESIS',
    timestamp: '2026-08-01T00:00:00Z',
    actor: 'SYSTEM_ROOT',
    recId: 'SYS-GENESIS',
    event: 'CREATED',
    previousHash: GENESIS_HASH,
    currentHash: '3A1B9F74E82C0154D9842FBC810967A208B46C9A2054D9842FBC810967A208B4',
    status: 'VALID',
    dataPayload: { network: 'REC-GUARD-CONSORTIUM', protocol: 'Hyperledger-Fabric-Interlock-v2' }
  },
  {
    blockNumber: 1,
    transactionId: 'TX-8842-A001',
    timestamp: '2026-08-14T10:02:15Z',
    actor: 'SOLAR-017 (Mojave IV Telemetry Gateway)',
    recId: 'REC-10231',
    event: 'CREATED',
    previousHash: '3A1B9F74E82C0154D9842FBC810967A208B46C9A2054D9842FBC810967A208B4',
    currentHash: '7C4A8D912E4F0B56A183C90E2D5F8A1B3E7C9D2E4F0B56A183C90E2D5F8A1B3E',
    status: 'VALID',
    dataPayload: { meterId: 'MTR-MOJAVE-04', grossKWh: 11390000, solarIrradianceIndex: 94.2 }
  },
  {
    blockNumber: 2,
    transactionId: 'TX-8842-A002',
    timestamp: '2026-08-20T10:08:40Z',
    actor: 'WestGrid Registries (Admin Cert-07)',
    recId: 'REC-10231',
    event: 'ISSUED',
    previousHash: '7C4A8D912E4F0B56A183C90E2D5F8A1B3E7C9D2E4F0B56A183C90E2D5F8A1B3E',
    currentHash: 'A83F7C91D4E2B085A621F09E3C5D7B1A4F8E2C901A5D8E4F7B3C6A2E1D9F0A83',
    status: 'VALID',
    dataPayload: { claimedMWh: 18500, verifiedMWh: 11390, recipient: 'Apex Energy Traders Inc' }
  },
  {
    blockNumber: 3,
    transactionId: 'TX-8842-A003',
    timestamp: '2026-08-23T11:34:19Z',
    actor: 'Apex Energy Traders Inc',
    recId: 'REC-10231',
    event: 'TRANSFERRED',
    previousHash: 'A83F7C91D4E2B085A621F09E3C5D7B1A4F8E2C901A5D8E4F7B3C6A2E1D9F0A83',
    currentHash: 'D2E4A91B83F7C085A621F09E3C5D7B1A4F8E2C901A5D8E4F7B3C6A2E1D9F0A83',
    status: 'VALID',
    dataPayload: { transferFrom: 'Apex Energy Traders Inc', transferTo: 'EcoClear Brokerage', contractId: 'PPA-2026-991' }
  },
  {
    blockNumber: 4,
    transactionId: 'TX-8842-A004',
    timestamp: '2026-08-25T14:42:00Z',
    actor: 'REC-GUARD Automated Guard Agent',
    recId: 'REC-10231',
    event: 'TRANSFERRED',
    previousHash: 'D2E4A91B83F7C085A621F09E3C5D7B1A4F8E2C901A5D8E4F7B3C6A2E1D9F0A83',
    currentHash: 'F5B8A1D3C7E90246A819F30E5C2D7B4A1F9E3C802A4D7E5F6B2C5A1E0D8F9A72',
    status: 'VALID',
    dataPayload: { action: 'FLAGGED_SUSPENDED', riskScore: 91, flagReason: 'Mismatch + Duplicate Gen Claim' }
  }
];

export const SUSPICIOUS_NETWORK_07: SuspiciousNetworkCluster = {
  id: 'NET-07',
  name: 'Suspicious Network Cluster #07 (High Velocity Wash Trading)',
  certificatesCount: 12,
  entitiesCount: 4,
  transfersCount: 8,
  anomaliesCount: 3,
  riskBand: 'HIGH',
  description: 'Circular transfer loops observed between Apex Energy Traders and EcoClear Brokerage prior to scheduled corporate retirements.',
  involvedEntityIds: ['SOLAR-017', 'ISS-WEST-01', 'TRD-APEX-01', 'TRD-ECO-02', 'BUY-AERO-01'],
  involvedRecIds: ['REC-10231', 'REC-10452', 'REC-10304', 'REC-10088']
};
