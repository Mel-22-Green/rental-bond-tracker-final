// frontend/src/pages/Properties.js
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Layout from '../components/Layout';
import { toast } from '../components/Toast';

const BLANK = { address: '', landlord_name: '', landlord_phone: '', landlord_email: '', agent_name: '', agent_phone: '', lease_start: '', lease_end: '', is_current: false };

const inp = { width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '11px 14px', color: 'white', fontSize: 14, outline: 'none' };
const glass = { background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.15)' };

export default function Properties() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterCurrent, setFilterCurrent] = useState('all');
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(BLANK);
  const [editId, setEditId]         = useState(null);
  const [saving, setSaving]         = useState(false);
  const [confirm, setConfirm]       = useState(null);

  useEffect(() => { if (!localStorage.getItem('user')) navigate('/login'); }, [navigate]);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterCurrent === 'yes') params.is_current = 'true';
      const res = await API.get('/properties', { params });
      setProperties(res.data);
    } catch { toast.error('Failed to load properties'); }
    finally { setLoading(false); }
  }, [search, filterCurrent]);

  useEffect(() => { fetch(); }, [fetch]);

  const openEdit = (p) => {
    setEditId(p.property_id);
    setForm({
      address: p.address || '', landlord_name: p.landlord_name || '',
      landlord_phone: p.landlord_phone || '', landlord_email: p.landlord_email || '',
      agent_name: p.agent_name || '', agent_phone: p.agent_phone || '',
      lease_start: p.lease_start?.split('T')[0] || '',
      lease_end:   p.lease_end?.split('T')[0] || '',
      is_current: p.is_current || false,
    });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditId(null); setForm(BLANK); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId) {
        await API.put(`/properties/${editId}`, form);
        toast.success('Property updated');
      } else {
        await API.post('/properties/add', form);
        toast.success('Property added');
      }
      closeForm(); fetch();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await API.delete(`/properties/${id}`); toast.success('Property deleted'); fetch(); }
    catch { toast.error('Failed to delete property'); }
    finally { setConfirm(null); }
  };

  const filtered = properties.filter(p => {
    if (filterCurrent === 'yes' && !p.is_current) return false;
    if (filterCurrent === 'no' && p.is_current) return false;
    return true;
  });

  return (
    <Layout title="Properties" icon="🏘️">
      {/* toolbar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
        <input placeholder="🔍 Search by address…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inp, flex: 1, minWidth: 200 }} />
        <select value={filterCurrent} onChange={e => setFilterCurrent(e.target.value)}
          style={{ ...inp, width: 'auto', cursor: 'pointer' }}>
          <option value="all">All properties</option>
          <option value="yes">Current residence only</option>
          <option value="no">Past properties</option>
        </select>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(BLANK); }}
          style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', padding: '11px 22px', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          + Add Property
        </button>
      </div>

      {/* add/edit form */}
      {showForm && (
        <div style={{ ...glass, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ color: 'white', margin: 0, fontSize: 18 }}>{editId ? '✏️ Edit Property' : '🏘️ New Property'}</h3>
            <button onClick={closeForm} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 22, cursor: 'pointer' }}>✕</button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input placeholder="Full Address *" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required style={inp} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input placeholder="Landlord Name *" value={form.landlord_name} onChange={e => setForm({ ...form, landlord_name: e.target.value })} required style={inp} />
              <input placeholder="Landlord Phone" value={form.landlord_phone} onChange={e => setForm({ ...form, landlord_phone: e.target.value })} style={inp} />
            </div>
            <input type="email" placeholder="Landlord Email" value={form.landlord_email} onChange={e => setForm({ ...form, landlord_email: e.target.value })} style={inp} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input placeholder="Agent Name" value={form.agent_name} onChange={e => setForm({ ...form, agent_name: e.target.value })} style={inp} />
              <input placeholder="Agent Phone" value={form.agent_phone} onChange={e => setForm({ ...form, agent_phone: e.target.value })} style={inp} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={lbl}>Lease Start</label><input type="date" value={form.lease_start} onChange={e => setForm({ ...form, lease_start: e.target.value })} style={inp} /></div>
              <div><label style={lbl}>Lease End</label><input type="date" value={form.lease_end} onChange={e => setForm({ ...form, lease_end: e.target.value })} style={inp} /></div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_current} onChange={e => setForm({ ...form, is_current: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#667eea' }} />
              This is my current residence
            </label>
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <button type="submit" disabled={saving} style={{ flex: 1, background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', padding: 13, border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>
                {saving ? 'Saving…' : editId ? 'Update Property' : 'Save Property'}
              </button>
              <button type="button" onClick={closeForm} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white', padding: 13, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* list */}
      {loading ? <Spinner /> : filtered.length === 0 ? (
        <Empty icon="🏘️" text="No properties found" onAdd={() => setShowForm(true)} btnText="Add Your First Property" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
          {filtered.map(p => (
            <div key={p.property_id} style={{ ...glass, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 32 }}>{p.is_current ? '🏡' : '🏘️'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ color: 'white', margin: 0, fontSize: 15, fontWeight: 700, wordBreak: 'break-word' }}>{p.address}</h3>
                  {p.is_current && <span style={{ background: 'rgba(16,185,129,0.25)', border: '1px solid #10b98155', color: '#6ee7b7', fontSize: 11, padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginTop: 4 }}>Current</span>}
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 16 }}>
                <span>👤 {p.landlord_name}{p.landlord_phone ? ` · ${p.landlord_phone}` : ''}</span>
                {p.agent_name && <span>🏢 {p.agent_name}{p.agent_phone ? ` · ${p.agent_phone}` : ''}</span>}
                {(p.lease_start || p.lease_end) && <span>📅 {p.lease_start?.split('T')[0] || '?'} → {p.lease_end?.split('T')[0] || 'ongoing'}</span>}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => openEdit(p)} style={actBtn('#667eea')}>Edit</button>
                <button onClick={() => setConfirm(p.property_id)} style={actBtn('#ef4444')}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirm && <ConfirmModal msg="Delete this property? Associated bonds and inspections may be affected." onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
    </Layout>
  );
}

const lbl = { display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 };
const actBtn = (c) => ({ flex: 1, background: `${c}33`, border: `1px solid ${c}66`, color: c, padding: '8px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600 });

function Spinner() { return <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.5)' }}><div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.15)', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>; }
function Empty({ icon, text, onAdd, btnText }) { return <div style={{ textAlign: 'center', padding: 80, background: 'rgba(255,255,255,0.05)', borderRadius: 20 }}><div style={{ fontSize: 64, marginBottom: 16 }}>{icon}</div><p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 20 }}>{text}</p><button onClick={onAdd} style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', padding: '12px 24px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 600 }}>{btnText}</button></div>; }
function ConfirmModal({ msg, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: 'rgba(18,18,42,0.98)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: 32, maxWidth: 380, width: '90%' }}>
        <p style={{ color: 'white', fontSize: 15, marginBottom: 24 }}>⚠️ {msg}</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onConfirm} style={{ flex: 1, background: '#ef444433', border: '1px solid #ef444466', color: '#f87171', padding: 12, borderRadius: 12, cursor: 'pointer', fontWeight: 600 }}>Delete</button>
          <button onClick={onCancel} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: 12, borderRadius: 12, cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
