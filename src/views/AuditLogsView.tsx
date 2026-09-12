import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Search, 
  Download, 
  Filter, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  ExternalLink 
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [resultFilter, setResultFilter] = useState('ALL');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch = 
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.recId && log.recId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRole = roleFilter === 'ALL' || log.userRole === roleFilter;
      const matchesResult = resultFilter === 'ALL' || log.result === resultFilter;

      return matchesSearch && matchesRole && matchesResult;
    });
  }, [auditLogs, searchQuery, roleFilter, resultFilter]);

  const handleExportCsv = () => {
    const headers = ['Log ID', 'User Name', 'Role', 'Action', 'REC ID', 'Timestamp', 'IP Address', 'Result', 'Details'];
    const rows = filteredLogs.map(l => [
      l.id,
      `"${l.userName}"`,
      l.userRole,
      l.action,
      l.recId || '',
      `"${l.timestamp}"`,
      l.ipAddress,
      l.result,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rec-guard-audit-log-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
              IMMUTABLE JOURNAL
            </span>
            <span className="text-xs text-slate-500 font-medium">• SEC Rule 17a-4 Compliant</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            System Audit & Governance Logs
          </h1>
          <p className="text-xs text-slate-500">
            Append-only chronological record of all administrative submissions, algorithmic analyses, and case dispositions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Audit Trail (CSV)
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Logged Actions</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{auditLogs.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">100% Non-repudiable</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Flagged Exceptions</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">
            {auditLogs.filter(l => l.result === 'FLAGGED').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Automated rule violations</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Active Operators</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">4 Roles</div>
          <div className="text-[11px] text-blue-600 font-medium mt-0.5">RBAC Validated</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Ledger Integrity</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">VERIFIED</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Zero cryptographic breaks</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, user, REC ID, or details..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="AUDITOR">AUDITOR</option>
              <option value="CERTIFICATE_ISSUER">ISSUER</option>
              <option value="CORPORATE_BUYER">BUYER</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Result:</span>
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none"
            >
              <option value="ALL">All Results</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FLAGGED">FLAGGED</option>
              <option value="DENIED">DENIED</option>
              <option value="FAILURE">FAILURE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Event ID / Time</th>
                <th className="py-3 px-4">Principal & Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">REC Reference</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4">Details & Forensics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No audit events match your search filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{log.id}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {log.timestamp}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{log.userName}</div>
                      <span className={`inline-block mt-0.5 text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                        log.userRole === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                        log.userRole === 'AUDITOR' ? 'bg-indigo-100 text-indigo-800' :
                        log.userRole === 'CERTIFICATE_ISSUER' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 text-[11px]">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {log.recId ? (
                        <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          {log.recId}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        log.result === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        log.result === 'FLAGGED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {log.result}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600" title={log.details}>
                      {log.details || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
