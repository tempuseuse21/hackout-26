import { RECRecord, RiskBand } from '../types';

export interface RuleEvaluationResult {
  ruleId: string;
  ruleName: string;
  triggered: boolean;
  scoreContribution: number;
  explanation: string;
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
}

export interface FullAuditResult {
  riskScore: number;
  riskBand: RiskBand;
  breakdown: {
    duplicateRecId: number;
    duplicateGenId: number;
    generationMismatch: number;
    overIssuance: number;
    retirementReuse: number;
    suspiciousTransfer: number;
    invalidTransition: number;
    aiAnomaly: number;
  };
  flagReasons: string[];
  recommendedAction: string;
  ruleResults: RuleEvaluationResult[];
}

export function evaluateRules(
  rec: Partial<RECRecord>,
  allRecs: RECRecord[],
  aiAnomalyScore = 0,
  isAiAnomaly = false
): FullAuditResult {
  const ruleResults: RuleEvaluationResult[] = [];
  const flagReasons: string[] = [];

  let r1Score = 0;
  let r2Score = 0;
  let r3Score = 0;
  let r4Score = 0;
  let r5Score = 0;
  let r6Score = 0;
  let r7Score = 0;

  // RULE-001: Duplicate REC ID
  if (rec.id) {
    const matchingRecIds = allRecs.filter(r => r.id === rec.id);
    if (matchingRecIds.length > 1) {
      r1Score = 35;
      const msg = `RULE-001 Violation: Duplicate REC ID detected across registry (${rec.id}). Multiple certificate objects share identical identifier.`;
      flagReasons.push(msg);
      ruleResults.push({
        ruleId: 'RULE-001',
        ruleName: 'Duplicate REC ID',
        triggered: true,
        scoreContribution: 35,
        explanation: msg,
        severity: 'CRITICAL'
      });
    } else {
      ruleResults.push({
        ruleId: 'RULE-001',
        ruleName: 'Duplicate REC ID',
        triggered: false,
        scoreContribution: 0,
        explanation: 'Unique REC identifier verified across registry.',
        severity: 'INFO'
      });
    }
  }

  // RULE-002: Duplicate Generation ID
  if (rec.generationId) {
    const matchingGen = allRecs.filter(
      r => r.generationId === rec.generationId && r.id !== rec.id
    );
    if (matchingGen.length > 0) {
      r2Score = 30;
      const otherIds = matchingGen.map(m => m.id).join(', ');
      const msg = `RULE-002 Violation: Generation ID ${rec.generationId} has duplicate claims across multiple certificates (${otherIds}).`;
      flagReasons.push(msg);
      ruleResults.push({
        ruleId: 'RULE-002',
        ruleName: 'Duplicate Generation ID',
        triggered: true,
        scoreContribution: 30,
        explanation: msg,
        severity: 'CRITICAL'
      });
    } else {
      ruleResults.push({
        ruleId: 'RULE-002',
        ruleName: 'Duplicate Generation ID',
        triggered: false,
        scoreContribution: 0,
        explanation: `Generation ID ${rec.generationId} verified unique to this certificate.`,
        severity: 'INFO'
      });
    }
  }

  // RULE-003: Generation Mismatch
  const claimed = rec.claimedGenerationMWh || 0;
  const verified = rec.verifiedGenerationMWh || 0;
  if (claimed > 0 && verified > 0) {
    if (claimed > verified) {
      const discrepancyPct = ((claimed - verified) / verified) * 100;
      if (discrepancyPct > 50) {
        r3Score = 25;
        const msg = `RULE-003 Violation: Claimed generation (${claimed.toLocaleString()} MWh) exceeds verified SCADA meter data (${verified.toLocaleString()} MWh) by ${discrepancyPct.toFixed(1)}%.`;
        flagReasons.push(msg);
        ruleResults.push({
          ruleId: 'RULE-003',
          ruleName: 'Generation Mismatch',
          triggered: true,
          scoreContribution: 25,
          explanation: msg,
          severity: 'CRITICAL'
        });
      } else if (discrepancyPct > 20) {
        r3Score = 18;
        const msg = `RULE-003 Violation: Claimed generation exceeds verified SCADA meter data by ${discrepancyPct.toFixed(1)}%.`;
        flagReasons.push(msg);
        ruleResults.push({
          ruleId: 'RULE-003',
          ruleName: 'Generation Mismatch',
          triggered: true,
          scoreContribution: 18,
          explanation: msg,
          severity: 'HIGH'
        });
      } else if (discrepancyPct > 5) {
        r3Score = 10;
        const msg = `RULE-003 Warning: Claimed generation exceeds verified SCADA meter data by ${discrepancyPct.toFixed(1)}%.`;
        flagReasons.push(msg);
        ruleResults.push({
          ruleId: 'RULE-003',
          ruleName: 'Generation Mismatch',
          triggered: true,
          scoreContribution: 10,
          explanation: msg,
          severity: 'WARNING'
        });
      } else {
        ruleResults.push({
          ruleId: 'RULE-003',
          ruleName: 'Generation Mismatch',
          triggered: false,
          scoreContribution: 0,
          explanation: `Claimed volume (${claimed} MWh) aligns within 5% tolerance of verified SCADA meter (${verified} MWh).`,
          severity: 'INFO'
        });
      }
    } else {
      ruleResults.push({
        ruleId: 'RULE-003',
        ruleName: 'Generation Mismatch',
        triggered: false,
        scoreContribution: 0,
        explanation: `Claimed generation (${claimed.toLocaleString()} MWh) matches verified SCADA meter data (${verified.toLocaleString()} MWh).`,
        severity: 'INFO'
      });
    }
  }

  // RULE-004: Over-Issuance
  const recQuantity = rec.energyQuantityMWh || rec.claimedGenerationMWh || 0;
  const eligible = rec.eligibleRenewableMWh || verified || 0;
  if (recQuantity > eligible && eligible > 0) {
    r4Score = 25;
    const msg = `RULE-004 Violation: Certificate batch quantity (${recQuantity.toLocaleString()} MWh) exceeds total eligible renewable generation (${eligible.toLocaleString()} MWh).`;
    flagReasons.push(msg);
    ruleResults.push({
      ruleId: 'RULE-004',
      ruleName: 'Over-Issuance',
      triggered: true,
      scoreContribution: 25,
      explanation: msg,
      severity: 'CRITICAL'
    });
  } else {
    ruleResults.push({
      ruleId: 'RULE-004',
      ruleName: 'Over-Issuance',
      triggered: false,
      scoreContribution: 0,
      explanation: 'Issued REC quantity conforms to eligible generation envelope.',
      severity: 'INFO'
    });
  }

  // RULE-005: Retired REC Reuse
  if (rec.isRetiredReused || (rec.status === 'RETIRED' && (rec.transferCount || 0) > 0 && rec.lastTransferDate && rec.retirementDate && new Date(rec.lastTransferDate) > new Date(rec.retirementDate))) {
    r5Score = 35;
    const msg = 'RULE-005 Violation: Certificate marked as RETIRED was re-entered into trading or secondary transfer stream.';
    flagReasons.push(msg);
    ruleResults.push({
      ruleId: 'RULE-005',
      ruleName: 'Retired REC Reuse',
      triggered: true,
      scoreContribution: 35,
      explanation: msg,
      severity: 'CRITICAL'
    });
  } else {
    ruleResults.push({
      ruleId: 'RULE-005',
      ruleName: 'Retired REC Reuse',
      triggered: false,
      scoreContribution: 0,
      explanation: 'Retirement status is valid; no post-retirement trading observed.',
      severity: 'INFO'
    });
  }

  // RULE-006: Suspicious Transfer Frequency
  const transferCount = rec.transferCount || 0;
  const timeBetween = rec.features?.timeBetweenTransfersHours ?? 72;
  if (transferCount >= 4 || (transferCount >= 2 && timeBetween < 2)) {
    r6Score = 15;
    const msg = `RULE-006 Warning: Abnormal transfer velocity (${transferCount} rapid transfers, interval ${timeBetween}h), indicating possible wash trading or circular movement.`;
    flagReasons.push(msg);
    ruleResults.push({
      ruleId: 'RULE-006',
      ruleName: 'Suspicious Transfer Frequency',
      triggered: true,
      scoreContribution: 15,
      explanation: msg,
      severity: 'HIGH'
    });
  } else {
    ruleResults.push({
      ruleId: 'RULE-006',
      ruleName: 'Suspicious Transfer Frequency',
      triggered: false,
      scoreContribution: 0,
      explanation: 'Transfer cadence is consistent with normal bilateral trading standards.',
      severity: 'INFO'
    });
  }

  // RULE-007: Invalid Lifecycle Transition
  // Sequence must be: GENERATION -> VERIFICATION -> ISSUANCE -> TRANSFER -> RETIREMENT
  let invalidTransition = false;
  let transitionReason = '';

  if (rec.issuanceDate && rec.generationDate && new Date(rec.issuanceDate) < new Date(rec.generationDate)) {
    invalidTransition = true;
    transitionReason = 'Issuance timestamp precedes generation date.';
  } else if (rec.status === 'ACTIVE' && rec.retirementDate) {
    invalidTransition = true;
    transitionReason = 'Certificate contains retirement date but active status.';
  }

  if (invalidTransition) {
    r7Score = 20;
    const msg = `RULE-007 Violation: Invalid lifecycle transition. ${transitionReason}`;
    flagReasons.push(msg);
    ruleResults.push({
      ruleId: 'RULE-007',
      ruleName: 'Invalid Lifecycle Transition',
      triggered: true,
      scoreContribution: 20,
      explanation: msg,
      severity: 'HIGH'
    });
  } else {
    ruleResults.push({
      ruleId: 'RULE-007',
      ruleName: 'Invalid Lifecycle Transition',
      triggered: false,
      scoreContribution: 0,
      explanation: 'Lifecycle transitions follow strict chronological sequence.',
      severity: 'INFO'
    });
  }

  // AI Isolation Forest Anomaly Contribution
  const aiScore = isAiAnomaly ? 15 : Math.round(aiAnomalyScore * 15);
  if (isAiAnomaly) {
    const msg = 'Potential anomaly detected - requires investigation (Isolation Forest outlier across multi-dimensional feature space).';
    flagReasons.push(msg);
    ruleResults.push({
      ruleId: 'AI-ANOMALY',
      ruleName: 'Isolation Forest Anomaly Model',
      triggered: true,
      scoreContribution: aiScore,
      explanation: msg,
      severity: 'HIGH'
    });
  }

  // Raw score summation
  const rawScore = r1Score + r2Score + r3Score + r4Score + r5Score + r6Score + r7Score + aiScore;
  const riskScore = Math.min(100, Math.max(0, rawScore));

  let riskBand: RiskBand = 'LOW';
  if (riskScore > 80) riskBand = 'CRITICAL';
  else if (riskScore > 60) riskBand = 'HIGH';
  else if (riskScore > 30) riskBand = 'MEDIUM';

  // Recommended Action
  let recommendedAction = 'Standard clearance: Certificate verified for corporate retirement and Scope 2 accounting.';
  if (r5Score > 0) {
    recommendedAction = 'Suspend certificate immediately: Refer retired reuse violation to National Energy Registry for voidance.';
  } else if (r1Score > 0 || r2Score > 0) {
    recommendedAction = 'Request forensic audit: Freeze dual claimed certificates and subpoena meter registry records.';
  } else if (r3Score > 0 || r4Score > 0) {
    recommendedAction = 'Review SCADA meter data: Request calibrated revenue meter logs from plant operator.';
  } else if (r6Score > 0) {
    recommendedAction = 'Investigate transfer syndicate: Conduct anti-money laundering and wash trading review of intermediary broker.';
  } else if (isAiAnomaly) {
    recommendedAction = 'Potential anomaly detected - requires investigation: Queue for auditor desk review of production telemetry.';
  }

  return {
    riskScore,
    riskBand,
    breakdown: {
      duplicateRecId: r1Score,
      duplicateGenId: r2Score,
      generationMismatch: r3Score,
      overIssuance: r4Score,
      retirementReuse: r5Score,
      suspiciousTransfer: r6Score,
      invalidTransition: r7Score,
      aiAnomaly: aiScore,
    },
    flagReasons,
    recommendedAction,
    ruleResults
  };
}
