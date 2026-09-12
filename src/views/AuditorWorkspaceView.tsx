import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RiskBadge } from '../components/RiskBadge';
import { 
  FileCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  Download, 
  Printer, 
  UserCheck, 
  Clock, 
  FileSpreadsheet,
  Layers,
  Send
} from 'lucide-react';

export const AuditorWorkspaceView: React.FC = () => {
  const { selectedRec, recs, setSelectedRecId, addToast } = useApp();

  const [auditorNotes, setAuditorNotes] = useState(
    `[FORENSIC MEMO - CASE ${selectedRec.id}]\n` +
    `Cross-registry reconciliation completed on ${new Date().toISOString().split('T')[0]}.\n` +
    `Observed a 62.4% generation inflation compared to SCADA revenue-grade export meters.\n` +
    `Cross-referenced duplicate claim under GEN-88421 with PJM-GATS twin REC-10452.\n` +
    `Recommended immediate market freeze and notice of revocation.`
  );

  const [auditDecision, setAuditDecision] = useState<string | null>(null);

  const handleSaveNotes = () => {
    addToast({
      type: 'success',
      title: 'Auditor Notes Stored',
      message: `Forensic audit log updated for ${selectedRec.id}.`
    });
  };

  const handleDecision = (decision: string) => {
    setAuditDecision(decision);
    addToast({
      type: 'info',
      title: 'Regulatory Action Dispatched',
      message: `Case ${selectedRec.id} status updated to: ${decision}`
    });
  };

  const handleExportForensicReport = () => {
    const reportText = 
`========================================================================
REC-GUARD FORENSIC AUDIT & MARKET INTEGRITY REPORT
REGULATORY DOSSIER: ${selectedRec.id}
DATE GENERATED: ${new Date().toISOString()}
========================================================================
1. TARGET ASSET SPECIFICATION
- Certificate ID: ${selectedRec.id}
- Plant Name: ${selectedRec.plantName} (${selectedRec.plantId})
- Energy Source: ${selectedRec.energySource} | Capacity: ${selectedRec.plantCapacityMW} MW
- Accredited Issuer: ${selectedRec.issuerName}
- Current Beneficiary: ${selectedRec.currentOwnerName}
- SHA-256 Fingerprint: ${selectedRec.fingerprintSha256}

2. INTEGRITY AUDIT FINDINGS
- Aggregate Risk Score: ${selectedRec.riskScore}/100 [${selectedRec.riskBand}]
- Claimed Generation: ${selectedRec.claimedGenerationMWh.toLocaleString()} MWh
- SCADA Verified Meter: ${selectedRec.verifiedGenerationMWh.toLocaleString()} MWh
- Generation Discrepancy: ${(((selectedRec.claimedGenerationMWh - selectedRec.verifiedGenerationMWh)/selectedRec.verifiedGenerationMWh)*100).toFixed(1)}%
- Duplicate Generation ID: ${selectedRec.generationId}

3. FORENSIC EVIDENCE LOG
${selectedRec.flagReasons.map((r, i) => `[FLAG ${i+1}] ${r}`).join('\n')}

4. AUDITOR MEMORANDUM & VERDICT
${auditorNotes}

DETERMINATION: ${auditDecision || 'PENDING FORMAL SANCTION'}
INVESTIGATING AUDITOR: Lead Forensic Auditor (ID: AUD-88219)
========================================================================`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Forensic_Audit_Report_${selectedRec.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      title: 'Forensic Report Exported',
      message: `Official audit report generated for ${selectedRec.id}.`
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-emerald-400" />
            <span>Accredited Auditor & Regulatory Workspace</span>
          </h1>
          <p className="text-xs text-slate-400">
            Formal investigation dossier, evidence ledger reconciliation, and regulatory revocation pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedRec.id}
            onChange={(e) => setSelectedRecId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
          >
            {recs.slice(0, 15).map(r => (
              <option key={r.id} value={r.id}>{r.id} ({r.plantName})</option>
            ))}
          </select>

          <button
            onClick={handleExportForensicReport}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Forensic Report</span>
          </button>
        </div>
      </div>

      {/* Main Dossier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Columns: Formal Case Evidence Dossier */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Case Banner */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  CASE DOSSIER #{selectedRec.id}
                </span>
                <h2 className="text-lg font-bold text-slate-100 mt-0.5">{selectedRec.plantName}</h2>
                <div className="text-xs text-slate-400">{selectedRec.energySource} • {selectedRec.location}</div>
              </div>
              <RiskBadge score={selectedRec.riskScore} band={selectedRec.riskBand} size="md" />
            </div>

            {/* Evidence Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-500">CLAIMED VOLUME</span>
                <div className="text-slate-200 font-bold mt-0.5">{selectedRec.claimedGenerationMWh.toLocaleString()} MWh</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-500">SCADA VERIFIED</span>
                <div className="text-emerald-400 font-bold mt-0.5">{selectedRec.verifiedGenerationMWh.toLocaleString()} MWh</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-500">GEN RUN ID</span>
                <div className="text-slate-200 font-bold mt-0.5">{selectedRec.generationId}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-500">TRANSFERS</span>
                <div className="text-slate-200 font-bold mt-0.5">{selectedRec.transferCount} Hops</div>
              </div>
            </div>

            {/* Forensic Flag List */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                EVIDENCE STATEMENTS:
              </span>
              {selectedRec.flagReasons.map((reason, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <p className="text-slate-300 leading-snug">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Auditor Memo Pad */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <span>Auditor Forensic Working Memo</span>
              </h3>
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Memo</span>
              </button>
            </div>

            <textarea
              rows={6}
              value={auditorNotes}
              onChange={(e) => setAuditorNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Right 5 Columns: Regulatory Action Dispatches */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Statutory Enforcement Actions */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              REGULATORY ENFORCEMENT SANCTIONS:
            </h3>

            <div className="space-y-3">
              <button
                onClick={() => handleDecision('REVOCATION_REQUESTED')}
                className="w-full p-4 rounded-xl bg-rose-950/30 border border-rose-500/50 hover:bg-rose-900/40 text-left space-y-1 transition-all group"
              >
                <div className="font-bold text-xs text-rose-300 flex items-center justify-between">
                  <span>1. CONFIRM FRAUD & INITIATE REVOCATION</span>
                  <span className="text-[10px] font-mono bg-rose-500/20 px-1.5 py-0.5 rounded">STATUTORY ACTION</span>
                </div>
                <p className="text-[11px] text-slate-400 group-hover:text-slate-300 font-sans">
                  Issue formal registry cancellation notice, freeze subsequent transfers, and submit case to regulatory enforcement.
                </p>
              </button>

              <button
                onClick={() => handleDecision('REMEDIATION_WARNING')}
                className="w-full p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 hover:bg-amber-900/40 text-left space-y-1 transition-all group"
              >
                <div className="font-bold text-xs text-amber-300 flex items-center justify-between">
                  <span>2. ISSUE REMEDIATION & METER AUDIT NOTICE</span>
                  <span className="text-[10px] font-mono bg-amber-500/20 px-1.5 py-0.5 rounded">REMEDIATION</span>
                </div>
                <p className="text-[11px] text-slate-400 group-hover:text-slate-300 font-sans">
                  Mandate physical revenue meter recalibration within 14 calendar days before potential suspension.
                </p>
              </button>

              <button
                onClick={() => handleDecision('CLEARED_FALSE_POSITIVE')}
                className="w-full p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 hover:bg-emerald-900/40 text-left space-y-1 transition-all group"
              >
                <div className="font-bold text-xs text-emerald-300 flex items-center justify-between">
                  <span>3. DISMISS ANOMALY / CERTIFY COMPLIANCE</span>
                  <span className="text-[10px] font-mono bg-emerald-500/20 px-1.5 py-0.5 rounded">CLEARED</span>
                </div>
                <p className="text-[11px] text-slate-400 group-hover:text-slate-300 font-sans">
                  Auditor corroborates generation affidavit with physical transmission interconnect logs.
                </p>
              </button>
            </div>

            {auditDecision && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>ACTIVE DETERMINATION: {auditDecision}</span>
              </div>
            )}
          </div>

          {/* Audit Trail History */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Chain of Custody Audit Trail</span>
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>GEN-METER EVENT</span>
                  <span>{selectedRec.generationDate}</span>
                </div>
                <div className="text-slate-200 font-bold mt-0.5">{selectedRec.plantName} Export Logged</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>ISSUANCE REGISTRY</span>
                  <span>{selectedRec.issuanceDate}</span>
                </div>
                <div className="text-slate-200 font-bold mt-0.5">Minted by {selectedRec.issuerName}</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>AI VERIFICATION</span>
                  <span>Automatic</span>
                </div>
                <div className="text-rose-400 font-bold mt-0.5">Risk Score {selectedRec.riskScore}/100 Flagged</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
