// frontend/src/pages/ForgotPassword.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

function ForgotPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    if (formData.newPassword !== formData.confirmPassword)
      return setError('Passwords do not match');
    if (formData.newPassword.length < 8)
      return setError('Password must be at least 8 characters');
    setLoading(true);
    try {
      const res = await API.post('/auth/forgot-password', {
        email:       formData.email,
        newPassword: formData.newPassword,
      });
      setMessage(res.data.message || 'Password reset successfully!');
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Check your email address.');
    } finally { setLoading(false); }
  };

  return (
    <div style={s.container}>
      <video autoPlay loop muted playsInline style={s.videoBg}>
        <source src="/videos/background.mp4" type="video/mp4" />
      </video>

      <div style={s.glassCard}>
        <div style={s.logoSection}>
          <div style={s.logoCircle}>
            <span style={{ fontSize: 40 }}>{done ? '✅' : '🔑'}</span>
          </div>
          <h1 style={s.title}>Reset Password</h1>
          <p style={s.subtitle}>
            {done ? 'Redirecting to login…' : 'Enter your email and choose a new password'}
          </p>
        </div>

        {message && (
          <div style={s.successMessage}>
            {message}<br/>
            <span style={{ fontSize: 12, opacity: 0.85 }}>Redirecting to login in 3 seconds…</span>
          </div>
        )}
        {error && <div style={s.errorMessage}>{error}</div>}

        {!done && (
          <form onSubmit={handleSubmit}>
            <div style={s.inputGroup}>
              <span style={s.inputIcon}>📧</span>
              <input
                type="email" name="email" placeholder="Email Address"
                onChange={handleChange} required style={s.input}
              />
            </div>
            <div style={s.inputGroup}>
              <span style={s.inputIcon}>🔒</span>
              <input
                type="password" name="newPassword" placeholder="New Password (min 8)"
                onChange={handleChange} required style={s.input}
              />
            </div>
            <div style={s.inputGroup}>
              <span style={s.inputIcon}>🔒</span>
              <input
                type="password" name="confirmPassword" placeholder="Confirm New Password"
                onChange={handleChange} required style={s.input}
              />
            </div>
            <button type="submit" disabled={loading} style={s.button}>
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        )}

        <div style={s.footer}>
          <Link to="/login" style={s.link}>← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

const s = {
  container:      { minHeight:'100vh', width:'100%', position:'relative', overflow:'hidden', display:'flex', justifyContent:'center', alignItems:'center' },
  videoBg:        { position:'fixed', top:0, left:0, width:'100%', height:'100%', objectFit:'cover', zIndex:0 },
  glassCard:      { position:'relative', zIndex:10, width:450, maxWidth:'90%', background:'rgba(255,255,255,0.08)', backdropFilter:'blur(20px)', borderRadius:32, padding:'48px 40px', boxShadow:'0 8px 32px rgba(0,0,0,0.2)', border:'1px solid rgba(255,255,255,0.2)' },
  logoSection:    { textAlign:'center', marginBottom:32 },
  logoCircle:     { width:80, height:80, background:'linear-gradient(135deg,rgba(102,126,234,0.6),rgba(118,75,162,0.6))', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', border:'1px solid rgba(255,255,255,0.3)' },
  title:          { fontSize:28, fontWeight:'bold', color:'white', margin:'0 0 8px', textShadow:'0 2px 4px rgba(0,0,0,0.2)' },
  subtitle:       { fontSize:14, color:'rgba(255,255,255,0.7)', margin:0 },
  inputGroup:     { display:'flex', alignItems:'center', background:'rgba(255,255,255,0.1)', borderRadius:16, padding:'4px 20px', marginBottom:20, border:'1px solid rgba(255,255,255,0.2)' },
  inputIcon:      { fontSize:20, marginRight:12, opacity:0.7 },
  input:          { flex:1, padding:'16px 0', border:'none', background:'transparent', fontSize:15, outline:'none', color:'white' },
  button:         { width:'100%', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'white', padding:16, border:'none', borderRadius:16, fontSize:16, fontWeight:600, cursor:'pointer', marginTop:8 },
  errorMessage:   { background:'rgba(220,38,38,0.9)', color:'white', padding:12, borderRadius:12, marginBottom:20, textAlign:'center', fontSize:14 },
  successMessage: { background:'rgba(16,185,129,0.9)', color:'white', padding:12, borderRadius:12, marginBottom:20, textAlign:'center', fontSize:14 },
  footer:         { textAlign:'center', marginTop:24, paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.2)' },
  link:           { color:'white', textDecoration:'none', fontWeight:600 },
};

export default ForgotPassword;