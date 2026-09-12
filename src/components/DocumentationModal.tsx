import React, { useState } from 'react';
import { X, Database, Terminal, Shield, Cpu, BookOpen, ExternalLink, Copy, Check } from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose }) => {
  const [activeDocTab, setActiveDocTab] = useState<'overview' | 'schema' | 'api' | 'ai-ml' | 'ledger' | 'datasets'>('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-5xl h-[92vh] sm:h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-3 sm:p-4 md:px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span>REC-GUARD AI Architecture</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">Hackathon Dossier</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">Enterprise REC Fraud Detection, AI Pipeline, and Ledger Specifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-nav tabs */}
        <div className="flex items-center gap-1 px-3 sm:px-6 border-b border-slate-200 bg-white overflow-x-auto">
          {[
            { id: 'overview', label: '1. Architecture & Threat Model', icon: Shield },
            { id: 'schema', label: '2. PostgreSQL DDL Schema', icon: Database },
            { id: 'api', label: '3. FastAPI REST Endpoints', icon: Terminal },
            { id: 'ai-ml', label: '4. Isolation Forest & Explainability', icon: Cpu },
            { id: 'ledger', label: '5. DLT & Cryptographic Seals', icon: Shield },
            { id: 'datasets', label: '6. Real-World Datasets (EIA / NREL)', icon: ExternalLink }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveDocTab(t.id as any)}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  activeDocTab === t.id
                    ? 'border-blue-600 text-blue-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-700 text-xs md:text-sm space-y-6 bg-slate-50/50">
          {activeDocTab === 'overview' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-slate-900">End-to-End System Pipeline</h4>
              <div className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs leading-relaxed overflow-x-auto shadow-inner">
                <pre>{`Renewable Energy Plants (Solar / Wind / Hydro / Geothermal)
        ↓
IoT Smart Meter Telemetry (SCADA / Modbus Feeder Data)
        ↓
REC Data Ingestion API (Validation & Schema Sanitization)
        ↓
Deterministic Rule Engine (RULE-001 to RULE-007)
        ↓
AI Anomaly Engine (10-Feature Isolation Forest Outlier Scoring)
        ↓
Explainable Risk Engine (Normalized 0–100 Scoring with Factor Attribution)
        ↓
Cryptographic Fingerprint (SHA-256 Hash of REC Attributes)
        ↓
Permissioned DLT Ledger (Tamper-Evident Hash Chain)
        ↓
REC Digital Passport & Real-Time SOC Investigation Terminal`}</pre>
              </div>

              <h5 className="font-bold text-slate-900 pt-2">Threat Vectors Mitigated:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <div className="font-bold text-rose-700 text-xs">Duplicate Generation Claims</div>
                  <p className="text-xs text-slate-600 mt-1">Cross-registry duplicate generation ID detection preventing the same MWh batch from being issued twice.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <div className="font-bold text-orange-700 text-xs">Generation Output Mismatch</div>
                  <p className="text-xs text-slate-600 mt-1">Comparing claimed volume against verified revenue meter logs via direct inverter integration.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <div className="font-bold text-amber-700 text-xs">Retirement Reuse (Double-Claiming)</div>
                  <p className="text-xs text-slate-600 mt-1">Detecting and invalidating certificates traded or claimed after Scope 2 retirement has occurred.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <div className="font-bold text-blue-700 text-xs">Wash Trading & Circular Transfer</div>
                  <p className="text-xs text-slate-600 mt-1">Graph-based analysis flagging rapid entity turnover before scheduled regulatory filing windows.</p>
                </div>
              </div>
            </div>
          )}

          {activeDocTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-900">PostgreSQL Relational Schema</h4>
                <button
                  onClick={() => copyToClipboard(SQL_SCHEMA, 'sql')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs"
                >
                  {copiedCode === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy SQL</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 font-mono text-[11px] text-slate-200 overflow-x-auto max-h-96 shadow-inner">
                <code>{SQL_SCHEMA}</code>
              </pre>
            </div>
          )}

          {activeDocTab === 'api' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-slate-900">FastAPI RESTful Endpoints Specification</h4>
              <div className="space-y-2 font-mono text-xs">
                {[
                  { method: 'GET', path: '/api/recs', desc: 'List and filter RECs with pagination, risk banding, and owner filtering' },
                  { method: 'GET', path: '/api/recs/{rec_id}', desc: 'Retrieve full REC dossier, score breakdown, and plant meter telemetry' },
                  { method: 'POST', path: '/api/recs', desc: 'Ingest raw REC issuance batch and trigger automated fraud triage' },
                  { method: 'POST', path: '/api/detect/rules', desc: 'Execute 7 deterministic fraud rules against target REC batch' },
                  { method: 'POST', path: '/api/detect/ai', desc: 'Run Isolation Forest multi-feature outlier pipeline' },
                  { method: 'POST', path: '/api/risk-score', desc: 'Calculate normalized 0-100 risk score and generate plain-language explanations' },
                  { method: 'GET', path: '/api/fingerprint/{rec_id}', desc: 'Retrieve and verify SHA-256 cryptographic certificate fingerprint' },
                  { method: 'POST', path: '/api/verify', desc: 'Public verification endpoint for corporate buyers and auditors' },
                  { method: 'GET', path: '/api/lifecycle/{rec_id}', desc: 'Fetch full chronological event ledger for digital passport' },
                  { method: 'GET', path: '/api/network', desc: 'Extract graph entities and edges for wash trading analysis' },
                  { method: 'POST', path: '/api/dataset/generate', desc: 'Produce synthetic dataset for benchmark testing' }
                ].map((ep) => (
                  <div key={`endpoint-${ep.method}-${ep.path}`} className="p-3 rounded-lg bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ep.method === 'GET' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {ep.method}
                      </span>
                      <span className="text-slate-900 font-bold">{ep.path}</span>
                    </div>
                    <span className="text-slate-600 font-sans text-xs">{ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeDocTab === 'ai-ml' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-slate-900">Machine Learning & Explainable AI Philosophy</h4>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="font-bold text-blue-700">Critical Core Principle:</div>
                <p className="text-slate-800 font-medium">
                  "AI does not automatically declare fraud. AI surfaces high-dimensional anomalies for human forensic investigation."
                </p>
                <p className="text-slate-600 text-xs">
                  Isolation Forest functions as an unsupervised outlier detector across 10 distinct features: Plant capacity, historical generation baselines, current claimed output, generation logging cadence, batch volume, issuance frequency, transfer velocity, minimum transfer interval, historical deviation, and claimed vs verified ratios.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <h5 className="font-bold text-slate-900">Scoring Formula & Factor Decomposition:</h5>
                <p className="font-mono text-xs text-blue-800 font-semibold">
                  Final Risk Score = min(100, Σ Rule Contributions + AI Anomaly Score (20) + Historical Deviation (6))
                </p>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                  <li>RULE-001 / RULE-002: Duplicate REC ID or Generation ID (+30 pts)</li>
                  <li>RULE-003: Claimed output exceeds SCADA meter (+15 to +25 pts)</li>
                  <li>RULE-004: Over-issuance exceeds plant physical capacity (+25 pts)</li>
                  <li>RULE-005: Retired certificate traded post-retirement (+35 pts)</li>
                  <li>RULE-006: High-frequency transfer wash-trading velocity (+15 pts)</li>
                  <li>RULE-007: Abnormal generation output vs historic baseline (+15 pts)</li>
                  <li>Isolation Forest Anomaly: +20 points</li>
                </ul>
              </div>
            </div>
          )}

          {activeDocTab === 'ledger' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-slate-900">Permissioned DLT & Cryptographic Architecture</h4>
              <p className="text-slate-600">
                This prototype utilizes a permissioned ledger abstraction designed for direct integration with <strong>Hyperledger Fabric v2.5</strong> or standard verifiable data registries.
              </p>
              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 space-y-2 font-mono text-xs shadow-inner">
                <div className="text-emerald-400 font-bold">SHA-256 Certificate Fingerprint Formula:</div>
                <div>Hash = SHA256(rec_id | plant_id | generation_id | energy_mwh | issuance_date | issuer_id)</div>
                <div className="text-cyan-400 font-bold pt-2">Chained Block Hash:</div>
                <div>Block_N_Hash = SHA256(Block_N-1_Hash | block_number | timestamp | actor | rec_id | event | payload)</div>
              </div>
            </div>
          )}

          {activeDocTab === 'datasets' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-slate-900">Potential Real-World Data Sources</h4>
              <p className="text-slate-600">
                For production deployment, real generation feeds can be mapped from these legitimate public sources:
              </p>
              <div className="space-y-2">
                {[
                  { name: 'U.S. Energy Information Administration (EIA)', desc: 'Hourly electric grid monitor, plant-level solar/wind capacity factor baselines and Form EIA-923/860 data.' },
                  { name: 'NREL (National Renewable Energy Laboratory)', desc: 'National Solar Radiation Database (NSRDB) and Wind Integration National Database (WIND) Toolkit for irradiance ground-truthing.' },
                  { name: 'Open Power System Data (OPSD)', desc: 'Aggregated time-series electricity generation profiles for European power systems.' },
                  { name: 'ENTSO-E Transparency Platform', desc: 'Statutory real-time generation per unit across all European balancing markets.' }
                ].map((s) => (
                  <div key={`datasource-${s.name}`} className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
                    <div className="font-bold text-slate-900 text-xs">{s.name}</div>
                    <div className="text-xs text-slate-600 mt-0.5">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};

const SQL_SCHEMA = `-- ==========================================================
-- REC-GUARD AI: PostgreSQL Production Schema
-- Designed for High-Throughput Energy Certificate Auditability
-- ==========================================================

CREATE TABLE plants (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    capacity_mw NUMERIC(10, 2) NOT NULL,
    energy_source VARCHAR(32) NOT NULL,
    location VARCHAR(255) NOT NULL,
    grid_interconnection_id VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE issuers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    jurisdiction VARCHAR(128) NOT NULL,
    accreditation_number VARCHAR(128) UNIQUE NOT NULL,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE recs (
    id VARCHAR(64) PRIMARY KEY,
    plant_id VARCHAR(64) REFERENCES plants(id),
    issuer_id VARCHAR(64) REFERENCES issuers(id),
    generation_id VARCHAR(128) NOT NULL,
    claimed_generation_mwh NUMERIC(14, 3) NOT NULL,
    verified_generation_mwh NUMERIC(14, 3) NOT NULL,
    energy_quantity_mwh NUMERIC(14, 3) NOT NULL,
    generation_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    issuance_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    risk_score INT CHECK (risk_score BETWEEN 0 AND 100),
    risk_band VARCHAR(16) NOT NULL,
    anomaly_score NUMERIC(5, 4),
    fingerprint_sha256 CHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transfers (
    id VARCHAR(64) PRIMARY KEY,
    rec_id VARCHAR(64) REFERENCES recs(id),
    transfer_from VARCHAR(128) NOT NULL,
    transfer_to VARCHAR(128) NOT NULL,
    contract_reference VARCHAR(128),
    transfer_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fraud_alerts (
    id VARCHAR(64) PRIMARY KEY,
    rec_id VARCHAR(64) REFERENCES recs(id),
    alert_type VARCHAR(64) NOT NULL,
    risk_score INT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    assigned_auditor VARCHAR(128),
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ledger_events (
    block_number BIGSERIAL PRIMARY KEY,
    transaction_id VARCHAR(128) UNIQUE NOT NULL,
    rec_id VARCHAR(64) REFERENCES recs(id),
    actor VARCHAR(128) NOT NULL,
    event_type VARCHAR(32) NOT NULL,
    previous_hash CHAR(64) NOT NULL,
    current_hash CHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recs_gen_id ON recs(generation_id);
CREATE INDEX idx_recs_risk ON recs(risk_score DESC);
CREATE INDEX idx_ledger_rec ON ledger_events(rec_id);`;
