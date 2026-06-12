import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Satellite, Brain, Cloud, Lock, AlertTriangle, CheckCircle2, Database, Server, Cpu, Layers, Globe, Network, Radio, Zap } from 'lucide-react';

/* ── AWS-style architecture SVG background nodes ─────────────────────────── */
function ArchBackground() {
  const icons = [
    // Left side (pushed further to the edge and shifted up)
    { Icon: Cloud, cx: '3%', cy: '5%', size: 56, label: 'IoT Core', delay: 0 },
    { Icon: Radio, cx: '2%', cy: '25%', size: 48, label: 'SNS', delay: 1.8 },
    { Icon: Brain, cx: '4%', cy: '50%', size: 52, label: 'SageMaker', delay: 2.2 },
    { Icon: Network, cx: '3%', cy: '75%', size: 64, label: 'VPC', delay: 0.5 },
    // Right side (pushed further to the edge and shifted up)
    { Icon: Database, cx: '94%', cy: '5%', size: 48, label: 'S3', delay: 0.8 },
    { Icon: Globe, cx: '96%', cy: '25%', size: 54, label: 'CloudFront', delay: 2.5 },
    { Icon: Server, cx: '92%', cy: '50%', size: 48, label: 'EC2', delay: 1.5 },
    { Icon: Zap, cx: '95%', cy: '75%', size: 52, label: 'Lambda', delay: 1.2 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      {/* Ambient glows */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(87,126,137,0.08) 0%, transparent 70%)' }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 70%)' }}
      />

      {/* Blueprint grid — theme aware */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgb(var(--s-500) / 0.25)" strokeWidth="0.8"/>
          </pattern>
          <pattern id="grid-lg" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M 200 0 L 0 0 0 200" fill="none" stroke="rgb(var(--s-500) / 0.35)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <rect width="100%" height="100%" fill="url(#grid-lg)" />
      </svg>

      {/* AWS service node constellation */}
      {icons.map((node, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.5, y: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.05, 0.95], y: [-10, 10, -10] }}
          transition={{ duration: 6 + (i % 3), repeat: Infinity, delay: node.delay, ease: 'easeInOut' }}
          className="absolute flex flex-col items-center justify-center"
          style={{ left: node.cx, top: node.cy, transform: 'translate(-50%, -50%)', color: 'rgba(87,126,137,0.3)' }}
        >
          <node.Icon size={node.size} strokeWidth={1.2} />
          <span style={{ fontSize: 9, color: 'rgba(87,126,137,0.4)', marginTop: 6, fontWeight: 600, letterSpacing: '0.05em' }}>
            {node.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Feature list item ───────────────────────────────────────────────────── */
function FeatureItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm shrink-0">
        {icon}
      </span>
      <span className="text-[11px] text-white/80 font-medium leading-snug">{label}</span>
    </li>
  );
}

/* ── Eye icon for password toggle ───────────────────────────────────────── */
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

/* ── Spinner ─────────────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* ── Kaynes logo mark ────────────────────────────────────────────────────── */
function KaynesLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'sm' ? 32 : size === 'lg' ? 52 : 42;
  return (
    <div
      className="flex items-center justify-center rounded-xl font-display font-bold text-white shrink-0"
      style={{
        width: dim,
        height: dim,
        background: 'linear-gradient(135deg, #577E89 0%, #74A1B0 100%)',
        boxShadow: '0 4px 14px rgba(87,126,137,0.35)',
        fontSize: dim * 0.38,
        letterSpacing: '-0.03em',
      }}
    >
      K
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Login() {
  const { login, forgotPassword, resetPassword } = useApp();

  // View state: login | forgot | reset
  const [view, setView] = useState<'login' | 'forgot' | 'reset'>('login');

  // Forms
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError]           = useState('');
  const [message, setMessage]       = useState('');
  const [loading, setLoading]       = useState(false);
  const [showPass, setShowPass]     = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [credOpen, setCredOpen]     = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email.trim() || !password.trim()) { setError('Please fill in both fields.'); return; }
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.success) setError(res.error || 'Authentication failed.');
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email.trim()) { setError('Please enter your email.'); return; }
    setLoading(true);
    const res = await forgotPassword(email);
    setLoading(false);
    setMessage(res.message);
    if (res.success) setTimeout(() => setView('reset'), 2500);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email.trim() || !newPassword.trim()) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    const res = await resetPassword(email, newPassword);
    setLoading(false);
    setMessage(res.message);
    if (res.success) setTimeout(() => { setView('login'); setPassword(''); }, 2000);
  };

  const switchView = (v: typeof view) => {
    setView(v);
    setError('');
    setMessage('');
  };

  /* ── Shared input style — adapts to light/dark via CSS vars ── */
  const inputCls =
    'w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 font-medium k-input';

  return (
    <div
      className="relative flex min-h-screen items-center justify-center p-4 font-sans overflow-hidden"
      style={{ background: 'rgb(var(--s-base))' }}
    >
      <ArchBackground />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl md:grid md:grid-cols-2"
        style={{
          background: 'rgb(var(--s-800))',
          border: '1px solid rgb(var(--s-600))',
          boxShadow: 'var(--shadow-card-hover)',
        }}
      >
        {/* ── Left: Brand Hero Panel ──────────────────────────────────── */}
        <div
          className="relative hidden flex-col justify-between p-10 text-white md:flex overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #0f1f3d 0%, #0a1830 40%, #080f20 100%)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* AWS-style orange vertical accent bar */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
            style={{ background: 'linear-gradient(to bottom, #577E89, #74A1B0, transparent)' }}
          />

          {/* Decorative corner glow */}
          <div
            className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at top right, rgba(87,126,137,0.08) 0%, transparent 60%)' }}
          />

          {/* Brand top */}
          <div className="relative pl-4">
            <div className="flex items-center gap-3 mb-6">
              <KaynesLogo size="md" />
              <div>
                <div className="text-base font-bold font-display tracking-tight leading-tight">
                  Argo Glasses
                </div>
                <div
                  className="text-[10px] font-semibold uppercase tracking-widest mt-0.5"
                  style={{ color: '#577E89' }}
                >
                  IoT Fleet Console
                </div>
              </div>
            </div>

            <div
              className="mb-2 text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: 'rgba(87,126,137,0.7)' }}
            >
              Powered by Kaynes AI
            </div>

            <h1 className="text-2xl font-bold font-display leading-snug text-white mb-3">
              Enterprise Smart<br />
              <span style={{ color: '#577E89' }}>Glasses Command</span><br />
              Platform
            </h1>
            <p className="text-[11px] leading-relaxed text-white/55 max-w-xs">
              Unified telemetry, AI defect analysis and real-time fleet management 
              for industrial smart glasses — on AWS infrastructure.
            </p>
          </div>

          {/* Feature list */}
          <ul className="relative pl-4 space-y-3">
            <FeatureItem icon={<Satellite size={16} />} label="Centralized multi-plant asset & device mapping" />
            <FeatureItem icon={<Brain size={16} />} label="AWS SageMaker optical AI defect analysis" />
            <FeatureItem icon={<Cloud size={16} />} label="AWS IoT Core · S3 · Lambda telemetry bridge" />
            <FeatureItem icon={<Lock size={16} />} label="Role-based access with audit & compliance logs" />
          </ul>

          {/* Footer */}
          <div className="relative pl-4 flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: '#10B981', boxShadow: '0 0 6px #10B981' }}
            />
            <span className="text-[10px] text-white/40 font-medium">
              Corporate Authorized Personnel Only · AP-SOUTH-1
            </span>
          </div>
        </div>

        {/* ── Form Panel ────────────────────────────────────────── */}
        <div className="flex flex-col justify-center px-8 py-10 md:px-10" style={{ background: 'rgb(var(--s-base))' }}>
          {/* Mobile logo */}
          <div className="mb-6 flex items-center gap-3 md:hidden">
            <KaynesLogo size="sm" />
            <div>
              <div className="text-sm font-bold font-display leading-tight" style={{ color: 'rgb(var(--fg))' }}>Argo Glasses</div>
              <div className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: '#577E89' }}>
                IoT Fleet Console
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* ── VIEW: LOGIN ──────────────────────────────────────── */}
            {view === 'login' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22 }}
                onSubmit={handleLoginSubmit}
                className="space-y-5"
              >
                <div>
                  <div
                    className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                    style={{ color: '#577E89' }}
                  >
                    Kaynes Technology
                  </div>
                  <h2 className="text-2xl font-bold font-display tracking-tight" style={{ color: 'rgb(var(--fg))' }}>
                    Welcome back
                  </h2>
                  <p className="text-[12px] mt-1.5 leading-relaxed" style={{ color: 'rgb(var(--n-500))' }}>
                    Sign in with your corporate credentials to access the console.
                  </p>
                </div>

                {/* Error banner */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 rounded-xl p-3 text-xs font-medium"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626' }}
                  >
                    <AlertTriangle className="shrink-0 mt-0.5" size={14} />
                    {error}
                  </motion.div>
                )}

                {/* Email field */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgb(var(--n-500))' }}>
                    Corporate Email
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@kaynes.com"
                    className={inputCls + ' font-mono'}
                    autoComplete="email"
                  />
                </div>

                {/* Password field */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgb(var(--n-500))' }}>
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => switchView('forgot')}
                      className="text-[10px] font-medium transition-colors hover:underline"
                      style={{ color: '#577E89' }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      required
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={inputCls + ' pr-11'}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      tabIndex={-1}
                    >
                      <EyeIcon open={showPass} />
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #577E89 0%, #74A1B0 100%)',
                    color: '#0D0F15',
                    boxShadow: '0 4px 18px rgba(87,126,137,0.35)',
                  }}
                >
                  {loading ? <><Spinner /> Authenticating…</> : 'Sign In to Console'}
                </button>

                {/* Demo credentials (collapsible) */}
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: '1px solid rgb(var(--s-600))', background: 'rgb(var(--s-700))' }}
                >
                  <button
                    type="button"
                    onClick={() => setCredOpen(!credOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 text-[10px] font-semibold uppercase tracking-widest transition-colors"
                    style={{ color: 'rgb(var(--n-500))' }}
                  >
                    <span>Demo Credentials</span>
                    <span className={`transition-transform ${credOpen ? 'rotate-180' : ''}`}>▾</span>
                  </button>
                  {credOpen && (
                    <div className="px-4 pb-4 space-y-2">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                        <span className="font-medium" style={{ color: 'rgb(var(--n-600))' }}>Admin</span>
                        <span className="font-mono" style={{ color: 'rgb(var(--n-400))' }}>admin@kaynes.com</span>
                        <span className="font-medium" style={{ color: 'rgb(var(--n-600))' }}>Pass</span>
                        <span className="font-mono" style={{ color: 'rgb(var(--n-400))' }}>admin123</span>
                      </div>
                      <div className="h-px w-full" style={{ background: 'rgb(var(--s-600))' }} />
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                        <span className="font-medium" style={{ color: 'rgb(var(--n-600))' }}>Inspector</span>
                        <span className="font-mono" style={{ color: 'rgb(var(--n-400))' }}>inspector@kaynes.com</span>
                        <span className="font-medium" style={{ color: 'rgb(var(--n-600))' }}>Pass</span>
                        <span className="font-mono" style={{ color: 'rgb(var(--n-400))' }}>inspector123</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.form>
            )}

            {/* ── VIEW: FORGOT PASSWORD ─────────────────────────────── */}
            {view === 'forgot' && (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22 }}
                onSubmit={handleForgotSubmit}
                className="space-y-5"
              >
                <div>
                  <div
                    className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                    style={{ color: '#577E89' }}
                  >
                    Account Recovery
                  </div>
                  <h2 className="text-xl font-bold font-display tracking-tight" style={{ color: 'rgb(var(--fg))' }}>
                    Reset your password
                  </h2>
                  <p className="text-[12px] mt-1.5 leading-relaxed" style={{ color: 'rgb(var(--n-500))' }}>
                    Enter your registered corporate email to receive a reset link.
                  </p>
                </div>

                {error && (
                  <div
                    className="flex items-start gap-2 rounded-xl p-3 text-xs font-medium"
                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
                  >
                    <AlertTriangle className="shrink-0 mt-0.5" size={14} />{error}
                  </div>
                )}
                {message && (
                  <div
                    className="flex items-start gap-2 rounded-xl p-3 text-xs font-medium"
                    style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }}
                  >
                    <CheckCircle2 className="shrink-0 mt-0.5" size={14} />{message}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgb(var(--n-500))' }}>
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@kaynes.com"
                    className={inputCls + ' font-mono'}
                    autoComplete="email"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => switchView('login')}
                    className="flex-1 rounded-xl border py-3 text-xs font-medium transition-all"
                    style={{ borderColor: 'rgb(var(--s-500))', background: 'rgb(var(--s-700))', color: 'rgb(var(--n-400))' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgb(var(--s-600))'; (e.currentTarget as HTMLElement).style.color = 'rgb(var(--n-200))' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgb(var(--s-700))'; (e.currentTarget as HTMLElement).style.color = 'rgb(var(--n-400))' }}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold transition-all hover:scale-[1.02] disabled:opacity-70"
                    style={{
                      background: 'linear-gradient(135deg, #577E89 0%, #74A1B0 100%)',
                      color: '#0D0F15',
                      boxShadow: '0 4px 14px rgba(87,126,137,0.3)',
                    }}
                  >
                    {loading ? <Spinner /> : 'Send Reset Link'}
                  </button>
                </div>
              </motion.form>
            )}

            {/* ── VIEW: RESET PASSWORD ──────────────────────────────── */}
            {view === 'reset' && (
              <motion.form
                key="reset"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22 }}
                onSubmit={handleResetSubmit}
                className="space-y-5"
              >
                <div>
                  <div
                    className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                    style={{ color: '#577E89' }}
                  >
                    New Credentials
                  </div>
                  <h2 className="text-xl font-bold font-display tracking-tight" style={{ color: 'rgb(var(--fg))' }}>
                    Set new password
                  </h2>
                  <p className="text-[12px] mt-1.5 leading-relaxed" style={{ color: 'rgb(var(--n-500))' }}>
                    Enter your corporate email and your new secure password.
                  </p>
                </div>

                {error && (
                  <div
                    className="flex items-start gap-2 rounded-xl p-3 text-xs font-medium"
                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
                  >
                    <AlertTriangle className="inline" size={14} />{error}
                  </div>
                )}
                {message && (
                  <div
                    className="flex items-start gap-2 rounded-xl p-3 text-xs font-medium"
                    style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }}
                  >
                    <CheckCircle2 className="inline" size={14} />{message}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgb(var(--n-500))' }}>
                    Confirm Account Email
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls + ' font-mono'}
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgb(var(--n-500))' }}>
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      required
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className={inputCls + ' pr-11'}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      tabIndex={-1}
                    >
                      <EyeIcon open={showNewPass} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => switchView('login')}
                    className="flex-1 rounded-xl border py-3 text-xs font-medium transition-all"
                    style={{ borderColor: 'rgb(var(--s-500))', background: 'rgb(var(--s-700))', color: 'rgb(var(--n-400))' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgb(var(--s-600))'; (e.currentTarget as HTMLElement).style.color = 'rgb(var(--n-200))' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgb(var(--s-700))'; (e.currentTarget as HTMLElement).style.color = 'rgb(var(--n-400))' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold transition-all hover:scale-[1.02] disabled:opacity-70"
                    style={{
                      background: 'linear-gradient(135deg, #577E89 0%, #74A1B0 100%)',
                      color: '#0D0F15',
                      boxShadow: '0 4px 14px rgba(87,126,137,0.3)',
                    }}
                  >
                    {loading ? <Spinner /> : 'Update Password'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer note */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <span className="text-[9px] font-medium tracking-widest uppercase" style={{ color: 'rgb(var(--n-700))' }}>
          Kaynes Technology Industries · Enterprise IoT Division · v2.1
        </span>
      </div>
    </div>
  );
}
