import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FEATURE_NAMES, FEATURE_LABELS } from '../services/aiAnomalyEngine';
import { 
  BrainCircuit, 
  Cpu, 
  Play, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Activity, 
  FileCheck, 
  Info,
  Layers,
  Sparkles
} from 'lucide-react';

export const AiIntelligenceView: React.FC = () => {
  const { modelMetrics, runAiDetection, isAiTraining, recs, inspectRec } = useApp();
  const [contamination, setContamination] = useState<number>(0.08);

  const highAnomalyRecs = recs
    .filter(r => r.isAnomaly || r.anomalyScore > 0.6)
    .sort((a, b) => b.anomalyScore - a.anomalyScore)
    .slice(0, 5);

  const avgRisk = Math.round(recs.reduce((acc, r) => acc + r.riskScore, 0) / recs.length);
  const criticalCount = recs.filter(r => r.riskBand === 'CRITICAL').length;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-emerald-400" />
            <span>AI Risk Intelligence & Isolation Forest Pipeline</span>
          </h1>
          <p className="text-xs text-slate-400">
            Unsupervised multidimensional anomaly detection across generation physics, telemetry cadence, and transfer dynamics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => runAiDetection(contamination)}
            disabled={isAiTraining}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              isAiTraining
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-emerald-950 shadow-lg shadow-emerald-950/50 active:scale-95'
            }`}
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isAiTraining ? 'animate-spin' : ''}`} />
            <span>{isAiTraining ? 'Running Pipeline...' : 'Run AI Detection'}</span>
          </button>
        </div>
      </div>

      {/* Critical Principle Warning Banner (Prompt Section 41) */}
      <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-start gap-3 text-xs text-blue-200">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold font-mono tracking-wide uppercase">
            REGULATORY AI COMPLIANCE PRINCIPLE:
          </span>
          <p className="text-slate-300 leading-relaxed font-sans">
            "AI does not automatically declare fraud. AI surfaces statistical and physical anomalies for human forensic investigation. Every flagged certificate must be audited by an accredited environmental auditor before legal sanction or revocation."
          </p>
        </div>
      </div>

      {/* Model KPI Strip (Prompt Section 14 & 32) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Algorithm', value: 'Isolation Forest', sub: 'Ensemble iTrees', color: 'text-slate-100' },
          { label: 'Records Analyzed', value: modelMetrics.trainingRecords.toLocaleString(), sub: 'Active Dataset', color: 'text-emerald-400' },
          { label: 'Anomalies Detected', value: modelMetrics.anomaliesDetected.toString(), sub: 'Outlier Subset', color: 'text-rose-400' },
          { label: 'Average Risk Score', value: `${avgRisk}/100`, sub: 'Registry Baseline', color: 'text-amber-400' },
          { label: 'Critical Records', value: criticalCount.toString(), sub: 'Score > 80', color: 'text-rose-400' },
          { label: 'Execution Latency', value: `${modelMetrics.processingTimeMs} ms`, sub: modelMetrics.lastRunTimestamp, color: 'text-cyan-400' },
        ].map((kpi, i) => (
          <div key={i} className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">{kpi.label}</div>
            <div className={`text-base md:text-lg font-bold font-mono ${kpi.color}`}>{kpi.value}</div>
            <div className="text-[10px] text-slate-400 font-mono truncate">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Grid: Features & Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Columns: 10-Dimensional Feature Space Display */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>10-Feature Vector Tensor Architecture</span>
              </h3>
              <p className="text-xs text-slate-400">Features extracted from smart meters, plant specs, and ledger timestamps.</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              10 DIMENSIONS
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {FEATURE_NAMES.map((fName, idx) => {
              const weights = [0.14, 0.12, 0.15, 0.08, 0.16, 0.07, 0.11, 0.09, 0.13, 0.18];
              const weight = weights[idx] || 0.10;
              return (
                <div key={fName} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-emerald-400 font-bold text-[10px] w-5">F0{idx + 1}</span>
                    <span className="text-slate-300 font-sans truncate">{FEATURE_LABELS[fName]}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden hidden sm:block">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${weight * 100 * 4}%` }} />
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{(weight * 100).toFixed(0)}% wt</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contamination Slider */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">MODEL CONTAMINATION RATE (v):</span>
              <span className="text-emerald-400 font-bold">{(contamination * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.18"
              step="0.01"
              value={contamination}
              onChange={(e) => setContamination(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Conservative (2%)</span>
              <span>Default (8%)</span>
              <span>Aggressive (18%)</span>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Benchmark Performance & Top AI Outliers */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Synthetic Benchmark Metrics Card (Prompt Section 49) */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Synthetic Benchmark Performance</span>
              </h3>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                BENCHMARK ONLY
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">PRECISION</div>
                <div className="text-lg font-black text-emerald-400 mt-0.5">{modelMetrics.precision}%</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">RECALL</div>
                <div className="text-lg font-black text-teal-400 mt-0.5">{modelMetrics.recall}%</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">F1 SCORE</div>
                <div className="text-lg font-black text-cyan-400 mt-0.5">{modelMetrics.f1Score}%</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">ACCURACY</div>
                <div className="text-lg font-black text-slate-200 mt-0.5">{modelMetrics.accuracy}%</div>
              </div>
            </div>

            {/* Confusion Matrix */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                CONFUSION MATRIX (SYNTHETIC EVALUATION SET):
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                <div className="p-2 rounded bg-slate-900 border border-emerald-500/30">
                  <div className="text-emerald-400 font-bold">TP: 72</div>
                  <div className="text-[9px] text-slate-500">True Anomaly</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="text-rose-400 font-bold">FP: 4</div>
                  <div className="text-[9px] text-slate-500">False Positive</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="text-rose-400 font-bold">FN: 6</div>
                  <div className="text-[9px] text-slate-500">Missed Anomaly</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-emerald-500/30">
                  <div className="text-emerald-400 font-bold">TN: 918</div>
                  <div className="text-[9px] text-slate-500">True Normal</div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 italic">
              *Evaluated against synthetic ground truth generation spikes and duplicate injection. Not a claim of real-world legal guilt.
            </p>
          </div>

          {/* Top AI Outliers Detected */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between">
              <span>Top High-Dimensional Outliers</span>
              <span className="text-xs text-slate-400 font-mono">Anomaly Score</span>
            </h3>

            <div className="space-y-2 font-mono text-xs">
              {highAnomalyRecs.map(rec => (
                <div
                  key={rec.id}
                  onClick={() => inspectRec(rec.id)}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="font-bold text-slate-200 flex items-center gap-1.5">
                      <span>{rec.id}</span>
                      {rec.id === 'REC-10231' && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold">TOP</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-sans">{rec.plantName}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-rose-400">{(rec.anomalyScore * 100).toFixed(1)}%</span>
                    <div className="text-[10px] text-slate-500">Risk: {rec.riskScore}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
