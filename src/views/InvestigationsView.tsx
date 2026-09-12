import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RiskBadge } from '../components/RiskBadge';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Plus, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Send, 
  ArrowUpRight, 
  Check, 
  X,
  FileText,
  User,
  Building,
  Flag
} from 'lucide-react';
import { AlertStatus, FraudAlert } from '../types';

export const InvestigationsView: React.FC = () => {
  const { 
    alerts, 
    updateAlertStatus, 
    addInvestigationNote, 
    assignAuditor, 
    openInvestigationCase, 
    inspectRec, 
    recs,
    setActiveTab,
    currentUser
  } = useApp();

  const [selectedCaseId, setSelectedCaseId] = useState<string>(alerts[0]?.id || 'ALT-4091');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);

  // New Case Form State
  const [newRecId, setNewRecId] = useState(recs[0]?.id || 'REC-10231');
  const [newAlertType, setNewAlertType] = useState('Duplicate Claim');
  const [newSummary, setNewSummary] = useState('');
  const [newAuditor, setNewAuditor] = useState('Dr. Evelyn Vance');

  const auditorsList = [
    'Dr. Evelyn Vance (Chief Regulatory Auditor)',
    'Marcus Thorne (Senior Grid Forensic Investigator)',
    'Sarah Lin (Carbon Markets Compliance Specialist)',
    'Alex Chen (DLT Cryptographic Verifier)'
  ];

  // Filter alerts
  const filteredAlerts = alerts.filter(a => {
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'OPEN' && a.status !== 'OPEN') return false;
      if (statusFilter === 'UNDER_REVIEW' && a.status !== 'UNDER_REVIEW' && a.status !== 'IN_REVIEW') return false;
      if (statusFilter === 'ESCALATED' && a.status !== 'ESCALATED') return false;
      if (statusFilter === 'RESOLVED' && a.status !== 'RESOLVED') return false;
      if (statusFilter === 'FALSE_POSITIVE' && a.status !== 'FALSE_POSITIVE' && a.status !== 'DISMISSED') return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        a.id.toLowerCase().includes(q) ||
        a.recId.toLowerCase().includes(q) ||
        a.alertType.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.assignedAuditor.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeCase = alerts.find(a => a.id === selectedCaseId) || filteredAlerts[0] || alerts[0];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !activeCase) return;
    addInvestigationNote(activeCase.id, newNoteText.trim());
    setNewNoteText('');
  };

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSummary.trim()) return;
    openInvestigationCase(newRecId, newAlertType, newSummary.trim(), newAuditor);
    setShowNewCaseModal(false);
    setNewSummary('');
  };

  // Status Counts
  const counts = {
    all: alerts.length,
    open: alerts.filter(a => a.status === 'OPEN').length,
    underReview: alerts.filter(a => a.status === 'UNDER_REVIEW' || a.status === 'IN_REVIEW').length,
    escalated: alerts.filter(a => a.status === 'ESCALATED').length,
    resolved: alerts.filter(a => a.status === 'RESOLVED').length,
    falsePositive: alerts.filter(a => a.status === 'FALSE_POSITIVE' || a.status === 'DISMISSED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 font-mono">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <span>Auditor Investigation Center</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage forensic dossiers, assign investigators, escalate high-severity fraud, and document evidence.
          </p>
        </div>

        <button
          onClick={() => setShowNewCaseModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-emerald-950/40 flex items-center gap-1.5 self-start sm:self-auto transition-all cursor-pointer font-mono"
        >
          <Plus className="w-4 h-4" />
          <span>Open New Case</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs font-mono">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
            statusFilter === 'ALL' ? 'bg-slate-800 text-white border border-slate-700 font-bold' : 'text-slate-400 hover:bg-slate-800/60'
          }`}
        >
          All Cases ({counts.all})
        </button>
        <button
          onClick={() => setStatusFilter('OPEN')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
            statusFilter === 'OPEN' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 font-bold' : 'text-slate-400 hover:bg-slate-800/60'
          }`}
        >
          Open ({counts.open})
        </button>
        <button
          onClick={() => setStatusFilter('UNDER_REVIEW')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
            statusFilter === 'UNDER_REVIEW' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold' : 'text-slate-400 hover:bg-slate-800/60'
          }`}
        >
          Under Review ({counts.underReview})
        </button>
        <button
          onClick={() => setStatusFilter('ESCALATED')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
            statusFilter === 'ESCALATED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold' : 'text-slate-400 hover:bg-slate-800/60'
          }`}
        >
          Escalated ({counts.escalated})
        </button>
        <button
          onClick={() => setStatusFilter('RESOLVED')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
            statusFilter === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold' : 'text-slate-400 hover:bg-slate-800/60'
          }`}
        >
          Resolved ({counts.resolved})
        </button>
        <button
          onClick={() => setStatusFilter('FALSE_POSITIVE')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
            statusFilter === 'FALSE_POSITIVE' ? 'bg-slate-800 text-slate-300 border border-slate-700 font-bold' : 'text-slate-400 hover:bg-slate-800/60'
          }`}
        >
          False Positive ({counts.falsePositive})
        </button>
      </div>

      {/* Two-Column Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cases List */}
        <div className="lg:col-span-5 space-y-3 font-mono">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Filter by case, REC ID, or auditor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredAlerts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-900 rounded-xl border border-slate-800">
                No investigation cases match the selected filter.
              </div>
            ) : (
              filteredAlerts.map((c, idx) => {
                const isSelected = activeCase?.id === c.id;
                return (
                  <div
                    key={`case-${c.id}-${idx}`}
                    onClick={() => setSelectedCaseId(c.id)}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/80 border-emerald-500/50 shadow-md'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-white">{c.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        c.status === 'OPEN' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                        c.status === 'UNDER_REVIEW' || c.status === 'IN_REVIEW' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        c.status === 'ESCALATED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                        c.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5 font-mono text-slate-400">
                      <span className="text-emerald-400 font-bold">{c.recId}</span>
                      <span>•</span>
                      <span className="font-sans font-semibold text-slate-200 truncate">{c.alertType}</span>
                    </div>

                    <p className="text-slate-400 mt-1 line-clamp-2 leading-relaxed text-[11px] font-sans">
                      {c.summary}
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                      <span>Assigned: <strong className="text-slate-300">{c.assignedAuditor.split(' ')[0]}</strong></span>
                      <span className="font-mono">{c.detectedAt.slice(0, 10)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Case Dossier & Actions */}
        <div className="lg:col-span-7">
          {activeCase ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6 text-slate-100">
              {/* Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg font-bold font-mono text-white">{activeCase.id}</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border font-mono ${
                      activeCase.status === 'OPEN' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                      activeCase.status === 'UNDER_REVIEW' || activeCase.status === 'IN_REVIEW' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      activeCase.status === 'ESCALATED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                      activeCase.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {activeCase.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-mono">
                    Detected: <span className="font-mono text-slate-300">{activeCase.detectedAt}</span> • Type: <span className="font-semibold text-emerald-400">{activeCase.alertType}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <button
                    onClick={() => {
                      inspectRec(activeCase.recId);
                      setActiveTab('risk-intelligence');
                    }}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Inspect {activeCase.recId}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                </div>
              </div>

              {/* Status & Action Buttons */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3 font-mono">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Case Management Actions:</span>
                  <span className="text-[11px] text-slate-500">Current Role: {currentUser.role}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Under Review Action */}
                  <button
                    onClick={() => updateAlertStatus(activeCase.id, 'UNDER_REVIEW', 'Moved to active desk review by auditor.')}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Under Review
                  </button>

                  {/* Escalate Action */}
                  <button
                    onClick={() => updateAlertStatus(activeCase.id, 'ESCALATED', 'ESCALATED to National Energy Board and Market Operator for formal sanction.')}
                    className="px-3 py-1.5 bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Escalate</span>
                  </button>

                  {/* Resolve Action */}
                  <button
                    onClick={() => updateAlertStatus(activeCase.id, 'RESOLVED', 'Resolved after affidavit verification and meter calibration confirm reconciliation.')}
                    className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolve</span>
                  </button>

                  {/* False Positive Action */}
                  <button
                    onClick={() => updateAlertStatus(activeCase.id, 'FALSE_POSITIVE', 'Closed as false positive; benign meter latency confirmed.')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-700"
                  >
                    Mark False Positive
                  </button>
                </div>
              </div>

              {/* Auditor Assignment */}
              <div className="space-y-2 text-xs font-mono">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Assigned Lead Investigator:</span>
                </label>
                <select
                  value={activeCase.assignedAuditor}
                  onChange={(e) => assignAuditor(activeCase.id, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-emerald-500"
                >
                  {auditorsList.map((aud, idx) => (
                    <option key={`assigned-aud-${aud}-${idx}`} value={aud}>{aud}</option>
                  ))}
                </select>
              </div>

              {/* Case Summary & Evidence */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Forensic Summary & Evidence Signals
                </h3>
                <div className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                  {activeCase.summary}
                </div>

                {activeCase.evidence && activeCase.evidence.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {activeCase.evidence.map((ev, i) => (
                      <div key={`ev-${activeCase.id}-${i}`} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-start gap-2">
                        <Flag className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{ev}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Investigation Notes & Audit Log */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between">
                  <span>Timestamped Audit Notes ({activeCase.investigationNotes?.length || 0})</span>
                  <span className="text-[10px] text-emerald-400 font-mono">IMMUTABLE DOSSIER</span>
                </h3>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {activeCase.investigationNotes?.map((note) => (
                    <div key={note.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-white">{note.author} ({note.role})</span>
                        <span className="font-mono text-slate-500 text-[10px]">{note.timestamp}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans">{note.content}</p>
                      {note.actionTaken && (
                        <div className="text-[10px] font-mono text-emerald-400 font-semibold pt-1">
                          Action: {note.actionTaken}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add timestamped investigative note or affidavit reference..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={!newNoteText.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer font-mono"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Add Note</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-900 rounded-xl border border-slate-800 font-mono">
              Select an investigation case from the list on the left.
            </div>
          )}
        </div>
      </div>

      {/* Open New Case Modal */}
      {showNewCaseModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl max-w-lg w-full p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white font-mono">Open Formal Investigation Case</h2>
              <button 
                onClick={() => setShowNewCaseModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4 text-xs font-mono">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Target REC Certificate:</label>
                <select
                  value={newRecId}
                  onChange={(e) => setNewRecId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {recs.slice(0, 30).map((r, idx) => (
                    <option key={`inv-opt-${r.id}-${idx}`} value={r.id}>
                      {r.id} - {r.plantName} ({r.riskScore}/100)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Suspected Violation / Alert Type:</label>
                <select
                  value={newAlertType}
                  onChange={(e) => setNewAlertType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Duplicate Claim">Duplicate Claim / Double Counting</option>
                  <option value="Generation Mismatch">Generation Mismatch (Claimed vs SCADA)</option>
                  <option value="Over-Issuance">Over-Issuance Exceeding Plant Capacity</option>
                  <option value="Retirement Reuse">Retirement Reuse / Secondary Trade</option>
                  <option value="Transfer Anomaly">Rapid Transfer Velocity / Wash Trading</option>
                  <option value="AI Anomaly">Unsupervised Isolation Forest Anomaly</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Lead Investigator:</label>
                <select
                  value={newAuditor}
                  onChange={(e) => setNewAuditor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {auditorsList.map((aud, idx) => (
                    <option key={`new-aud-${aud}-${idx}`} value={aud}>{aud}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Forensic Synopsis / Rationale:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the audit trigger, revenue meter discrepancies, or suspicious counterparty behavior..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewCaseModal(false)}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-lg shadow-md shadow-emerald-950/40 cursor-pointer"
                >
                  Create Case Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
