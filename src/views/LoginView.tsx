import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Shield, 
  Lock, 
  User, 
  Key, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  Building, 
  UserCheck, 
  HelpCircle, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { UserRole } from '../types';
import { DEMO_CREDENTIALS, DemoRoleKey } from '../services/authService';

export const LoginView: React.FC = () => {
  const { login, loginAsRole } = useApp();

  const [usernameOrRole, setUsernameOrRole] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showHints, setShowHints] = useState(true);

  const demoAccounts: {
    key: DemoRoleKey;
    role: UserRole;
    label: string;
    username: string;
    pass: string;
    org: string;
    badge: string;
    color: string;
  }[] = [
    {
      key: 'admin',
      role: 'ADMIN',
      label: 'Admin (Regulator)',
      username: DEMO_CREDENTIALS.admin.username,
      pass: DEMO_CREDENTIALS.admin.password,
      org: DEMO_CREDENTIALS.admin.organization,
      badge: DEMO_CREDENTIALS.admin.badge,
      color: 'border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-900'
    },
    {
      key: 'auditor',
      role: 'AUDITOR',
      label: 'Auditor (Forensics)',
      username: DEMO_CREDENTIALS.auditor.username,
      pass: DEMO_CREDENTIALS.auditor.password,
      org: DEMO_CREDENTIALS.auditor.organization,
      badge: DEMO_CREDENTIALS.auditor.badge,
      color: 'border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-900'
    },
    {
      key: 'issuer',
      role: 'CERTIFICATE_ISSUER',
      label: 'Issuer (Registry Admin)',
      username: DEMO_CREDENTIALS.issuer.username,
      pass: DEMO_CREDENTIALS.issuer.password,
      org: DEMO_CREDENTIALS.issuer.organization,
      badge: DEMO_CREDENTIALS.issuer.badge,
      color: 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-900'
    },
    {
      key: 'buyer',
      role: 'CORPORATE_BUYER',
      label: 'Buyer (Corporate Scope 2)',
      username: DEMO_CREDENTIALS.buyer.username,
      pass: DEMO_CREDENTIALS.buyer.password,
      org: DEMO_CREDENTIALS.buyer.organization,
      badge: DEMO_CREDENTIALS.buyer.badge,
      color: 'border-amber-300 bg-amber-50/50 hover:bg-amber-50 text-amber-900'
    }
  ];

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = login(usernameOrRole, password);
    if (!success) {
      setErrorMsg('Invalid credentials. Valid usernames/roles: "admin", "auditor", "issuer", "buyer" with password "password123".');
    }
  };

  const handleQuickLogin = (acc: typeof demoAccounts[0]) => {
    setUsernameOrRole(acc.username);
    setPassword(acc.pass);
    setErrorMsg('');
    login(acc.username, acc.pass);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      {/* Top Regulatory Assurance Bar */}
      <div className="w-full max-w-4xl mb-4 flex items-center justify-between text-xs text-slate-500 px-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-slate-700">Federal Clean Energy Regulatory Commission</span>
          <span className="hidden sm:inline text-slate-400">• Certified Statutory Platform</span>
        </div>
        <div className="font-mono text-[11px] text-slate-500">
          SEC-ISO-27001 • RBAC ENFORCED
        </div>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Left Column: Login Form */}
        <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  REC-GUARD <span className="text-blue-600">AI</span>
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Renewable Energy Certificate Fraud Detection & Trust Platform
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">Sign in to your account</h2>
              <p className="text-xs text-slate-600 mt-1">
                Select your assigned role or enter your credentials below.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleManualLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username or Role Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={usernameOrRole}
                    onChange={(e) => setUsernameOrRole(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                    placeholder="admin, auditor, issuer, or buyer"
                  />
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span>Allowed roles:</span>
                  <button type="button" onClick={() => { setUsernameOrRole('admin'); setPassword('password123'); }} className="text-blue-600 hover:underline font-mono font-semibold">admin</button>,
                  <button type="button" onClick={() => { setUsernameOrRole('auditor'); setPassword('password123'); }} className="text-blue-600 hover:underline font-mono font-semibold">auditor</button>,
                  <button type="button" onClick={() => { setUsernameOrRole('issuer'); setPassword('password123'); }} className="text-blue-600 hover:underline font-mono font-semibold">issuer</button>,
                  <button type="button" onClick={() => { setUsernameOrRole('buyer'); setPassword('password123'); }} className="text-blue-600 hover:underline font-mono font-semibold">buyer</button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHints(!showHints)}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <HelpCircle className="w-3 h-3" />
                    {showHints ? 'Hide Hints' : 'View Password Hints'}
                  </button>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>Authorize & Enter Platform</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-200 text-center">
            <p className="text-[11px] text-slate-500">
              "From Generation to Retirement, Every REC Has a Risk Story."
            </p>
          </div>
        </div>

        {/* Right Column: Demo Accounts & Hint Matrix */}
        <div className="lg:col-span-6 bg-slate-50 p-6 sm:p-10 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Demo Roles & Credential Hints
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                1-CLICK QUICK ACCESS
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              For testing and demonstration, click any role card below to instantly populate credentials and enter that role's workspace:
            </p>

            <div className="space-y-3">
              {demoAccounts.map((acc) => (
                <div
                  key={acc.role}
                  onClick={() => handleQuickLogin(acc)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-sm ${acc.color}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{acc.label}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/80 border border-slate-300 text-slate-700 font-semibold">
                          {acc.badge}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                        {acc.org}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-[11px] font-bold text-blue-600 hover:bg-blue-600 hover:text-white transition-all shrink-0 shadow-2xs"
                    >
                      Login as {acc.role.split('_')[0]}
                    </button>
                  </div>

                  {showHints && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-400 block text-[10px]">USERNAME / ROLE:</span>
                        <strong className="text-blue-700 truncate block font-bold">'{acc.username}'</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">PASSWORD:</span>
                        <span className="text-slate-800 font-bold block">'{acc.pass}'</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-snug">
              <strong>Role-Based Route Protection Active:</strong> Different roles access tailored dashboards (e.g. Auditors review investigations, Issuers submit generation data, Buyers verify retirements).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
