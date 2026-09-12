/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  Shield, 
  Key, 
  CheckCircle2, 
  XCircle, 
  UserPlus, 
  Building2, 
  Lock, 
  BadgeCheck,
  Edit2,
  Save,
  Check,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { DEMO_USERS } from '../data/seedData';
import { UserRole, UserProfile } from '../types';

export const UserManagementView: React.FC = () => {
  const { currentUser, addToast, addAuditLog } = useApp();

  const [usersList, setUsersList] = useState<UserProfile[]>(DEMO_USERS);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');

  const permissionsMatrix: {
    role: UserRole;
    permissions: string[];
  }[] = [
    {
      role: 'ADMIN',
      permissions: [
        'Full System Overview & Analytics',
        'Manual REC Intake (+ Add New REC)',
        'Bulk CSV Dataset Ingestion',
        'Trigger Algorithmic & AI Analysis',
        'Verify Digital Fingerprints & Ledger',
        'Open, Assign, & Escalate Investigations',
        'Manage System Users & Roles',
        'Export All Governance & Audit Reports'
      ]
    },
    {
      role: 'AUDITOR',
      permissions: [
        'Assigned Case Queue Access',
        'Inspect "Why Flagged" Evidence Dossier',
        'Review AI Outlier Factor Contributions',
        'Add Timestamped Forensic Case Notes',
        'Dismiss Verified False Positives',
        'Verify Cryptographic Ledger Chains',
        'Export Investigation Summary Reports'
      ]
    },
    {
      role: 'CERTIFICATE_ISSUER',
      permissions: [
        'Submit New Generation Batches',
        'View Self-Issued REC Portfolio',
        'Inspect Initial Anomaly Advisory Flags',
        'Verify Own REC Digital Fingerprints',
        'Respond to Active Regulatory Inquiries'
      ]
    },
    {
      role: 'CORPORATE_BUYER',
      permissions: [
        'Public & Market REC Registry Search',
        'Inspect High-Level Trust Score Index',
        'Verify Certificate Retirement Receipts',
        'Check Tamper-Evident Digital Passports'
      ]
    }
  ];

  const handleStartEdit = (user: UserProfile) => {
    setEditingUserId(user.id);
    setSelectedRole(user.role);
  };

  const handleSaveRole = (userId: string) => {
    const targetUser = usersList.find(u => u.id === userId);
    if (!targetUser) return;

    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, role: selectedRole };
      }
      return u;
    }));

    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'ADMIN_USER_ROLE_MODIFIED',
      ipAddress: '127.0.0.1',
      result: 'SUCCESS',
      details: `Administrator ${currentUser.name} modified role for user ${targetUser.name} (${targetUser.id}) to [${selectedRole}].`
    });

    addToast({
      type: 'success',
      title: 'User Role Updated',
      message: `Role for ${targetUser.name} updated to ${selectedRole}. Permissions will take effect immediately.`
    });

    setEditingUserId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              GOVERNANCE & DIRECTORY ACCESS
            </span>
            <span className="text-xs text-slate-400 font-medium">• 4 Active Principals</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            User Administration & RBAC Management
          </h1>
          <p className="text-xs text-slate-400">
            Enforces strict segregation of duties between System Administrators, Environmental Auditors, Certificate Issuers, and Corporate Buyers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Active Admin:</span>
          <span className="text-xs font-bold text-white bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            {currentUser.name} ({currentUser.role})
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Authorized User Accounts & Role Assignments
          </h2>
          <span className="text-xs text-slate-400">
            Admin role modifications take effect permanently in database session.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/40 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">User ID & Name</th>
                <th className="py-3 px-4">Email / Login</th>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Admin Role Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {usersList.map((user) => {
                const isCurrent = currentUser.id === user.id;
                const isEditing = editingUserId === user.id;

                return (
                  <tr key={user.id} className={`hover:bg-slate-800/40 transition-colors ${isCurrent ? 'bg-blue-950/20' : ''}`}>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-400 rounded font-mono">You</span>
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500">{user.id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-300">
                      {user.email}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                      {user.organization}
                    </td>
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                          className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="AUDITOR">AUDITOR</option>
                          <option value="CERTIFICATE_ISSUER">CERTIFICATE_ISSUER</option>
                          <option value="CORPORATE_BUYER">CORPORATE_BUYER</option>
                        </select>
                      ) : (
                        <div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            user.role === 'ADMIN' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                            user.role === 'AUDITOR' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            user.role === 'CERTIFICATE_ISSUER' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          }`}>
                            {user.role}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-0.5">{user.badge}</div>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        ACTIVE
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSaveRole(user.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(user)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs border border-slate-700 flex items-center gap-1 ml-auto transition-colors cursor-pointer"
                          title="Modify user RBAC role"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Modify Role</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permission Matrix */}
      <div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          Statutory Role Authorization Matrix
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {permissionsMatrix.map((matrix) => (
            <div key={matrix.role} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    matrix.role === 'ADMIN' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    matrix.role === 'AUDITOR' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    matrix.role === 'CERTIFICATE_ISSUER' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  }`}>
                    {matrix.role}
                  </span>
                  <BadgeCheck className="w-4 h-4 text-slate-500" />
                </div>
                <ul className="space-y-2 text-xs text-slate-400 mt-4">
                  {matrix.permissions.map((perm, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-snug">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{perm}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                SEC-RBAC • ACCESS ENFORCED
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
