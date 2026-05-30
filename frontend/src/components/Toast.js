// frontend/src/components/Toast.js
// Lightweight toast — no extra dependency needed.
// Usage: import { toast } from './Toast';  toast.success('Done!');
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

let _addToast = null;

function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  useEffect(() => { _addToast = add; }, [add]);

  const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6', warning: '#f59e0b' };
  const icons  = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };

  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background: 'rgba(18,18,42,0.97)', backdropFilter: 'blur(12px)', border: `1px solid ${colors[t.type]}55`, borderLeft: `4px solid ${colors[t.type]}`, borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, color: 'white', fontSize: 14, fontWeight: 500, minWidth: 240, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', animation: 'fadeInRight 0.3s ease', pointerEvents: 'auto' }}>
          <span style={{ color: colors[t.type], fontSize: 16, fontWeight: 700 }}>{icons[t.type]}</span>
          {t.msg}
        </div>
      ))}
      <style>{`@keyframes fadeInRight { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }`}</style>
    </div>,
    document.body
  );
}

export const toast = {
  success: (msg) => _addToast?.(msg, 'success'),
  error:   (msg) => _addToast?.(msg, 'error'),
  info:    (msg) => _addToast?.(msg, 'info'),
  warning: (msg) => _addToast?.(msg, 'warning'),
};

export default ToastContainer;
