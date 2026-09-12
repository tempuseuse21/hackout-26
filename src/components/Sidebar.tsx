/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { toCanonicalRole } from '../types';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  ShieldAlert, 
  BadgeCheck, 
  Layers, 
  BarChart3, 
  Sliders, 
  FileText, 
  Users, 
  PlusCircle, 
  Building2, 
  Clock, 
  ShoppingBag, 
  CheckCircle2, 
  DollarSign, 
  Award, 
  UserCheck, 
  History, 
  ShieldCheck,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
  X
} from 'lucide-react';

interface SidebarNavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  isAction?: boolean;
}

export const Sidebar: React.FC = () => {
  const { 
    currentUser, 
    currentPath, 
    navigateToPath, 
    alerts, 
    recs, 
    setIsAddRecOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isSidebarCollapsed,
    toggleSidebarCollapsed
  } = useApp();

  const canonicalRole = toCanonicalRole(currentUser.role);
  const openAlertsCount = alerts.filter(a => a.status === 'OPEN' || a.status === 'UNDER_REVIEW').length;
  const flaggedRecsCount = recs.filter(r => r.status === 'FLAGGED' || r.riskScore >= 50).length;

  // Strict Role-Aware Navigation Mapping (Requirement 11)
  const getNavItems = (): { title: string; subtitle: string; items: SidebarNavItem[] } => {
    switch (canonicalRole) {
      case 'ADMIN':
        return {
          title: 'ADMIN GOVERNANCE',
          subtitle: 'System Administration & RBAC',
          items: [
            { id: 'admin-dash', label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
            { id: 'admin-users', label: 'Users', path: '/admin/users', icon: Users },
            { id: 'admin-recs', label: 'RECs', path: '/admin/recs', icon: FileSpreadsheet },
            { id: 'admin-verify', label: 'Verification', path: '/admin/verification', icon: BadgeCheck },
            { id: 'admin-alerts', label: 'Fraud Alerts', path: '/admin/fraud-alerts', icon: ShieldAlert, badge: openAlertsCount > 0 ? openAlertsCount : undefined },
            { id: 'admin-analytics', label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
            { id: 'admin-audit', label: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
            { id: 'admin-settings', label: 'Settings', path: '/admin/settings', icon: Sliders },
          ]
        };

      case 'ISSUER':
        return {
          title: 'ISSUER WORKSPACE',
          subtitle: 'Clean Energy Asset Management',
          items: [
            { id: 'issuer-dash', label: 'Dashboard', path: '/issuer/dashboard', icon: LayoutDashboard },
            { id: 'issuer-create', label: 'Create REC', path: '/issuer/create-rec', icon: PlusCircle, isAction: true },
            { id: 'issuer-my-recs', label: 'My RECs', path: '/issuer/my-recs', icon: FileSpreadsheet },
            { id: 'issuer-verify-status', label: 'Verification Status', path: '/issuer/verification', icon: BadgeCheck },
            { id: 'issuer-alerts', label: 'Fraud Alerts', path: '/issuer/fraud-alerts', icon: ShieldAlert },
            { id: 'issuer-history', label: 'History', path: '/issuer/history', icon: History },
            { id: 'issuer-profile', label: 'Profile', path: '/issuer/profile', icon: Building2 },
          ]
        };

      case 'BUYER':
        return {
          title: 'BUYER WORKSPACE',
          subtitle: 'Renewable Power Procurement',
          items: [
            { id: 'buyer-dash', label: 'Dashboard', path: '/buyer/dashboard', icon: LayoutDashboard },
            { id: 'buyer-explore', label: 'Explore RECs', path: '/buyer/explore', icon: ShoppingBag },
            { id: 'buyer-purchases', label: 'My Purchases', path: '/buyer/my-purchases', icon: CheckCircle2 },
            { id: 'buyer-portfolio', label: 'Portfolio', path: '/buyer/portfolio', icon: Layers },
            { id: 'buyer-transactions', label: 'Transactions', path: '/buyer/transactions', icon: DollarSign },
            { id: 'buyer-verify', label: 'Verification', path: '/buyer/verification', icon: Award },
            { id: 'buyer-profile', label: 'Profile', path: '/buyer/profile', icon: UserCheck },
          ]
        };

      case 'AUDITOR':
        return {
          title: 'AUDITOR WORKSPACE',
          subtitle: 'Independent Evidence & Verifier',
          items: [
            { id: 'auditor-dash', label: 'Dashboard', path: '/auditor/dashboard', icon: LayoutDashboard },
            { id: 'auditor-queue', label: 'Verification Queue', path: '/auditor/verification-queue', icon: Clock, badge: flaggedRecsCount },
            { id: 'auditor-certs', label: 'Certificates', path: '/auditor/certificates', icon: FileSpreadsheet },
            { id: 'auditor-alerts', label: 'Risk Alerts', path: '/auditor/risk-alerts', icon: ShieldAlert, badge: openAlertsCount },
            { id: 'auditor-history', label: 'Verification History', path: '/auditor/history', icon: History },
            { id: 'auditor-audit-trail', label: 'Audit Trail', path: '/auditor/audit-trail', icon: FileText },
            { id: 'auditor-profile', label: 'Profile', path: '/auditor/profile', icon: ShieldCheck },
          ]
        };
    }
  };

  const navConfig = getNavItems();

  const handleNavClick = (item: SidebarNavItem) => {
    if (item.isAction && item.id === 'issuer-create') {
      setIsAddRecOpen(true);
      setIsMobileMenuOpen(false);
      return;
    }
    navigateToPath(item.path);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* 1. MOBILE SLIDE-OUT DRAWER OVERLAY & SIDEBAR (< md) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div 
            className="fixed inset-y-0 left-0 w-72 sm:w-80 max-w-[85vw] bg-slate-900 border-r border-slate-800 flex flex-col justify-between shadow-2xl z-50 animate-in slide-in-from-left duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
          >
            <div className="p-4 overflow-y-auto space-y-2 custom-scrollbar">
              {/* Drawer Top Header with Close Button */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold">
                    {navConfig.title}
                  </div>
                  <div className="text-xs text-slate-300 font-medium">
                    {navConfig.subtitle}
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Add REC button for Admin / Issuer */}
              {(canonicalRole === 'ADMIN' || canonicalRole === 'ISSUER') && (
                <div className="mb-3">
                  <button
                    onClick={() => {
                      setIsAddRecOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-900/30 transition-all cursor-pointer min-h-[44px]"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ Mint New REC</span>
                  </button>
                </div>
              )}

              {/* Navigation Items (Mobile with comfortable touch targets >= 44px) */}
              <div className="space-y-1">
                {navConfig.items.map(item => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path || 
                    (item.path.endsWith('/dashboard') && (currentPath === `/${canonicalRole.toLowerCase()}` || currentPath === `/${canonicalRole.toLowerCase()}/`));

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs transition-all cursor-pointer min-h-[44px] ${
                        isActive 
                          ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/70 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-white' : 'text-slate-400'
                        }`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : typeof item.badge === 'number' && item.badge > 0
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                              : 'bg-slate-800 text-slate-400'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Footer RBAC Badge */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
                <Shield className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate">{currentUser.name}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Role: <span className="text-blue-300 font-semibold">{canonicalRole}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. DESKTOP & TABLET PERSISTENT SIDEBAR (>= md) */}
      <aside 
        className={`hidden md:flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0 bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-200 ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="p-3 overflow-y-auto space-y-1 custom-scrollbar">
          {/* Header & Collapse Toggle */}
          <div className="flex items-center justify-between px-2 pt-1 pb-3 mb-2 border-b border-slate-800/80">
            {!isSidebarCollapsed && (
              <div className="min-w-0 pr-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold truncate">
                  {navConfig.title}
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate">
                  {navConfig.subtitle}
                </div>
              </div>
            )}
            <button
              onClick={toggleSidebarCollapsed}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ${
                isSidebarCollapsed ? 'mx-auto' : ''
              }`}
              title={isSidebarCollapsed ? "Expand Sidebar (Ctrl/Cmd+B)" : "Collapse to Icon Mode"}
              aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Quick Add REC button for Admin / Issuer */}
          {(canonicalRole === 'ADMIN' || canonicalRole === 'ISSUER') && (
            <div className="mb-3 px-0.5">
              <button
                onClick={() => setIsAddRecOpen(true)}
                className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-900/30 transition-all cursor-pointer ${
                  isSidebarCollapsed ? 'w-full py-2.5 px-0' : 'w-full py-2 px-3'
                }`}
                title="Create and analyze a new Renewable Energy Certificate"
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>+ Mint New REC</span>}
              </button>
            </div>
          )}

          {/* Role-Specific Navigation Menu */}
          <div className="space-y-1">
            {navConfig.items.map(item => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || 
                (item.path.endsWith('/dashboard') && (currentPath === `/${canonicalRole.toLowerCase()}` || currentPath === `/${canonicalRole.toLowerCase()}/`));

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-xl text-xs transition-all cursor-pointer ${
                    isSidebarCollapsed 
                      ? 'justify-center py-2.5 px-0' 
                      : 'justify-between px-3.5 py-2.5'
                  } ${
                    isActive 
                      ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70 font-medium'
                  }`}
                >
                  <div className={`flex items-center gap-3 min-w-0 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`} />
                    {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {item.badge !== undefined && (
                    isSidebarCollapsed ? (
                      <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900 absolute top-1.5 right-2" />
                    ) : (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : typeof item.badge === 'number' && item.badge > 0
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                            : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.badge}
                      </span>
                    )
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Role Security Stamp */}
        <div className={`p-3 border-t border-slate-800 bg-slate-950/60 text-center ${isSidebarCollapsed ? 'px-1' : 'px-3.5'}`}>
          {isSidebarCollapsed ? (
            <div className="flex justify-center" title={`Role: ${canonicalRole} · User: ${currentUser.id}`}>
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-300 mb-0.5">
                <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">RBAC Active</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono truncate leading-snug">
                {canonicalRole} · {currentUser.id}
              </p>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

