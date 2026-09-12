/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { RiskBadge } from '../../components/RiskBadge';
import { 
  ShoppingBag, 
  Leaf, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Award, 
  Download, 
  ExternalLink,
  Search,
  Zap,
  Building2,
  FileCheck,
  Check
} from 'lucide-react';
import { RECRecord } from '../../types';

export const BuyerDashboardView: React.FC = () => {
  const { 
    recs, 
    setRecs, 
    currentUser, 
    addToast, 
    addAuditLog, 
    inspectRec 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'MARKETPLACE' | 'PORTFOLIO' | 'TRANSACTIONS' | 'PROOFS'>('MARKETPLACE');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [purchasingRecId, setPurchasingRecId] = useState<string | null>(null);

  // Strict Data Isolation: Only RECs owned by this buyer
  const ownedRecs = useMemo(() => {
    return recs.filter(r => 
      r.currentOwnerId === currentUser.id ||
      r.currentOwnerName.toLowerCase().includes(currentUser.organization.toLowerCase()) ||
      r.currentOwnerName.toLowerCase().includes('aerotech')
    );
  }, [recs, currentUser]);

  // Available RECs for purchase in registry marketplace (Active, low risk, not owned by buyer)
  const availableMarketplaceRecs = useMemo(() => {
    return recs.filter(r => 
      r.status === 'ACTIVE' && 
      r.currentOwnerId !== currentUser.id &&
      !r.currentOwnerName.toLowerCase().includes(currentUser.organization.toLowerCase()) &&
      !r.currentOwnerName.toLowerCase().includes('aerotech') &&
      r.riskScore <= 35
    );
  }, [recs, currentUser]);

  const filteredMarketplaceRecs = useMemo(() => {
    if (sourceFilter === 'ALL') return availableMarketplaceRecs;
    return availableMarketplaceRecs.filter(r => r.energySource.toUpperCase() === sourceFilter.toUpperCase());
  }, [availableMarketplaceRecs, sourceFilter]);

  // Metrics
  const totalMWhAcquired = ownedRecs.reduce((sum, r) => sum + r.energyQuantityMWh, 0);
  const totalCo2OffsetTons = Math.round(totalMWhAcquired * 0.82); // 0.82 MT CO2e avoided per MWh
  const totalInvestmentUsd = totalMWhAcquired * 4.85; // $4.85/MWh average
  const annualTargetMWh = 60000;
  const progressPercent = Math.min(100, Math.round((totalMWhAcquired / annualTargetMWh) * 100));

  const handlePurchaseRec = (rec: RECRecord) => {
    setPurchasingRecId(rec.id);

    setTimeout(() => {
      // Transfer ownership in state
      setRecs(prev => prev.map(item => {
        if (item.id === rec.id) {
          return {
            ...item,
            currentOwnerId: currentUser.id,
            currentOwnerName: currentUser.organization,
            transferCount: (item.transferCount || 0) + 1,
            lastTransferDate: new Date().toISOString().split('T')[0]
          };
        }
        return item;
      }));

      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: 'BUYER',
        action: 'REC_PURCHASED',
        recId: rec.id,
        ipAddress: '192.168.1.1',
        result: 'SUCCESS',
        details: `Corporate Buyer ${currentUser.organization} successfully acquired ${rec.energyQuantityMWh} MWh certificate (${rec.id}) from ${rec.currentOwnerName}.`
      });

      addToast({
        type: 'success',
        title: 'Certificate Acquired!',
        message: `Successfully transferred ownership of ${rec.id} (${rec.energyQuantityMWh} MWh) to ${currentUser.organization}.`
      });

      setPurchasingRecId(null);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Buyer Workspace Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5" />
                Corporate Sustainability & Procurement Workspace
              </span>
              <span className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono rounded-full">
                Scope 2 Net-Zero 2026
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Renewable Energy Procurement & Offset Portfolio
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Welcome back, <span className="text-slate-200 font-medium">{currentUser.name}</span> (<span className="text-teal-300 font-medium">{currentUser.organization}</span>). Procure verified renewable energy certificates, retire assets for GHG Protocol compliance, and verify green claims.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setActiveTab('MARKETPLACE')}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-teal-900/30 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Marketplace</span>
            </button>
            <button
              onClick={() => setActiveTab('PORTFOLIO')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4 text-teal-400" />
              <span>My Holdings ({ownedRecs.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Buyer KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Clean Power Procured</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {(totalMWhAcquired / 1000).toFixed(1)}k <span className="text-base font-normal text-slate-400">MWh</span>
          </div>
          <div className="text-xs text-slate-400">
            {progressPercent}% of 2026 Scope 2 Net-Zero Goal
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Scope 2 CO₂e Avoided</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Leaf className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-400 mb-1">
            {(totalCo2OffsetTons / 1000).toFixed(1)}k <span className="text-base font-normal text-slate-400">MT</span>
          </div>
          <div className="text-xs text-slate-400">
            GHG Protocol Corporate Standard compliant
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Active Owned Certificates</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{ownedRecs.length}</div>
          <div className="text-xs text-slate-400">
            Fully settled on immutable ledger
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Clean Capital Invested</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            ${(totalInvestmentUsd / 1000).toFixed(0)}k
          </div>
          <div className="text-xs text-slate-400">
            Average price: $4.85 / verified MWh
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('MARKETPLACE')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'MARKETPLACE'
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Explore REC Marketplace ({availableMarketplaceRecs.length})
        </button>
        <button
          onClick={() => setActiveTab('PORTFOLIO')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'PORTFOLIO'
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          My Purchased Portfolio ({ownedRecs.length})
        </button>
        <button
          onClick={() => setActiveTab('TRANSACTIONS')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'TRANSACTIONS'
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Settlement & Transaction Logs
        </button>
        <button
          onClick={() => setActiveTab('PROOFS')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'PROOFS'
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Environmental Claims & Attestations
        </button>
      </div>

      {/* Tab 1: Marketplace */}
      {activeTab === 'MARKETPLACE' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div>
              <h3 className="font-semibold text-white text-base">Verified REC Clearinghouse</h3>
              <p className="text-xs text-slate-400">All listed assets are verified via smart-meter SCADA feeds with 0 duplicate claims</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filter Source:</span>
              <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {['ALL', 'SOLAR', 'WIND', 'HYDRO'].map(src => (
                  <button
                    key={src}
                    onClick={() => setSourceFilter(src)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      sourceFilter === src ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {src}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMarketplaceRecs.slice(0, 9).map(rec => (
              <div key={rec.id} className="bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 rounded-2xl p-5 space-y-4 transition-all group relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono font-bold text-teal-400">{rec.id}</span>
                    <h4 className="text-sm font-semibold text-white mt-1 group-hover:text-teal-300 transition-colors">
                      {rec.plantName}
                    </h4>
                    <span className="text-xs text-slate-400">{rec.location}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
                    {rec.energySource}
                  </span>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Quantity:</span>
                    <span className="font-semibold text-white font-mono">{rec.energyQuantityMWh.toLocaleString()} MWh</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Accredited Issuer:</span>
                    <span className="text-slate-300">{rec.issuerName}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Unit Price:</span>
                    <span className="text-emerald-400 font-semibold font-mono">$4.85 / MWh</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <RiskBadge band={rec.riskBand} score={rec.riskScore} />
                  <button
                    onClick={() => handlePurchaseRec(rec)}
                    disabled={purchasingRecId === rec.id}
                    className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-medium rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-teal-900/20 cursor-pointer disabled:opacity-50"
                  >
                    {purchasingRecId === rec.id ? (
                      <span>Settling...</span>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Purchase & Transfer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Portfolio */}
      {activeTab === 'PORTFOLIO' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white text-base">Corporate Clean Energy Portfolio</h3>
              <p className="text-xs text-slate-400">Certificates actively registered under {currentUser.organization}</p>
            </div>
            <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs rounded-full font-mono font-semibold">
              {ownedRecs.length} Certificates Settled
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                <tr>
                  <th className="py-3 px-4 font-semibold">Certificate ID</th>
                  <th className="py-3 px-4 font-semibold">Facility Name</th>
                  <th className="py-3 px-4 font-semibold">Source</th>
                  <th className="py-3 px-4 font-semibold">Quantity (MWh)</th>
                  <th className="py-3 px-4 font-semibold">CO₂e Avoided</th>
                  <th className="py-3 px-4 font-semibold">SHA-256 Fingerprint</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {ownedRecs.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-teal-400">{rec.id}</td>
                    <td className="py-3 px-4 font-sans text-slate-200">{rec.plantName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                        {rec.energySource}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-semibold">{rec.energyQuantityMWh.toLocaleString()}</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">{Math.round(rec.energyQuantityMWh * 0.82).toLocaleString()} MT</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] truncate max-w-[140px]" title={rec.fingerprintSha256}>
                      {rec.fingerprintSha256?.substring(0, 16)}...
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => inspectRec(rec.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Inspect Passport
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Transactions */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <h3 className="font-semibold text-white text-base mb-1">Procurement & Settlement History</h3>
          <p className="text-xs text-slate-400 mb-4">Cryptographically sealed transfer events for financial and regulatory reconciliation</p>

          <div className="space-y-3">
            {ownedRecs.slice(0, 5).map((rec, idx) => (
              <div key={rec.id + idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-2">
                      <span>Ownership Transfer · Settlement Cleared</span>
                      <span className="font-mono text-teal-400">[{rec.id}]</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Procured from {rec.issuerName} · {rec.energyQuantityMWh.toLocaleString()} MWh
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-semibold text-emerald-400 font-mono">
                    ${(rec.energyQuantityMWh * 4.85).toLocaleString()} USD
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">Settled on Ledger</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Proofs & Attestations */}
      {activeTab === 'PROOFS' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-white text-base">Environmental Claims & Scope 2 Proofs</h3>
            <p className="text-xs text-slate-400">Cryptographically verifiable certificates for CDP, RE100, and SEC climate disclosures</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-slate-950 to-teal-950/30 border border-teal-500/30 rounded-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono text-teal-400 uppercase tracking-wider font-semibold">Official Green Power Attestation</span>
                <h4 className="text-lg font-bold text-white mt-1">{currentUser.organization}</h4>
                <p className="text-xs text-slate-400">Reporting Year: 2026 Calendar Year</p>
              </div>
              <Award className="w-10 h-10 text-teal-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">Total Certified Generation:</span>
                <span className="text-base font-bold text-white">{totalMWhAcquired.toLocaleString()} MWh</span>
              </div>
              <div>
                <span className="text-slate-500 block">Avoided Greenhouse Gas:</span>
                <span className="text-base font-bold text-emerald-400">{totalCo2OffsetTons.toLocaleString()} MT CO₂e</span>
              </div>
              <div>
                <span className="text-slate-500 block">Registry Consensus Status:</span>
                <span className="text-base font-bold text-teal-400">100% Verified Clean</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => addToast({ type: 'success', title: 'Attestation Exported', message: 'Cryptographic PDF downloaded for ESG reporting desk.' })}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Official Compliance Certificate (PDF/JSON)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
