/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ShieldAlert, ArrowRight, Lock, AlertTriangle, Home } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toCanonicalRole } from '../types';

interface AccessDeniedProps {
  targetRole: string;
  attemptedPath?: string;
  onNavigate?: (path: string) => void;
}

export const AccessDeniedView: React.FC<AccessDeniedProps> = ({ 
  targetRole, 
  attemptedPath,
  onNavigate 
}) => {
  const { currentUser, navigateToRoleDashboard } = useApp();
  const [countdown, setCountdown] = useState(5);
  const userCanonicalRole = toCanonicalRole(currentUser?.role);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigateToRoleDashboard();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigateToRoleDashboard]);

  const handleReturn = () => {
    if (onNavigate) {
      onNavigate(`/${userCanonicalRole.toLowerCase()}/dashboard`);
    } else {
      navigateToRoleDashboard();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6 shadow-inner">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="inline-block px-3 py-1 bg-red-950/60 border border-red-800/60 rounded-full text-xs font-mono font-medium text-red-300 uppercase tracking-wider mb-3">
            HTTP 403 Forbidden · Access Denied
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Unauthorized Security Boundary
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            You do not possess the cryptographic permissions required to view the{' '}
            <span className="font-semibold text-amber-300">{targetRole.toUpperCase()}</span> workspace.
            Role-Based Access Control (RBAC) strictly isolates all administrative, issuer, verifier, and buyer boundaries.
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-6 text-left space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Attempted Resource:</span>
              <span className="text-red-400 font-semibold">{attemptedPath || `/${targetRole.toLowerCase()}/*`}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Authenticated Role:</span>
              <span className="text-emerald-400 font-semibold">{userCanonicalRole}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Security Policy:</span>
              <span className="text-slate-300">Strict Compartmentalization (ISO 14064-3 / RBAC)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleReturn}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Return to {userCanonicalRole} Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Automatically redirecting to your authorized workspace in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  );
};
