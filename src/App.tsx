/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GuidedDemoBar } from './components/GuidedDemoBar';
import { ToastContainer } from './components/ToastContainer';
import { DocumentationModal } from './components/DocumentationModal';
import { AddRecModal } from './components/AddRecModal';

// Views
import { DashboardView } from './views/DashboardView';
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

const MainLayout: React.FC = () => {
  const { activeTab, guidedDemoActive, isAuthenticated } = useApp();
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // If user is not authenticated or explicitly viewing login, render LoginView
  if (!isAuthenticated || activeTab === 'login') {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
        <LoginView />
        <ToastContainer />
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'rec-analysis':
      case 'registry':
      case 'rec-details':
        return <RecAnalysisView />;
      case 'risk-intelligence':
      case 'details':
      case 'fraud-rules':
      case 'fraud-center':
      case 'ai-intelligence':
        return <RiskIntelligenceView />;
      case 'passport':
        return <DigitalPassportView />;
      case 'ledger':
        return <LedgerView />;
      case 'investigations':
      case 'alerts':
      case 'auditor-workspace':
        return <InvestigationsView />;
      case 'fraud-network':
      case 'network':
        return <FraudNetworkGraphView />;
      case 'reports':
      case 'analytics':
        return <ReportsView />;
      case 'audit-logs':
        return <AuditLogsView />;
      case 'users':
        return <UserManagementView />;
      case 'data-import':
        return <DataImportView />;
      case 'verification':
        return <VerificationView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Enterprise Navigation Header */}
      <Header onOpenDocs={() => setIsDocsOpen(true)} />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Sidebar Navigation */}
        <Sidebar />

        {/* Content View Area */}
        <main className={`flex-1 overflow-y-auto bg-slate-50 ${guidedDemoActive ? 'pb-20' : 'pb-10'}`}>
          {renderActiveView()}
        </main>
      </div>

      {/* Guided Walkthrough Bar */}
      <GuidedDemoBar />

      {/* Global Toast Notification System */}
      <ToastContainer />

      {/* Interactive System Documentation Modal */}
      <DocumentationModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />

      {/* Manual REC Intake Modal (+ Add New REC) */}
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
