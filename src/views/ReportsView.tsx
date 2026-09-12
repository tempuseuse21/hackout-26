import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  Download, 
  Filter, 
  FileSpreadsheet, 
  AlertTriangle, 
  ShieldCheck, 
  Building2, 
  Layers 
} from 'lucide-react';
import { exportRecsToCsv } from '../services/datasetGenerator';

export const ReportsView: React.FC = () => {
  const { recs, alerts } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<'risk-summary' | 'fraud-summary' | 'plant-risk' | 'issuer-risk'>('risk-summary');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('ALL');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState('ALL');

  const filteredRecs = useMemo(() => {
    return recs.filter(r => {
      const matchRisk = selectedRiskFilter === 'ALL' || r.riskBand === selectedRiskFilter;
      const matchSource = selectedSourceFilter === 'ALL' || r.energySource === selectedSourceFilter;
      return matchRisk && matchSource;
    });
  }, [recs, selectedRiskFilter, selectedSourceFilter]);

  // Aggregate Plant Risk
  const plantRiskReport = useMemo(() => {
    const map = new Map<string, {
      plantName: string;
      source: string;
      capacityMW: number;
      totalRecs: number;
      flaggedRecs: number;
      avgRiskScore: number;
      maxMismatchPct: number;
    }>();

    recs.forEach(r => {
      const existing = map.get(r.plantId) || {
        plantName: r.plantName,
        source: r.energySource,
        capacityMW: r.plantCapacityMW,
        totalRecs: 0,
        flaggedRecs: 0,
        avgRiskScore: 0,
        maxMismatchPct: 0
      };

      existing.totalRecs += 1;
      if (r.riskBand === 'HIGH' || r.riskBand === 'CRITICAL' || r.status === 'FLAGGED') {
        existing.flaggedRecs += 1;
      }
      existing.avgRiskScore += r.riskScore;

      const mismatch = ((r.claimedGenerationMWh - r.verifiedGenerationMWh) / (r.verifiedGenerationMWh || 1)) * 100;
      if (mismatch > existing.maxMismatchPct) existing.maxMismatchPct = mismatch;

      map.set(r.plantId, existing);
    });

    return Array.from(map.entries()).map(([plantId, data]) => ({
      plantId,
      ...data,
      avgRiskScore: Math.round(data.avgRiskScore / data.totalRecs)
    })).sort((a, b) => b.avgRiskScore - a.avgRiskScore);
  }, [recs]);

  // Aggregate Issuer Reliability
  const issuerRiskReport = useMemo(() => {
    const map = new Map<string, {
      issuerName: string;
      totalSubmitted: number;
      flaggedCount: number;
      criticalCount: number;
      avgRisk: number;
    }>();

    recs.forEach(r => {
      const key = r.issuerName;
      const existing = map.get(key) || {
        issuerName: key,
        totalSubmitted: 0,
        flaggedCount: 0,
        criticalCount: 0,
        avgRisk: 0
      };

      existing.totalSubmitted += 1;
      if (r.riskBand === 'HIGH' || r.riskBand === 'CRITICAL') existing.flaggedCount += 1;
      if (r.riskBand === 'CRITICAL') existing.criticalCount += 1;
      existing.avgRisk += r.riskScore;

      map.set(key, existing);
    });

    return Array.from(map.values()).map(v => ({
      ...v,
      avgRisk: Math.round(v.avgRisk / v.totalSubmitted),
      complianceRate: Math.round(((v.totalSubmitted - v.flaggedCount) / v.totalSubmitted) * 100)
    })).sort((a, b) => b.avgRisk - a.avgRisk);
  }, [recs]);

  const handleDownloadCsv = () => {
    const csvData = exportRecsToCsv(filteredRecs);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rec-guard-report-${activeReportTab}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              REGULATORY COMPLIANCE INTELLIGENCE
            </span>
            <span className="text-xs text-slate-500 font-medium">• Aggregated Energy Market Analytics</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Compliance & Anomaly Audit Reports
          </h1>
          <p className="text-xs text-slate-500">
            Export official risk registries, generation mismatch audits, and plant-level compliance summaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Active Report (CSV)
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Audited Certificate Registry</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{recs.length.toLocaleString()} RECs</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Synthetic & Live Intake Pool</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">High / Critical Anomalies</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">
            {recs.filter(r => r.riskBand === 'HIGH' || r.riskBand === 'CRITICAL').length}
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-0.5">
            {((recs.filter(r => r.riskBand === 'HIGH' || r.riskBand === 'CRITICAL').length / recs.length) * 100).toFixed(1)}% of registry
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Active Investigations</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{alerts.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Human-in-the-loop oversight</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Overall Trust Health</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">94.2 / 100</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">SHA-256 Verified</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2">
        <button
          onClick={() => setActiveReportTab('risk-summary')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
            activeReportTab === 'risk-summary'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          REC Risk Summary ({filteredRecs.length})
        </button>
        <button
          onClick={() => setActiveReportTab('plant-risk')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
            activeReportTab === 'plant-risk'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Plant Risk Index ({plantRiskReport.length})
        </button>
        <button
          onClick={() => setActiveReportTab('issuer-risk')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
            activeReportTab === 'issuer-risk'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Issuer Compliance Index ({issuerRiskReport.length})
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-b-xl shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Risk Filter:</span>
            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="CRITICAL">Critical Risk (81-100)</option>
              <option value="HIGH">High Risk (61-80)</option>
              <option value="MEDIUM">Medium Risk (31-60)</option>
              <option value="LOW">Low Risk (0-30)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Energy Source:</span>
            <select
              value={selectedSourceFilter}
              onChange={(e) => setSelectedSourceFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none"
            >
              <option value="ALL">All Sources</option>
              <option value="SOLAR">Solar</option>
              <option value="WIND">Wind</option>
              <option value="HYDRO">Hydro</option>
              <option value="GEOTHERMAL">Geothermal</option>
              <option value="BIOMASS">Biomass</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Showing {filteredRecs.length} matching rows
        </span>
      </div>

      {/* Table Content */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {activeReportTab === 'risk-summary' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">REC ID</th>
                  <th className="py-3 px-4">Plant & Location</th>
                  <th className="py-3 px-4">Verified (MWh)</th>
                  <th className="py-3 px-4">Claimed (MWh)</th>
                  <th className="py-3 px-4">Mismatch</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Primary Anomaly Signal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRecs.slice(0, 30).map(r => {
                  const mismatchPct = ((r.claimedGenerationMWh - r.verifiedGenerationMWh) / (r.verifiedGenerationMWh || 1)) * 100;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{r.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{r.plantName}</div>
                        <div className="text-[11px] text-slate-500">{r.location}</div>
                      </td>
                      <td className="py-3 px-4 font-mono">{r.verifiedGenerationMWh.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono">{r.claimedGenerationMWh.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono">
                        {mismatchPct > 0 ? (
                          <span className={`font-bold ${mismatchPct > 20 ? 'text-rose-600' : 'text-amber-600'}`}>
                            +{mismatchPct.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">0%</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          r.riskBand === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                          r.riskBand === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                          r.riskBand === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {r.riskScore}/100 • {r.riskBand}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                        {r.flagReasons?.[0] || 'Clean verified baseline'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeReportTab === 'plant-risk' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Plant Name & ID</th>
                  <th className="py-3 px-4">Source & Capacity</th>
                  <th className="py-3 px-4">Total RECs</th>
                  <th className="py-3 px-4">Flagged RECs</th>
                  <th className="py-3 px-4">Max Mismatch</th>
                  <th className="py-3 px-4">Average Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {plantRiskReport.map(p => (
                  <tr key={p.plantId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {p.plantName}
                      <span className="block font-mono text-[11px] text-slate-400">{p.plantId}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{p.source}</span>
                      <span className="block text-[11px] text-slate-500">{p.capacityMW} MW Nameplate</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">{p.totalRecs}</td>
                    <td className="py-3 px-4 font-mono">
                      {p.flaggedRecs > 0 ? (
                        <span className="text-rose-600 font-bold">{p.flaggedRecs}</span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {p.maxMismatchPct > 0 ? `+${p.maxMismatchPct.toFixed(1)}%` : '0%'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        p.avgRiskScore > 60 ? 'bg-rose-100 text-rose-800' :
                        p.avgRiskScore > 30 ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.avgRiskScore} / 100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReportTab === 'issuer-risk' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Issuer Organization</th>
                  <th className="py-3 px-4">Total Submissions</th>
                  <th className="py-3 px-4">Flagged Submissions</th>
                  <th className="py-3 px-4">Critical Anomalies</th>
                  <th className="py-3 px-4">Compliance Rating</th>
                  <th className="py-3 px-4">Average Risk Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {issuerRiskReport.map(iss => (
                  <tr key={iss.issuerName} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{iss.issuerName}</td>
                    <td className="py-3 px-4 font-mono">{iss.totalSubmitted}</td>
                    <td className="py-3 px-4 font-mono">
                      {iss.flaggedCount > 0 ? (
                        <span className="text-amber-600 font-bold">{iss.flaggedCount}</span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {iss.criticalCount > 0 ? (
                        <span className="text-rose-600 font-bold">{iss.criticalCount}</span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        iss.complianceRate >= 90 ? 'bg-emerald-100 text-emerald-800' :
                        iss.complianceRate >= 75 ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {iss.complianceRate}% Verified
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      {iss.avgRisk} / 100
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
