import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RiskBadge, RiskMeter } from '../components/RiskBadge';
import { verifyRecFingerprint, computeSha256 } from '../services/cryptoService';
import { 
  ArrowLeft, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Cpu, 
  Zap, 
  FileCheck, 
  Share2, 
  History, 
  Building, 
  Clock, 
  Copy, 
  Check,
  RefreshCw,
  Sliders,
  ExternalLink
} from 'lucide-react';

export const RecDetailsView: React.FC = () => {
  const { selectedRec, setActiveTab, setSelectedRecId, recs, addToast, updateAlertStatus, alerts } = useApp();
  
  const [verificationResult, setVerificationResult] = useState<{
    checked: boolean;
    valid: boolean;
    computedHash: string;
  } | null>(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [simulatedTamper, setSimulatedTamper] = useState(false);

  // Cross-reference twin certificates if duplicate generation ID
  const duplicateTwins = recs.filter(
    r => r.generationId === selectedRec.generationId && r.id !== selectedRec.id
  );

  const handleVerifyFingerprint = async () => {
    setIsVerifying(true);
    setTimeout(async () => {
      // If user simulated tampering, modify the payload slightly
      const testClaimed = simulatedTamper ? selectedRec.claimedGenerationMWh + 500 : selectedRec.claimedGenerationMWh;
      const testPayload = `${selectedRec.id}|${selectedRec.plantId}|${selectedRec.generationId}|${testClaimed}|${selectedRec.issuanceDate}|${selectedRec.issuerId}`;
      const computedHash = await computeSha256(testPayload);
      const matches = computedHash.toUpperCase() === selectedRec.fingerprintSha256.toUpperCase();

      setVerificationResult({
        checked: true,
        valid: matches,
        computedHash
      });
      setIsVerifying(false);

      if (matches) {
        addToast({
          type: 'success',
          title: 'Integrity Check Passed',
          message: 'Certificate metadata strictly matches the on-record SHA-256 digital fingerprint.'
        });
      } else {
        addToast({
          type: 'error',
          title: 'TAMPER DETECTED',
          message: 'Cryptographic mismatch! Certificate payload does not match the stored SHA-256 fingerprint.'
        });
      }
    }, 450);
  };

  const copyHash = () => {
    navigator.clipboard.writeText(selectedRec.fingerprintSha256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const matchingAlert = alerts.find(a => a.recId === selectedRec.id);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Navigation breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('registry')}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Back to Registry"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-black font-mono text-slate-100">{selectedRec.id}</h1>
              <RiskBadge score={selectedRec.riskScore} band={selectedRec.riskBand} size="md" />
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                selectedRec.status === 'FLAGGED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {selectedRec.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Generation Source: <span className="text-slate-200 font-semibold">{selectedRec.plantName}</span> ({selectedRec.location})
            </p>
          </div>
        </div>

        {/* Quick investigation shortcuts */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('passport')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-teal-400" />
            <span>Digital Passport</span>
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Network Graph</span>
          </button>
          <button
            onClick={() => setActiveTab('auditor-workspace')}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Open Auditor Dossier</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Dossier / Right Explainability Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Metadata & Cryptographic Integrity */}
        <div className="space-y-6">
          {/* Certificate Spec Card */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Certificate Core Specification</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-mono">PLANT ID</span>
                <div className="font-mono font-bold text-slate-200 mt-0.5">{selectedRec.plantId}</div>
                <div className="text-[10px] text-emerald-400">{selectedRec.plantCapacityMW} MW Nameplate</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-mono">ENERGY SOURCE</span>
                <div className="font-bold text-slate-200 mt-0.5">{selectedRec.energySource}</div>
                <div className="text-[10px] text-slate-400">{selectedRec.location}</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-mono">GENERATION ID</span>
                <div className="font-mono font-bold text-slate-200 mt-0.5">{selectedRec.generationId}</div>
                <div className="text-[10px] text-slate-400">Telemetry Log</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-mono">ISSUED VOLUME</span>
                <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                  {selectedRec.energyQuantityMWh.toLocaleString()} MWh
                </div>
                <div className="text-[10px] text-slate-400">1 REC = 1 MWh</div>
              </div>
            </div>

            {/* Issuance & Ownership Entities */}
            <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Accredited Issuer:</span>
                <span className="font-semibold text-slate-200">{selectedRec.issuerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Current Custody:</span>
                <span className="font-semibold text-indigo-300 font-mono">{selectedRec.currentOwnerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Generation Date:</span>
                <span className="font-mono text-slate-200">{selectedRec.generationDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Issuance Date:</span>
                <span className="font-mono text-slate-200">{selectedRec.issuanceDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Transfer Count:</span>
                <span className="font-mono text-slate-200">{selectedRec.transferCount} transfers</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Digital Fingerprint Card (Prompt Section 17) */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>SHA-256 Digital Fingerprint</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                W3C SUBTLECRYPTO
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 font-mono text-[11px] text-slate-300 break-all space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1">
                <span>ON-CHAIN RECORDED HASH:</span>
                <button
                  onClick={copyHash}
                  className="hover:text-white flex items-center gap-1 text-slate-400"
                >
                  {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="text-emerald-400 font-semibold tracking-wide">
                {selectedRec.fingerprintSha256}
              </div>
            </div>

            {/* Tamper simulation toggle */}
            <div className="flex items-center justify-between text-xs px-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400">
                <input
                  type="checkbox"
                  checked={simulatedTamper}
                  onChange={(e) => {
                    setSimulatedTamper(e.target.checked);
                    setVerificationResult(null);
                  }}
                  className="rounded bg-slate-950 border-slate-700 text-rose-500 focus:ring-0"
                />
                <span className="text-slate-300 font-medium">Simulate Payload Modification (+500 MWh)</span>
              </label>
            </div>

            {/* Verification Button */}
            <button
              onClick={handleVerifyFingerprint}
              disabled={isVerifying}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                isVerifying 
                  ? 'bg-slate-800 text-slate-400' 
                  : 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'Recalculating SHA-256 Digest...' : 'Verify Certificate Fingerprint'}</span>
            </button>

            {/* Live Verification Result banner */}
            {verificationResult && (
              <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-300 ${
                verificationResult.valid 
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                  : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
              }`}>
                {verificationResult.valid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
                )}
                <div>
                  <div className="font-bold">
                    {verificationResult.valid ? '✓ Certificate Integrity Verified' : '⚠ TAMPER DETECTED — HASH MISMATCH'}
                  </div>
                  <p className="text-[11px] opacity-85 mt-0.5">
                    {verificationResult.valid 
                      ? 'Recomputed SHA-256 hash matches the cryptographic seal stored in the ledger.'
                      : 'Recomputed hash deviates from recorded fingerprint! The certificate payload has been unauthorizedly modified.'}
                  </p>
                  <div className="font-mono text-[10px] mt-1 text-slate-400 break-all">
                    Computed: {verificationResult.computedHash}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Columns (Span 2): "WHY FLAGGED?" Risk Decomposition & Explainable AI */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main "WHY FLAGGED?" Card (Prompt Section 11 & 15) */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 via-[#0e1523] to-slate-900/90 border border-slate-800 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  EXPLAINABLE RISK INTELLIGENCE
                </span>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-100 mt-1">
                  Why Was {selectedRec.id} Flagged?
                </h2>
                <p className="text-xs text-slate-400">
                  Transparent factor decomposition explaining the exact score calculation.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-3xl font-black font-mono text-rose-400 leading-none">
                    {selectedRec.riskScore}<span className="text-base text-slate-500 font-normal">/100</span>
                  </div>
                  <div className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider mt-1">
                    {selectedRec.riskBand} SEVERITY
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Risk Meter */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <RiskMeter score={selectedRec.riskScore} size="lg" />
            </div>

            {/* Factor Points Breakdown Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                SCORE CONTRIBUTION BREAKDOWN:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                {[
                  {
                    name: 'Duplicate Generation Claim',
                    points: selectedRec.scoreBreakdown.duplicateClaim,
                    desc: 'Same meter generation ID claimed across multiple certificates.',
                    color: selectedRec.scoreBreakdown.duplicateClaim > 0 ? 'text-rose-400 border-rose-500/30 bg-rose-950/20' : 'text-slate-400 border-slate-800 bg-slate-950/40'
                  },
                  {
                    name: 'Generation Meter Mismatch',
                    points: selectedRec.scoreBreakdown.generationMismatch,
                    desc: 'Claimed MWh exceeds verified revenue meter output.',
                    color: selectedRec.scoreBreakdown.generationMismatch > 0 ? 'text-rose-400 border-rose-500/30 bg-rose-950/20' : 'text-slate-400 border-slate-800 bg-slate-950/40'
                  },
                  {
                    name: 'AI Anomaly (Isolation Forest)',
                    points: selectedRec.scoreBreakdown.aiAnomaly,
                    desc: 'Multidimensional outlier across 10 plant and timing features.',
                    color: selectedRec.scoreBreakdown.aiAnomaly > 0 ? 'text-orange-400 border-orange-500/30 bg-orange-950/20' : 'text-slate-400 border-slate-800 bg-slate-950/40'
                  },
                  {
                    name: 'Transfer Velocity Anomaly',
                    points: selectedRec.scoreBreakdown.transferAnomaly,
                    desc: 'Abnormal frequency or rapid wash trading before retirement.',
                    color: selectedRec.scoreBreakdown.transferAnomaly > 0 ? 'text-amber-400 border-amber-500/30 bg-amber-950/20' : 'text-slate-400 border-slate-800 bg-slate-950/40'
                  },
                  {
                    name: 'Historical Plant Deviation',
                    points: selectedRec.scoreBreakdown.historicalPattern,
                    desc: 'Output deviates significantly from seasonal nameplate curves.',
                    color: selectedRec.scoreBreakdown.historicalPattern > 0 ? 'text-amber-400 border-amber-500/30 bg-amber-950/20' : 'text-slate-400 border-slate-800 bg-slate-950/40'
                  },
                  {
                    name: 'Over-Issuance vs Envelope',
                    points: selectedRec.scoreBreakdown.overIssuance,
                    desc: 'Quantity exceeds certified eligible renewable generation.',
                    color: selectedRec.scoreBreakdown.overIssuance > 0 ? 'text-rose-400 border-rose-500/30 bg-rose-950/20' : 'text-slate-400 border-slate-800 bg-slate-950/40'
                  }
                ].map((item, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border flex items-start justify-between gap-2 ${item.color}`}>
                    <div>
                      <div className="font-bold text-slate-200">{item.name}</div>
                      <div className="text-[11px] text-slate-400 font-sans mt-0.5">{item.desc}</div>
                    </div>
                    <span className="font-bold text-sm shrink-0">
                      {item.points > 0 ? `+${item.points}` : '+0'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Calculation Line */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono text-xs">
                <span className="text-slate-400 font-semibold">AGGREGATE NORMALIZED RISK:</span>
                <span className="text-rose-400 font-black text-sm">
                  TOTAL = {selectedRec.riskScore}/100
                </span>
              </div>
            </div>

            {/* Plain-Language Forensic Explanations (Prompt Section 11 & 16) */}
            <div className="space-y-3 border-t border-slate-800 pt-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                NATURAL LANGUAGE FORENSIC EVIDENCE:
              </h4>

              <div className="space-y-2">
                {selectedRec.flagReasons.map((reason, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-2.5 text-xs">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <p className="text-slate-300 leading-relaxed font-sans">{reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Twin Cross-Registry Conflict Alert if any */}
            {duplicateTwins.length > 0 && (
              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-2">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-bold font-mono">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>CROSS-REGISTRY DUPLICATE CONFLICT IDENTIFIED</span>
                </div>
                <p className="text-xs text-slate-300">
                  Generation ID <span className="font-mono font-bold text-white">{selectedRec.generationId}</span> is claimed simultaneously by:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {duplicateTwins.map(twin => (
                    <button
                      key={twin.id}
                      onClick={() => setSelectedRecId(twin.id)}
                      className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold flex items-center gap-1.5"
                    >
                      <span>{twin.id}</span>
                      <span className="text-[10px] text-slate-400 font-sans">({twin.issuerName})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Forensic Action Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1.5">
              <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" />
                <span>RECOMMENDED ACTION FOR AUDITOR / REGULATOR:</span>
              </div>
              <p className="text-xs text-slate-200 font-medium leading-relaxed font-sans">
                {selectedRec.recommendedAction}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
