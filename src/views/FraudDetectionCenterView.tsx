import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { evaluateRules } from '../services/rulesEngine';
import { RiskBadge } from '../components/RiskBadge';
import { 
  SlidersHorizontal, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  FileText, 
  Sparkles,
  ArrowRight,
  RotateCcw,
  Zap,
  Layers
} from 'lucide-react';

export const FraudDetectionCenterView: React.FC = () => {
  const { recs, inspectRec, addToast } = useApp();

  // Test bench state for custom evaluation
  const [testClaimed, setTestClaimed] = useState<number>(18500);
  const [testVerified, setTestVerified] = useState<number>(11390);
  const [testGenId, setTestGenId] = useState<string>('GEN-88421');
  const [testVolume, setTestVolume] = useState<number>(18500);
  const [testTransfers, setTestTransfers] = useState<number>(4);
  const [testRetired, setTestRetired] = useState<boolean>(false);

  // Filter violation lists
  const [activeRuleTab, setActiveRuleTab] = useState<number>(1);

  // Discrepancy % helper
  const discrepancyPercent = useMemo(() => {
    if (testVerified <= 0) return 0;
    return Math.max(0, ((testClaimed - testVerified) / testVerified) * 100);
  }, [testClaimed, testVerified]);

  // Violations count per rule across current registry
  const ruleCounts = useMemo(() => {
    let duplicateCount = 0;
    let mismatchCount = 0;
    let overIssuanceCount = 0;
    let retirementCount = 0;
    let transferCount = 0;

    const seenGenIds = new Map<string, string[]>();
    recs.forEach(r => {
      if (!seenGenIds.has(r.generationId)) seenGenIds.set(r.generationId, []);
      seenGenIds.get(r.generationId)!.push(r.id);
    });

    recs.forEach(r => {
      if ((seenGenIds.get(r.generationId)?.length || 0) > 1) duplicateCount++;
      if (r.claimedGenerationMWh > r.verifiedGenerationMWh * 1.1) mismatchCount++;
      if (r.energyQuantityMWh > (r.eligibleRenewableMWh || r.verifiedGenerationMWh)) overIssuanceCount++;
      if (r.isRetiredReused || (r.status === 'RETIRED' && r.transferCount > 1)) retirementCount++;
      if (r.transferCount >= 4) transferCount++;
    });

    return {
      duplicateCount,
      mismatchCount,
      overIssuanceCount,
      retirementCount,
      transferCount
    };
  }, [recs]);

  // Run dynamic evaluation on test bench
  const testAuditResult = useMemo(() => {
    return evaluateRules(
      {
        id: 'REC-SIM-TEST',
        generationId: testGenId,
        claimedGenerationMWh: testClaimed,
        verifiedGenerationMWh: testVerified,
        energyQuantityMWh: testVolume,
        transferCount: testTransfers,
        isRetiredReused: testRetired,
        features: {
          plantCapacityMW: 120,
          historicalGenMWh: 11200,
          currentGenMWh: testClaimed,
          genFrequencyDays: 30,
          recQuantity: testVolume,
          issuanceFreqDays: 5,
          transferFrequency: testTransfers,
          timeBetweenTransfersHours: 24,
          historicalDeviationPercent: discrepancyPercent,
          claimedVsVerifiedRatio: testClaimed / Math.max(1, testVerified)
        }
      },
      recs,
      0.88,
      true
    );
  }, [testClaimed, testVerified, testGenId, testVolume, testTransfers, testRetired, recs, discrepancyPercent]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
            <span>Deterministic Rule-Based Fraud Detection Center</span>
          </h1>
          <p className="text-xs text-slate-400">
            Enforcing statutory market integrity rules across generation logs, smart meters, and transfer sequences.
          </p>
        </div>
      </div>

      {/* 5 Rules Navigation Cards (Prompt Section 12) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          {
            id: 1,
            title: 'RULE 1: Duplicate Claim',
            rule: 'Same Generation ID in >1 REC',
            score: '+30 pts',
            violators: ruleCounts.duplicateCount,
            severity: 'CRITICAL',
            color: 'border-rose-500/40 text-rose-300'
          },
          {
            id: 2,
            title: 'RULE 2: Gen Mismatch',
            rule: 'Claimed > Verified Smart Meter',
            score: '+10 to +25 pts',
            violators: ruleCounts.mismatchCount,
            severity: 'CRITICAL',
            color: 'border-orange-500/40 text-orange-300'
          },
          {
            id: 3,
            title: 'RULE 3: Over-Issuance',
            rule: 'REC Vol > Eligible Plant Output',
            score: '+30 pts',
            violators: ruleCounts.overIssuanceCount,
            severity: 'CRITICAL',
            color: 'border-amber-500/40 text-amber-300'
          },
          {
            id: 4,
            title: 'RULE 4: Retirement Reuse',
            rule: 'Retired REC Traded Post-Claim',
            score: '+35 pts',
            violators: ruleCounts.retirementCount,
            severity: 'CRITICAL',
            color: 'border-purple-500/40 text-purple-300'
          },
          {
            id: 5,
            title: 'RULE 5: Transfer Velocity',
            rule: 'Rapid / Circular Wash Trading',
            score: '+10 pts',
            violators: ruleCounts.transferCount,
            severity: 'HIGH',
            color: 'border-indigo-500/40 text-indigo-300'
          }
        ].map(r => (
          <div
            key={r.id}
            onClick={() => setActiveRuleTab(r.id)}
            className={`p-4 rounded-xl border bg-slate-900/70 cursor-pointer transition-all hover:bg-slate-850 flex flex-col justify-between space-y-2 ${
              activeRuleTab === r.id ? `${r.color} ring-1 ring-emerald-500/40 shadow-lg` : 'border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                <span>{r.title}</span>
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">{r.score}</span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-1 leading-snug">{r.rule}</p>
            </div>
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs font-mono">
              <span className="text-slate-500">Registry Flags:</span>
              <span className="font-bold text-rose-400">{r.violators} certificates</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Interactive Rule Workbench & Live Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Columns: Interactive Rule Simulator */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Interactive Fraud Rule Simulator & Test Bench</span>
              </h3>
              <p className="text-xs text-slate-400">
                Adjust input telemetry parameters to observe real-time statutory rule execution.
              </p>
            </div>
            <button
              onClick={() => {
                setTestClaimed(18500);
                setTestVerified(11390);
                setTestGenId('GEN-88421');
                setTestVolume(18500);
                setTestTransfers(4);
                setTestRetired(false);
              }}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Load REC-10231 Preset</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            {/* Claimed Generation */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <label className="text-slate-400">CLAIMED GENERATION (MWh):</label>
              <input
                type="number"
                value={testClaimed}
                onChange={(e) => setTestClaimed(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-bold"
              />
              <div className="text-[10px] text-slate-500 font-sans">Self-reported by generation facility</div>
            </div>

            {/* Verified Generation */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <label className="text-slate-400">VERIFIED SMART METER (MWh):</label>
              <input
                type="number"
                value={testVerified}
                onChange={(e) => setTestVerified(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-emerald-400 font-bold"
              />
              <div className="text-[10px] text-slate-500 font-sans">SCADA revenue meter certified baseline</div>
            </div>

            {/* Generation ID */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <label className="text-slate-400">GENERATION IDENTIFIER:</label>
              <input
                type="text"
                value={testGenId}
                onChange={(e) => setTestGenId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-bold"
              />
              <div className="text-[10px] text-slate-500 font-sans">Try GEN-88421 for duplicate claim trigger</div>
            </div>

            {/* Transfer Count */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <label className="text-slate-400">TRANSFER COUNT (VELOCITY):</label>
              <input
                type="number"
                value={testTransfers}
                onChange={(e) => setTestTransfers(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-bold"
              />
              <div className="text-[10px] text-slate-500 font-sans">&ge; 4 triggers transfer velocity warning</div>
            </div>
          </div>

          {/* Discrepancy indicator bar */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">RULE 2 DISCREPANCY INDEX:</span>
              <span className={`font-bold ${discrepancyPercent > 50 ? 'text-rose-400' : discrepancyPercent > 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {discrepancyPercent.toFixed(1)}% ({discrepancyPercent > 50 ? 'CRITICAL RISK' : discrepancyPercent > 30 ? 'HIGH RISK' : discrepancyPercent > 10 ? 'FLAG' : 'PASS'})
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  discrepancyPercent > 50 ? 'bg-rose-500' : discrepancyPercent > 30 ? 'bg-orange-500' : discrepancyPercent > 10 ? 'bg-amber-400' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, discrepancyPercent))}%` }}
              />
            </div>
          </div>

          {/* Checkbox triggers */}
          <div className="flex flex-wrap gap-4 text-xs font-sans text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={testRetired}
                onChange={(e) => setTestRetired(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-rose-500 focus:ring-0"
              />
              <span className="font-semibold text-rose-400">Simulate Retirement Reuse Violation (Rule 4)</span>
            </label>
          </div>
        </div>

        {/* Right 5 Columns: Real-Time Evaluator Result Output */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono uppercase text-emerald-400 font-bold">
                AUDIT ENGINE EVALUATION
              </span>
              <RiskBadge score={testAuditResult.riskScore} band={testAuditResult.riskBand} size="sm" />
            </div>

            {/* Rules Triggered List */}
            <div className="space-y-2.5">
              {testAuditResult.ruleResults.map((res, i) => (
                <div 
                  key={i} 
                  className={`p-3 rounded-xl border text-xs ${
                    res.triggered 
                      ? 'bg-rose-950/30 border-rose-500/40 text-rose-200' 
                      : 'bg-slate-950/50 border-slate-800/80 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono font-bold">
                    <span>{res.ruleName}</span>
                    <span>{res.triggered ? `+${res.scoreContribution} PTS` : 'PASS'}</span>
                  </div>
                  <p className="text-[11px] font-sans mt-1 leading-snug">
                    {res.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Aggregate Total */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono">
            <span className="text-xs text-slate-400 font-semibold">TOTAL ASSESSED RISK:</span>
            <span className="text-xl font-black text-rose-400">
              {testAuditResult.riskScore} / 100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
