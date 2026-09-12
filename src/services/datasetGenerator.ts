import { RECRecord } from '../types';
import { generateSyntheticDataset } from '../data/seedData';
import { evaluateRules } from './rulesEngine';
import { fallbackSha256 } from './cryptoService';

export { generateSyntheticDataset };

export const CSV_TEMPLATE_HEADERS = [
  'rec_id',
  'plant_id',
  'plant_name',
  'energy_source',
  'plant_capacity_mw',
  'location',
  'generation_id',
  'claimed_generation_mwh',
  'verified_generation_mwh',
  'energy_quantity_mwh',
  'generation_date',
  'issuance_date',
  'issuer_name',
  'initial_owner_name',
  'current_owner_name',
  'status',
  'transfer_count',
  'risk_band',
  'risk_score',
  'flag_reasons',
  'recommended_action'
];

export async function parseCsvToRecs(csvText: string, existingRecs: RECRecord[] = []): Promise<RECRecord[]> {
  const res = parseAndAnalyzeCsv(csvText, existingRecs);
  return res.processedRecs;
}

export function exportRecsToCsv(recs: RECRecord[]): string {
  const headers = [
    'rec_id',
    'plant_id',
    'plant_name',
    'energy_source',
    'generation_id',
    'issuer_id',
    'issuer_name',
    'current_owner_name',
    'plant_capacity_mw',
    'claimed_generation_mwh',
    'verified_generation_mwh',
    'energy_quantity_mwh',
    'generation_timestamp',
    'issuance_timestamp',
    'transfer_count',
    'status',
    'risk_score',
    'risk_band',
    'anomaly_score',
    'sha256_fingerprint'
  ];

  const rows = recs.map(r => [
    r.id,
    r.plantId,
    `"${r.plantName.replace(/"/g, '""')}"`,
    r.energySource,
    r.generationId,
    r.issuerId,
    `"${r.issuerName.replace(/"/g, '""')}"`,
    `"${r.currentOwnerName.replace(/"/g, '""')}"`,
    r.plantCapacityMW,
    r.claimedGenerationMWh,
    r.verifiedGenerationMWh,
    r.energyQuantityMWh,
    r.generationDate,
    r.issuanceDate,
    r.transferCount,
    r.status,
    r.riskScore,
    r.riskBand,
    r.anomalyScore,
    r.fingerprintSha256
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

export function downloadCsvFile(content: string, filename = 'rec_guard_dataset.csv') {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export interface CsvValidationResult {
  valid: boolean;
  errors: string[];
  processedRecs: RECRecord[];
  summary: {
    totalRows: number;
    validRows: number;
    anomaliesFound: number;
    criticalRisks: number;
  };
}

export function parseAndAnalyzeCsv(csvText: string, existingRecs: RECRecord[] = []): CsvValidationResult {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    return {
      valid: false,
      errors: ['CSV file is empty or missing headers.'],
      processedRecs: [],
      summary: { totalRows: 0, validRows: 0, anomaliesFound: 0, criticalRisks: 0 }
    };
  }

  const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const requiredColumns = [
    'rec_id',
    'plant_id',
    'generation_id',
    'claimed_generation_mwh',
    'verified_generation_mwh'
  ];

  const missing = requiredColumns.filter(col => !rawHeaders.includes(col));
  if (missing.length > 0) {
    return {
      valid: false,
      errors: [`Missing mandatory columns: ${missing.join(', ')}. Expected at least: rec_id, plant_id, generation_id, claimed_generation_mwh, verified_generation_mwh.`],
      processedRecs: [],
      summary: { totalRows: lines.length - 1, validRows: 0, anomaliesFound: 0, criticalRisks: 0 }
    };
  }

  const recIdIdx = rawHeaders.indexOf('rec_id');
  const plantIdIdx = rawHeaders.indexOf('plant_id');
  const genIdIdx = rawHeaders.indexOf('generation_id');
  const claimedIdx = rawHeaders.indexOf('claimed_generation_mwh');
  const verifiedIdx = rawHeaders.indexOf('verified_generation_mwh');
  const issuerIdx = rawHeaders.indexOf('issuer_id');
  const capIdx = rawHeaders.indexOf('plant_capacity_mw');
  const statusIdx = rawHeaders.indexOf('status');

  const processedRecs: RECRecord[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));

    const recId = parts[recIdIdx] || `REC-${12000 + i}`;
    const plantId = parts[plantIdIdx] || 'PLANT-UNK';
    const genId = parts[genIdIdx] || `GEN-UNK-${i}`;
    const claimed = parseFloat(parts[claimedIdx]) || 1000;
    const verified = parseFloat(parts[verifiedIdx]) || 1000;
    const capacity = capIdx >= 0 ? parseFloat(parts[capIdx]) || 100 : 100;
    const issuer = issuerIdx >= 0 && parts[issuerIdx] ? parts[issuerIdx] : 'Grid Authority';
    const rawStatus = statusIdx >= 0 ? (parts[statusIdx].toUpperCase() as any) : 'ACTIVE';

    const fingerprint = fallbackSha256(`${recId}|${plantId}|${genId}|${claimed}|${new Date().toISOString()}|${issuer}`);

    const newRec: RECRecord = {
      id: recId,
      plantId,
      plantName: `${plantId} Facility`,
      plantCapacityMW: capacity,
      energySource: 'SOLAR',
      location: 'US Regional Interconnect',
      generationId: genId,
      claimedGenerationMWh: claimed,
      verifiedGenerationMWh: verified,
      eligibleRenewableMWh: verified,
      energyQuantityMWh: claimed,
      issuerId: issuer,
      issuerName: issuer,
      currentOwnerId: 'BUY-DEFAULT',
      currentOwnerName: 'Clean Energy Brokerage',
      generationDate: new Date().toISOString().slice(0, 10),
      issuanceDate: new Date().toISOString().slice(0, 10),
      status: rawStatus === 'RETIRED' ? 'RETIRED' : 'ACTIVE',
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
      recommendedAction: '',
      fingerprintSha256: fingerprint,
      transferCount: 1,
      features: {
        plantCapacityMW: capacity,
        historicalGenMWh: capacity * 120,
        currentGenMWh: claimed,
        genFrequencyDays: 30,
        recQuantity: claimed,
        issuanceFreqDays: 5,
        transferFrequency: 1,
        timeBetweenTransfersHours: 72,
        historicalDeviationPercent: parseFloat((((claimed - verified) / Math.max(1, verified)) * 100).toFixed(1)),
        claimedVsVerifiedRatio: parseFloat((claimed / Math.max(1, verified)).toFixed(2))
      }
    };

    // Run rule evaluation against union of existing and new
    const audit = evaluateRules(newRec, [...existingRecs, ...processedRecs]);
    newRec.riskScore = audit.riskScore;
    newRec.riskBand = audit.riskBand;
    newRec.scoreBreakdown = audit.breakdown;
    newRec.flagReasons = audit.flagReasons;
    newRec.recommendedAction = audit.recommendedAction;
    if (newRec.riskScore > 60) {
      newRec.status = 'FLAGGED';
    }

    processedRecs.push(newRec);
  }

  const anomaliesCount = processedRecs.filter(r => r.riskScore > 60).length;
  const criticalCount = processedRecs.filter(r => r.riskBand === 'CRITICAL').length;

  return {
    valid: true,
    errors,
    processedRecs,
    summary: {
      totalRows: lines.length - 1,
      validRows: processedRecs.length,
      anomaliesFound: anomaliesCount,
      criticalRisks: criticalCount
    }
  };
}
