import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  Radio, 
  Search, 
  Play, 
  FileText, 
  Bell, 
  Activity, 
  Zap,
  CheckCircle2,
  PlusCircle,
  LogOut,
  Shield,
  Menu,
  X
} from 'lucide-react';

interface HeaderProps {
  onOpenDocs: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDocs }) => {
  const { 
    currentUser, 
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
    logout,
    navigateToRoleDashboard,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useApp();

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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
      setMobileSearchOpen(false);
    } else {
      // Default to 10231 if not found
      inspectRec('REC-10231');
      setSearchQuery('');
      setMobileSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200 px-3 sm:px-4 md:px-6 flex items-center justify-between gap-2 sm:gap-4 select-none">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile Hamburger Drawer Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[44px] flex items-center justify-center relative"
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5" />}
          {openAlertsCount > 0 && !isMobileMenuOpen && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-white" />
          )}
        </button>

        <button 
          onClick={navigateToRoleDashboard}
          className="flex items-center gap-2 sm:gap-2.5 text-left group cursor-pointer"
          title="Return to Role Dashboard"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:bg-blue-700 transition-colors shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-extrabold tracking-tight text-sm sm:text-base text-slate-900 font-mono">REC-GUARD</span>
              <span className="text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-semibold">AI</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-500 tracking-wider uppercase font-medium hidden xs:block">Fraud Detection</p>
          </div>
        </button>

        {/* Live Simulation Indicator Button */}
        <button
          onClick={() => setLiveMonitoring(!liveMonitoring)}
          className={`hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
            liveMonitoring 
              ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-xs' 
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Toggle real-time streaming telemetry and fraud detection simulation"
        >
          <span className={`w-2 h-2 rounded-full ${liveMonitoring ? 'bg-rose-600 animate-ping' : 'bg-slate-400'}`} />
          <Radio className="w-3.5 h-3.5" />
          <span className="font-mono">{liveMonitoring ? 'LIVE STREAMING' : 'Live Stream: Idle'}</span>
        </button>
      </div>

      {/* Center: Global Search (Desktop / Tablet) */}
      <div className="hidden md:flex items-center gap-2 lg:gap-3 flex-1 max-w-md lg:max-w-xl justify-center mx-2">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search REC-10231, GEN ID, Plant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 font-mono transition-all"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </form>

        {/* Guided Demo Button for Judges */}
        <button
          onClick={startGuidedDemo}
          className="flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold shadow-xs transition-all shrink-0 cursor-pointer"
          title="Start Interactive Fraud Investigation Walkthrough"
        >
          <Play className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
          <span className="whitespace-nowrap">Demo</span>
          <span className="hidden xl:inline text-[10px] bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-mono font-bold">REC-10231</span>
        </button>
      </div>

      {/* Mobile Search Overlay Bar */}
      {mobileSearchOpen && (
        <div className="md:hidden absolute inset-x-0 top-0 h-16 bg-white border-b border-slate-200 px-3 flex items-center gap-2 z-50 animate-in fade-in slide-in-from-top-2">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <input
              type="text"
              autoFocus
              placeholder="Search REC ID, Plant, or Token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:bg-white font-mono"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
          </form>
          <button
            type="button"
            onClick={() => setMobileSearchOpen(false)}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Mobile Search Button Toggle */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="md:hidden p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          title="Search RECs"
          aria-label="Search RECs"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Guided Demo Button for Mobile */}
        <button
          onClick={startGuidedDemo}
          className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold shadow-xs transition-all min-h-[38px]"
          title="Start Interactive Fraud Investigation Walkthrough"
        >
          <Play className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
          <span className="hidden xs:inline">Demo</span>
        </button>

        {/* Quick Add REC Button */}
        <button
          onClick={() => setIsAddRecOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer min-h-[36px]"
          title="Create and analyze a new Renewable Energy Certificate"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">+ Add REC</span>
        </button>

        {/* Architecture / Docs button */}
        <button
          onClick={onOpenDocs}
          className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
          title="Architecture, APIs & Model Specs"
          aria-label="View system documentation"
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* Alerts Bell */}
        <button
          onClick={() => setActiveTab('investigations')}
          className="relative p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
          title="Fraud Investigation Alerts"
          aria-label="View fraud alerts"
        >
          <Bell className="w-4 h-4" />
          {openAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
              {openAlertsCount}
            </span>
          )}
        </button>

        {/* Role Identity Display (Strict RBAC) */}
        <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-200">
          <div className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 max-w-[130px] sm:max-w-[200px]">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-600 flex items-center justify-center text-[11px] sm:text-xs font-bold text-white shadow-xs shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden lg:block text-left min-w-0">
              <div className="text-xs font-semibold text-slate-900 leading-tight flex items-center gap-1 truncate">
                <span className="truncate">{currentUser.name}</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-blue-100 text-blue-800 font-mono font-bold shrink-0">
                  [{currentUser.role.replace('_', ' ')}]
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate font-mono">{currentUser.organization}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200 min-h-[38px] min-w-[38px]"
            title="Sign out of your session"
            aria-label="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

