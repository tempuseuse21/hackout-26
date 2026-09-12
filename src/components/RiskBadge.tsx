import React from 'react';
import { RiskBand } from '../types';

interface RiskBadgeProps {
  score: number;
  band?: RiskBand;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ 
  score, 
  band, 
  size = 'md',
  showScore = true 
}) => {
  const calculatedBand: RiskBand = band || (
    score > 80 ? 'CRITICAL' :
    score > 60 ? 'HIGH' :
    score > 30 ? 'MEDIUM' : 'LOW'
  );

  const styleMap = {
    LOW: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      dot: 'bg-emerald-400',
      label: 'LOW'
    },
    MEDIUM: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      dot: 'bg-amber-400',
      label: 'MEDIUM'
    },
    HIGH: {
      bg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
      dot: 'bg-orange-400',
      label: 'HIGH'
    },
    CRITICAL: {
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      dot: 'bg-rose-400',
      label: 'CRITICAL'
    }
  };

  const current = styleMap[calculatedBand];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-2.5 py-1 gap-2 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-bold'
  };

  return (
    <span 
      className={`inline-flex items-center rounded-full border whitespace-nowrap tracking-wide uppercase transition-colors ${current.bg} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shadow-sm ${current.dot}`} />
      <span>{current.label}</span>
      {showScore && (
        <span className="opacity-80 font-mono text-[11px] border-l border-current/20 pl-1.5">
          {score}/100
        </span>
      )}
    </span>
  );
};

interface RiskMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ score, size = 'md', showLabel = true }) => {
  const clamped = Math.min(100, Math.max(0, score));

  // Determine color based on semantic rules
  const getColor = (s: number) => {
    if (s > 80) return 'from-rose-500 to-red-600 text-rose-400 border-rose-500/30';
    if (s > 60) return 'from-orange-500 to-amber-600 text-orange-400 border-orange-500/30';
    if (s > 30) return 'from-amber-400 to-yellow-500 text-amber-300 border-amber-500/30';
    return 'from-emerald-400 to-teal-500 text-emerald-400 border-emerald-500/30';
  };

  const getBandText = (s: number) => {
    if (s > 80) return 'CRITICAL ANOMALY';
    if (s > 60) return 'HIGH SUSPICION';
    if (s > 30) return 'ELEVATED RISK';
    return 'CLEAR / VERIFIED';
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
          <span className="text-slate-400 font-medium">Risk Score</span>
          <span className="font-mono font-bold text-slate-100">{clamped} / 100 ({getBandText(clamped)})</span>
        </div>
      )}
      
      {/* Risk bar track */}
      <div className="relative w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
        {/* Background graduation markers */}
        <div className="absolute inset-0 flex justify-between px-1 pointer-events-none opacity-20">
          <div className="w-px h-full bg-slate-600" />
          <div className="w-px h-full bg-slate-600" />
          <div className="w-px h-full bg-slate-600" />
          <div className="w-px h-full bg-slate-600" />
        </div>
        
        <div 
          className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out shadow-sm ${getColor(clamped)}`}
          style={{ width: `${Math.max(4, clamped)}%` }}
        />
      </div>

      <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1 px-0.5">
        <span>0 LOW</span>
        <span>30 MED</span>
        <span>60 HIGH</span>
        <span>80 CRIT</span>
      </div>
    </div>
  );
};
