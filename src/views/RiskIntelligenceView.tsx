import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { RiskBadge, RiskMeter } from '../components/RiskBadge';
import { evaluateRules } from '../services/rulesEngine';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Cpu, 
  Zap, 
  History, 
  ArrowRight, 
  FileText, 
  Share2, 
  Activity, 
  ExternalLink,
  ChevronDown,
  Building,
  Calendar,
  Layers,
  Lock
} from 'lucide-react';

export const RiskIntelligenceView: React.FC = () => {
  const { selectedRec, setSelectedRecId, recs, setActiveTab } = useApp();

  // Evaluate the selected REC with the deterministic 7-rule engine and AI anomaly flag
  const auditResult = useMemo(() => {
    return evaluateRules(selectedRec, recs, selectedRec.features?.historicalDeviationPercent ? 0.8 : 0.1, selectedRec.isAnomaly);
  }, [selectedRec, recs]);

  // Featured Demo Scenarios for instant testing
  const demoScenarios = [
    { id: 'REC-10231', label: 'REC-10231 (Multi-Failure: Over-Issuance + Duplicate Claim)', tag: 'CRITICAL', score: 98 },
    { id: 'REC-20412', label: 'REC-20412 (Over-Issuance & Capacity Exceeded)', tag: 'HIGH', score: 78 },
    { id: 'REC-30911', label: 'REC-30911 (Retired REC Reuse / Zombie Certificate)', tag: 'CRITICAL', score: 92 },
    { id: 'REC-40115', label: 'REC-40115 (Clean Solar REC - Golden Benchmark)', tag: 'LOW', score: 8 },
  ];

  // Generation Discrepancy Math
  const claimed = selectedRec.claimedGenerationMWh || 0;
  const verified = selectedRec.verifiedGenerationMWh || 0;
  const discrepancyMWh = claimed - verified;
  const discrepancyPercent = verified > 0 ? ((discrepancyMWh / verified) * 100) : 0;

  // Transfer Metrics
  const transferCount = selectedRec.transferCount || 0;
  const transferIntervalHours = selectedRec.features?.timeBetweenTransfersHours ?? 72;
  const isPostRetirementAttempt = selectedRec.isRetiredReused || (selectedRec.status === 'RETIRED' && transferCount > 0);

  // Historical baseline
  const historicalBaseline = selectedRec.features?.historicalGenMWh || Math.round(verified * 0.95);
  const historicalDev = selectedRec.features?.historicalDeviationPercent || 0;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & REC Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Risk Intelligence Center</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-semibold border border-blue-200">
              FORENSIC TRIAGE
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Deterministic rule violation tracing, SCADA meter telemetry comparison, and multi-dimensional anomaly diagnosis.
          </p>
        </div>

        {/* REC Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600">Select Certificate:</label>
          <select
            value={selectedRec.id}
            onChange={(e) => setSelectedRecId(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
          >
            {recs.slice(0, 30).map((r, idx) => (
              <option key={`risk-rec-${r.id}-${idx}`} value={r.id}>
                {r.id} - {r.plantName.slice(0, 20)} ({r.riskScore}/100)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Demo Scenario Quick-Pick Buttons */}
      <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider text-[11px] mr-1">
          Instant Demo Scenarios:
        </span>
        {demoScenarios.map((sc, idx) => (
          <button
            key={`demo-sc-${sc.id}-${idx}`}
            onClick={() => setSelectedRecId(sc.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 border ${
              selectedRec.id === sc.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <span className="font-mono font-bold">{sc.id}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
              sc.tag === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
              sc.tag === 'HIGH' ? 'bg-orange-100 text-orange-800' :
              'bg-emerald-100 text-emerald-800'
            }`}>
              {sc.tag}
            </span>
          </button>
        ))}
      </div>

      {/* Primary Risk Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-slate-900 font-mono">{selectedRec.id}</span>
              <RiskBadge score={selectedRec.riskScore} band={selectedRec.riskBand} size="lg" />
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                selectedRec.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                selectedRec.status === 'FLAGGED' ? 'bg-rose-50 text-rose-700 border border-rose-200 font-bold' :
                'bg-slate-100 text-slate-700'
              }`}>
                {selectedRec.status}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1.5">
              Plant: <span className="font-semibold text-slate-900">{selectedRec.plantName}</span> ({selectedRec.energySource}, {selectedRec.plantCapacityMW} MW) • Generation ID: <span className="font-mono font-medium text-slate-800">{selectedRec.generationId}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('passport')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              View Lifecycle Passport
            </button>
            <button
              onClick={() => setActiveTab('investigations')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              Open Audit Case
            </button>
          </div>
        </div>

        {/* Risk Meter Visualizer */}
        <div className="pt-2">
          <RiskMeter score={selectedRec.riskScore} size="lg" />
        </div>

        {/* Regulatory Disclaimer Notice as required */}
        <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
          <Info className="w-4 h-4 shrink-0 text-amber-600" />
          <span className="font-medium">
            Prototype thresholds only - not official regulatory standards.
          </span>
          <span className="text-amber-700 ml-auto hidden sm:inline text-[11px]">
            Calibrated for statutory demonstration: 0–30 Low, 31–60 Medium, 61–80 High, 81–100 Critical.
          </span>
        </div>
      </div>

      {/* WHY FLAGGED? Section (CRITICAL MANDATE) */}
      <div className={`rounded-xl p-6 border shadow-xs ${
        selectedRec.riskScore > 30 
          ? 'bg-rose-50/50 border-rose-200' 
          : 'bg-emerald-50/50 border-emerald-200'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          {selectedRec.riskScore > 30 ? (
            <ShieldAlert className="w-5 h-5 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          )}
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
            {selectedRec.riskScore > 30 ? 'WHY FLAGGED? Concrete Forensic Evidence' : 'CLEAR: Zero Statutory Violations Detected'}
          </h2>
        </div>

        {auditResult.flagReasons.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-slate-600 font-medium">
              The automated evaluation engine detected {auditResult.flagReasons.length} statutory anomalies or evidence signals:
            </p>
            <div className="space-y-2 mt-2">
              {auditResult.flagReasons.map((reason, idx) => (
                <div 
                  key={idx} 
                  className="p-3 bg-white rounded-lg border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5 shadow-2xs font-mono"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-emerald-800">
            This certificate fully complies with statutory guidelines. Meter telemetry aligns with claimed output, no duplicate claims exist in registry, and lifecycle sequencing is valid.
          </p>
        )}
      </div>

      {/* Triggered Rules Matrix (RULE-001 through RULE-007) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Deterministic Fraud Rules Evaluation</h2>
            <p className="text-xs text-slate-500">Statutory 7-rule fraud detection matrix</p>
          </div>
          <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
            RULE-001 to RULE-007
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {auditResult.ruleResults.filter(r => r.ruleId.startsWith('RULE-')).map((rule) => (
            <div 
              key={rule.ruleId}
              className={`p-3.5 rounded-lg border text-xs transition-all flex flex-col justify-between ${
                rule.triggered 
                  ? 'bg-rose-50/40 border-rose-200 text-slate-900' 
                  : 'bg-slate-50/60 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">{rule.ruleId}</span>
                  <span className="font-semibold text-slate-800">{rule.ruleName}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  rule.triggered 
                    ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {rule.triggered ? `TRIGGERED (+${rule.scoreContribution} pts)` : 'PASSED (0 pts)'}
                </span>
              </div>
              <p className="mt-2 text-slate-600 text-[11px] leading-relaxed">
                {rule.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Anomaly Diagnosis (Isolation Forest) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AI Anomaly Detection</h2>
              <p className="text-xs text-slate-500">Unsupervised Isolation Forest multi-feature outlier assessment</p>
            </div>
          </div>

          <div className="text-right">
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
              selectedRec.isAnomaly 
                ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              {selectedRec.isAnomaly ? 'POTENTIAL ANOMALY DETECTED' : 'IN-BOUND PATTERN'}
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Diagnosis Status:</span>
            <span className="font-mono font-bold text-slate-900">
              {selectedRec.isAnomaly ? 'Requires investigation' : 'Nominal multi-dimensional profile'}
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            {selectedRec.isAnomaly
              ? 'Potential anomaly detected - requires investigation. High-dimensional vector analysis across plant capacity, generation interval, and claimed-to-verified ratios placed this certificate in the anomalous leaf tree partition.'
              : 'Statistical feature vector falls within normal clusters of accredited generation plants.'}
          </p>
        </div>
      </div>

      {/* 3-Column Forensic Comparison: Generation, Transfer, Historical */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generation Comparison */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Generation Comparison</h3>
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs text-slate-500 mt-1">Claimed Generation vs Verified SCADA</p>

            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Claimed Output:</span>
                  <span className="font-mono font-bold text-slate-900">{claimed.toLocaleString()} MWh</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Verified SCADA Meter:</span>
                  <span className="font-mono font-bold text-slate-900">{verified.toLocaleString()} MWh</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${verified < claimed ? 'bg-amber-500' : 'bg-emerald-600'}`} 
                    style={{ width: `${Math.min(100, (verified / Math.max(1, claimed)) * 100)}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-600">Discrepancy:</span>
              <span className={`font-mono ${discrepancyMWh > 0 ? 'text-rose-600 font-bold' : 'text-emerald-700'}`}>
                {discrepancyMWh > 0 ? `+${discrepancyMWh.toLocaleString()} MWh (${discrepancyPercent.toFixed(1)}%)` : 'Balanced (0 MWh)'}
              </span>
            </div>
          </div>
        </div>

        {/* Transfer Behaviour */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Transfer Behaviour</h3>
              <Share2 className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs text-slate-500 mt-1">Velocity, cadence & secondary custody</p>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Transfer Velocity:</span>
                <span className="font-mono font-bold text-slate-900">{transferCount} hops</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Min Interval:</span>
                <span className="font-mono font-bold text-slate-900">{transferIntervalHours} hours</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Hop Count:</span>
                <span className="font-mono font-bold text-slate-900">{transferCount} intermediate owners</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Post-Retirement Attempt:</span>
                <span className={`font-mono font-bold ${isPostRetirementAttempt ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {isPostRetirementAttempt ? 'DETECTED (VIOLATION)' : 'None'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
            Current Owner: <span className="font-semibold text-slate-900">{selectedRec.currentOwnerName}</span>
          </div>
        </div>

        {/* Historical Behaviour */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Historical Behaviour</h3>
              <History className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs text-slate-500 mt-1">Plant baseline comparison</p>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Facility Baseline:</span>
                <span className="font-mono font-bold text-slate-900">{historicalBaseline.toLocaleString()} MWh</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Current Output:</span>
                <span className="font-mono font-bold text-slate-900">{claimed.toLocaleString()} MWh</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Historical Deviation:</span>
                <span className={`font-mono font-bold ${Math.abs(historicalDev) > 30 ? 'text-amber-600' : 'text-slate-900'}`}>
                  {historicalDev > 0 ? `+${historicalDev.toFixed(1)}%` : `${historicalDev.toFixed(1)}%`}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
            Plant Capacity: <span className="font-mono font-semibold text-slate-900">{selectedRec.plantCapacityMW} MW</span>
          </div>
        </div>
      </div>

      {/* Recommended Action Card (MANDATE) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">Statutory Recommended Action</h2>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            Auditor Next Steps
          </span>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="font-mono font-bold text-sm text-slate-900">
            {auditResult.recommendedAction}
          </div>
          <p className="text-slate-600">
            Preserve all revenue meter SCADA intervals, freeze transfer rights on registry smart contracts, and log timestamped action in the immutable audit dossier.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => setActiveTab('passport')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
          >
            Inspect Cryptographic Passport
          </button>
          <button
            onClick={() => setActiveTab('investigations')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs"
          >
            Escalate to Auditor Workspace
          </button>
        </div>
      </div>
    </div>
  );
};
