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
  BadgeCheck 
} from 'lucide-react';
import { DEMO_USERS } from '../data/seedData';
import { UserRole } from '../types';

export const UserManagementView: React.FC = () => {
  const { currentUser, switchRole, addToast } = useApp();

  const [usersList, setUsersList] = useState(DEMO_USERS);

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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              ROLE-BASED ACCESS CONTROL (RBAC)
            </span>
            <span className="text-xs text-slate-500 font-medium">• 4 Active Principals</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            User Administration & Security Roles
          </h1>
          <p className="text-xs text-slate-500">
            Enforces segregation of duties between Regulators, Environmental Auditors, Certificate Issuers, and Corporate Buyers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Active Operator:</span>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
            {currentUser.name} ({currentUser.role})
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Registered Identity Profiles
          </h2>
          <span className="text-xs text-slate-500">
            Click "Switch Persona" to immediately assume that identity in live demo mode.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">User ID & Name</th>
                <th className="py-3 px-4">Email / Login</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Demo Username / Role</th>
                <th className="py-3 px-4">Demo Password</th>
                <th className="py-3 px-4 text-right">Quick Switch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {usersList.map((user) => {
                const isCurrent = currentUser.role === user.role;
                let demoUsername = 'admin';
                if (user.role === 'AUDITOR') demoUsername = 'auditor';
                if (user.role === 'CERTIFICATE_ISSUER') demoUsername = 'issuer';
                if (user.role === 'CORPORATE_BUYER') demoUsername = 'buyer';

                return (
                  <tr key={user.id} className={`hover:bg-slate-50 transition-colors ${isCurrent ? 'bg-blue-50/30' : ''}`}>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="font-mono text-[11px] text-slate-400">{user.id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                      {user.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'AUDITOR' ? 'bg-indigo-100 text-indigo-800' :
                        user.role === 'CERTIFICATE_ISSUER' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {user.role}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">{user.badge}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {user.organization}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-bold">
                        {demoUsername}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700 font-bold">
                      password123
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isCurrent ? (
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          Active Now
                        </span>
                      ) : (
                        <button
                          onClick={() => switchRole(user.role)}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-white hover:bg-blue-50 px-3 py-1 rounded-lg border border-slate-300 shadow-2xs transition-all"
                        >
                          Switch Persona
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
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          Statutory Role Authorization Matrix
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {permissionsMatrix.map((matrix) => (
            <div key={matrix.role} className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    matrix.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                    matrix.role === 'AUDITOR' ? 'bg-indigo-100 text-indigo-800' :
                    matrix.role === 'CERTIFICATE_ISSUER' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {matrix.role}
                  </span>
                  <BadgeCheck className="w-4 h-4 text-slate-400" />
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-600 mt-3">
                  {matrix.permissions.map((perm, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 leading-snug">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{perm}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                SEC-RBAC • ACCESS ENFORCED
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
