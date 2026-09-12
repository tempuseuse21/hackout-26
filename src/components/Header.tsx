/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Zap,
  PlusCircle,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { toCanonicalRole } from '../types';

interface HeaderProps {
  onOpenDocs?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDocs }) => {
  const { 
    currentUser, 
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

  const canonicalRole = toCanonicalRole(currentUser.role);
  const canRegisterRec = canonicalRole === 'ISSUER' || canonicalRole === 'ADMIN';
  const openAlertsCount = alerts.filter(a => a.status === 'OPEN' || a.status === 'UNDER_REVIEW').length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const clean = searchQuery.trim().toUpperCase();
    const found = recs.find(r => 
      r.id.toUpperCase().includes(clean) || 
      r.generationId?.toUpperCase().includes(clean) || 
      r.plantId?.toUpperCase().includes(clean) ||
      r.plantName?.toUpperCase().includes(clean)
    );
    if (found) {
      inspectRec(found.id);
      setSearchQuery('');
      setMobileSearchOpen(false);
    } else {
      inspectRec('REC-10231');
      setSearchQuery('');
      setMobileSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-slate-900 border-b border-slate-800 px-3 sm:px-4 md:px-6 flex items-center justify-between gap-2 sm:gap-4 select-none">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-hidden min-h-[44px] min-w-[44px] flex items-center justify-center relative cursor-pointer"
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
          {openAlertsCount > 0 && !isMobileMenuOpen && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-slate-900" />
          )}
        </button>

        <button 
          onClick={navigateToRoleDashboard}
          className="flex items-center gap-2 sm:gap-2.5 text-left group cursor-pointer"
          title="Return to Role Dashboard"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-950/40 group-hover:from-emerald-500 group-hover:to-teal-400 transition-all shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-bold tracking-tight text-sm sm:text-base text-white font-mono">REC-GUARD</span>
              <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-semibold">AI</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 tracking-wider uppercase font-medium hidden xs:block">
              Trust & Fraud Detection
            </p>
          </div>
        </button>
      </div>

      {/* Center: Global Search (Desktop / Tablet) */}
      <div className="hidden md:flex items-center gap-2 lg:gap-3 flex-1 max-w-md lg:max-w-xl justify-center mx-2">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Search certificate ID, plant, or meter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:bg-slate-950 focus:ring-1 focus:ring-emerald-500 font-mono transition-all"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Mobile Search Overlay Bar */}
      {mobileSearchOpen && (
        <div className="md:hidden absolute inset-x-0 top-0 h-16 bg-slate-900 border-b border-slate-800 px-3 flex items-center gap-2 z-50">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <input
              type="text"
              autoFocus
              placeholder="Search REC ID, Plant, or Token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 font-mono"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          </form>
          <button
            type="button"
            onClick={() => setMobileSearchOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Mobile Search Toggle */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="md:hidden p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
          title="Search RECs"
          aria-label="Search RECs"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick Add REC Button (Only for Issuer and Admin) */}
        {canRegisterRec && (
          <button
            onClick={() => setIsAddRecOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/30 transition-all cursor-pointer min-h-[36px]"
            title="Register & mint a new Renewable Energy Certificate"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Register REC</span>
          </button>
        )}

        {/* Role Identity Badge (Strict RBAC) */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-800/60 border border-slate-800 max-w-[150px] sm:max-w-[220px]">
            <div className="w-7 h-7 rounded-lg bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden lg:block text-left min-w-0">
              <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1.5 truncate">
                <span className="truncate">{currentUser.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono font-bold shrink-0">
                  {canonicalRole}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate font-mono">{currentUser.organization}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-colors cursor-pointer border border-slate-800 hover:border-rose-800/50 min-h-[38px] min-w-[38px]"
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
