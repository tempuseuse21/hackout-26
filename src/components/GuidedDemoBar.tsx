import React from 'react';
import { useApp } from '../context/AppContext';
import { ChevronRight, ChevronLeft, X, Sparkles, ShieldAlert } from 'lucide-react';

export const DEMO_STEPS_CONFIG = [
  {
    step: 1,
    title: 'STEP 1: REC Ingestion & Issuance',
    summary: 'REC-10231 is issued for Mojave Helios Array IV claiming 18,500 MWh output under Generation ID GEN-88421.',
    actionLabel: 'Inspect Risk Intelligence',
    targetTab: 'risk-intelligence'
  },
  {
    step: 2,
    title: 'STEP 2: Duplicate Generation ID Detected',
    summary: 'System scans nationwide registries and identifies that GEN-88421 is also claimed by twin certificate REC-10452.',
    actionLabel: 'Analyze Discrepancy',
    targetTab: 'risk-intelligence'
  },
  {
    step: 3,
    title: 'STEP 3: Smart-Meter Generation Mismatch',
    summary: 'Cross-verifying with SCADA meter feed reveals verified generation is only 11,390 MWh (+62.4% inflation).',
    actionLabel: 'Inspect Rules Engine',
    targetTab: 'risk-intelligence'
  },
  {
    step: 4,
    title: 'STEP 4: Isolation Forest Anomaly Detection',
    summary: 'Unsupervised ML model flags REC-10231 as an extreme multidimensional outlier with Anomaly Score 0.884.',
    actionLabel: 'View Risk Score Breakdown',
    targetTab: 'risk-intelligence'
  },
  {
    step: 5,
    title: 'STEP 5: Explainable Risk Score (91/100)',
    summary: 'Engine aggregates signals: +30 Duplicate, +25 Mismatch, +20 AI Anomaly, +10 Velocity = 91 CRITICAL.',
    actionLabel: 'Inspect Digital Passport',
    targetTab: 'passport'
  },
  {
    step: 6,
    title: 'STEP 6: SHA-256 Digital Fingerprint Check',
    summary: 'Passport validates the 5-stage lifecycle and SHA-256 cryptographic digest of certificate metadata.',
    actionLabel: 'Inspect Blockchain Ledger',
    targetTab: 'ledger'
  },
  {
    step: 7,
    title: 'STEP 7: Tamper-Evident Ledger Audit',
    summary: 'Ledger records all lifecycle blocks. Test cryptographic hash-chain verification and simulated block tampering.',
    actionLabel: 'View Fraud Network Graph',
    targetTab: 'network'
  },
  {
    step: 8,
    title: 'STEP 8: Fraud Syndicate Cluster Analysis',
    summary: 'Interactive topological graph reveals circular wash trades between CleanVolt, Verde, and TerraWatt.',
    actionLabel: 'Open Auditor Case',
    targetTab: 'investigations'
  },
  {
    step: 9,
    title: 'STEP 9: Auditor Investigation Case',
    summary: 'Auditor reviews evidence dossier, evaluates rule violations, logs audit notes, and flags for regulatory hold.',
    actionLabel: 'Enforce Regulatory Freeze',
    targetTab: 'investigations'
  },
  {
    step: 10,
    title: 'STEP 10: Regulatory Action & Freeze Enforced',
    summary: 'Certificate status marked UNDER REVIEW / SUSPENDED. Secondary market trading and corporate Scope 2 claims frozen.',
    actionLabel: 'Finish Walkthrough',
    targetTab: 'investigations'
  }
];

export const GuidedDemoBar: React.FC = () => {
  const { 
    guidedDemoActive, 
    guidedDemoStep, 
    nextDemoStep, 
    prevDemoStep, 
    exitGuidedDemo, 
    inspectRec,
    updateAlertStatus,
    alerts,
    setActiveTab
  } = useApp();

  if (!guidedDemoActive) return null;

  const currentConfig = DEMO_STEPS_CONFIG[guidedDemoStep - 1] || DEMO_STEPS_CONFIG[0];

  const handleAction = () => {
    if (guidedDemoStep === 1) {
      inspectRec('REC-10231');
      setActiveTab('risk-intelligence');
    } else if (guidedDemoStep === 10) {
      const targetAlert = alerts.find(a => a.recId === 'REC-10231');
      if (targetAlert) {
        updateAlertStatus(targetAlert.id, 'UNDER_REVIEW', 'Guided Demo: Lead Auditor enforced regulatory suspension on REC-10231.');
      }
      setActiveTab('investigations');
      exitGuidedDemo();
      return;
    } else {
      if (currentConfig.targetTab) {
        setActiveTab(currentConfig.targetTab as any);
      }
    }
    nextDemoStep();
  };

  return (
    <div className="bg-white border-t border-blue-200 px-4 py-2.5 shadow-lg fixed bottom-0 left-0 right-0 z-40 flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Left step badge */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono font-bold shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>GUIDED WALKTHROUGH</span>
          <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded font-black text-[10px]">
            {guidedDemoStep}/10
          </span>
        </div>
        <div>
          <h4 className="text-xs md:text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>{currentConfig.title}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
              REC-10231
            </span>
          </h4>
          <p className="text-xs text-slate-600 line-clamp-1 max-w-2xl">
            {currentConfig.summary}
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
        <button
          onClick={prevDemoStep}
          disabled={guidedDemoStep <= 1}
          className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none text-xs flex items-center gap-1 border border-slate-300 font-semibold"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          onClick={handleAction}
          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
        >
          <span>{currentConfig.actionLabel}</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={exitGuidedDemo}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
          title="Exit Guided Walkthrough"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
