/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { RiskBadge } from '../../components/RiskBadge';
import { 
  Building2, 
  Zap, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  PlusCircle, 
  FileCheck, 
  ShieldCheck, 
  ArrowUpRight, 
  Radio, 
  Sliders, 
  ChevronRight,
  ExternalLink,
  History
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const IssuerDashboardView: React.FC = () => {
  const { 
    recs, 
    currentUser, 
    setIsAddRecOpen, 
    inspectRec, 
    alerts,
    navigateToPath
  } = useApp();

  const [activeTab, setActiveTab] = useState<'MY_RECS' | 'VERIFICATION_TRACKER' | 'ALERTS' | 'FACILITY'>('MY_RECS');

  // Strict Data Isolation: Only RECs issued by this user or organization
  const issuerRecs = useMemo(() => {
    return recs.filter(r => 
      r.issuerId === currentUser.id ||
      r.issuerName.toLowerCase().includes(currentUser.organization.toLowerCase()) ||
      r.issuerName.toLowerCase().includes('westgrid')
    );
  }, [recs, currentUser]);

  const approvedRecs = issuerRecs.filter(r => r.status === 'ACTIVE' && r.riskScore < 50);
  const pendingRecs = issuerRecs.filter(r => r.status === 'FLAGGED' || r.anomalyScore > 0.5);
  const rejectedRecs = issuerRecs.filter(r => r.status === 'SUSPENDED' || r.riskBand === 'CRITICAL');
  const totalGenerationMWh = issuerRecs.reduce((sum, r) => sum + r.claimedGenerationMWh, 0);

  const issuerRecIds = new Set(issuerRecs.map(r => r.id));
  const issuerAlerts = alerts.filter(a => issuerRecIds.has(a.recId));

  const facilityGenerationTrend = [
    { day: 'Mon', solarMWh: 420, geothermalMWh: 210 },
    { day: 'Tue', solarMWh: 460, geothermalMWh: 215 },
    { day: 'Wed', solarMWh: 390, geothermalMWh: 205 },
    { day: 'Thu', solarMWh: 510, geothermalMWh: 218 },
    { day: 'Fri', solarMWh: 485, geothermalMWh: 212 },
    { day: 'Sat', solarMWh: 530, geothermalMWh: 220 },
    { day: 'Sun', solarMWh: 495, geothermalMWh: 214 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Issuer Workspace Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Energy Producer & Issuer Workspace
              </span>
              <span className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono rounded-full">
                Accreditation #REG-2026-CA
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Renewable Generation & Issuance Center
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Welcome back, <span className="text-slate-200 font-medium">{currentUser.name}</span> ({currentUser.organization}). Monitor inverter telemetry, mint verifiable clean certificates, and track independent auditor verifications.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsAddRecOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/30 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register / Mint REC</span>
            </button>
            <button
              onClick={() => setActiveTab('VERIFICATION_TRACKER')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Pending Audits ({pendingRecs.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Issuer KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Registered RECs</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{issuerRecs.length}</div>
          <div className="text-xs text-slate-400">
            Across 2 accredited renewable generating plants
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Approved & Active</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-teal-400 mb-1">{approvedRecs.length}</div>
          <div className="text-xs text-slate-400">
            Fully certified for market trading & transfer
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Pending Verification</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-400 mb-1">{pendingRecs.length}</div>
          <div className="text-xs text-slate-400">
            Awaiting auditor SCADA cross-reconciliation
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Clean Power Generated</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Radio className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {(totalGenerationMWh / 1000).toFixed(1)}k <span className="text-base font-normal text-slate-400">MWh</span>
          </div>
          <div className="text-xs text-slate-400">
            SCADA revenue meter export: 99.4% precision
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('MY_RECS')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'MY_RECS'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          My Registered Certificates ({issuerRecs.length})
        </button>
        <button
          onClick={() => setActiveTab('VERIFICATION_TRACKER')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'VERIFICATION_TRACKER'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Auditor Verification Tracker ({pendingRecs.length})
        </button>
        <button
          onClick={() => setActiveTab('ALERTS')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ALERTS'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Telemetry & Fraud Alerts ({issuerAlerts.length})
        </button>
        <button
          onClick={() => setActiveTab('FACILITY')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'FACILITY'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Facility Specs & Interconnect
        </button>
      </div>

      {/* Tab 1: My Registered Certificates */}
      {activeTab === 'MY_RECS' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-semibold text-white text-base">Issuer Certificate Portfolio</h3>
              <p className="text-xs text-slate-400">Strictly showing certificates originating from your accredited generating assets</p>
            </div>
            <button
              onClick={() => setIsAddRecOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Register Generation Batch</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                <tr>
                  <th className="py-3 px-4 font-semibold">Certificate ID</th>
                  <th className="py-3 px-4 font-semibold">Generating Plant</th>
                  <th className="py-3 px-4 font-semibold">Source</th>
                  <th className="py-3 px-4 font-semibold">Claimed MWh</th>
                  <th className="py-3 px-4 font-semibold">Verified MWh</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Risk Band</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {issuerRecs.slice(0, 15).map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{rec.id}</td>
                    <td className="py-3 px-4 font-sans text-slate-200">{rec.plantName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                        {rec.energySource}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-semibold">{rec.claimedGenerationMWh.toLocaleString()}</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">{rec.verifiedGenerationMWh?.toLocaleString() || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        rec.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        rec.status === 'FLAGGED' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-red-950 text-red-400 border border-red-800'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge band={rec.riskBand} score={rec.riskScore} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => inspectRec(rec.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Verification Status Tracker */}
      {activeTab === 'VERIFICATION_TRACKER' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-white text-base">Independent Auditor Verification Tracker</h3>
            <p className="text-xs text-slate-400">Track stage-by-stage regulatory clearance for pending certificates</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {issuerRecs.slice(0, 4).map(rec => (
              <div key={rec.id} className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-400">{rec.id}</span>
                    <h4 className="text-sm font-semibold text-white mt-0.5">{rec.plantName}</h4>
                    <span className="text-xs text-slate-400">{rec.claimedGenerationMWh.toLocaleString()} MWh claimed</span>
                  </div>
                  <RiskBadge band={rec.riskBand} score={rec.riskScore} />
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>Audit Pipeline Stage</span>
                    <span className="text-emerald-400">{rec.riskScore > 60 ? 'Stage 2/4 (Forensic Review)' : 'Stage 4/4 (Cleared)'}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${rec.riskScore > 60 ? 'bg-amber-500 w-1/2' : 'bg-emerald-500 w-full'}`}
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-400 bg-slate-900/90 p-3 rounded-lg border border-slate-800/80">
                  <div className="font-medium text-slate-300 mb-1">Telemetry Status:</div>
                  {rec.flagReasons?.[0] || 'All smart-meter SCADA feeds successfully verified.'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Alerts */}
      {activeTab === 'ALERTS' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <h3 className="font-semibold text-white text-base mb-1">Facility Telemetry & Discrepancy Alerts</h3>
          <p className="text-xs text-slate-400 mb-4">Real-time alerts triggered by inverter sensors and generation curve deviations</p>

          {issuerAlerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-white">No active critical alerts</div>
              <div className="text-xs">Your generating meters are transmitting within normal operational thresholds.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {issuerAlerts.map(alert => (
                <div key={alert.id} className="p-4 bg-slate-950/80 border border-amber-900/30 rounded-xl flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white flex items-center gap-2">
                        <span>{alert.alertType}</span>
                        <span className="text-xs font-mono text-amber-400 font-normal">[{alert.recId}]</span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1">{alert.description}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-1">Detected at: {alert.detectedAt}</div>
                    </div>
                  </div>
                  <RiskBadge band={alert.riskBand} score={alert.riskScore} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Facility Specs */}
      {activeTab === 'FACILITY' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="font-semibold text-white text-base">Facility Hardware & Grid Interconnection Specs</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-sm">Mojave Helios Array IV</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold">120 MW Solar PV</span>
              </div>
              <div className="text-xs text-slate-400 space-y-1.5 font-mono">
                <div>Interconnection: CAISO North Path 15 (500 kV Substation)</div>
                <div>Telemetry Protocol: Modbus TCP over TLS 1.3 / DNP3</div>
                <div>Revenue Meter ID: MTR-MOJAVE-04 (Class 0.2 Bi-directional)</div>
                <div>Inverter Units: 48x SMA Sunny Central 2500-EV</div>
              </div>
            </div>

            <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-sm">Salton Sea Geothermal Complex</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">60 MW Baseload</span>
              </div>
              <div className="text-xs text-slate-400 space-y-1.5 font-mono">
                <div>Interconnection: IID Imperial Valley 230 kV Gateway</div>
                <div>Telemetry Protocol: IEC 61850 Real-time SCADA feed</div>
                <div>Revenue Meter ID: MTR-SALTON-01 (Continuous Steam Flow)</div>
                <div>Turbine: Fuji Electric Flash Steam Double Extraction</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
