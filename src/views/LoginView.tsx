import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Shield, 
  Lock, 
  User, 
  Key, 
  ChevronRight, 
  Eye, 
  EyeOff,
  AlertCircle,
  Building2,
  CheckCircle2,
  UserPlus,
  Mail,
  BadgeCheck,
  Zap,
  ShoppingBag,
  FileCheck
} from 'lucide-react';
import { UserRole } from '../types';
import { authService } from '../services/authService';

export const LoginView: React.FC = () => {
  const { login, registerUser } = useApp();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state
  const [usernameOrRole, setUsernameOrRole] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regOrganization, setRegOrganization] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('ISSUER');
  const [regBadge, setRegBadge] = useState('');

  const handleManualLogin = (e: React.FormEvent, customIdentifier?: string) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const targetUser = customIdentifier || usernameOrRole;

    setTimeout(() => {
      const success = login(targetUser, password || 'password123');
      if (!success) {
        setErrorMsg('Account not found. Please click "Create Account" to register.');
        setIsLoading(false);
      }
    }, 300);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    if (!regName.trim() || !regEmail.trim() || !regOrganization.trim()) {
      setErrorMsg('Please fill in Name, Email, and Organization.');
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      const success = registerUser({
        name: regName,
        email: regEmail,
        password: regPassword || 'password123',
        role: regRole,
        organization: regOrganization,
        badge: regBadge || undefined
      });

      if (!success) {
        setErrorMsg('Registration failed. Please verify your details.');
        setIsLoading(false);
      }
    }, 400);
  };

  const fillAdminDemo = () => {
    setUsernameOrRole('admin');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Top Security Banner */}
      <div className="w-full max-w-lg mb-6 flex items-center justify-between text-xs text-slate-400 px-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-300">REC-GUARD AI Registry</span>
        </div>
        <div className="font-mono text-[11px] text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800">
          RBAC ENFORCED
        </div>
      </div>

      {/* Card Container */}
      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-950/50 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              REC-GUARD <span className="text-emerald-400">AI</span>
            </h1>
            <p className="text-xs text-slate-400">
              Renewable Energy Certificate Trust & Fraud Detection Platform
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('LOGIN'); setErrorMsg(''); }}
            className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'LOGIN' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('REGISTER'); setErrorMsg(''); }}
            className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'REGISTER' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-teal-400" />
            <span>Create Account</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 mb-5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {mode === 'LOGIN' ? (
          /* ================= SIGN IN FORM ================= */
          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Username or Registered Email
                </label>
                <button
                  type="button"
                  onClick={fillAdminDemo}
                  className="text-[11px] text-emerald-400 hover:underline font-mono"
                >
                  Quick Fill Admin
                </button>
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={usernameOrRole}
                  onChange={(e) => setUsernameOrRole(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="e.g. admin or your registered email"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Role Sign In Shortcuts */}
            <div className="pt-3 border-t border-slate-800/60">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Or Quick Login As Role:
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleManualLogin(null as any, 'admin')}
                  className="py-1.5 px-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-center font-medium cursor-pointer"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleManualLogin(null as any, 'issuer')}
                  className="py-1.5 px-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-lg text-center font-medium cursor-pointer"
                >
                  Issuer
                </button>
                <button
                  type="button"
                  onClick={() => handleManualLogin(null as any, 'buyer')}
                  className="py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-center font-medium cursor-pointer"
                >
                  Buyer
                </button>
                <button
                  type="button"
                  onClick={() => handleManualLogin(null as any, 'auditor')}
                  className="py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-center font-medium cursor-pointer"
                >
                  Auditor
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* ================= REGISTER FORM WITH ROLE PICKER ================= */
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                  placeholder="e.g. Dr. Jane Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address / Username <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                    placeholder="e.g. jane@cleanenergy.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                    placeholder="Set account password"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Organization / Company <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={regOrganization}
                  onChange={(e) => setRegOrganization(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                  placeholder="e.g. Sierra Renewable Power Ltd."
                />
              </div>
            </div>

            {/* User Type / Role Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                Select Your User Role / Account Type <span className="text-rose-400">*</span>
              </label>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* ISSUER */}
                <div
                  onClick={() => setRegRole('ISSUER')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    regRole === 'ISSUER' || regRole === 'CERTIFICATE_ISSUER'
                      ? 'bg-teal-500/15 border-teal-500 text-teal-300 ring-1 ring-teal-500'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-white mb-0.5">
                    <Zap className="w-4 h-4 text-teal-400" />
                    <span>Certificate Issuer</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Mint & manage renewable generation assets</p>
                </div>

                {/* BUYER */}
                <div
                  onClick={() => setRegRole('BUYER')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    regRole === 'BUYER' || regRole === 'CORPORATE_BUYER'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-white mb-0.5">
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                    <span>Corporate Buyer</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Procure & retire verified REC claims</p>
                </div>

                {/* AUDITOR */}
                <div
                  onClick={() => setRegRole('AUDITOR')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    regRole === 'AUDITOR'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-white mb-0.5">
                    <FileCheck className="w-4 h-4 text-amber-400" />
                    <span>Accredited Auditor</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Inspect forensic evidence & SCADA meters</p>
                </div>

                {/* ADMIN */}
                <div
                  onClick={() => setRegRole('ADMIN')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    regRole === 'ADMIN'
                      ? 'bg-indigo-500/15 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-white mb-0.5">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <span>Regulatory Admin</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Global platform governance & user RBAC</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Title / Designation (Optional)
              </label>
              <div className="relative">
                <BadgeCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={regBadge}
                  onChange={(e) => setRegBadge(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                  placeholder="e.g. Lead Sustainability Officer"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Creating Account...' : 'Register & Enter Workspace'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Support roles: Regulatory Admin, Issuer, Corporate Buyer, Accredited Auditor</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/80 shrink-0" />
            <span>Instant workspace routing with active cryptographic audit logs</span>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400 max-w-sm">
        <p className="font-mono text-[11px]">REC-GUARD AI Registry Platform v2.4</p>
        <p className="text-slate-400 mt-0.5">Secure Renewable Energy Certificate Lifecycle Management</p>
      </div>
    </div>
  );
};

