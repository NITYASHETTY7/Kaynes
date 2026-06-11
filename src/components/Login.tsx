import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';

function GlassesMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 48" className={className} fill="none">
      <circle cx="30" cy="24" r="18" stroke="currentColor" strokeWidth="3" />
      <circle cx="90" cy="24" r="18" stroke="currentColor" strokeWidth="3" />
      <path d="M48 24h24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M12 16 4 12M108 16l8-4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="30" cy="24" r="6" fill="currentColor" />
      <circle cx="90" cy="24" r="6" fill="currentColor" />
    </svg>
  )
}

function Backdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-argo-cyan/10 blur-3xl" 
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-44 -right-40 h-[36rem] w-[36rem] rounded-full bg-argo-violet/10 blur-3xl" 
      />
      <svg className="absolute inset-0 h-full w-full opacity-[0.5]" preserveAspectRatio="none">
        <defs>
          <pattern id="dots" width="34" height="34" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgb(var(--n-500) / 0.25)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </div>
  )
}

export default function Login() {
  const { login, forgotPassword, resetPassword } = useApp();
  
  // View state: login | forgot | reset
  const [view, setView] = useState<'login' | 'forgot' | 'reset'>('login');
  
  // Forms
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email.trim() || !password.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || 'Authentication failed.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }

    const res = await forgotPassword(email);
    setMessage(res.message);
    if (res.success) {
      // Advance to reset password step for simulator demo
      setTimeout(() => {
        setView('reset');
      }, 2500);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim() || !newPassword.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    const res = await resetPassword(email, newPassword);
    setMessage(res.message);
    if (res.success) {
      setTimeout(() => {
        setView('login');
        setPassword('');
      }, 2000);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-ink-900 p-4 font-sans">
      <Backdrop />

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 grid w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/5 bg-ink-800/60 backdrop-blur-2xl shadow-2xl md:grid-cols-2 shadow-glow-cyan"
      >
        
        {/* Brand Side Hero */}
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-argo-cyan to-argo-violet p-8 text-white md:flex">
          <div className="relative">
            <GlassesMark className="h-12 w-28 text-white" />
            <h1 className="mt-6 text-2xl font-bold leading-tight">
              Argo Glasses
              <br />
              IoT Fleet Console
            </h1>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-white/80">
              Unified telemetry command center for corporate smart glasses fleets. Powered by Kaynes AI.
            </p>
          </div>

          <ul className="relative space-y-3 text-xs text-white/90">
            {[
              ['🛰', 'Centralized plant & asset mapping'],
              ['🧠', 'Optical AI defect analysis playground'],
              ['📊', 'Telemetry reporting & secure access control'],
            ].map(([icon, label]) => (
              <li key={label} className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
                  {icon}
                </span>
                {label}
              </li>
            ))}
          </ul>

          <div className="relative text-[10px] text-white/70">
            Corporate Authorized Personnel Only
          </div>
        </div>

        {/* ── Form Side ──────────────────────────────────── */}
        <div className="p-8 flex flex-col justify-center">
          
          {/* Logo for mobile */}
          <div className="mb-6 flex items-center gap-3 md:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-argo-cyan/15 text-argo-cyan">
              <GlassesMark className="h-5 w-12" />
            </span>
            <div>
              <h1 className="text-sm font-semibold leading-tight text-fg">Argo Glasses</h1>
              <p className="text-[11px] leading-tight text-argo-cyan">IoT Fleet Console</p>
            </div>
          </div>

          {/* VIEW: LOGIN FORM */}
          {view === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-fg font-display tracking-tight">Authorized Sign In</h2>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Enter your Kaynes Technology secure corporate credentials.</p>
              </div>

              {error && <div className="rounded-lg bg-argo-red/10 border border-argo-red/30 p-2.5 text-xs text-argo-red font-semibold">{error}</div>}

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 font-bold">Corporate Email</label>
                <input 
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kaynes.com"
                  className="w-full rounded-xl border border-white/10 bg-ink-900/50 px-4 py-3 text-sm text-fg outline-none transition-all focus:border-argo-cyan focus:bg-ink-900 focus:shadow-glow-cyan font-mono"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Secure Password</label>
                  <button 
                    type="button" 
                    onClick={() => { setView('forgot'); setError(''); setMessage(''); }}
                    className="text-[10px] text-argo-cyan hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input 
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-ink-900/50 px-4 py-3 text-sm text-fg outline-none transition-all focus:border-argo-cyan focus:bg-ink-900 focus:shadow-glow-cyan"
                />
              </div>

              <button 
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-argo-cyan to-[#00c6ff] py-3 text-sm font-bold text-ink-900 transition-all hover:scale-[1.02] hover:shadow-glow-cyan"
              >
                Sign In to Console
              </button>

              {/* Helpful credentials blocks */}
              <div className="rounded-xl bg-ink-900/40 border border-white/5 p-4 space-y-2 text-[10px] text-slate-400">
                <span className="font-semibold text-slate-300 block">Stakeholder Demo Credentials:</span>
                <div className="flex justify-between items-center">
                  <span>Admin: <strong className="text-fg font-mono ml-1">admin@kaynes.com</strong></span>
                  <span className="opacity-70">Pass: <strong className="text-fg font-mono">admin123</strong></span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Inspector: <strong className="text-fg font-mono ml-1">inspector@kaynes.com</strong></span>
                  <span className="opacity-70">Pass: <strong className="text-fg font-mono">inspector123</strong></span>
                </div>
              </div>
            </form>
          )}

          {/* VIEW: FORGOT PASSWORD */}
          {view === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-fg">Account Recovery</h2>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Enter your registered email address to receive an account reset simulation link.</p>
              </div>

              {error && <div className="rounded-lg bg-argo-red/10 p-2.5 text-xs text-argo-red font-semibold">{error}</div>}
              {message && <div className="rounded-lg bg-argo-green/10 border border-argo-green/30 p-2.5 text-xs text-argo-green font-semibold">{message}</div>}

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 font-bold">Email Address</label>
                <input 
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kaynes.com"
                  className="w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm text-fg outline-none focus:border-argo-cyan font-mono"
                />
              </div>

              <div className="flex justify-between gap-3">
                <button 
                  type="button" 
                  onClick={() => { setView('login'); setError(''); setMessage(''); }}
                  className="flex-1 rounded-lg border border-ink-500 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-ink-700"
                >
                  Back to Sign In
                </button>
                <button 
                  type="submit"
                  className="flex-1 rounded-lg bg-argo-cyan py-2 text-xs font-semibold text-ink-900 hover:brightness-110"
                >
                  Simulate Link
                </button>
              </div>
            </form>
          )}

          {/* VIEW: RESET PASSWORD */}
          {view === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-fg">Configure New Password</h2>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Enter your corporate email and specify your updated credentials.</p>
              </div>

              {error && <div className="rounded-lg bg-argo-red/10 p-2.5 text-xs text-argo-red font-semibold">{error}</div>}
              {message && <div className="rounded-lg bg-argo-green/10 border border-argo-green/30 p-2.5 text-xs text-argo-green font-semibold">{message}</div>}

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 font-bold">Confirm Account Email</label>
                <input 
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm text-fg outline-none focus:border-argo-cyan font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 font-bold">Specify New Password</label>
                <input 
                  required
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Secure Pass"
                  className="w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm text-fg outline-none focus:border-argo-cyan"
                />
              </div>

              <div className="flex justify-between gap-3">
                <button 
                  type="button" 
                  onClick={() => { setView('login'); setError(''); setMessage(''); }}
                  className="flex-1 rounded-lg border border-ink-500 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-ink-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 rounded-lg bg-argo-cyan py-2 text-xs font-semibold text-ink-900 hover:brightness-110"
                >
                  Update Credentials
                </button>
              </div>
            </form>
          )}

        </div>

      </motion.div>
    </div>
  );
}
