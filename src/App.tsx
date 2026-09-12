/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';
import { DocumentationModal } from './components/DocumentationModal';
import { AddRecModal } from './components/AddRecModal';
import { AccessDeniedView } from './components/AccessDeniedView';

// Dedicated Role Dashboards
import { AdminDashboardView } from './views/dashboards/AdminDashboardView';
import { IssuerDashboardView } from './views/dashboards/IssuerDashboardView';
import { BuyerDashboardView } from './views/dashboards/BuyerDashboardView';
import { AuditorDashboardView } from './views/dashboards/AuditorDashboardView';

// Core Application Feature Views
import { RecAnalysisView } from './views/RecAnalysisView';
import { LedgerView } from './views/LedgerView';
import { InvestigationsView } from './views/InvestigationsView';
import { VerificationView } from './views/VerificationView';
import { AuditLogsView } from './views/AuditLogsView';
import { UserManagementView } from './views/UserManagementView';
import { ReportsView } from './views/ReportsView';
import { ProfileView } from './views/ProfileView';
import { LoginView } from './views/LoginView';
import { toCanonicalRole } from './types';

const MainLayout: React.FC = () => {
  const { 
    isAuthenticated, 
    currentUser, 
    currentPath, 
    navigateToPath,
    activeTab
  } = useApp();

  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const canonicalRole = toCanonicalRole(currentUser?.role || 'BUYER');

  // Automatic Role Redirection on root or /dashboard
  useEffect(() => {
    if (isAuthenticated) {
      if (currentPath === '/' || currentPath === '/dashboard' || currentPath === '/login') {
        const target = `/${canonicalRole.toLowerCase()}/dashboard`;
        navigateToPath(target);
      }
    }
  }, [isAuthenticated, currentPath, canonicalRole, navigateToPath]);

  // If user is not authenticated or explicitly viewing login, render LoginView
  if (!isAuthenticated || currentPath === '/login' || activeTab === 'login') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-600 selection:text-white">
        <LoginView />
        <ToastContainer />
      </div>
    );
  }

  // Authoritative Route Guard & View Dispatcher
  const renderActiveView = () => {
    // Explicit Access Denied Screen
    if (currentPath === '/access-denied') {
      return <AccessDeniedView attemptedPath={currentPath} />;
    }

    // ADMIN Protected Routes (/admin/*)
    if (currentPath.startsWith('/admin')) {
      if (canonicalRole !== 'ADMIN') {
        return <AccessDeniedView targetRole="ADMIN" attemptedPath={currentPath} />;
      }
      if (currentPath === '/admin/users') return <UserManagementView />;
      if (currentPath === '/admin/recs') return <RecAnalysisView />;
      if (currentPath === '/admin/verification') return <VerificationView />;
      if (currentPath === '/admin/fraud-alerts') return <InvestigationsView />;
      if (currentPath === '/admin/analytics') return <ReportsView />;
      if (currentPath === '/admin/audit-logs') return <AuditLogsView />;
      return <AdminDashboardView />;
    }

    // ISSUER Protected Routes (/issuer/*)
    if (currentPath.startsWith('/issuer')) {
      if (canonicalRole !== 'ISSUER') {
        return <AccessDeniedView targetRole="ISSUER" attemptedPath={currentPath} />;
      }
      if (currentPath === '/issuer/my-recs') return <RecAnalysisView />;
      if (currentPath === '/issuer/verification') return <VerificationView />;
      if (currentPath === '/issuer/risk-alerts') return <InvestigationsView />;
      if (currentPath === '/issuer/history') return <AuditLogsView />;
      if (currentPath === '/issuer/profile') return <ProfileView />;
      return <IssuerDashboardView />;
    }

    // BUYER Protected Routes (/buyer/*)
    if (currentPath.startsWith('/buyer')) {
      if (canonicalRole !== 'BUYER') {
        return <AccessDeniedView targetRole="BUYER" attemptedPath={currentPath} />;
      }
      if (currentPath === '/buyer/explore') return <RecAnalysisView />;
      if (currentPath === '/buyer/my-recs') return <RecAnalysisView />;
      if (currentPath === '/buyer/transactions') return <LedgerView />;
      if (currentPath === '/buyer/verification') return <VerificationView />;
      if (currentPath === '/buyer/profile') return <ProfileView />;
      return <BuyerDashboardView />;
    }

    // AUDITOR Protected Routes (/auditor/*)
    if (currentPath.startsWith('/auditor')) {
      if (canonicalRole !== 'AUDITOR') {
        return <AccessDeniedView targetRole="AUDITOR" attemptedPath={currentPath} />;
      }
      if (currentPath === '/auditor/verification-queue') return <VerificationView />;
      if (currentPath === '/auditor/recs') return <RecAnalysisView />;
      if (currentPath === '/auditor/risk-alerts') return <InvestigationsView />;
      if (currentPath === '/auditor/history') return <AuditLogsView />;
      if (currentPath === '/auditor/audit-trail') return <LedgerView />;
      if (currentPath === '/auditor/profile') return <ProfileView />;
      return <AuditorDashboardView />;
    }

    // ActiveTab fallbacks
    if (activeTab === 'verification') return <VerificationView />;
    if (activeTab === 'investigations' || activeTab === 'alerts') return <InvestigationsView />;
    if (activeTab === 'ledger') return <LedgerView />;
    if (activeTab === 'audit-logs') return <AuditLogsView />;
    if (activeTab === 'registry' || activeTab === 'rec-analysis' || activeTab === 'details') return <RecAnalysisView />;

    // Default Fallback: Render current user's dedicated role dashboard
    switch (canonicalRole) {
      case 'ADMIN':
        return <AdminDashboardView />;
      case 'ISSUER':
        return <IssuerDashboardView />;
      case 'BUYER':
        return <BuyerDashboardView />;
      case 'AUDITOR':
        return <AuditorDashboardView />;
      default:
        return <BuyerDashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Top Enterprise Navigation Header */}
      <Header onOpenDocs={() => setIsDocsOpen(true)} />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Role-Aware Sidebar */}
        <Sidebar />

        {/* Content View Area */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-slate-950 pb-10 p-3 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global Toast Notification System */}
      <ToastContainer />

      {/* Interactive System Documentation Modal */}
      <DocumentationModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />

      {/* Manual REC Intake Modal (+ Mint New REC) */}
      <AddRecModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
