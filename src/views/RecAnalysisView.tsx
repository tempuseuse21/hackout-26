import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { RECRecord } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { 
  Search, 
  Filter, 
  Eye, 
  ShieldAlert, 
  BadgePercent, 
  Download, 
  Copy, 
  Check, 
  X, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Building2,
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react';

export const RecAnalysisView: React.FC = () => {
  const { recs, inspectRec, setActiveTab } = useApp();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('ALL');
  const [energySourceFilter, setEnergySourceFilter] = useState<string>('ALL');

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortField, setSortField] = useState<keyof RECRecord>('riskScore');
  const [sortAsc, setSortAsc] = useState(false);

  // Selected REC for View Modal
  const [viewingRec, setViewingRec] = useState<RECRecord | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Filtered and Sorted RECs
  const filteredRecs = useMemo(() => {
    return recs.filter(rec => {
      // Search matching REC ID, Generation ID, Plant name, Owner name, or Hash
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesId = rec.id.toLowerCase().includes(q);
        const matchesGen = rec.generationId.toLowerCase().includes(q);
        const matchesPlant = rec.plantName.toLowerCase().includes(q);
        const matchesOwner = rec.currentOwnerName.toLowerCase().includes(q);
        const matchesHash = rec.fingerprintSha256.toLowerCase().includes(q);
        if (!matchesId && !matchesGen && !matchesPlant && !matchesOwner && !matchesHash) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'ALL' && rec.status !== statusFilter) {
        return false;
      }

      // Risk Level filter
      if (riskLevelFilter !== 'ALL' && rec.riskBand !== riskLevelFilter) {
        return false;
      }

      // Energy Source filter
      if (energySourceFilter !== 'ALL' && rec.energySource !== energySourceFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') {
        return sortAsc ? (aVal as string).localeCompare(bVal as string) : (bVal as string).localeCompare(aVal as string);
      }
      return sortAsc ? (Number(aVal) - Number(bVal)) : (Number(bVal) - Number(aVal));
    });
  }, [recs, searchQuery, statusFilter, riskLevelFilter, energySourceFilter, sortField, sortAsc]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredRecs.length / pageSize) || 1;
  const paginatedRecs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecs.slice(start, start + pageSize);
  }, [filteredRecs, currentPage, pageSize]);

  const handleSort = (field: keyof RECRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">REC Analysis & Registry</h1>
          <p className="text-sm text-slate-500 mt-1">
            Search, filter, and inspect certificate telemetry across all generation claims and cryptographic fingerprints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            {filteredRecs.length.toLocaleString()} matching records
          </span>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="REC ID, Gen ID, Plant, Owner..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="FLAGGED">FLAGGED</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="TRANSFERRED">TRANSFERRED</option>
              <option value="RETIRED">RETIRED</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Risk Level</label>
            <select
              value={riskLevelFilter}
              onChange={(e) => {
                setRiskLevelFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">LOW (0–30)</option>
              <option value="MEDIUM">MEDIUM (31–60)</option>
              <option value="HIGH">HIGH (61–80)</option>
              <option value="CRITICAL">CRITICAL (81–100)</option>
            </select>
          </div>

          {/* Energy Source Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Energy Source</label>
            <select
              value={energySourceFilter}
              onChange={(e) => {
                setEnergySourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="ALL">All Energy Sources</option>
              <option value="Solar">Solar Photovoltaic</option>
              <option value="Wind">Onshore / Offshore Wind</option>
              <option value="Hydro">Hydroelectric</option>
              <option value="Biomass">Biomass / Biogas</option>
              <option value="Geothermal">Geothermal</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">Quick Filters:</span>
          <button
            onClick={() => {
              setStatusFilter('FLAGGED');
              setRiskLevelFilter('ALL');
              setCurrentPage(1);
            }}
            className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold"
          >
            Flagged Only
          </button>
          <button
            onClick={() => {
              setRiskLevelFilter('CRITICAL');
              setStatusFilter('ALL');
              setCurrentPage(1);
            }}
            className="px-2.5 py-1 rounded bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 font-semibold"
          >
            Critical Risk (Score &gt; 80)
          </button>
          <button
            onClick={() => {
              setStatusFilter('RETIRED');
              setRiskLevelFilter('ALL');
              setCurrentPage(1);
            }}
            className="px-2.5 py-1 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-semibold"
          >
            Retired Claims
          </button>
          <button
            onClick={() => {
              setRiskLevelFilter('LOW');
              setStatusFilter('ACTIVE');
              setCurrentPage(1);
            }}
            className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-semibold"
          >
            Clean / Verified RECs
          </button>
          {(searchQuery || statusFilter !== 'ALL' || riskLevelFilter !== 'ALL' || energySourceFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setRiskLevelFilter('ALL');
                setEnergySourceFilter('ALL');
                setCurrentPage(1);
              }}
              className="ml-auto text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th 
                  onClick={() => handleSort('id')} 
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>REC ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('plantName')} 
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Plant</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Generation (ID)</th>
                <th 
                  onClick={() => handleSort('claimedGenerationMWh')} 
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Energy (Claim vs Verified)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Status</th>
                <th 
                  onClick={() => handleSort('riskScore')} 
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Risk Score</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Fingerprint (SHA-256)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedRecs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No renewable energy certificates found matching current filters.
                  </td>
                </tr>
              ) : (
                paginatedRecs.map((rec, idx) => (
                  <tr key={`analysis-rec-${rec.id}-${idx}`} className="hover:bg-slate-50 transition-colors">
                    {/* REC ID */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {rec.id}
                    </td>

                    {/* Plant */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{rec.plantName}</div>
                      <div className="text-[11px] text-slate-500">{rec.energySource} • {rec.location}</div>
                    </td>

                    {/* Generation ID */}
                    <td className="py-3 px-4 font-mono text-slate-600">
                      <div>{rec.generationId}</div>
                      <div className="text-[10px] text-slate-400">{rec.generationDate}</div>
                    </td>

                    {/* Energy (Claimed vs Verified MWh) */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-semibold text-slate-900">
                        {rec.claimedGenerationMWh.toLocaleString()} MWh
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        Verified: {rec.verifiedGenerationMWh.toLocaleString()} MWh
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 truncate max-w-[130px]" title={rec.currentOwnerName}>
                        {rec.currentOwnerName}
                      </div>
                      <div className="text-[10px] text-slate-400">Issuer: {rec.issuerName}</div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        rec.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        rec.status === 'FLAGGED' ? 'bg-rose-50 text-rose-700 border border-rose-200 font-bold' :
                        rec.status === 'SUSPENDED' ? 'bg-amber-50 text-amber-700 border border-amber-200 font-bold' :
                        rec.status === 'RETIRED' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {rec.status}
                      </span>
                    </td>

                    {/* Risk Score */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {rec.riskScore} / 100
                    </td>

                    {/* Risk Level */}
                    <td className="py-3 px-4">
                      <RiskBadge score={rec.riskScore} band={rec.riskBand} size="sm" showScore={false} />
                    </td>

                    {/* Fingerprint SHA-256 */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                        <span title={rec.fingerprintSha256}>
                          {rec.fingerprintSha256.slice(0, 8)}...{rec.fingerprintSha256.slice(-6)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(rec.fingerprintSha256)}
                          className="p-1 hover:text-slate-800 text-slate-400 transition-colors"
                          title="Copy SHA-256 Hash"
                        >
                          {copiedHash === rec.fingerprintSha256 ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Actions: View, Inspect Risk, Passport */}
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setViewingRec(rec)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-xs transition-colors"
                        title="View Certificate Details"
                      >
                        View
                      </button>
                      <button
                        onClick={() => inspectRec(rec.id)}
                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded text-xs border border-amber-200 transition-colors"
                        title="Analyze Forensic Risk & Statutory Rules"
                      >
                        Inspect Risk
                      </button>
                      <button
                        onClick={() => {
                          inspectRec(rec.id);
                          setActiveTab('passport');
                        }}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded text-xs border border-blue-200 transition-colors"
                        title="Open Digital Lifecycle Passport"
                      >
                        Passport
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Showing {paginatedRecs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredRecs.length)} of {filteredRecs.length} entries</span>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded px-2 py-1 font-mono text-xs text-slate-900"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-mono text-xs font-semibold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Certificate Quick View Modal */}
      {viewingRec && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 font-mono">{viewingRec.id}</h2>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    viewingRec.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    viewingRec.status === 'FLAGGED' ? 'bg-rose-50 text-rose-700 border border-rose-200 font-bold' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {viewingRec.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">Statutory Certificate Manifest & SCADA Telemetry</p>
              </div>
              <button
                onClick={() => setViewingRec(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Generation ID</div>
                <div className="font-mono font-semibold text-slate-900 mt-1">{viewingRec.generationId}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Claimed Volume</div>
                <div className="font-mono font-semibold text-slate-900 mt-1">{viewingRec.claimedGenerationMWh.toLocaleString()} MWh</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Verified SCADA Volume</div>
                <div className="font-mono font-semibold text-slate-900 mt-1">{viewingRec.verifiedGenerationMWh.toLocaleString()} MWh</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Plant Name</div>
                <div className="font-semibold text-slate-900 mt-1">{viewingRec.plantName}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Capacity (MW)</div>
                <div className="font-mono font-semibold text-slate-900 mt-1">{viewingRec.plantCapacityMW} MW</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Energy Source</div>
                <div className="font-semibold text-slate-900 mt-1">{viewingRec.energySource}</div>
              </div>
            </div>

            {/* Cryptographic Proof */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1.5">
              <div className="text-slate-400 font-bold uppercase text-[10px]">SHA-256 Digital Fingerprint</div>
              <div className="font-mono text-slate-800 break-all bg-white p-2 rounded border border-slate-200">
                {viewingRec.fingerprintSha256}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setViewingRec(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const id = viewingRec.id;
                  setViewingRec(null);
                  inspectRec(id);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Inspect Forensic Risk
              </button>
              <button
                onClick={() => {
                  const id = viewingRec.id;
                  setViewingRec(null);
                  inspectRec(id);
                  setActiveTab('passport');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Open Digital Passport
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
