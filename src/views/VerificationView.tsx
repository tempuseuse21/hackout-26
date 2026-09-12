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
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-blue-600" />
            <span>Batch Verification Processing</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Automated statutory audit pipeline processing large batches against RULE-001 to RULE-007 and SCADA telemetry.
          </p>
        </div>

        {/* Action Buttons (Mandated) */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReRunRulesEngine}
            disabled={isReRunning}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReRunning ? 'animate-spin' : ''}`} />
            <span>{isReRunning ? 'Executing Engine...' : 'Re-Run Rules Engine'}</span>
          </button>

          <button
            onClick={handleExportReport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Verification Report</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs (Mandated: All, Low, Medium, High, Critical, Flagged only) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs">
        <button
          onClick={() => { setActiveFilter('ALL'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeFilter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All ({counts.all})
        </button>

        <button
          onClick={() => { setActiveFilter('LOW'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeFilter === 'LOW' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Low ({counts.low})
        </button>

        <button
          onClick={() => { setActiveFilter('MEDIUM'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeFilter === 'MEDIUM' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Medium ({counts.medium})
        </button>

        <button
          onClick={() => { setActiveFilter('HIGH'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeFilter === 'HIGH' ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          High ({counts.high})
        </button>

        <button
          onClick={() => { setActiveFilter('CRITICAL'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeFilter === 'CRITICAL' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Critical ({counts.critical})
        </button>

        <button
          onClick={() => { setActiveFilter('FLAGGED'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeFilter === 'FLAGGED' ? 'bg-rose-700 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Flagged Only ({counts.flagged})
        </button>
      </div>

      {/* Search Input Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search REC ID, plant name, or fraud rule (e.g. RULE-002)..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{filteredRecs.length}</span> audited certificates
        </div>
      </div>

      {/* Verification Table (Mandated Columns: REC ID, Risk Score, Risk Level, Flagged Rules, Status) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">REC ID</th>
                <th className="py-3 px-4">Facility / Source</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Flagged Rules</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedRecs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No certificates found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedRecs.map((rec, idx) => (
                  <tr key={`verif-rec-${rec.id}-${idx}`} className="hover:bg-slate-50 transition-colors">
                    {/* REC ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <button
                        onClick={() => {
                          inspectRec(rec.id);
                          setActiveTab('risk-intelligence');
                        }}
                        className="text-blue-600 hover:underline"
                        title="Open in Risk Intelligence"
                      >
                        {rec.id}
                      </button>
                    </td>

                    {/* Facility */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 truncate max-w-[180px]">{rec.plantName}</div>
                      <div className="text-[11px] text-slate-500">{rec.energySource} • {rec.plantCapacityMW} MW</div>
                    </td>

                    {/* Risk Score */}
                    <td className="py-3.5 px-4 font-mono font-bold text-sm">
                      <span className={
                        rec.computedRiskScore > 80 ? 'text-rose-600' :
                        rec.computedRiskScore > 60 ? 'text-orange-600' :
                        rec.computedRiskScore > 30 ? 'text-amber-600' :
                        'text-emerald-600'
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
                              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200"
                            >
                              {rule}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>0 Violations</span>
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        rec.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        rec.status === 'FLAGGED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        rec.status === 'RETIRED' ? 'bg-slate-100 text-slate-700' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
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
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
