// frontend/src/components/Layout.js
// Shared sidebar + page shell used by all authenticated pages.
// Usage: <Layout title="Properties" icon="🏘️">...content...</Layout>
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const MENU = [
  { path: '/dashboard',    icon: '🏠', label: 'Dashboard' },
  { path: '/properties',   icon: '🏘️', label: 'Properties' },
  { path: '/bonds',        icon: '💰', label: 'Bonds' },
  { path: '/inspections',  icon: '📋', label: 'Inspections' },
  { path: '/documents',    icon: '📄', label: 'Documents' },
  { path: '/profile',      icon: '👤', label: 'Profile' },
];

export default function Layout({ children, title, icon }) {
  const [open, setOpen] = useState(true);
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => { localStorage.removeItem('user'); navigate('/login'); };
  const W = open ? 260 : 72;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative' }}>
      {/* video bg */}
      <video autoPlay loop muted playsInline style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}>
        <source src="/videos/background.mp4" type="video/mp4" />
      </video>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.42)', zIndex: 1 }} />

      {/* sidebar */}
      <aside style={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: W, background: 'rgba(18,18,42,0.88)', backdropFilter: 'blur(16px)', transition: 'width 0.3s', display: 'flex', flexDirection: 'column', zIndex: 100, borderRight: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', minHeight: 70 }}>
          <span style={{ fontSize: 26, flexShrink: 0 }}>🏠</span>
          {open && <span style={{ fontSize: 15, fontWeight: 700, color: 'white', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}>Rental Bond Tracker</span>}
          <button onClick={() => setOpen(o => !o)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 28, height: 28, borderRadius: 8, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{open ? '◀' : '▶'}</button>
        </div>

        <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {MENU.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 12, textDecoration: 'none', background: active ? 'linear-gradient(135deg,rgba(102,126,234,0.35),rgba(118,75,162,0.25))' : 'transparent', border: active ? '1px solid rgba(102,126,234,0.4)' : '1px solid transparent', color: active ? 'white' : 'rgba(255,255,255,0.72)', fontWeight: active ? 600 : 400, transition: 'all 0.2s', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                {open && <span style={{ fontSize: 14 }}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {open && (
          <div style={{ padding: '0 14px 8px', margin: '0 10px' }}>
            <div style={{ background: 'rgba(102,126,234,0.15)', border: '1px solid rgba(102,126,234,0.25)', borderRadius: 12, padding: '10px 12px', marginBottom: 8 }}>
              <p style={{ margin: 0, color: 'white', fontWeight: 600, fontSize: 13 }}>{user.full_name || 'User'}</p>
              <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{user.email}</p>
            </div>
          </div>
        )}

        <div style={{ padding: '0 10px 16px' }}>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171', padding: '11px 12px', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🚪</span>
            {open && 'Logout'}
          </button>
        </div>
      </aside>

      {/* main */}
      <main style={{ flex: 1, marginLeft: W, transition: 'margin-left 0.3s', padding: '28px 28px 48px', position: 'relative', zIndex: 10, minWidth: 0 }}>
        {title && (
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              {icon} {title}
            </h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
