// frontend/src/pages/Bonds.js
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Layout from '../components/Layout';
import { toast } from '../components/Toast';

const BLANK = { property_id: '', amount: '', payment_date: '', reference_no: '', status: 'Pending', refund_amount: '', refund_date: '' };
const inp = { width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '11px 14px', color: 'white', fontSize: 14, outline: 'none' };
const glass = { background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.15)' };

const STATUS_COLORS = { Paid: '#10b981', Pending: '#f59e0b', Refunded: '#ef4444' };

export default function Bonds() {
  const navigate = useNavigate();
  const [bonds, setBonds]         = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('All');
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(BLANK);
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);
  const [confirm, setConfirm]     = useState(null);

  useEffect(() => { if (!localStorage.getItem('user')) navigate('/login'); }, [navigate]);

  const fetchBonds = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== 'All' ? { status: filter } : {};
      const res = await API.get('/bonds', { params });
      setBonds(res.data);
    } catch { toast.error('Failed to load bonds'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchBonds(); }, [fetchBonds]);
  useEffect(() => {
    API.get('/properties').then(r => setProperties(r.data)).catch(() => {});
  }, []);

  const openEdit = (b) => {
    setEditId(b.bond_id);
    setForm({
      property_id:  b.property_id, amount: b.amount || '',
      payment_date: b.payment_date?.split('T')[0] || '',
      reference_no: b.reference_no || '', status: b.status || 'Pending',
      refund_amount: b.refund_amount || '', refund_date: b.refund_date?.split('T')[0] || '',
    });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditId(null); setForm(BLANK); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId) {
        await API.put(`/bonds/${editId}`, form);
        toast.success('Bond updated');
      } else {
        await API.post('/bonds/add', form);
        toast.success('Bond recorded');
      }
      closeForm(); fetchBonds();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save bond'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await API.delete(`/bonds/${id}`); toast.success('Bond deleted'); fetchBonds(); }
    catch { toast.error('Failed to delete bond'); }
    finally { setConfirm(null); }
  };

  const totalBonds = bonds.reduce((s, b) => s + Number(b.amount || 0), 0);

  return (
    <Layout title="Bonds" icon="💰">
      {/* summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 24 }}>
        {['All','Paid','Pending','Refunded'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ ...glass, padding: '14px 16px', border: `1px solid ${filter === s ? '#667eea' : 'rgba(255,255,255,0.12)'}`, background: filter === s ? 'rgba(102,126,234,0.2)' : 'rgba(255,255,255,0.07)', color: 'white', cursor: 'pointer', borderRadius: 14, fontWeight: filter === s ? 700 : 400, fontSize: 14 }}>
            {s === 'All' ? `All (${bonds.length})` : `${s} (${bonds.filter(b => b.status === s).length})`}
          </button>
        ))}
      </div>

      {/* toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: 13 }}>
          Total bond value: <strong style={{ color: 'white' }}>${totalBonds.toFixed(2)}</strong>
        </p>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(BLANK); }}
          style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>
          + Record Bond
        </button>
      </div>

      {/* form */}
      {showForm && (
        <div style={{ ...glass, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ color: 'white', margin: 0 }}>{editId ? '✏️ Edit Bond' : '💰 Record Bond'}</h3>
            <button onClick={closeForm} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 22, cursor: 'pointer' }}>✕</button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <select value={form.property_id} onChange={e => setForm({ ...form, property_id: e.target.value })} required style={{ ...inp, cursor: 'pointer' }}>
              <option value="">Select Property *</option>
              {properties.map(p => <option key={p.property_id} value={p.property_id}>{p.address}</option>)}
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={lbl}>Amount ($) *</label><input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required style={inp} /></div>
              <div><label style={lbl}>Payment Date *</label><input type="date" value={form.payment_date} onChange={e => setForm({ ...form, payment_date: e.target.value })} required style={inp} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input placeholder="Reference Number" value={form.reference_no} onChange={e => setForm({ ...form, reference_no: e.target.value })} style={inp} />
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ ...inp, cursor: 'pointer' }}>
                <option value="Pending">Pending</option><option value="Paid">Paid</option><option value="Refunded">Refunded</option>
              </select>
            </div>
            {form.status === 'Refunded' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={lbl}>Refund Amount ($)</label><input type="number" step="0.01" value={form.refund_amount} onChange={e => setForm({ ...form, refund_amount: e.target.value })} style={inp} /></div>
                <div><label style={lbl}>Refund Date</label><input type="date" value={form.refund_date} onChange={e => setForm({ ...form, refund_date: e.target.value })} style={inp} /></div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <button type="submit" disabled={saving} style={{ flex: 1, background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', padding: 13, border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>
                {saving ? 'Saving…' : editId ? 'Update Bond' : 'Record Bond'}
              </button>
              <button type="button" onClick={closeForm} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white', padding: 13, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* list */}
      {loading ? <Spinner /> : bonds.length === 0 ? (
        <Empty icon="💰" text="No bonds recorded yet" onAdd={() => setShowForm(true)} btnText="Record Your First Bond" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {bonds.map(b => {
            const c = STATUS_COLORS[b.status] || '#6b7280';
            return (
              <div key={b.bond_id} style={{ ...glass, padding: 20, display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${c}22`, border: `1px solid ${c}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>💰</div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>${Number(b.amount || 0).toFixed(2)}</span>
                    <span style={{ background: `${c}22`, border: `1px solid ${c}44`, color: c, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{b.status}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span>📍 {b.address || `Property #${b.property_id}`}</span>
                    {b.payment_date && <span>📅 {b.payment_date?.split('T')[0]}</span>}
                    {b.reference_no && <span>🔖 {b.reference_no}</span>}
                    {b.status === 'Refunded' && b.refund_amount && <span>↩ Refunded ${b.refund_amount} on {b.refund_date?.split('T')[0]}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => openEdit(b)} style={actBtn('#667eea')}>Edit</button>
                  <button onClick={() => setConfirm(b.bond_id)} style={actBtn('#ef4444')}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirm && <ConfirmModal msg="Delete this bond record?" onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
    </Layout>
  );
}

const lbl = { display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 };
const actBtn = (c) => ({ background: `${c}22`, border: `1px solid ${c}44`, color: c, padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600 });
function Spinner() { return <div style={{ textAlign: 'center', padding: 60 }}><div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.15)', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>; }
function Empty({ icon, text, onAdd, btnText }) { return <div style={{ textAlign: 'center', padding: 80, background: 'rgba(255,255,255,0.05)', borderRadius: 20 }}><div style={{ fontSize: 64, marginBottom: 16 }}>{icon}</div><p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 20 }}>{text}</p><button onClick={onAdd} style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', padding: '12px 24px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 600 }}>{btnText}</button></div>; }
function ConfirmModal({ msg, onConfirm, onCancel }) { return <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}><div style={{ background: 'rgba(18,18,42,0.98)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: 32, maxWidth: 380, width: '90%' }}><p style={{ color: 'white', fontSize: 15, marginBottom: 24 }}>⚠️ {msg}</p><div style={{ display: 'flex', gap: 12 }}><button onClick={onConfirm} style={{ flex: 1, background: '#ef444433', border: '1px solid #ef444466', color: '#f87171', padding: 12, borderRadius: 12, cursor: 'pointer', fontWeight: 600 }}>Delete</button><button onClick={onCancel} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: 12, borderRadius: 12, cursor: 'pointer' }}>Cancel</button></div></div></div>; }
