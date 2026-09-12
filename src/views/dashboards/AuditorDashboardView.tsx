/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { RiskBadge } from '../../components/RiskBadge';
import { 
  FileCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search, 
  Download, 
  FileSpreadsheet, 
  ExternalLink,
  Save,
  Send,
  XCircle,
  HelpCircle,
  Eye
} from 'lucide-react';
import { RECRecord } from '../../types';

export const AuditorDashboardView: React.FC = () => {
  const { 
    recs, 
    setRecs, 
    currentUser, 
    alerts, 
    auditLogs, 
    addAuditLog, 
    addToast, 
    inspectRec,
    navigateToPath
  } = useApp();

  const [activeTab, setActiveTab] = useState<'QUEUE' | 'VERIFY_ACTION' | 'ANOMALIES' | 'AUDIT_TRAIL'>('QUEUE');
  const [selectedCaseRecId, setSelectedCaseRecId] = useState<string>('REC-10231');
  const [caseNotes, setCaseNotes] = useState(
    'SCADA telemetry reconciliation indicates a 62.4% generation inflation compared to revenue-grade export meters at Mojave Helios IV.\nRecommend immediate regulatory freeze.'
  );
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Verification queue: RECs that are flagged or have high risk or anomaly score
  const queueRecs = useMemo(() => {
    return recs.filter(r => r.status === 'FLAGGED' || r.riskScore >= 40 || r.isAnomaly);
  }, [recs]);

  const criticalCases = queueRecs.filter(r => r.riskBand === 'CRITICAL' || r.riskScore >= 80);
  const pendingCases = queueRecs.filter(r => r.status === 'FLAGGED');

  const selectedCaseRec = useMemo(() => {
    return recs.find(r => r.id === selectedCaseRecId) || queueRecs[0] || recs[0];
  }, [recs, selectedCaseRecId, queueRecs]);

  const handleDecision = (decision: 'APPROVE' | 'FLAG_SUSPICIOUS' | 'REVOKE' | 'REQUEST_EVIDENCE') => {
    if (!selectedCaseRec) return;
    setActionInProgress(decision);

    setTimeout(() => {
      setRecs(prev => prev.map(item => {
        if (item.id === selectedCaseRec.id) {
          let updatedStatus = item.status;
          let updatedRisk = item.riskScore;
          let updatedBand = item.riskBand;
          let isAnomaly = item.isAnomaly;

          if (decision === 'APPROVE') {
            updatedStatus = 'ACTIVE';
            updatedRisk = Math.min(item.riskScore, 15);
            updatedBand = 'LOW';
            isAnomaly = false;
          } else if (decision === 'FLAG_SUSPICIOUS') {
            updatedStatus = 'FLAGGED';
          } else if (decision === 'REVOKE') {
            updatedStatus = 'SUSPENDED';
            updatedBand = 'CRITICAL';
          }

          return {
            ...item,
            status: updatedStatus,
            riskScore: updatedRisk,
            riskBand: updatedBand,
            isAnomaly
          };
        }
        return item;
      }));

      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: 'AUDITOR',
        action: `AUDIT_DECISION_${decision}`,
        recId: selectedCaseRec.id,
        ipAddress: '10.0.4.88',
        result: decision === 'APPROVE' ? 'SUCCESS' : 'FLAGGED',
        details: `Auditor ${currentUser.name} issued decision [${decision}] for certificate ${selectedCaseRec.id}. Notes: ${caseNotes.slice(0, 80)}...`
      });

      addToast({
        type: decision === 'APPROVE' ? 'success' : 'info',
        title: `Verification Decision Applied: ${decision}`,
        message: `Case ${selectedCaseRec.id} status updated and signed with auditor key.`
      });

      setActionInProgress(null);
    }, 500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Auditor Workspace Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" />
                Independent Environmental Auditor Workspace
              </span>
              <span className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono rounded-full">
                Verifier License #CISA-ENV-49102
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Forensic Verification & Evidence Desk
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Welcome back, <span className="text-slate-200 font-medium">{currentUser.name}</span> ({currentUser.organization}). Review disputed generation claims, inspect smart-meter discrepancies, and execute authoritative verification rulings.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setActiveTab('QUEUE')}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-amber-900/30 cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Verification Queue ({queueRecs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('VERIFY_ACTION')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Forensic Workbench</span>
            </button>
          </div>
        </div>
      </div>

      {/* Auditor KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Queue Depth</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-400 mb-1">{queueRecs.length}</div>
          <div className="text-xs text-slate-400">
            Certificates awaiting forensic determination
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Critical Anomaly Flags</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-red-400 mb-1">{criticalCases.length}</div>
          <div className="text-xs text-slate-400">
            Immediate market freeze recommended
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Audits Completed</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-400 mb-1">148</div>
          <div className="text-xs text-slate-400">
            Signed with auditor cryptographic credentials
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Avg. Turnaround Time</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">4.8 <span className="text-base font-normal text-slate-400">hours</span></div>
          <div className="text-xs text-slate-400">
            92.6% within regulatory 24h SLA target
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('QUEUE')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'QUEUE'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Priority Verification Queue ({queueRecs.length})
        </button>
        <button
          onClick={() => setActiveTab('VERIFY_ACTION')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'VERIFY_ACTION'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Forensic Determination Workbench
        </button>
        <button
          onClick={() => setActiveTab('ANOMALIES')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ANOMALIES'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Rule Engine Discrepancies ({alerts.length})
        </button>
        <button
          onClick={() => setActiveTab('AUDIT_TRAIL')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'AUDIT_TRAIL'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Auditor Action Trail & Dossiers
        </button>
      </div>

      {/* Tab 1: Queue */}
      {activeTab === 'QUEUE' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white text-base">Flagged Certificates Requiring Verifier Action</h3>
              <p className="text-xs text-slate-400">Prioritized by composite Isolation Forest score and discrepancy severity</p>
            </div>
            <span className="px-3 py-1 bg-amber-950 text-amber-400 border border-amber-800 text-xs rounded-full font-mono">
              {queueRecs.length} High Priority Items
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                <tr>
                  <th className="py-3 px-4 font-semibold">Certificate ID</th>
                  <th className="py-3 px-4 font-semibold">Generating Plant</th>
                  <th className="py-3 px-4 font-semibold">Claimed MWh</th>
                  <th className="py-3 px-4 font-semibold">SCADA Verified</th>
                  <th className="py-3 px-4 font-semibold">Variance %</th>
                  <th className="py-3 px-4 font-semibold">Risk Band</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {queueRecs.map(rec => {
                  const variance = rec.verifiedGenerationMWh 
                    ? (((rec.claimedGenerationMWh - rec.verifiedGenerationMWh) / rec.verifiedGenerationMWh) * 100).toFixed(1)
                    : '+0.0';
                  return (
                    <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-amber-400">{rec.id}</td>
                      <td className="py-3 px-4 font-sans text-slate-200">{rec.plantName}</td>
                      <td className="py-3 px-4 text-slate-300 font-semibold">{rec.claimedGenerationMWh.toLocaleString()}</td>
                      <td className="py-3 px-4 text-emerald-400 font-semibold">{rec.verifiedGenerationMWh?.toLocaleString() || '—'}</td>
                      <td className="py-3 px-4 font-semibold text-red-400">+{variance}%</td>
                      <td className="py-3 px-4">
                        <RiskBadge band={rec.riskBand} score={rec.riskScore} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedCaseRecId(rec.id);
                              setActiveTab('VERIFY_ACTION');
                            }}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            Open Case
                          </button>
                          <button
                            onClick={() => inspectRec(rec.id)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Forensic Determination Workbench */}
      {activeTab === 'VERIFY_ACTION' && selectedCaseRec && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase">Target Case Dossier</span>
                  <h3 className="text-xl font-bold text-white mt-1">{selectedCaseRec.id} · {selectedCaseRec.plantName}</h3>
                  <span className="text-xs text-slate-400">Issuing Entity: {selectedCaseRec.issuerName}</span>
                </div>
                <RiskBadge band={selectedCaseRec.riskBand} score={selectedCaseRec.riskScore} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block">Claimed Output:</span>
                  <span className="text-white font-bold text-sm">{selectedCaseRec.claimedGenerationMWh.toLocaleString()} MWh</span>
                </div>
                <div>
                  <span className="text-slate-500 block">SCADA Export:</span>
                  <span className="text-emerald-400 font-bold text-sm">{selectedCaseRec.verifiedGenerationMWh?.toLocaleString() || '—'} MWh</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Plant Capacity:</span>
                  <span className="text-white font-bold text-sm">{selectedCaseRec.plantCapacityMW} MW</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Current Status:</span>
                  <span className="text-amber-400 font-bold text-sm">{selectedCaseRec.status}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Automated Fraud Triggers</h4>
                <div className="space-y-2">
                  {(selectedCaseRec.flagReasons || ['Generation curve divergence observed against regional peers.']).map((reason, idx) => (
                    <div key={idx} className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Forensic Audit Memo</h4>
                <textarea
                  value={caseNotes}
                  onChange={(e) => setCaseNotes(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                  placeholder="Enter auditor findings, subpoena references, and evidence notes..."
                />
              </div>
            </div>
          </div>

          {/* Ruling Actions */}
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-white text-base">Verifier Ruling Actions</h3>
              <p className="text-xs text-slate-400">Executing a decision signs the record with your accredited CISA cryptographic key.</p>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => handleDecision('APPROVE')}
                  disabled={actionInProgress !== null}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Clear Certificate</span>
                </button>

                <button
                  onClick={() => handleDecision('FLAG_SUSPICIOUS')}
                  disabled={actionInProgress !== null}
                  className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Issue Freeze & Demand Meter Logs</span>
                </button>

                <button
                  onClick={() => handleDecision('REVOKE')}
                  disabled={actionInProgress !== null}
                  className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Revoke / Cancel Certificate</span>
                </button>

                <button
                  onClick={() => handleDecision('REQUEST_EVIDENCE')}
                  disabled={actionInProgress !== null}
                  className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer disabled:opacity-50"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Request Third-Party Lab Calibration</span>
                </button>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-500 space-y-1">
                <div>Signing Key: RSA-4096-SHA256</div>
                <div>Hash Anchor: Block #{Math.floor(Math.random() * 80 + 10)}</div>
                <div>Status: Valid CISA Certification</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Anomalies */}
      {activeTab === 'ANOMALIES' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-white text-base">Rule Engine Discrepancies & Anomaly Flags</h3>
          <div className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-2">
                      <span>{alert.alertType}</span>
                      <span className="font-mono text-amber-400">[{alert.recId}]</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{alert.description}</div>
                  </div>
                </div>
                <RiskBadge band={alert.riskBand} score={alert.riskScore} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Audit Trail */}
      {activeTab === 'AUDIT_TRAIL' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white text-base">Forensic Evidence Trail</h3>
              <p className="text-xs text-slate-400">Immutable ledger log of all forensic decisions and case notes</p>
            </div>
            <button
              onClick={() => addToast({ type: 'success', title: 'Audit Trail Exported', message: 'CSV forensic dossier generated.' })}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Dossier</span>
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.slice(0, 8).map(log => (
              <div key={log.id} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-4 font-mono text-xs">
                <div>
                  <span className="font-bold text-amber-400">{log.action}</span>
                  <span className="text-slate-400 ml-2 font-sans">{log.details}</span>
                </div>
                <div className="text-slate-500 shrink-0">{log.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
