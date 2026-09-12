import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { RiskBadge } from '../components/RiskBadge';
import { formatHash } from '../services/cryptoService';
import { exportRecsToCsv, downloadCsvFile } from '../services/datasetGenerator';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  Eye, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { RiskBand, RECStatus } from '../types';

export const RegistryView: React.FC = () => {
  const { recs, inspectRec, addToast } = useApp();

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskBand, setSelectedRiskBand] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedIssuer, setSelectedIssuer] = useState<string>('ALL');
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'risk' | 'date' | 'quantity'>('risk');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Extract unique issuers for filter dropdown
  const uniqueIssuers = useMemo(() => {
    const set = new Set<string>();
    recs.forEach(r => {
      if (r.issuerName) set.add(r.issuerName);
    });
    return Array.from(set);
  }, [recs]);

  // Filter and sort logic
  const filteredRecs = useMemo(() => {
    let result = [...recs];

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toUpperCase();
      result = result.filter(r => 
        r.id.toUpperCase().includes(q) ||
        r.plantId.toUpperCase().includes(q) ||
        r.plantName.toUpperCase().includes(q) ||
        r.generationId.toUpperCase().includes(q) ||
        r.issuerName.toUpperCase().includes(q) ||
        r.currentOwnerName.toUpperCase().includes(q)
      );
    }

    // Risk Band Filter
    if (selectedRiskBand !== 'ALL') {
      result = result.filter(r => r.riskBand === selectedRiskBand);
    }

    // Status Filter
    if (selectedStatus !== 'ALL') {
      result = result.filter(r => r.status === selectedStatus);
    }

    // Issuer Filter
    if (selectedIssuer !== 'ALL') {
      result = result.filter(r => r.issuerName === selectedIssuer);
    }

    // Suspicious Only
    if (suspiciousOnly) {
      result = result.filter(r => r.riskScore > 60 || r.status === 'FLAGGED');
    }

    // Sort
    result.sort((a, b) => {
      let valA: number = 0;
      let valB: number = 0;
      if (sortBy === 'risk') {
        valA = a.riskScore;
        valB = b.riskScore;
      } else if (sortBy === 'quantity') {
        valA = a.energyQuantityMWh;
        valB = b.energyQuantityMWh;
      } else if (sortBy === 'date') {
        valA = new Date(a.issuanceDate).getTime();
        valB = new Date(b.issuanceDate).getTime();
      }
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

    return result;
  }, [recs, searchTerm, selectedRiskBand, selectedStatus, selectedIssuer, suspiciousOnly, sortBy, sortOrder]);

  // Pagination slicing
  const totalPages = Math.ceil(filteredRecs.length / pageSize) || 1;
  const paginatedRecs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecs.slice(start, start + pageSize);
  }, [filteredRecs, currentPage, pageSize]);

  const handleExportCsv = () => {
    const csvData = exportRecsToCsv(filteredRecs);
    downloadCsvFile(csvData, `rec_guard_export_${Date.now()}.csv`);
    addToast({
      type: 'success',
      title: 'CSV Export Generated',
      message: `Exported ${filteredRecs.length} REC records with SHA-256 fingerprints.`
    });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedRiskBand('ALL');
    setSelectedStatus('ALL');
    setSelectedIssuer('ALL');
    setSuspiciousOnly(false);
    setSortBy('risk');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <span>Renewable Energy Certificate (REC) Registry</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {filteredRecs.length.toLocaleString()} of {recs.length.toLocaleString()}
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Immutable registry ledger tracking generation origin, ownership transfers, and automated fraud flags.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Field */}
          <div className="relative sm:col-span-2">
            <input
              type="text"
              placeholder="Search REC ID, Plant, Generation ID, Issuer..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          {/* Risk Band */}
          <div>
            <select
              value={selectedRiskBand}
              onChange={(e) => { setSelectedRiskBand(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Risk Bands</option>
              <option value="LOW">Low Risk (0–30)</option>
              <option value="MEDIUM">Medium Risk (31–60)</option>
              <option value="HIGH">High Risk (61–80)</option>
              <option value="CRITICAL">Critical Risk (81–100)</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="FLAGGED">FLAGGED</option>
              <option value="TRANSFERRED">TRANSFERRED</option>
              <option value="RETIRED">RETIRED</option>
            </select>
          </div>

          {/* Issuer */}
          <div>
            <select
              value={selectedIssuer}
              onChange={(e) => { setSelectedIssuer(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Issuers</option>
              {uniqueIssuers.map(iss => (
                <option key={iss} value={iss}>{iss}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Second row of filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={suspiciousOnly}
                onChange={(e) => { setSuspiciousOnly(e.target.checked); setCurrentPage(1); }}
                className="rounded bg-slate-950 border-slate-700 text-rose-500 focus:ring-0 focus:ring-offset-0"
              />
              <span className="font-semibold text-rose-400">Suspicious Only (Risk &gt; 60)</span>
            </label>

            <div className="flex items-center gap-2 text-slate-400">
              <span>Sort by:</span>
              <button
                onClick={() => {
                  if (sortBy === 'risk') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  else { setSortBy('risk'); setSortOrder('desc'); }
                }}
                className={`px-2 py-0.5 rounded font-mono ${sortBy === 'risk' ? 'bg-emerald-500/20 text-emerald-300' : 'hover:text-slate-200'}`}
              >
                Risk Score {sortBy === 'risk' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => {
                  if (sortBy === 'quantity') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  else { setSortBy('quantity'); setSortOrder('desc'); }
                }}
                className={`px-2 py-0.5 rounded font-mono ${sortBy === 'quantity' ? 'bg-emerald-500/20 text-emerald-300' : 'hover:text-slate-200'}`}
              >
                Volume {sortBy === 'quantity' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => {
                  if (sortBy === 'date') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  else { setSortBy('date'); setSortOrder('desc'); }
                }}
                className={`px-2 py-0.5 rounded font-mono ${sortBy === 'date' ? 'bg-emerald-500/20 text-emerald-300' : 'hover:text-slate-200'}`}
              >
                Issue Date {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
            </div>
          </div>

          <button
            onClick={resetFilters}
            className="text-slate-400 hover:text-slate-200 flex items-center gap-1 text-[11px]"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-4 font-semibold">REC ID</th>
                <th className="py-3 px-4 font-semibold">PLANT & SOURCE</th>
                <th className="py-3 px-4 font-semibold">GEN ID</th>
                <th className="py-3 px-4 font-semibold">ISSUER</th>
                <th className="py-3 px-4 font-semibold">VOLUME</th>
                <th className="py-3 px-4 font-semibold">ISSUE DATE</th>
                <th className="py-3 px-4 font-semibold">STATUS</th>
                <th className="py-3 px-4 font-semibold">RISK LEVEL</th>
                <th className="py-3 px-4 font-semibold">FINGERPRINT (SHA-256)</th>
                <th className="py-3 px-4 font-semibold">CURRENT OWNER</th>
                <th className="py-3 px-4 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {paginatedRecs.map(rec => (
                <tr 
                  key={rec.id}
                  onClick={() => inspectRec(rec.id)}
                  className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${
                    rec.id === 'REC-10231' ? 'bg-rose-950/20' : ''
                  }`}
                >
                  {/* REC ID */}
                  <td className="py-3 px-4 font-bold text-slate-100 flex items-center gap-1.5">
                    <span>{rec.id}</span>
                    {rec.id === 'REC-10231' && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                        CRITICAL
                      </span>
                    )}
                  </td>

                  {/* Plant & Source */}
                  <td className="py-3 px-4 text-slate-300 font-sans">
                    <div className="font-semibold text-slate-200">{rec.plantName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{rec.energySource} • {rec.plantId}</div>
                  </td>

                  {/* Gen ID */}
                  <td className="py-3 px-4 text-slate-300 text-[11px]">
                    {rec.generationId}
                  </td>

                  {/* Issuer */}
                  <td className="py-3 px-4 text-slate-300 font-sans truncate max-w-[130px]">
                    {rec.issuerName}
                  </td>

                  {/* Energy Quantity */}
                  <td className="py-3 px-4 text-slate-200 font-bold">
                    {rec.energyQuantityMWh.toLocaleString()} MWh
                  </td>

                  {/* Issue Date */}
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {rec.issuanceDate}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      rec.status === 'FLAGGED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      rec.status === 'RETIRED' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      rec.status === 'TRANSFERRED' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {rec.status}
                    </span>
                  </td>

                  {/* Risk Level */}
                  <td className="py-3 px-4">
                    <RiskBadge score={rec.riskScore} band={rec.riskBand} size="sm" />
                  </td>

                  {/* Fingerprint */}
                  <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">
                    <span title={rec.fingerprintSha256}>{formatHash(rec.fingerprintSha256, 12)}</span>
                  </td>

                  {/* Current Owner */}
                  <td className="py-3 px-4 text-slate-300 font-sans truncate max-w-[140px]">
                    {rec.currentOwnerName}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        inspectRec(rec.id);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 font-semibold transition-colors text-[11px]"
                    >
                      Dossier
                    </button>
                  </td>
                </tr>
              ))}

              {paginatedRecs.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500 font-sans">
                    No certificates found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 font-mono">
            Showing <span className="text-slate-200 font-bold">{Math.min(filteredRecs.length, (currentPage - 1) * pageSize + 1)}</span> to{' '}
            <span className="text-slate-200 font-bold">{Math.min(filteredRecs.length, currentPage * pageSize)}</span> of{' '}
            <span className="text-slate-200 font-bold">{filteredRecs.length.toLocaleString()}</span> entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="px-3 font-mono text-slate-300 font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
