import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Zap, 
  BrainCircuit, 
  Lock, 
  ArrowRight, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Eye,
  Server,
  Sparkles
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const { setActiveTab, startGuidedDemo, inspectRec } = useApp();

  const lifecycleStages = [
    { title: 'Renewable Generation', desc: 'Solar, Wind & Hydro plant telemetry', icon: '☀️' },
    { title: 'Generation Data', desc: 'Revenue-grade IoT smart meters', icon: '⚡' },
    { title: 'REC Issuance', desc: 'Accredited registry batch claim', icon: '📜' },
    { title: 'AI Verification', desc: '10-feature Isolation Forest scan', icon: '🧠' },
    { title: 'Risk Scoring', desc: '0–100 explainable risk index', icon: '🎯' },
    { title: 'DLT Ledger', desc: 'SHA-256 cryptographically chained', icon: '⛓️' },
    { title: 'Transfer', desc: 'Counterparty wash trade analysis', icon: '🔄' },
    { title: 'Retirement', desc: 'Permanent tamper-evident claim', icon: '🔒' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-16 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-6 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold tracking-wide shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>RENEWABLE ENERGY INTELLIGENCE + CIRCULAR CARBON ECOSYSTEM</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-100 tracking-tight leading-tight">
          Trust Every <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Renewable Energy</span> Certificate.
        </h1>

        <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          AI-powered fraud detection, explainable risk intelligence, and tamper-evident lifecycle tracking for renewable energy certificates.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-emerald-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-all hover:scale-[1.02] active:scale-95"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={startGuidedDemo}
            className="px-6 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-sm flex items-center gap-2 transition-all hover:border-emerald-500/40"
          >
            <span>Watch REC-10231 Demo</span>
            <span className="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded font-mono font-bold">CRITICAL</span>
          </button>
        </div>
      </div>

      {/* Visual Architectural Pipeline Diagram */}
      <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/80 border border-slate-800/80 p-6 md:p-8 shadow-2xl space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h3 className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
            END-TO-END TRUST ARCHITECTURE
          </h3>
          <p className="text-xl font-bold text-slate-100 mt-1">
            The REC-GUARD Continuous Verification Pipeline
          </p>
        </div>

        {/* Lifecycle flow */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
          {lifecycleStages.map((stage, idx) => (
            <div key={idx} className="relative group">
              <div className="h-full p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col items-center text-center space-y-2 group-hover:bg-slate-850">
                <div className="text-2xl">{stage.icon}</div>
                <div className="text-[11px] font-mono text-emerald-400 font-bold">0{idx + 1}</div>
                <div className="font-semibold text-xs text-slate-200 leading-snug">{stage.title}</div>
                <div className="text-[11px] text-slate-400 leading-tight">{stage.desc}</div>
              </div>
              {idx < lifecycleStages.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 text-slate-600 z-10 pointer-events-none">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* From / To Paradigm Shift (Prompt Section 42) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-rose-950/10 border border-rose-500/20 space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm font-mono uppercase">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Legacy REC Markets (The Problem)</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">✕</span>
              <span><strong>Manual Verification:</strong> Fragmented PDF registry sheets verified months after power generation.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">✕</span>
              <span><strong>Duplicate Issuance:</strong> Same generation window claimed simultaneously across multi-state registries.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">✕</span>
              <span><strong>Retirement Reuse:</strong> Retired corporate claims re-sold into secondary trade brokers.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">✕</span>
              <span><strong>Generation Mismatch:</strong> Inaccurate generation affidavits inflated far beyond meter output.</span>
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm font-mono uppercase">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>REC-GUARD AI (The Solution)</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Continuous Telemetry:</strong> Real-time SCADA IoT ingestion linked to revenue metering.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Deterministic Rules + AI:</strong> 5 statutory fraud rules + 10D Isolation Forest outlier detection.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Explainable Risk Scores:</strong> Transparent 0–100 risk scoring with transparent factor decomposition.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Tamper-Evident Passport:</strong> SHA-256 digital certificates linked to permissioned DLT ledger.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Core Technology Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Rule-Based Engine',
            desc: 'Detects duplicate Gen IDs, over-issuance, generation discrepancy %, and post-retirement trades.',
            icon: ShieldCheck,
            color: 'text-emerald-400'
          },
          {
            title: 'Isolation Forest ML',
            desc: 'Unsupervised multidimensional anomaly detection trained on plant capacity and generation envelopes.',
            icon: BrainCircuit,
            color: 'text-cyan-400'
          },
          {
            title: 'SHA-256 Digital Seals',
            desc: 'Tamper-evident fingerprints for every certificate payload preventing undetected modification.',
            icon: Lock,
            color: 'text-amber-400'
          },
          {
            title: 'Network Intelligence',
            desc: 'Graph relationship mapping exposing circular wash trades and high-velocity broker rings.',
            icon: Activity,
            color: 'text-indigo-400'
          }
        ].map((pillar, i) => {
          const Icon = pillar.icon;
          return (
            <div key={i} className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
              <Icon className={`w-6 h-6 ${pillar.color}`} />
              <h4 className="font-bold text-sm text-slate-100">{pillar.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{pillar.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Featured Showcase: REC-10231 Callout Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-[#101726] to-slate-900 border border-rose-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
              FEATURED CASE STUDY
            </span>
            <span className="text-xs text-slate-400 font-mono">REC-10231 • Mojave Helios Array IV</span>
          </div>
          <h3 className="text-xl font-bold text-slate-100">
            Investigate Critical Risk Score 91/100 Anomaly
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            See how REC-GUARD AI caught a 62.4% generation mismatch, a duplicate generation ID across registries, and a suspicious 4-hop wash trading sequence.
          </p>
        </div>
        <button
          onClick={() => inspectRec('REC-10231')}
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/60 flex items-center gap-2 shrink-0 transition-transform active:scale-95"
        >
          <span>Open Full Dossier</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
