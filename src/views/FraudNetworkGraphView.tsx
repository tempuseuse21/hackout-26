import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Share2, 
  AlertTriangle, 
  ShieldCheck, 
  RotateCcw, 
  Building2, 
  Factory, 
  Layers, 
  Info,
  ArrowRight,
  ShieldAlert,
  ArrowUpRight,
  Zap,
  Activity
} from 'lucide-react';

interface NetworkNode {
  id: string;
  label: string;
  type: 'PLANT' | 'REGISTRY' | 'BROKER' | 'BUYER' | 'DUPLICATE_REC';
  x: number;
  y: number;
  risk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  details: string;
  volumeMWh?: number;
  recId?: string;
}

interface NetworkLink {
  source: string;
  target: string;
  label: string;
  isWashTrade?: boolean;
  isDuplicate?: boolean;
}

export const FraudNetworkGraphView: React.FC = () => {
  const { inspectRec, setActiveTab } = useApp();
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [filterMode, setFilterMode] = useState<'ALL' | 'WASH_TRADE' | 'DUPLICATE' | 'HIGH_RISK'>('ALL');

  // Network topology focusing on the REC-10231 syndication and wash trade ring
  const nodes: NetworkNode[] = [
    {
      id: 'PLANT-01',
      label: 'Mojave Helios Array IV',
      type: 'PLANT',
      x: 110,
      y: 220,
      risk: 'CRITICAL',
      details: 'Solar facility (120 MW). Claimed 18,500 MWh vs 11,390 MWh SCADA revenue meter verification.',
      volumeMWh: 18500,
      recId: 'REC-10231'
    },
    {
      id: 'REG-WREGIS',
      label: 'WREGIS Western Registry',
      type: 'REGISTRY',
      x: 310,
      y: 120,
      risk: 'HIGH',
      details: 'Primary issuing registry. Minted REC-10231 under generation run GEN-88421.',
      recId: 'REC-10231'
    },
    {
      id: 'REG-PJM',
      label: 'PJM-GATS Cross-Registry',
      type: 'REGISTRY',
      x: 310,
      y: 320,
      risk: 'CRITICAL',
      details: 'Conflicting registry. Issued duplicate certificate REC-10452 under identical GEN-88421.',
      recId: 'REC-10452'
    },
    {
      id: 'BROKER-CLEANVOLT',
      label: 'CleanVolt Energy Trading',
      type: 'BROKER',
      x: 520,
      y: 120,
      risk: 'CRITICAL',
      details: 'Intermediary broker. Transferred REC-10231 in high-velocity wash trading loop.',
      volumeMWh: 18500,
      recId: 'REC-10231'
    },
    {
      id: 'BROKER-VERDE',
      label: 'Verde Capital Markets',
      type: 'BROKER',
      x: 730,
      y: 120,
      risk: 'CRITICAL',
      details: 'Involved in circular wash trade loop back to TerraWatt Commodities within 48 hours.',
      volumeMWh: 18500,
      recId: 'REC-10231'
    },
    {
      id: 'BROKER-TERRAWATT',
      label: 'TerraWatt Commodities',
      type: 'BROKER',
      x: 620,
      y: 260,
      risk: 'HIGH',
      details: 'Wash trade loop endpoint before rapid final transfer to corporate off-taker.',
      volumeMWh: 18500,
      recId: 'REC-10231'
    },
    {
      id: 'BUYER-APEX',
      label: 'Apex Data Systems Inc.',
      type: 'BUYER',
      x: 880,
      y: 260,
      risk: 'LOW',
      details: 'Corporate off-taker retiring REC-10231 for corporate Scope 2 ESG decarbonization claim.',
      volumeMWh: 18500,
      recId: 'REC-10231'
    },
    {
      id: 'REC-10452-TWIN',
      label: 'Twin Conflict: REC-10452',
      type: 'DUPLICATE_REC',
      x: 520,
      y: 360,
      risk: 'CRITICAL',
      details: 'Duplicate claim sold to Nordic Wind Capital using the exact same generation meter run.',
      recId: 'REC-10452',
      volumeMWh: 18500
    }
  ];

  const links: NetworkLink[] = [
    { source: 'PLANT-01', target: 'REG-WREGIS', label: 'Claim 18,500 MWh' },
    { source: 'PLANT-01', target: 'REG-PJM', label: 'Duplicate Claim GEN-88421', isDuplicate: true },
    { source: 'REG-WREGIS', target: 'BROKER-CLEANVOLT', label: 'Initial Mint Transfer' },
    { source: 'REG-PJM', target: 'REC-10452-TWIN', label: 'Parallel Duplicate Issuance', isDuplicate: true },
    { source: 'BROKER-CLEANVOLT', target: 'BROKER-VERDE', label: 'Wash Step 1 (<24h)', isWashTrade: true },
    { source: 'BROKER-VERDE', target: 'BROKER-TERRAWATT', label: 'Wash Step 2 (<12h)', isWashTrade: true },
    { source: 'BROKER-TERRAWATT', target: 'BROKER-CLEANVOLT', label: 'Circular Loop Return', isWashTrade: true },
    { source: 'BROKER-TERRAWATT', target: 'BUYER-APEX', label: 'Final Transfer & Retire' }
  ];

  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // Default select the first broker if none selected
  const activeNode = selectedNode || nodes[3];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Share2 className="w-6 h-6 text-blue-600" />
            <span>Fraud Syndicate & Wash Trade Network</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Topological mapping of cross-registry double claims, broker syndication, and high-frequency circular wash-trading loops.
          </p>
        </div>

        {/* Filter modes */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterMode === 'ALL' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Entities
          </button>
          <button
            onClick={() => setFilterMode('WASH_TRADE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterMode === 'WASH_TRADE' ? 'bg-rose-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Circular Wash Loop
          </button>
          <button
            onClick={() => setFilterMode('DUPLICATE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterMode === 'DUPLICATE' ? 'bg-orange-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Duplicate Claim Twin
          </button>
        </div>
      </div>

      {/* Main Canvas & Detail Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Network Visualizer */}
        <div className="lg:col-span-8 p-6 rounded-xl bg-white border border-slate-200 overflow-hidden relative shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" /> Generator
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-teal-600" /> Registry
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-600" /> Broker Ring
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600" /> Corporate Buyer
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">Click node to inspect dossier</span>
          </div>

          <div className="w-full h-[450px] pt-4">
            <svg viewBox="0 0 980 440" className="w-full h-full select-none">
              <defs>
                <marker
                  id="arrow-standard"
                  viewBox="0 0 10 10"
                  refX="22"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                </marker>
                <marker
                  id="arrow-wash"
                  viewBox="0 0 10 10"
                  refX="24"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#e11d48" />
                </marker>
                <marker
                  id="arrow-dup"
                  viewBox="0 0 10 10"
                  refX="24"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#ea580c" />
                </marker>
              </defs>

              {/* Network Links */}
              {links.map((link, idx) => {
                const s = nodeMap.get(link.source);
                const t = nodeMap.get(link.target);
                if (!s || !t) return null;

                const isDimmed =
                  (filterMode === 'WASH_TRADE' && !link.isWashTrade) ||
                  (filterMode === 'DUPLICATE' && !link.isDuplicate);

                const strokeColor = link.isWashTrade ? '#e11d48' :
                                    link.isDuplicate ? '#ea580c' : '#94a3b8';

                const markerEnd = link.isWashTrade ? 'url(#arrow-wash)' :
                                  link.isDuplicate ? 'url(#arrow-dup)' : 'url(#arrow-standard)';

                const midX = (s.x + t.x) / 2;
                const midY = (s.y + t.y) / 2 - (link.isWashTrade ? 12 : 0);

                return (
                  <g key={`link-${link.source}-${link.target}-${idx}`} opacity={isDimmed ? 0.12 : 1} className="transition-opacity duration-300">
                    <line
                      x1={s.x}
                      y1={s.y}
                      x2={t.x}
                      y2={t.y}
                      stroke={strokeColor}
                      strokeWidth={link.isWashTrade || link.isDuplicate ? 2.5 : 1.5}
                      strokeDasharray={link.isWashTrade ? '5 3' : undefined}
                      markerEnd={markerEnd}
                    />
                    <text
                      x={midX}
                      y={midY}
                      fill={strokeColor}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="select-none"
                    >
                      {link.label}
                    </text>
                  </g>
                );
              })}

              {/* Network Nodes */}
              {nodes.map(node => {
                const isDimmed =
                  (filterMode === 'WASH_TRADE' && node.type !== 'BROKER' && node.id !== 'BUYER-APEX') ||
                  (filterMode === 'DUPLICATE' && node.type !== 'PLANT' && node.type !== 'REGISTRY' && node.type !== 'DUPLICATE_REC');

                const isSelected = activeNode.id === node.id;

                const fillColor = node.type === 'PLANT' ? '#10b981' :
                                  node.type === 'REGISTRY' ? '#0d9488' :
                                  node.type === 'BROKER' ? '#e11d48' :
                                  node.type === 'DUPLICATE_REC' ? '#ea580c' : '#2563eb';

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    opacity={isDimmed ? 0.15 : 1}
                    className="cursor-pointer group transition-all"
                  >
                    {/* Pulsing ring if selected or wash trade */}
                    {isSelected && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="22"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2"
                        className="animate-pulse"
                      />
                    )}

                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="16"
                      fill="#ffffff"
                      stroke={fillColor}
                      strokeWidth={isSelected ? 3 : 2}
                      className="group-hover:r-[18px] transition-all shadow-xs"
                    />

                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="6"
                      fill={fillColor}
                    />

                    {/* Node Text Label */}
                    <text
                      x={node.x}
                      y={node.y + 26}
                      fill="#0f172a"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="sans-serif"
                    >
                      {node.label}
                    </text>
                    <text
                      x={node.x}
                      y={node.y + 38}
                      fill="#64748b"
                      fontSize="8"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {node.type}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center justify-between mt-2">
            <span>Detected 1 Circular Wash Trading Loop • 1 Duplicate Claim Ring</span>
            <span className="font-mono text-rose-600 font-bold">SYNDICATE RISK: CRITICAL (98/100)</span>
          </div>
        </div>

        {/* Right: Selected Node Forensic Dossier */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-mono font-bold text-slate-500">ENTITY DOSSIER</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeNode.risk === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                activeNode.risk === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                'bg-emerald-100 text-emerald-800'
              }`}>
                {activeNode.risk} RISK
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{activeNode.label}</h3>
              <div className="text-xs font-mono text-blue-600 font-semibold mt-0.5">{activeNode.id}</div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Entity Archetype:</span>
                <span className="font-semibold text-slate-800">{activeNode.type}</span>
              </div>
              {activeNode.volumeMWh && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Trading Volume:</span>
                  <span className="font-mono font-bold text-slate-900">{activeNode.volumeMWh.toLocaleString()} MWh</span>
                </div>
              )}
              {activeNode.recId && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Associated Certificate:</span>
                  <span className="font-mono font-bold text-blue-700">{activeNode.recId}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700">Forensic Syndicate Analysis:</span>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                {activeNode.details}
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100">
            {activeNode.recId && (
              <button
                onClick={() => {
                  inspectRec(activeNode.recId!);
                  setActiveTab('risk-intelligence');
                }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Inspect Certificate {activeNode.recId}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setActiveTab('investigations')}
              className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Open Syndicate Investigation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
