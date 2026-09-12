import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  BarChart3, 
  Sun, 
  Wind, 
  Droplets, 
  Globe, 
  Zap, 
  Building2, 
  AlertTriangle,
  Layers
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { recs } = useApp();
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  // Source-level stats
  const sourceStats = useMemo(() => {
    const map = new Map<string, { total: number; highRisk: number; totalVolume: number }>();
    ['Solar', 'Wind', 'Hydro'].forEach(s => map.set(s, { total: 0, highRisk: 0, totalVolume: 0 }));

    recs.forEach(r => {
      const s = r.energySource || 'Solar';
      if (!map.has(s)) map.set(s, { total: 0, highRisk: 0, totalVolume: 0 });
      const item = map.get(s)!;
      item.total++;
      item.totalVolume += r.energyQuantityMWh;
      if (r.riskScore > 60) item.highRisk++;
    });

    return Array.from(map.entries()).map(([source, data]) => ({
      source,
      total: data.total,
      highRisk: data.highRisk,
      totalVolume: (data.totalVolume / 1000).toFixed(1),
      riskRate: data.total > 0 ? ((data.highRisk / data.total) * 100).toFixed(1) : '0'
    }));
  }, [recs]);

  // Regional stats
  const regionalStats = useMemo(() => {
    const map = new Map<string, { count: number; highRiskCount: number }>();
    recs.forEach(r => {
      const loc = r.location || 'USA';
      if (!map.has(loc)) map.set(loc, { count: 0, highRiskCount: 0 });
      const item = map.get(loc)!;
      item.count++;
      if (r.riskScore > 60) item.highRiskCount++;
    });

    return Array.from(map.entries())
      .map(([loc, data]) => ({
        location: loc,
        count: data.count,
        riskRate: ((data.highRiskCount / data.count) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [recs]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          <span>Macro Forensic Analytics & Market Exposure</span>
        </h1>
        <p className="text-xs text-slate-400">
          Cross-cutting risk correlations across renewable technologies, regional ISO grids, and generation discrepancies.
        </p>
      </div>

      {/* Grid: Renewable Technologies Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sourceStats.map(item => {
          const Icon = item.source === 'Solar' ? Sun :
                       item.source === 'Wind' ? Wind : Droplets;
          const color = item.source === 'Solar' ? 'text-amber-400' :
                        item.source === 'Wind' ? 'text-cyan-400' : 'text-blue-400';

          return (
            <div key={item.source} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${color}`} />
                  <h3 className="font-bold text-slate-100 text-sm">{item.source} Sector</h3>
                </div>
                <span className="font-mono text-xs text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  {item.riskRate}% High Risk
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-500">TOTAL VOLUME</span>
                  <div className="font-bold text-slate-200 mt-0.5">{item.totalVolume} GWh</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-500">CERTIFICATES</span>
                  <div className="font-bold text-slate-200 mt-0.5">{item.total.toLocaleString()}</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Exposure Proportion:</span>
                  <span>{item.highRisk} flagged</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${item.riskRate}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Analytical Visualizer: Generation Discrepancy Scatter Trend */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Telemetry Generation Divergence (Claimed vs SCADA Meter)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Certificates above the 45° diagonal line indicate generation claims exceeding physical grid export.
            </p>
          </div>
          {hoveredPoint && (
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-emerald-400">
              {hoveredPoint}
            </span>
          )}
        </div>

        {/* SVG Scatter/Divergence Plot */}
        <div className="h-64 w-full pt-2">
          <svg viewBox="0 0 700 240" className="w-full h-full overflow-visible">
            {/* Grid & Axis */}
            <line x1="50" y1="20" x2="680" y2="20" stroke="#1e293b" strokeDasharray="4 4" />
            <line x1="50" y1="80" x2="680" y2="80" stroke="#1e293b" strokeDasharray="4 4" />
            <line x1="50" y1="140" x2="680" y2="140" stroke="#1e293b" strokeDasharray="4 4" />
            <line x1="50" y1="200" x2="680" y2="200" stroke="#334155" />
            <line x1="50" y1="20" x2="50" y2="200" stroke="#334155" />

            {/* Labels */}
            <text x="40" y="24" fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">20k</text>
            <text x="40" y="84" fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">15k</text>
            <text x="40" y="144" fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">10k</text>
            <text x="40" y="204" fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">0</text>

            <text x="365" y="225" fill="#64748b" fontSize="10" textAnchor="middle" fontFamily="monospace">
              SCADA Verified Export (MWh) →
            </text>

            {/* Ideal 1:1 Line */}
            <line x1="50" y1="200" x2="650" y2="20" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
            <text x="655" y="24" fill="#10b981" fontSize="9" fontFamily="monospace">1:1 Ratio</text>

            {/* Plotted points */}
            {recs.slice(0, 40).map((r, i) => {
              const cx = 50 + (r.verifiedGenerationMWh / 22000) * 600;
              const cy = 200 - (r.claimedGenerationMWh / 22000) * 180;
              const isFlagged = r.claimedGenerationMWh > r.verifiedGenerationMWh * 1.15;
              const color = isFlagged ? '#ef4444' : '#10b981';
              const rSize = r.id === 'REC-10231' ? 7 : isFlagged ? 4.5 : 3;

              return (
                <circle
                  key={r.id}
                  cx={cx}
                  cy={cy}
                  r={rSize}
                  fill={color}
                  opacity={isFlagged ? 0.9 : 0.6}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                  className="cursor-pointer hover:r-[8px] transition-all"
                  onMouseEnter={() => setHoveredPoint(`${r.id}: Claimed ${r.claimedGenerationMWh} vs Verified ${r.verifiedGenerationMWh} MWh (${r.plantName})`)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Regional Risk Exposure */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Regional ISO / Grid Interconnection Exposure</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {regionalStats.map(reg => (
            <div key={reg.location} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="font-bold text-slate-200">{reg.location}</div>
              <div className="text-[10px] font-mono text-slate-400">{reg.count} Tracked RECs</div>
              <div className="text-xs font-mono font-bold text-rose-400 mt-1">{reg.riskRate}% High Risk</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
