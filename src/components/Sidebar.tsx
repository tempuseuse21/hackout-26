import React from 'react';
import { useApp, AppTab } from '../context/AppContext';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  ShieldAlert, 
  BadgeCheck, 
  Layers, 
  FolderSearch, 
  Share2, 
  BarChart3, 
  Sliders,
  Lock,
  Shield,
  FileText,
  Users,
  PlusCircle
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, alerts, selectedRecId, setIsAddRecOpen, currentUser } = useApp();

  const openAlerts = alerts.filter(a => a.status === 'OPEN' || a.status === 'UNDER_REVIEW').length;

  const navItems: {
    id: AppTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'rec-analysis', label: 'REC Registry & Intake', icon: FileSpreadsheet },
    { id: 'risk-intelligence', label: 'Risk Intelligence', icon: ShieldAlert, badge: selectedRecId },
    { id: 'passport', label: 'Digital Passport', icon: BadgeCheck },
    { id: 'ledger', label: 'Audit Ledger', icon: Layers },
    { id: 'investigations', label: 'Investigations', icon: FolderSearch, badge: openAlerts > 0 ? openAlerts : undefined },
    { id: 'fraud-network', label: 'Fraud Network Graph', icon: Share2 },
    { id: 'reports', label: 'Audit & Reports', icon: BarChart3 },
    { id: 'audit-logs', label: 'Governance Logs', icon: FileText },
    { id: 'users', label: 'Users & RBAC', icon: Users },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0">
      <div className="p-3 overflow-y-auto space-y-1 custom-scrollbar">
        {/* Quick Add REC Action */}
        <div className="mb-2">
          <button
            onClick={() => setIsAddRecOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add New REC</span>
          </button>
        </div>

        <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
          CORE PLATFORM NAVIGATION
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || 
            (item.id === 'rec-analysis' && activeTab === 'registry') ||
            (item.id === 'risk-intelligence' && (activeTab === 'details' || activeTab === 'rec-details' || activeTab === 'fraud-rules' || activeTab === 'ai-intelligence')) ||
            (item.id === 'investigations' && (activeTab === 'alerts' || activeTab === 'auditor-workspace')) ||
            (item.id === 'fraud-network' && activeTab === 'network') ||
            (item.id === 'reports' && activeTab === 'analytics');

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs transition-all ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-600 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-slate-400'
                }`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                  isActive 
                    ? 'bg-blue-100 text-blue-800' 
                    : typeof item.badge === 'number' 
                      ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                      : 'bg-slate-100 text-slate-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Assurance Banner */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50 text-center">
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-700 mb-1">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          <span>Statutory REC Verification</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">
          7-Rule Engine & Isolation Forest Anomaly Scoring
        </p>
      </div>
    </aside>
  );
};
