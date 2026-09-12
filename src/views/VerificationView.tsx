import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { RiskBadge } from '../components/RiskBadge';
import { evaluateRules } from '../services/rulesEngine';
import { downloadCsvFile } from '../services/datasetGenerator';
import { 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Download, 
  Search, 
  Filter, 
  Upload, 
  Layers, 
  ArrowUpRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { RiskBand } from '../types';

export const VerificationView: React.FC = () => {
  const { recs, setRecs, inspectRec, addToast, setActiveTab } = useApp();

  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isReRunning, setIsReRunning] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Batch evaluation of each REC using the 7 fraud rules
  const verifiedList = useMemo(() => {
    return recs.map(rec => {
      const evaluation = evaluateRules(
        rec, 
        recs, 
        rec.features?.historicalDeviationPercent ? 0.8 : 0.1, 
        rec.isAnomaly
      );
      const triggeredRuleIds = evaluation.ruleResults
        .filter(r => r.triggered && r.ruleId.startsWith('RULE-'))
        .map(r => r.ruleId);

      return {
        ...rec,
        computedRiskScore: evaluation.riskScore,
        computedRiskBand: evaluation.riskBand,
        flaggedRules: triggeredRuleIds,
        flaggedCount: triggeredRuleIds.length,
        recommendedAction: evaluation.recommendedAction
      };
    });
  }, [recs]);

  // Filtering
  const filteredRecs = useMemo(() => {
    return verifiedList.filter(item => {
      // Risk filter
      if (activeFilter === 'LOW' && item.computedRiskBand !== 'LOW') return false;
      if (activeFilter === 'MEDIUM' && item.computedRiskBand !== 'MEDIUM') return false;
      if (activeFilter === 'HIGH' && item.computedRiskBand !== 'HIGH') return false;
      if (activeFilter === 'CRITICAL' && item.computedRiskBand !== 'CRITICAL') return false;
      if (activeFilter === 'FLAGGED' && item.flaggedCount === 0 && item.status !== 'FLAGGED') return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          item.id.toLowerCase().includes(q) ||
          item.plantName.toLowerCase().includes(q) ||
          item.flaggedRules.some(r => r.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [verifiedList, activeFilter, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredRecs.length / pageSize) || 1;
  const paginatedRecs = filteredRecs.slice((page - 1) * pageSize, page * pageSize);

  // Action: Re-run rules engine
  const handleReRunRulesEngine = () => {
    setIsReRunning(true);
    setTimeout(() => {
      // Refresh recs by recalculating scores
      setRecs(prev => prev.map(rec => {
        const ev = evaluateRules(rec, prev, 0.5, rec.isAnomaly);
        return {
          ...rec,
          riskScore: ev.riskScore,
          riskBand: ev.riskBand,
          status: ev.riskScore > 60 ? 'FLAGGED' : rec.status
        };
      }));
      setIsReRunning(false);
      addToast({
        type: 'success',
        title: 'Batch Rules Engine Completed',
        message: `Successfully audited ${recs.length.toLocaleString()} certificates against RULE-001 through RULE-007.`
      });
    }, 450);
  };

  // Action: Export verification report
  const handleExportReport = () => {
    const headers = ['REC ID', 'Risk Score', 'Risk Level', 'Flagged Rules', 'Status', 'Plant Name', 'Claimed MWh', 'Verified MWh', 'Recommended Action'];
    const rows = filteredRecs.map(r => [
      r.id,
      r.computedRiskScore,
      r.computedRiskBand,
      `"${r.flaggedRules.join('; ') || 'None'}"`,
      r.status,
      `"${r.plantName}"`,
      r.claimedGenerationMWh,
      r.verifiedGenerationMWh,
      `"${r.recommendedAction}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    downloadCsvFile(csvContent, `REC_Batch_Verification_Report_${Date.now()}.csv`);

    addToast({
      type: 'success',
      title: 'Verification Report Exported',
      message: `Downloaded CSV verification audit dossier for ${filteredRecs.length} certificates.`
    });
  };

  // Counts for pills
  const counts = {
    all: verifiedList.length,
    low: verifiedList.filter(r => r.computedRiskBand === 'LOW').length,
    medium: verifiedList.filter(r => r.computedRiskBand === 'MEDIUM').length,
    high: verifiedList.filter(r => r.computedRiskBand === 'HIGH').length,
    critical: verifiedList.filter(r => r.computedRiskBand === 'CRITICAL').length,
    flagged: verifiedList.filter(r => r.flaggedCount > 0 || r.status === 'FLAGGED').length,
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <span>Batch Verification Processing</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Automated statutory audit pipeline processing large batches against RULE-001 to RULE-007 and SCADA telemetry.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono">
          <button
            onClick={handleReRunRulesEngine}
            disabled={isReRunning}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReRunning ? 'animate-spin' : ''}`} />
            <span>{isReRunning ? 'Executing Engine...' : 'Re-Run Rules Engine'}</span>
          </button>

          <button
            onClick={handleExportReport}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-emerald-950/40 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Verification Report</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs font-mono">
        <button
          onClick={() => { setActiveFilter('ALL'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeFilter === 'ALL' ? 'bg-slate-800 text-white border border-slate-700 font-bold' : 'text-slate-400 hover:bg-slate-800/60'
          }`}
        >
          All ({counts.all})
        </button>

        <button
          onClick={() => { setActiveFilter('LOW'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeFilter === 'LOW' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold' : 'text-slate-400 hover:bg-slate-800/60'
          }`}
        >
          Low ({counts.low})
        </button>

        <button
          onClick={() => { setActiveFilter('MEDIUM'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeFilter === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold' : 'text-slate-400 hover:bg-slate-800/60'
          }`}
        >
          Medium ({counts.medium})
        </button>

        <button
          onClick={() => { setActiveFilter('HIGH'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeFilter === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 font-bold' : 'text-slate-400 hover:bg-slate-800/60'
          }`}
        >
          High ({counts.high})
        </button>

        <button
          onClick={() => { setActiveFilter('CRITICAL'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeFilter === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold' : 'text-slate-400 hover:bg-slate-800/60'
          }`}
        >
          Critical ({counts.critical})
        </button>

        <button
          onClick={() => { setActiveFilter('FLAGGED'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeFilter === 'FLAGGED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold' : 'text-slate-400 hover:bg-slate-800/60'
          }`}
        >
          Flagged Only ({counts.flagged})
        </button>
      </div>

      {/* Search Input Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search REC ID, plant name, or fraud rule (e.g. RULE-002)..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="font-semibold text-white">{filteredRecs.length}</span> audited certificates
        </div>
      </div>

      {/* Verification Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">REC ID</th>
                <th className="py-3.5 px-4">Facility / Source</th>
                <th className="py-3.5 px-4">Risk Score</th>
                <th className="py-3.5 px-4">Risk Level</th>
                <th className="py-3.5 px-4">Flagged Rules</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {paginatedRecs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                    No certificates found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedRecs.map((rec, idx) => (
                  <tr key={`verif-rec-${rec.id}-${idx}`} className="hover:bg-slate-800/50 transition-colors">
                    {/* REC ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      <button
                        onClick={() => {
                          inspectRec(rec.id);
                          setActiveTab('risk-intelligence');
                        }}
                        className="hover:underline cursor-pointer"
                        title="Open in Risk Intelligence"
                      >
                        {rec.id}
                      </button>
                    </td>

                    {/* Facility */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-100 truncate max-w-[180px]">{rec.plantName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{rec.energySource} • {rec.plantCapacityMW} MW</div>
                    </td>

                    {/* Risk Score */}
                    <td className="py-3.5 px-4 font-mono font-bold text-sm">
                      <span className={
                        rec.computedRiskScore > 80 ? 'text-rose-400' :
                        rec.computedRiskScore > 60 ? 'text-orange-400' :
                        rec.computedRiskScore > 30 ? 'text-amber-400' :
                        'text-emerald-400'
                      }>
                        {rec.computedRiskScore}/100
                      </span>
                    </td>

                    {/* Risk Level */}
                    <td className="py-3.5 px-4">
                      <RiskBadge score={rec.computedRiskScore} band={rec.computedRiskBand} size="sm" />
                    </td>

                    {/* Flagged Rules */}
                    <td className="py-3.5 px-4">
                      {rec.flaggedRules.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[280px]">
                          {rec.flaggedRules.map((rule, rIdx) => (
                            <span 
                              key={`rule-${rule}-${rIdx}`}
                              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30"
                            >
                              {rule}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>0 Violations</span>
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        rec.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        rec.status === 'FLAGGED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                        rec.status === 'RETIRED' ? 'bg-slate-800 text-slate-400 border-slate-700' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {rec.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          inspectRec(rec.id);
                          setActiveTab('risk-intelligence');
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer font-mono"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div>
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-semibold disabled:opacity-40 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-semibold disabled:opacity-40 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
