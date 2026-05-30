// frontend/src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const inp = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 14, padding: '13px 16px', color: 'white', fontSize: 14, outline: 'none',
};

function Step1({ onSuccess }) {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true);
    try {
      const { confirm, ...data } = form;
      const res = await API.post('/auth/register', data);
      onSuccess(res.data);
    } catch (err) { setError(err.response?.data?.error || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={s.circle}><span style={{ fontSize: 34 }}>🏠</span></div>
        <h1 style={s.h1}>Create Account</h1>
        <p style={s.sub}>Start tracking your rental bonds today</p>
      </div>
      {error && <div style={s.err}>{error}</div>}
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        <input placeholder="Full Name" required style={inp} onChange={e => setForm({ ...form, full_name: e.target.value })} />
        <input type="email" placeholder="Email Address" required style={inp} onChange={e => setForm({ ...form, email: e.target.value })} />
        <div style={{ display: 'flex', gap: 12 }}>
          <input type="password" placeholder="Password (min 8)" required style={inp} onChange={e => setForm({ ...form, password: e.target.value })} />
          <input type="password" placeholder="Confirm" required style={inp} onChange={e => setForm({ ...form, confirm: e.target.value })} />
        </div>
        <input type="tel" placeholder="Phone (optional)" style={inp} onChange={e => setForm({ ...form, phone: e.target.value })} />
        <button type="submit" disabled={loading} style={s.btn}>{loading ? 'Creating…' : 'Create Account →'}</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 18, color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
        Already have an account? <Link to="/login" style={{ color: 'white', fontWeight: 600 }}>Login</Link>
      </p>
    </>
  );
}

function Step2({ data, onDone }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCodes, setShowCodes] = useState(true);

  const verify = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await API.post('/auth/mfa/setup-verify', { user_id: data.user_id, token });
      localStorage.setItem('user', JSON.stringify({ ...res.data.user, token: res.data.token }));
      onDone(res.data.user.role);
    } catch (err) { setError(err.response?.data?.error || 'Invalid code'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={s.circle}><span style={{ fontSize: 30 }}>🔐</span></div>
        <h1 style={{ ...s.h1, fontSize: 21 }}>Set Up Two-Factor Auth</h1>
        <p style={s.sub}>Scan with Google Authenticator or Authy</p>
      </div>

      <img src={data.qrDataUrl} alt="QR Code"
        style={{ display: 'block', margin: '0 auto 18px', width: 170, borderRadius: 12, border: '2px solid rgba(255,255,255,0.25)' }} />

      {showCodes && (
        <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: 12, padding: 14, marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: 12 }}>⚠️ Save backup codes — shown once only!</span>
            <button onClick={() => setShowCodes(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 12 }}>Hide</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {data.backupCodes.map((c, i) => (
              <code key={i} style={{ background: 'rgba(255,255,255,0.12)', padding: '5px 10px', borderRadius: 6, fontSize: 13, color: 'white', letterSpacing: 2, fontFamily: 'monospace' }}>{c}</code>
            ))}
          </div>
        </div>
      )}

      {error && <div style={s.err}>{error}</div>}
      <form onSubmit={verify} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input value={token} onChange={e => setToken(e.target.value.replace(/\D/g, ''))}
          placeholder="6-digit code" maxLength={6}
          style={{ ...inp, textAlign: 'center', fontSize: 24, letterSpacing: 10, fontFamily: 'monospace' }} />
        <button type="submit" disabled={loading || token.length !== 6} style={s.btn}>
          {loading ? 'Verifying…' : 'Verify & Complete Setup ✓'}
        </button>
      </form>
    </>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [mfaData, setMfaData] = useState(null);

  return (
    <div style={s.page}>
      <video autoPlay loop muted playsInline style={s.video}><source src="/videos/background.mp4" type="video/mp4" /></video>
      <div style={{ ...s.card, maxWidth: step === 2 ? 450 : 490 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {[1, 2].map(n => <div key={n} style={{ width: 32, height: 4, borderRadius: 2, background: step >= n ? '#667eea' : 'rgba(255,255,255,0.2)', transition: 'background 0.3s' }} />)}
        </div>
        {step === 1 && <Step1 onSuccess={d => { setMfaData(d); setStep(2); }} />}
        {step === 2 && <Step2 data={mfaData} onDone={role => navigate(role === 'admin' ? '/admin-dashboard' : '/dashboard')} />}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  video: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 },
  card: { position: 'relative', zIndex: 10, width: '92%', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', borderRadius: 28, padding: '36px 34px', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  circle: { width: 68, height: 68, borderRadius: '50%', margin: '0 auto 14px', background: 'linear-gradient(135deg,rgba(102,126,234,0.6),rgba(118,75,162,0.6))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.3)' },
  h1: { fontSize: 24, fontWeight: 'bold', color: 'white', margin: '0 0 5px' },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.62)', margin: 0 },
  btn: { width: '100%', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', padding: 14, border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  err: { background: 'rgba(220,38,38,0.85)', color: 'white', padding: '10px 14px', borderRadius: 12, marginBottom: 14, fontSize: 13 },
};
