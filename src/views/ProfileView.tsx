/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { toCanonicalRole } from '../types';
import { Shield, User, Building, Mail, Key, CheckCircle, Clock } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser } = useApp();
  const canonicalRole = toCanonicalRole(currentUser.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            <User className="w-6 h-6 text-emerald-400" />
            Security Profile & Credentials
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Role-Based Access Control identity credentials for the REC-GUARD AI Trust Network.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            RBAC VERIFIED
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-3xl font-bold font-mono shadow-xl shadow-emerald-950/50 mb-4 border border-emerald-400/30">
            {currentUser.name.charAt(0)}
          </div>
          <h2 className="text-lg font-bold text-white">{currentUser.name}</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{currentUser.email}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-emerald-300">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            {canonicalRole}
          </div>
        </div>

        {/* Organization & Permissions Card */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-400" />
            Organizational Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-500 block mb-1">Organization</span>
              <span className="text-white font-semibold text-sm">{currentUser.organization}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-500 block mb-1">User Identifier</span>
              <span className="text-emerald-400 font-semibold text-sm">{currentUser.id}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-500 block mb-1">Assigned Role Band</span>
              <span className="text-white font-semibold text-sm">{currentUser.role}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-500 block mb-1">Account Status</span>
              <span className="text-emerald-400 font-semibold text-sm">ACTIVE (Compliant)</span>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              Cryptographic Registry Verification
            </h4>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400 break-all">
              <span className="text-emerald-400">PUBKEY_SHA256: </span>
              e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
