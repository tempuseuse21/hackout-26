import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEMO_USERS } from '../data/seedData';
import { UserRole } from '../types';
import { 
  ShieldAlert, 
  Radio, 
  Search, 
  Play, 
  FileText, 
  Bell, 
  UserCheck, 
  ChevronDown, 
  Activity, 
  Zap,
  CheckCircle2,
  PlusCircle,
  LogOut,
  Users
} from 'lucide-react';

interface HeaderProps {
  onOpenDocs: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDocs }) => {
  const { 
    currentUser, 
    switchRole, 
    liveMonitoring, 
    setLiveMonitoring, 
    startGuidedDemo, 
    searchQuery, 
    setSearchQuery, 
    inspectRec, 
    recs,
    alerts,
    setActiveTab,
    setIsAddRecOpen,
    logout
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const openAlertsCount = alerts.filter(a => a.status === 'OPEN' || a.status === 'UNDER_REVIEW').length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const clean = searchQuery.trim().toUpperCase();
    const found = recs.find(r => 
      r.id.toUpperCase().includes(clean) || 
      r.generationId.toUpperCase().includes(clean) || 
      r.plantId.toUpperCase().includes(clean)
    );
    if (found) {
      inspectRec(found.id);
      setSearchQuery('');
      setSearchOpen(false);
    } else {
      // Default to 10231 if not found
      inspectRec('REC-10231');
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition-colors">
            <Zap className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-base text-slate-900 font-mono">REC-GUARD</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-semibold">AI</span>
            </div>
            <p className="text-[10px] text-slate-500 tracking-wider uppercase font-medium">Fraud Detection & Trust</p>
          </div>
        </button>

        {/* Live Simulation Indicator Button */}
        <button
          onClick={() => setLiveMonitoring(!liveMonitoring)}
          className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
            liveMonitoring 
              ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm' 
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Toggle real-time streaming telemetry and fraud detection simulation"
        >
          <span className={`w-2 h-2 rounded-full ${liveMonitoring ? 'bg-rose-600 animate-ping' : 'bg-slate-400'}`} />
          <Radio className="w-3.5 h-3.5" />
          <span className="font-mono">{liveMonitoring ? 'LIVE STREAMING' : 'Live Stream: Idle'}</span>
        </button>
      </div>

      {/* Center: Global Search & Demo Walkthrough */}
      <div className="flex items-center gap-3 flex-1 max-w-xl justify-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs hidden md:block">
          <input
            type="text"
            placeholder="Search REC-10231, GEN ID, Plant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 font-mono"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </form>

        {/* Guided Demo Button for Judges */}
        <button
          onClick={startGuidedDemo}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold shadow-sm transition-all"
          title="Start Interactive Fraud Investigation Walkthrough"
        >
          <Play className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
          <span className="whitespace-nowrap">Demo Scenario</span>
          <span className="hidden lg:inline text-[10px] bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-mono font-bold">REC-10231</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Quick Add REC Button */}
        <button
          onClick={() => setIsAddRecOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
          title="Create and analyze a new Renewable Energy Certificate"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>+ Add REC</span>
        </button>

        {/* Architecture / Docs button */}
        <button
          onClick={onOpenDocs}
          className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
          title="Architecture, APIs & Model Specs"
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* Alerts Bell */}
        <button
          onClick={() => setActiveTab('investigations')}
          className="relative p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
          title="Fraud Investigation Alerts"
        >
          <Bell className="w-4 h-4" />
          {openAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center shadow-sm">
              {openAlertsCount}
            </span>
          )}
        </button>

        {/* Role Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-left transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-900 leading-tight flex items-center gap-1">
                <span>{currentUser.name.split(' ')[0]}</span>
                <span className="text-[10px] text-blue-600 font-mono">[{currentUser.role.slice(0, 3)}]</span>
              </div>
              <p className="text-[10px] text-slate-500 truncate max-w-[110px]">{currentUser.badge}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
          </button>

          {roleMenuOpen && (
            <div 
              className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
              onMouseLeave={() => setRoleMenuOpen(false)}
            >
              <div className="px-2 py-1.5 text-[11px] font-mono text-slate-500 border-b border-slate-100 mb-1">
                SWITCH ACTIVE PERSONA:
              </div>
              {DEMO_USERS.map(u => (
                <button
                  key={u.id}
                  onClick={() => {
                    switchRole(u.role);
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    currentUser.role === u.role ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-900">{u.name}</div>
                    <div className="text-[10px] text-slate-500">{u.role.replace('_', ' ')} • {u.badge}</div>
                  </div>
                  {currentUser.role === u.role && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  )}
                </button>
              ))}

              <div className="mt-1 pt-1 border-t border-slate-100 flex flex-col gap-1">
                <button
                  onClick={() => {
                    setActiveTab('users');
                    setRoleMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Manage RBAC Roles</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setRoleMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out / Switch Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
