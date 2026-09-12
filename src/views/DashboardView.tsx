import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { RiskBadge } from '../components/RiskBadge';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  Activity, 
  ArrowUpRight, 
  CheckCircle2, 
  FileSearch, 
  BadgePercent,
  Shield,
  Info,
  Layers
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

export const DashboardView: React.FC = () => {
  const { recs, alerts, inspectRec, setActiveTab, liveMonitoring } = useApp();

  // 1. KPI Calculations
  const activeRecs = recs.filter(r => r.status === 'ACTIVE');
  const totalActiveCount = activeRecs.length;

  const totalVerifiedMWh = recs.reduce((sum, r) => sum + (r.verifiedGenerationMWh || 0), 0);
  const totalClaimedMWh = recs.reduce((sum, r) => sum + (r.claimedGenerationMWh || 0), 0);

  const flaggedAnomaliesCount = recs.filter(r => r.status === 'FLAGGED' || r.isAnomaly || r.riskScore > 60).length;
  const highCriticalRiskCount = recs.filter(r => r.riskBand === 'HIGH' || r.riskBand === 'CRITICAL').length;

  // Platform Trust Score (0-100)
  const platformTrustScore = useMemo(() => {
    const anomalyFraction = flaggedAnomaliesCount / Math.max(1, recs.length);
    const score = Math.max(0, Math.min(100, Math.round((1 - anomalyFraction * 0.7) * 100)));
    return score;
  }, [flaggedAnomaliesCount, recs.length]);

  // 2. Risk Distribution Data
  const riskDistribution = useMemo(() => {
    const low = recs.filter(r => r.riskBand === 'LOW').length;
    const med = recs.filter(r => r.riskBand === 'MEDIUM').length;
    const high = recs.filter(r => r.riskBand === 'HIGH').length;
    const crit = recs.filter(r => r.riskBand === 'CRITICAL').length;
    return [
      { name: 'Low (0–30)', count: low, color: '#16a34a' },
      { name: 'Medium (31–60)', count: med, color: '#d97706' },
      { name: 'High (61–80)', count: high, color: '#ea580c' },
      { name: 'Critical (81–100)', count: crit, color: '#dc2626' },
    ];
  }, [recs]);

  // 3. Risk Trend Chart Data (Recent 6 Months)
  const trendData = [
    { month: 'Oct', verifiedMWh: 18400, flaggedCount: 8, avgRisk: 14 },
    { month: 'Nov', verifiedMWh: 22100, flaggedCount: 12, avgRisk: 16 },
    { month: 'Dec', verifiedMWh: 26500, flaggedCount: 19, avgRisk: 19 },
    { month: 'Jan', verifiedMWh: 31200, flaggedCount: 28, avgRisk: 22 },
    { month: 'Feb', verifiedMWh: 38900, flaggedCount: 41, avgRisk: 26 },
    { month: 'Mar', verifiedMWh: 45200, flaggedCount: flaggedAnomaliesCount, avgRisk: 29 },
  ];

  // 4. Recent REC Activity
  const recentRecs = useMemo(() => {
    return [...recs].slice(0, 7);
  }, [recs]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Platform Title & Regulatory Subtext */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Executive Trust & Integrity Dashboard</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time renewable energy certificate telemetry, statutory rule evaluation, and machine learning anomaly surveillance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('rec-analysis')}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            Browse Registry
          </button>
          <button
            onClick={() => inspectRec('REC-10231')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>Inspect Flagged REC-10231</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live streaming indicator if active */}
      {liveMonitoring && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            <span>Simulated Telemetry Stream Active: Ingesting high-frequency generation meter pulses and continuous anomaly re-scoring.</span>
          </div>
          <span className="font-mono text-[11px] bg-rose-100 px-2 py-0.5 rounded font-semibold text-rose-900">4.5s CYCLE</span>
        </div>
      )}

      {/* Core KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Active RECs */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Active RECs</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
              {totalActiveCount.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Of {recs.length.toLocaleString()} total monitored certificates
            </p>
          </div>
        </div>

        {/* Verified Generation */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Verified Generation</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
              {(totalVerifiedMWh / 1000).toFixed(1)} <span className="text-lg font-medium text-slate-500">GWh</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {((totalVerifiedMWh / Math.max(1, totalClaimedMWh)) * 100).toFixed(1)}% meter confirmation rate
            </p>
          </div>
        </div>

        {/* Flagged Anomalies */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Flagged Anomalies</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-amber-600 font-mono tracking-tight">
              {flaggedAnomaliesCount.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {((flaggedAnomaliesCount / Math.max(1, recs.length)) * 100).toFixed(1)}% anomaly detection rate
            </p>
          </div>
        </div>

        {/* High/Critical Risk */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>High / Critical Risk</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-rose-600 font-mono tracking-tight">
              {highCriticalRiskCount.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Immediate statutory audit hold advised
            </p>
          </div>
        </div>
      </div>

      {/* Platform Trust Score Callout Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base">Platform Trust Score</span>
              <span className="text-xs font-bold text-blue-700 font-mono px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-full">
                {platformTrustScore} / 100
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
              Composite synthetic health index derived from SCADA revenue-meter coherence, cross-registry duplicate absence, hash-chain integrity, and Isolation Forest anomaly baselines.
            </p>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
              <Info className="w-3.5 h-3.5" />
              <span>Prototype internal platform metric only; not an official regulatory score.</span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-48 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-500" 
            style={{ width: `${platformTrustScore}%` }}
          />
        </div>
      </div>

      {/* Charts Grid: Risk Trend & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Risk & Anomaly Trajectory</h2>
              <p className="text-xs text-slate-500">6-month trend of verified generation versus flagged anomalous claims</p>
            </div>
            <span className="text-xs font-medium text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded">
              Monthly Aggregation
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="verifiedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any, name: string) => [
                    name === 'verifiedMWh' ? `${Number(val).toLocaleString()} MWh` : `${val} anomalies`, 
                    name === 'verifiedMWh' ? 'Verified MWh' : 'Flagged Claims'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="verifiedMWh" 
                  stroke="#2563eb" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#verifiedFill)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Risk Distribution</h2>
              <span className="text-xs text-slate-500 font-mono">0–100 Bands</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Certificates categorized by calibrated composite risk tier</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar 
                  dataKey="count" 
                  radius={[4, 4, 0, 0]}
                  shape={(props: any) => {
                    const { x, y, width, height, index } = props;
                    const item = riskDistribution[index];
                    const fill = item ? item.color : '#2563eb';
                    return (
                      <rect 
                        x={x} 
                        y={y} 
                        width={width} 
                        height={height} 
                        fill={fill} 
                        rx={4} 
                        ry={4} 
                      />
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            {riskDistribution.map((item) => (
              <div key={`dist-legend-${item.name}`} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px]">{item.name.split(' ')[0]}</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent REC Activity Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent REC Activity</h2>
            <p className="text-xs text-slate-500">Live transaction ledger feed and incoming registry issuance records</p>
          </div>
          <button
            onClick={() => setActiveTab('rec-analysis')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All {recs.length} Certificates</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">REC ID</th>
                <th className="py-3 px-4">Plant & Location</th>
                <th className="py-3 px-4">Generation Claim</th>
                <th className="py-3 px-4">Current Custody</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentRecs.map((rec, idx) => (
                <tr key={`recent-rec-${rec.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {rec.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-900">{rec.plantName}</div>
                    <div className="text-[11px] text-slate-500">{rec.energySource} • {rec.location}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-semibold text-slate-900">
                      {rec.claimedGenerationMWh.toLocaleString()} MWh
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Verified: {rec.verifiedGenerationMWh.toLocaleString()} MWh
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-900 truncate max-w-[140px]">{rec.currentOwnerName}</div>
                    <div className="text-[11px] text-slate-500">Issuer: {rec.issuerName}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      rec.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      rec.status === 'FLAGGED' ? 'bg-rose-50 text-rose-700 border border-rose-200 font-bold' :
                      rec.status === 'RETIRED' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {rec.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <RiskBadge score={rec.riskScore} band={rec.riskBand} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => inspectRec(rec.id)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-xs transition-colors"
                    >
                      Inspect Risk
                    </button>
                    <button
                      onClick={() => {
                        inspectRec(rec.id);
                        setActiveTab('passport');
                      }}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded text-xs transition-colors"
                    >
                      Passport
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
