// frontend/src/pages/Inspections.js
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Layout from '../components/Layout';
import { toast } from '../components/Toast';

const API_BASE = 'http://localhost:5000';
const BLANK = { property_id: '', inspection_date: '', inspection_type: 'Routine', condition_notes: '', overall_rating: '' };
const inp = { width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '11px 14px', color: 'white', fontSize: 14, outline: 'none' };
const glass = { background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.15)' };

const TYPE_ICONS = { Entry: '🚪', Routine: '🔄', Exit: '🏃' };

export default function Inspections() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [properties, setProperties]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState(BLANK);
  const [photo, setPhoto]             = useState(null);
  const [preview, setPreview]         = useState(null);
  const [editId, setEditId]           = useState(null);
  const [saving, setSaving]           = useState(false);
  const [confirm, setConfirm]         = useState(null);
  const [lightbox, setLightbox]       = useState(null);

  useEffect(() => { if (!localStorage.getItem('user')) navigate('/login'); }, [navigate]);

  const fetchInspections = useCallback(async () => {
    setLoading(true);
    try { const r = await API.get('/inspections'); setInspections(r.data); }
    catch { toast.error('Failed to load inspections'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchInspections(); }, [fetchInspections]);
  useEffect(() => { API.get('/properties').then(r => setProperties(r.data)).catch(() => {}); }, []);

  const openEdit = (ins) => {
    setEditId(ins.inspection_id);
    setForm({
      property_id:     ins.property_id,
      inspection_date: ins.inspection_date?.split('T')[0] || '',
      inspection_type: ins.inspection_type || 'Routine',
      condition_notes: ins.condition_notes || '',
      overall_rating:  ins.overall_rating || '',
    });
    setPhoto(null); setPreview(null);
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditId(null); setForm(BLANK); setPhoto(null); setPreview(null); };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Only image files are allowed');
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('photo', photo);

      if (editId) {
        await API.put(`/inspections/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Inspection updated');
      } else {
        await API.post('/inspections/add', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Inspection added');
      }
      closeForm(); fetchInspections();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await API.delete(`/inspections/${id}`); toast.success('Inspection deleted'); fetchInspections(); }
    catch { toast.error('Failed to delete'); }
    finally { setConfirm(null); }
  };

  const imgUrl = (path) => path ? `${API_BASE}/${path.replace(/\\/g, '/')}` : null;

  return (
    <Layout title="Inspections" icon="📋">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(BLANK); }}
          style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', padding: '10px 22px', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>
          + Add Inspection
        </button>
      </div>

      {showForm && (
        <div style={{ ...glass, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ color: 'white', margin: 0 }}>{editId ? '✏️ Edit Inspection' : '📋 New Inspection'}</h3>
            <button onClick={closeForm} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 22, cursor: 'pointer' }}>✕</button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <select value={form.property_id} onChange={e => setForm({ ...form, property_id: e.target.value })} required style={{ ...inp, cursor: 'pointer' }}>
              <option value="">Select Property *</option>
              {properties.map(p => <option key={p.property_id} value={p.property_id}>{p.address}</option>)}
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={lbl}>Inspection Date *</label><input type="date" value={form.inspection_date} onChange={e => setForm({ ...form, inspection_date: e.target.value })} required style={inp} /></div>
              <div>
                <label style={lbl}>Type</label>
                <select value={form.inspection_type} onChange={e => setForm({ ...form, inspection_type: e.target.value })} style={{ ...inp, cursor: 'pointer' }}>
                  <option value="Entry">Entry</option><option value="Routine">Routine</option><option value="Exit">Exit</option>
                </select>
              </div>
            </div>
            <div>
              <label style={lbl}>Overall Rating (1–5)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setForm({ ...form, overall_rating: n })}
                    style={{ width: 40, height: 40, borderRadius: 10, border: `2px solid ${form.overall_rating >= n ? '#f59e0b' : 'rgba(255,255,255,0.2)'}`, background: form.overall_rating >= n ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)', color: form.overall_rating >= n ? '#f59e0b' : 'rgba(255,255,255,0.4)', fontSize: 18, cursor: 'pointer' }}>
                    ★
                  </button>
                ))}
                {form.overall_rating && <button type="button" onClick={() => setForm({ ...form, overall_rating: '' })} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer' }}>Clear</button>}
              </div>
            </div>
            <div>
              <label style={lbl}>Condition Notes</label>
              <textarea value={form.condition_notes} onChange={e => setForm({ ...form, condition_notes: e.target.value })} rows={3}
                placeholder="Describe the property condition…"
                style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <div>
              <label style={lbl}>Photo {editId ? '(leave empty to keep existing)' : ''}</label>
              <input type="file" accept="image/*" onChange={handleFile} style={{ ...inp, cursor: 'pointer' }} />
              {preview && (
                <div style={{ marginTop: 10 }}>
                  <img src={preview} alt="preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 10, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }} />
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <button type="submit" disabled={saving} style={{ flex: 1, background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', padding: 13, border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>
                {saving ? 'Saving…' : editId ? 'Update Inspection' : 'Save Inspection'}
              </button>
              <button type="button" onClick={closeForm} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white', padding: 13, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <Spinner /> : inspections.length === 0 ? (
        <Empty icon="📋" text="No inspections recorded yet" onAdd={() => setShowForm(true)} btnText="Add Your First Inspection" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {inspections.map(ins => {
            const url = imgUrl(ins.photo_path);
            return (
              <div key={ins.inspection_id} style={{ ...glass, padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {/* photo thumbnail */}
                {url ? (
                  <img src={url} alt="inspection" onClick={() => setLightbox(url)}
                    style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', cursor: 'zoom-in', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 72, height: 72, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                    {TYPE_ICONS[ins.inspection_type] || '📋'}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{TYPE_ICONS[ins.inspection_type]} {ins.inspection_type} Inspection</span>
                    {ins.overall_rating && <span style={{ color: '#f59e0b', fontSize: 14 }}>{'★'.repeat(ins.overall_rating)}{'☆'.repeat(5 - ins.overall_rating)}</span>}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span>📍 {ins.address || `Property #${ins.property_id}`}</span>
                    {ins.inspection_date && <span>📅 {ins.inspection_date?.split('T')[0]}</span>}
                  </div>
                  {ins.condition_notes && (
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                      {ins.condition_notes.length > 120 ? ins.condition_notes.substring(0, 120) + '…' : ins.condition_notes}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => openEdit(ins)} style={actBtn('#667eea')}>Edit</button>
                  <button onClick={() => setConfirm(ins.inspection_id)} style={actBtn('#ef4444')}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'zoom-out' }}>
          <img src={lightbox} alt="full" style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.8)' }} />
        </div>
      )}

      {confirm && <ConfirmModal msg="Delete this inspection and its photo?" onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
    </Layout>
  );
}

