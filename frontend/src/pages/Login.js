// frontend/src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const inp = {
  flex: 1, padding: '15px 0', border: 'none',
  background: 'transparent', fontSize: 14, outline: 'none', color: 'white',
};
const wrap = {
  display: 'flex', alignItems: 'center',
  background: 'rgba(255,255,255,0.1)', borderRadius: 16,
  padding: '3px 18px', marginBottom: 18,
  border: '1px solid rgba(255,255,255,0.2)',
};

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep]         = useState(1); // 1=credentials, 2=totp, 3=backup
  const [form, setForm]         = useState({ email: '', password: '' });
  const [totpCode, setTotpCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [preToken, setPreToken] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const finish = (data) => {
    localStorage.setItem('user', JSON.stringify({ ...data.user, token: data.token }));
    navigate(data.user.role === 'admin' ? '/admin-dashboard' : '/dashboard');
  };

  // Step 1 — password
  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await API.post('/auth/login', form);
      if (res.data.mfa_required) {
        setPreToken(res.data.pre_token);
        setStep(2);
      } else {
        finish(res.data);
      }
    } catch (err) { setError(err.response?.data?.error || 'Login failed'); }
    finally { setLoading(false); }
  };

  // Step 2 — TOTP
  const handleTotp = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await API.post('/auth/mfa/login-verify', { pre_token: preToken, token: totpCode });
      finish(res.data);
    } catch (err) { setError(err.response?.data?.error || 'Invalid code'); }
    finally { setLoading(false); }
  };

  // Step 3 — backup code
  const handleBackup = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await API.post('/auth/mfa/backup-verify', { pre_token: preToken, backup_code: backupCode });
      finish(res.data);
    } catch (err) { setError(err.response?.data?.error || 'Invalid backup code'); }
    finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <video autoPlay loop muted playsInline style={s.video}>
        <source src="/videos/background.mp4" type="video/mp4" />
      </video>

      <div style={s.card}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={s.circle}><span style={{ fontSize: 38 }}>🏠</span></div>
          <h1 style={s.h1}>Rental Bond Tracker</h1>
          <p style={s.sub}>
            {step === 1 && 'Manage your rental bonds with confidence'}
            {step === 2 && 'Enter your authenticator code'}
            {step === 3 && 'Enter a backup recovery code'}
          </p>
        </div>

        {error && <div style={s.err}>{error}</div>}

        {/* ── Step 1: credentials ───────────────────────────────── */}
        {step === 1 && (
          <form onSubmit={handleLogin}>
            <div style={wrap}><span style={s.ico}>📧</span><input type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={inp} /></div>
            <div style={wrap}><span style={s.ico}>🔒</span><input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required style={inp} /></div>
            <button type="submit" disabled={loading} style={s.btn}>{loading ? 'Signing in…' : 'Sign In'}</button>
          </form>
        )}

        {/* ── Step 2: TOTP ─────────────────────────────────────── */}
        {step === 2 && (
          <form onSubmit={handleTotp}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 48 }}>🔐</span>
            </div>
            <input
              value={totpCode} onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000" maxLength={6}
              style={{ ...inp, display: 'block', width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 16, padding: '16px', textAlign: 'center', fontSize: 28, letterSpacing: 12, fontFamily: 'monospace', marginBottom: 16 }}
            />
            <button type="submit" disabled={loading || totpCode.length !== 6} style={s.btn}>
              {loading ? 'Verifying…' : 'Verify Code'}
            </button>
            <button type="button" onClick={() => setStep(3)} style={{ ...s.btn, background: 'rgba(255,255,255,0.15)', marginTop: 10 }}>
              Use a backup code instead
            </button>
          </form>
        )}

        {/* ── Step 3: backup code ───────────────────────────────── */}
        {step === 3 && (
          <form onSubmit={handleBackup}>
            <input
              value={backupCode} onChange={e => setBackupCode(e.target.value.toUpperCase())}
              placeholder="XXXXXXXX" maxLength={8}
              style={{ ...inp, display: 'block', width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 16, padding: '16px', textAlign: 'center', fontSize: 22, letterSpacing: 6, fontFamily: 'monospace', marginBottom: 16 }}
            />
            <button type="submit" disabled={loading} style={s.btn}>{loading ? 'Checking…' : 'Use Backup Code'}</button>
            <button type="button" onClick={() => setStep(2)} style={{ ...s.btn, background: 'rgba(255,255,255,0.15)', marginTop: 10 }}>
              ← Back to authenticator
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          {step === 1 && (
            <>
              <p style={{ color: 'rgba(255,255,255,0.55)', margin: '0 0 10px', fontSize: 13 }}>
                Don't have an account? <Link to="/register" style={{ color: 'white', fontWeight: 600 }}>Create one</Link>
              </p>
              <Link to="/forgot-password" style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>Forgot Password?</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  video: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 },
  card: { position: 'relative', zIndex: 10, width: 440, maxWidth: '92%', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', borderRadius: 30, padding: '44px 38px', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  circle: { width: 78, height: 78, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(102,126,234,0.6),rgba(118,75,162,0.6))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', border: '1px solid rgba(255,255,255,0.3)' },
  h1: { fontSize: 26, fontWeight: 'bold', color: 'white', margin: '0 0 6px' },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.62)', margin: 0 },
  ico: { fontSize: 20, marginRight: 12, opacity: 0.7 },
  btn: { width: '100%', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', padding: '15px', border: 'none', borderRadius: 16, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  err: { background: 'rgba(220,38,38,0.85)', color: 'white', padding: '10px 14px', borderRadius: 12, marginBottom: 16, fontSize: 13, textAlign: 'center' },
};
