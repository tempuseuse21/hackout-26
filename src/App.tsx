/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GuidedDemoBar } from './components/GuidedDemoBar';
import { ToastContainer } from './components/ToastContainer';
import { DocumentationModal } from './components/DocumentationModal';
import { AddRecModal } from './components/AddRecModal';
import { AccessDeniedView } from './components/AccessDeniedView';

// Dedicated Role Dashboards (Requirement 2 & 6)
import { AdminDashboardView } from './views/dashboards/AdminDashboardView';
import { IssuerDashboardView } from './views/dashboards/IssuerDashboardView';
import { BuyerDashboardView } from './views/dashboards/BuyerDashboardView';
import { AuditorDashboardView } from './views/dashboards/AuditorDashboardView';

// Feature Views
import { RecAnalysisView } from './views/RecAnalysisView';
import { RiskIntelligenceView } from './views/RiskIntelligenceView';
import { DigitalPassportView } from './views/DigitalPassportView';
import { LedgerView } from './views/LedgerView';
import { InvestigationsView } from './views/InvestigationsView';
import { DataImportView } from './views/DataImportView';
import { VerificationView } from './views/VerificationView';
import { FraudNetworkGraphView } from './views/FraudNetworkGraphView';
import { AuditLogsView } from './views/AuditLogsView';
import { UserManagementView } from './views/UserManagementView';
import { ReportsView } from './views/ReportsView';
import { LoginView } from './views/LoginView';
import { toCanonicalRole } from './types';

const MainLayout: React.FC = () => {
  const { 
    guidedDemoActive, 
    isAuthenticated, 
    currentUser, 
    currentPath, 
    navigateToPath,
    activeTab
  } = useApp();

  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const canonicalRole = toCanonicalRole(currentUser?.role || 'REGULATOR');

  // Automatic Role Redirection on root or /dashboard (Requirement 2 & 5)
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
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
        <LoginView />
        <ToastContainer />
      </div>
    );
  }

  // Authoritative Route Guard & View Dispatcher
  const renderActiveView = () => {
    // 1. Explicit Access Denied Screen
    if (currentPath === '/access-denied') {
      return <AccessDeniedView attemptedPath={currentPath} />;
    }

    // 2. ADMIN Protected Routes (/admin/*)
    if (currentPath.startsWith('/admin')) {
      if (canonicalRole !== 'ADMIN') {
        return (
          <AccessDeniedView 
            targetRole="ADMIN" 
            attemptedPath={currentPath} 
          />
        );
      }

      if (currentPath === '/admin/users') return <UserManagementView />;
      if (currentPath === '/admin/recs') return <RecAnalysisView />;
      if (currentPath === '/admin/verification') return <VerificationView />;
      if (currentPath === '/admin/fraud-alerts') return <InvestigationsView />;
      if (currentPath === '/admin/analytics') return <ReportsView />;
      if (currentPath === '/admin/audit-logs') return <AuditLogsView />;
      return <AdminDashboardView />;
    }

    // 3. ISSUER Protected Routes (/issuer/*)
    if (currentPath.startsWith('/issuer')) {
      if (canonicalRole !== 'ISSUER') {
        return (
          <AccessDeniedView 
            targetRole="ISSUER" 
            attemptedPath={currentPath} 
          />
        );
      }
      return <IssuerDashboardView />;
    }

    // 4. BUYER Protected Routes (/buyer/*)
    if (currentPath.startsWith('/buyer')) {
      if (canonicalRole !== 'BUYER') {
        return (
          <AccessDeniedView 
            targetRole="BUYER" 
            attemptedPath={currentPath} 
          />
        );
      }
      return <BuyerDashboardView />;
    }

    // 5. AUDITOR Protected Routes (/auditor/*)
    if (currentPath.startsWith('/auditor')) {
      if (canonicalRole !== 'AUDITOR') {
        return (
          <AccessDeniedView 
            targetRole="AUDITOR" 
            attemptedPath={currentPath} 
          />
        );
      }
      if (currentPath === '/auditor/certificates') return <RecAnalysisView />;
      return <AuditorDashboardView />;
    }

    // 6. Universal Deep-Link Views
    if (currentPath === '/passport' || activeTab === 'passport') {
      return <DigitalPassportView />;
    }
    if (currentPath === '/ledger' || activeTab === 'ledger') {
      if (canonicalRole === 'ADMIN' || canonicalRole === 'AUDITOR') {
        return <LedgerView />;
      }
      return <AccessDeniedView targetRole="ADMIN" attemptedPath={currentPath} />;
    }
    if (currentPath === '/fraud-network' || activeTab === 'fraud-network') {
      if (canonicalRole === 'ADMIN' || canonicalRole === 'AUDITOR') {
        return <FraudNetworkGraphView />;
      }
      return <AccessDeniedView targetRole="ADMIN" attemptedPath={currentPath} />;
    }

    // 7. Default Fallback: Render current user's dedicated role dashboard
    switch (canonicalRole) {
      case 'ADMIN':
        return <AdminDashboardView />;
      case 'ISSUER':
        return <IssuerDashboardView />;
      case 'BUYER':
        return <BuyerDashboardView />;
      case 'AUDITOR':
        return <AuditorDashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Enterprise Navigation Header */}
      <Header onOpenDocs={() => setIsDocsOpen(true)} />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Role-Aware Sidebar */}
        <Sidebar />

        {/* Content View Area */}
        <main className={`flex-1 min-w-0 overflow-y-auto bg-slate-950 ${guidedDemoActive ? 'pb-24 sm:pb-20' : 'pb-10'} p-3 sm:p-6 lg:p-8`}>
          <div className="max-w-7xl mx-auto w-full">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Guided Walkthrough Bar */}
      <GuidedDemoBar />

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