const lbl = { display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 };
const actBtn = (c) => ({ background: `${c}22`, border: `1px solid ${c}44`, color: c, padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600 });
function Spinner() { return <div style={{ textAlign: 'center', padding: 60 }}><div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.15)', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>; }
function Empty({ icon, text, onAdd, btnText }) { return <div style={{ textAlign: 'center', padding: 80, background: 'rgba(255,255,255,0.05)', borderRadius: 20 }}><div style={{ fontSize: 64, marginBottom: 16 }}>{icon}</div><p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 20 }}>{text}</p><button onClick={onAdd} style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', padding: '12px 24px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 600 }}>{btnText}</button></div>; }
function ConfirmModal({ msg, onConfirm, onCancel }) { return <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}><div style={{ background: 'rgba(18,18,42,0.98)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: 32, maxWidth: 380, width: '90%' }}><p style={{ color: 'white', fontSize: 15, marginBottom: 24 }}>⚠️ {msg}</p><div style={{ display: 'flex', gap: 12 }}><button onClick={onConfirm} style={{ flex: 1, background: '#ef444433', border: '1px solid #ef444466', color: '#f87171', padding: 12, borderRadius: 12, cursor: 'pointer', fontWeight: 600 }}>Delete</button><button onClick={onCancel} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: 12, borderRadius: 12, cursor: 'pointer' }}>Cancel</button></div></div></div>; }
