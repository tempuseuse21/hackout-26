/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { RiskBadge } from '../../components/RiskBadge';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Users, 
  FileCheck, 
  Activity, 
  ArrowUpRight, 
  ShieldAlert, 
  Server, 
  Layers, 
  FileSpreadsheet,
  CheckCircle2,
  Lock,
  Zap,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const AdminDashboardView: React.FC = () => {
  const { 
    recs, 
    alerts, 
    auditLogs, 
    currentUser, 
    navigateToPath,
    inspectRec
  } = useApp();

  // Platform metrics
  const activeRecs = recs.filter(r => r.status === 'ACTIVE');
  const flaggedRecs = recs.filter(r => r.status === 'FLAGGED' || r.isAnomaly || r.riskScore > 60);
  const pendingVerifications = recs.filter(r => r.status === 'FLAGGED' || r.anomalyScore > 0.5);
  const totalVerifiedMWh = recs.reduce((sum, r) => sum + (r.verifiedGenerationMWh || 0), 0);
  const totalClaimedMWh = recs.reduce((sum, r) => sum + (r.claimedGenerationMWh || 0), 0);

  const platformTrustScore = useMemo(() => {
    const anomalyFraction = flaggedRecs.length / Math.max(1, recs.length);
    return Math.max(0, Math.min(100, Math.round((1 - anomalyFraction * 0.7) * 100)));
  }, [flaggedRecs.length, recs.length]);

  const riskDistribution = useMemo(() => {
    const low = recs.filter(r => r.riskBand === 'LOW').length;
    const med = recs.filter(r => r.riskBand === 'MEDIUM').length;
    const high = recs.filter(r => r.riskBand === 'HIGH').length;
    const crit = recs.filter(r => r.riskBand === 'CRITICAL').length;
    return [
      { name: 'Low (0–30)', count: low, fill: '#10b981' },
      { name: 'Med (31–60)', count: med, fill: '#f59e0b' },
      { name: 'High (61–80)', count: high, fill: '#f97316' },
      { name: 'Crit (81–100)', count: crit, fill: '#ef4444' },
    ];
  }, [recs]);

  const trendData = [
    { month: 'Oct', verified: 18400, anomalies: 8 },
    { month: 'Nov', verified: 22100, anomalies: 12 },
    { month: 'Dec', verified: 26500, anomalies: 19 },
    { month: 'Jan', verified: 31200, anomalies: 28 },
    { month: 'Feb', verified: 38900, anomalies: 41 },
    { month: 'Mar', verified: 45200, anomalies: flaggedRecs.length },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Workspace Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Administrative Command Center
              </span>
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                RBAC Security Enforced
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Global Platform Governance Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Welcome back, <span className="text-slate-200 font-medium">{currentUser.name}</span>. Oversee user roles, global certificate integrity, forensic audit logs, and fraud detection policies.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigateToPath('/admin/users')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/30 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Manage Users & Roles</span>
            </button>
            <button
              onClick={() => navigateToPath('/admin/fraud-alerts')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Fraud Alerts ({alerts.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Registered RECs</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{recs.length}</div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="text-emerald-400 font-semibold">{activeRecs.length} Active</span>
            <span>·</span>
            <span className="text-amber-400 font-semibold">{flaggedRecs.length} Flagged</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Platform Trust Score</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-400 mb-1">{platformTrustScore}%</div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>High integrity consensus across registries</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Pending Verification</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-400 mb-1">{pendingVerifications.length}</div>
          <div className="text-xs text-slate-400">
            Awaiting auditor SCADA meter reconciliation
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Verified Generation</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {(totalVerifiedMWh / 1000).toFixed(1)}k <span className="text-base font-normal text-slate-400">MWh</span>
          </div>
          <div className="text-xs text-slate-400">
            {((totalVerifiedMWh / Math.max(1, totalClaimedMWh)) * 100).toFixed(1)}% telemetry confirmation rate
          </div>
        </div>
      </div>

      {/* Analytics & Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Bar Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-base">Global Risk Band Distribution</h3>
            <span className="text-xs text-slate-500">ISO 14064-3</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} 
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ingestion & Verification Trend */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white text-base">Platform Verification & Anomaly Ingestion</h3>
              <p className="text-xs text-slate-400">Six-month telemetry growth vs automated anomaly flags</p>
            </div>
            <span className="px-2.5 py-1 bg-indigo-950/60 border border-indigo-800 text-indigo-300 text-xs rounded-lg">
              Live AI Pipeline
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="adminVerifiedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="adminAnomalyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} />
                <Area type="monotone" dataKey="verified" stroke="#6366f1" fillOpacity={1} fill="url(#adminVerifiedGrad)" name="Verified MWh" />
                <Area type="monotone" dataKey="anomalies" stroke="#ef4444" fillOpacity={1} fill="url(#adminAnomalyGrad)" name="Anomalies" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Admin Quick Links & Recent System Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admin Navigation Quick-Cards */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-white text-base mb-2">Administrative Management</h3>
          
          <div 
            onClick={() => navigateToPath('/admin/users')}
            className="p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Users & RBAC Roles</div>
                <div className="text-xs text-slate-400">Modify user roles & toggle account status</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </div>

          <div 
            onClick={() => navigateToPath('/admin/recs')}
            className="p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 group-hover:scale-110 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Global REC Registry</div>
                <div className="text-xs text-slate-400">Browse and inspect all registered assets</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
          </div>

          <div 
            onClick={() => navigateToPath('/admin/audit-logs')}
            className="p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Governance Audit Trail</div>
                <div className="text-xs text-slate-400">Inspect cryptographic compliance logs</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
          </div>
        </div>

        {/* Recent Governance & Security Activity */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-base">Recent Platform Security & Regulatory Events</h3>
            <button
              onClick={() => navigateToPath('/admin/audit-logs')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              View Full Logs
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg ${
                    log.result === 'DENIED' || log.result === 'FLAGGED' 
                      ? 'bg-red-500/10 text-red-400' 
                      : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {log.result === 'DENIED' ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate flex items-center gap-2">
                      <span>{log.action}</span>
                      <span className="text-xs font-mono text-slate-400 font-normal">[{log.userRole}]</span>
                    </div>
                    <div className="text-xs text-slate-400 truncate">{log.details || `Action performed by ${log.userName}`}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono text-slate-400">{log.timestamp.split(' ')[1] || log.timestamp}</div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    log.result === 'DENIED' ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-400'
                  }`}>
                    {log.result}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
