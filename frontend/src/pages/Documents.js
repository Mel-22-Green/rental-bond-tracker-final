// frontend/src/pages/Documents.js
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Layout from '../components/Layout';
import { toast } from '../components/Toast';

const API_BASE = 'http://localhost:5000';
const glass = { background:'rgba(255,255,255,0.08)', backdropFilter:'blur(12px)', borderRadius:20, border:'1px solid rgba(255,255,255,0.15)' };
const inp   = { width:'100%', boxSizing:'border-box', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:12, padding:'11px 14px', color:'white', fontSize:14, outline:'none' };

const fileIcon = (name='') => {
  const ext = (name||'').split('.').pop().toLowerCase();
  if (ext==='pdf') return {icon:'📕',color:'#ef4444'};
  if (['doc','docx'].includes(ext)) return {icon:'📘',color:'#3b82f6'};
  if (['xls','xlsx'].includes(ext)) return {icon:'📗',color:'#10b981'};
  if (['jpg','jpeg','png','gif','webp'].includes(ext)) return {icon:'🖼️',color:'#f59e0b'};
  if (['zip','rar','7z'].includes(ext)) return {icon:'📦',color:'#8b5cf6'};
  return {icon:'📄',color:'#6b7280'};
};
const fmtSize = b => !b ? '—' : b<1024 ? `${b} B` : b<1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`;
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-AU',{day:'2-digit',month:'short',year:'numeric'}) : '—';

export default function Documents() {
  const navigate = useNavigate();
  const [docs,setDocs]       = useState([]);
  const [loading,setLoading] = useState(true);
  const [search,setSearch]   = useState('');
  const [showForm,setShowForm] = useState(false);
  const [file,setFile]       = useState(null);
  const [title,setTitle]     = useState('');
  const [docType,setDocType] = useState('');
  const [saving,setSaving]   = useState(false);
  const [confirm,setConfirm] = useState(null);

  useEffect(()=>{ if(!localStorage.getItem('user')) navigate('/login'); },[navigate]);

  const fetchDocs = useCallback(async()=>{
    setLoading(true);
    try { const r = await API.get('/documents'); setDocs(r.data); }
    catch { toast.error('Failed to load documents'); }
    finally { setLoading(false); }
  },[]);

  useEffect(()=>{ fetchDocs(); },[fetchDocs]);

  const handleUpload = async e => {
    e.preventDefault();
    if(!file) return toast.error('Please select a file');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('document', file);
      fd.append('title', title || file.name);
      fd.append('document_type', docType || 'Other');
      await API.post('/documents/upload', fd, {headers:{'Content-Type':'multipart/form-data'}});
      toast.success('Document uploaded');
      setShowForm(false); setFile(null); setTitle(''); setDocType('');
      fetchDocs();
    } catch(err){ toast.error(err.response?.data?.error||'Upload failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async id => {
    try { await API.delete(`/documents/${id}`); toast.success('Deleted'); fetchDocs(); }
    catch { toast.error('Failed to delete'); }
    finally { setConfirm(null); }
  };

  const handleDownload = doc => {
    const a = document.createElement('a');
    a.href = `${API_BASE}/${(doc.file_path||'').replace(/\\/g,'/')}`;
    a.download = doc.title||'document'; a.target='_blank'; a.click();
  };

  const filtered = docs.filter(d => !search || (d.title||'').toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout title="Documents" icon="📄">
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:24,alignItems:'center'}}>
        <div style={{flex:1,position:'relative',minWidth:200}}>
          <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:16}}>🔍</span>
          <input placeholder="Search documents…" value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,paddingLeft:40}} />
        </div>
        <button onClick={()=>setShowForm(s=>!s)}
          style={{background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',padding:'11px 22px',border:'none',borderRadius:12,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>
          {showForm ? '✕ Cancel' : '+ Upload Document'}
        </button>
      </div>

      {showForm && (
        <div style={{...glass,padding:24,marginBottom:24}}>
          <h3 style={{color:'white',margin:'0 0 18px',fontSize:17}}>📤 Upload Document</h3>
          <form onSubmit={handleUpload} style={{display:'flex',flexDirection:'column',gap:12}}>
            <input placeholder="Document Title (optional)" value={title} onChange={e=>setTitle(e.target.value)} style={inp} />
            <select value={docType} onChange={e=>setDocType(e.target.value)} style={{...inp,cursor:'pointer'}}>
              <option value="">Select Type</option>
              {['Lease Agreement','Bond Receipt','Inspection Report','Notice','Invoice','Other'].map(t=><option key={t}>{t}</option>)}
            </select>
            <div
              style={{border:`2px dashed ${file?'#10b981':'rgba(255,255,255,0.25)'}`,borderRadius:14,padding:'28px 20px',textAlign:'center',cursor:'pointer',background:file?'rgba(16,185,129,0.08)':'rgba(255,255,255,0.03)'}}
              onClick={()=>document.getElementById('doc-inp').click()}
              onDragOver={e=>e.preventDefault()}
              onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)setFile(f);}}>
              <input id="doc-inp" type="file" style={{display:'none'}} onChange={e=>setFile(e.target.files[0])} />
              {file ? (<>
                <div style={{fontSize:36,marginBottom:8}}>{fileIcon(file.name).icon}</div>
                <p style={{color:'#6ee7b7',margin:'0 0 4px',fontWeight:600}}>{file.name}</p>
                <p style={{color:'rgba(255,255,255,0.4)',margin:0,fontSize:12}}>{fmtSize(file.size)}</p>
              </>) : (<>
                <div style={{fontSize:40,marginBottom:10}}>📁</div>
                <p style={{color:'rgba(255,255,255,0.6)',margin:'0 0 6px'}}>Drag & drop or click to select</p>
                <p style={{color:'rgba(255,255,255,0.35)',fontSize:12,margin:0}}>PDF, Word, Excel, Images — max 10 MB</p>
              </>)}
            </div>
            <div style={{display:'flex',gap:12}}>
              <button type="submit" disabled={saving||!file} style={{flex:1,background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',padding:13,border:'none',borderRadius:12,fontWeight:600,cursor:'pointer',opacity:(!file||saving)?0.6:1}}>
                {saving?'Uploading…':'📤 Upload'}
              </button>
              <button type="button" onClick={()=>{setShowForm(false);setFile(null);}} style={{flex:1,background:'rgba(255,255,255,0.1)',color:'white',padding:13,border:'1px solid rgba(255,255,255,0.2)',borderRadius:12,cursor:'pointer'}}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {!loading && docs.length>0 && (
        <p style={{color:'rgba(255,255,255,0.5)',fontSize:13,marginBottom:16}}>
          {filtered.length} document{filtered.length!==1?'s':''}{search?` matching "${search}"`:''}
        </p>
      )}

      {loading ? <Spinner/> : filtered.length===0 ? (
        <Empty icon="📄" text={search?'No documents match your search':'No documents uploaded yet'} onAdd={()=>setShowForm(true)} btnText="Upload First Document" hideBtn={!!search} />
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {filtered.map(doc=>{
            const {icon,color} = fileIcon(doc.title||doc.file_path||'');
            return (
              <div key={doc.document_id} style={{...glass,padding:'16px 20px',display:'flex',alignItems:'center',gap:16}}>
                <div style={{width:48,height:48,borderRadius:12,background:`${color}22`,border:`1px solid ${color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <button onClick={()=>handleDownload(doc)} style={{background:'none',border:'none',padding:0,color:'white',fontWeight:600,fontSize:15,cursor:'pointer',textAlign:'left',maxWidth:'100%',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',display:'block'}} title="Click to download">
                    {doc.title||'Untitled'} ⬇
                  </button>
                  <div style={{display:'flex',gap:14,marginTop:4,flexWrap:'wrap'}}>
                    {doc.document_type && <span style={{fontSize:12,color:'rgba(255,255,255,0.5)',background:'rgba(255,255,255,0.08)',padding:'2px 8px',borderRadius:20}}>{doc.document_type}</span>}
                    {doc.file_size && <span style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>{fmtSize(doc.file_size)}</span>}
                    <span style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>Uploaded {fmtDate(doc.uploaded_at||doc.created_at)}</span>
                  </div>
                </div>
                <div style={{display:'flex',gap:8,flexShrink:0}}>
                  <button onClick={()=>handleDownload(doc)} style={{background:'rgba(102,126,234,0.2)',border:'1px solid rgba(102,126,234,0.4)',color:'#a5b4fc',padding:'7px 14px',borderRadius:10,cursor:'pointer',fontSize:13,fontWeight:600}}>⬇ Download</button>
                  <button onClick={()=>setConfirm(doc.document_id)} style={{background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',padding:'7px 14px',borderRadius:10,cursor:'pointer',fontSize:13,fontWeight:600}}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {confirm && <ConfirmModal msg="Permanently delete this document?" onConfirm={()=>handleDelete(confirm)} onCancel={()=>setConfirm(null)} />}
    </Layout>
  );
}

function Spinner(){return <div style={{textAlign:'center',padding:60}}><div style={{width:36,height:36,border:'3px solid rgba(255,255,255,0.15)',borderTopColor:'#667eea',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;}
function Empty({icon,text,onAdd,btnText,hideBtn}){return <div style={{textAlign:'center',padding:80,background:'rgba(255,255,255,0.05)',borderRadius:20}}><div style={{fontSize:64,marginBottom:16}}>{icon}</div><p style={{color:'rgba(255,255,255,0.6)',marginBottom:20}}>{text}</p>{!hideBtn&&<button onClick={onAdd} style={{background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',padding:'12px 24px',borderRadius:12,border:'none',cursor:'pointer',fontWeight:600}}>{btnText}</button>}</div>;}
function ConfirmModal({msg,onConfirm,onCancel}){return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}><div style={{background:'rgba(18,18,42,0.98)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:20,padding:32,maxWidth:380,width:'90%'}}><p style={{color:'white',fontSize:15,marginBottom:24}}>⚠️ {msg}</p><div style={{display:'flex',gap:12}}><button onClick={onConfirm} style={{flex:1,background:'#ef444433',border:'1px solid #ef444466',color:'#f87171',padding:12,borderRadius:12,cursor:'pointer',fontWeight:600}}>Delete</button><button onClick={onCancel} style={{flex:1,background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',color:'white',padding:12,borderRadius:12,cursor:'pointer'}}>Cancel</button></div></div></div>;}
