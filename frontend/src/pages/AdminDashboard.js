// frontend/src/pages/AdminDashboard.js
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import { toast } from '../components/Toast';

const API_BASE = 'http://localhost:5000';

const C = {
  accent:'#7c6fe0', accentGlow:'rgba(124,111,224,0.35)',
  danger:'#ef4444', success:'#22c55e', warning:'#f59e0b', info:'#38bdf8',
  glass:'rgba(15,15,35,0.78)', glassLight:'rgba(255,255,255,0.06)',
  border:'rgba(255,255,255,0.10)', text:'#e2e8f0', muted:'rgba(226,232,240,0.50)',
};

const glassStyle = { background:C.glass, backdropFilter:'blur(16px)', borderRadius:20, border:`1px solid ${C.border}` };
const inp = { width:'100%', boxSizing:'border-box', background:C.glassLight, border:`1px solid ${C.border}`, borderRadius:10, padding:'9px 14px', color:C.text, fontSize:14, outline:'none' };

const NAV = [
  { id:'overview',    icon:'◈', label:'Overview' },
  { id:'users',       icon:'◉', label:'Users' },
  { id:'properties',  icon:'⬡', label:'Properties' },
  { id:'bonds',       icon:'◆', label:'Bonds' },
  { id:'inspections', icon:'◎', label:'Inspections' },
  { id:'documents',   icon:'◧', label:'Documents' },
  { id:'audit',       icon:'▤', label:'Audit Logs' },
];

// ── helpers ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{display:'flex',justifyContent:'center',padding:60}}>
      <div style={{width:36,height:36,border:`3px solid ${C.border}`,borderTopColor:C.accent,borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function Badge({label}) {
  const map={paid:C.success,pending:C.warning,refunded:C.danger,admin:C.accent,user:C.muted,entry:C.info,routine:C.success,exit:C.warning,create:C.success,update:C.warning,delete:C.danger,login:C.info};
  const c=map[(label||'').toLowerCase()]||C.muted;
  return <span style={{display:'inline-block',padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:600,background:`${c}22`,border:`1px solid ${c}55`,color:c,textTransform:'capitalize'}}>{label||'—'}</span>;
}

function Btn({children,onClick,color,small,danger,disabled}) {
  const bg=danger?C.danger:(color||C.accent);
  return (
    <button onClick={onClick} disabled={disabled}
      style={{background:`${bg}22`,border:`1px solid ${bg}55`,color:bg,borderRadius:8,padding:small?'5px 12px':'8px 18px',fontSize:small?12:13,fontWeight:600,cursor:disabled?'not-allowed':'pointer',opacity:disabled?0.5:1,whiteSpace:'nowrap'}}
      onMouseEnter={e=>{if(!disabled)e.currentTarget.style.background=`${bg}44`;}}
      onMouseLeave={e=>{e.currentTarget.style.background=`${bg}22`;}}>
      {children}
    </button>
  );
}

function Pages({page,total,limit,onPage}) {
  const pages=Math.ceil(total/limit); if(pages<=1)return null;
  return (
    <div style={{display:'flex',gap:8,alignItems:'center',justifyContent:'center',marginTop:20}}>
      <Btn small disabled={page<=1} onClick={()=>onPage(page-1)}>← Prev</Btn>
      <span style={{color:C.muted,fontSize:13}}>Page {page} / {pages}</span>
      <Btn small disabled={page>=pages} onClick={()=>onPage(page+1)}>Next →</Btn>
    </div>
  );
}

function Modal({title,onClose,children}) {
  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,.7)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={onClose}>
      <div style={{background:'rgba(18,18,40,.97)',border:`1px solid ${C.border}`,borderRadius:20,padding:32,maxWidth:520,width:'100%',maxHeight:'85vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <h2 style={{margin:0,color:C.text,fontSize:17,fontWeight:700}}>{title}</h2>
          <button onClick={onClose} style={{background:'none',border:'none',color:C.muted,fontSize:22,cursor:'pointer'}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Confirm({msg,onConfirm,onCancel}) {
  return (
    <Modal title="Confirm" onClose={onCancel}>
      <p style={{color:C.text,marginBottom:24}}>{msg}</p>
      <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
        <Btn onClick={onCancel}>Cancel</Btn>
        <Btn danger onClick={onConfirm}>Confirm Delete</Btn>
      </div>
    </Modal>
  );
}

function FF({label,children}) {
  return (
    <div style={{marginBottom:14}}>
      <label style={{display:'block',color:C.muted,fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:5}}>{label}</label>
      {children}
    </div>
  );
}

function exportCSV(rows,filename) {
  if(!rows.length)return;
  const h=Object.keys(rows[0]);
  const csv=[h.join(','),...rows.map(r=>h.map(k=>`"${String(r[k]??'').replace(/"/g,'""')}"`).join(','))].join('\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  a.download=filename;a.click();
}

const fmtDate=d=>d?new Date(d).toLocaleDateString('en-AU',{day:'2-digit',month:'short',year:'numeric'}):'—';
const fmtDT=d=>d?new Date(d).toLocaleString('en-AU',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—';

function TH({children}) {
  return <th style={{textAlign:'left',padding:'10px 12px',color:C.muted,fontWeight:600,fontSize:11,whiteSpace:'nowrap',textTransform:'uppercase',letterSpacing:'.05em'}}>{children}</th>;
}

// ── MiniBar ──────────────────────────────────────────────────────────────────
function MiniBar({data}) {
  if(!data?.length)return null;
  const max=Math.max(...data.map(d=>d.count),1);
  return (
    <div style={{display:'flex',alignItems:'flex-end',gap:3,height:80}}>
      {data.map((d,i)=>(
        <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center'}}>
          <div title={`${d.label}: ${d.count}`}
            style={{width:'100%',borderRadius:'3px 3px 0 0',height:`${Math.max((d.count/max)*70,3)}px`,background:`linear-gradient(180deg,${C.accent},${C.accentGlow})`,transition:'height .5s ease'}}/>
        </div>
      ))}
    </div>
  );
}

// ── OverviewTab ───────────────────────────────────────────────────────────────
function OverviewTab({stats,recent,onTabChange}) {
  const chartData=React.useMemo(()=>Array.from({length:30},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-(29-i));
    return {label:d.toLocaleDateString('en-AU',{day:'2-digit',month:'short'}),count:Math.floor(Math.random()*9)};
  }),[]);

  const CARDS=[
    {label:'Total Users',      value:stats?.users,       icon:'◉',color:C.accent,  tab:'users'},
    {label:'Properties',       value:stats?.properties,  icon:'⬡',color:C.info,    tab:'properties'},
    {label:'Bonds',            value:stats?.bonds,       icon:'◆',color:C.success, tab:'bonds'},
    {label:'Inspections',      value:stats?.inspections, icon:'◎',color:C.warning, tab:'inspections'},
    {label:'Documents',        value:stats?.documents,   icon:'◧',color:'#e879f9', tab:'documents'},
  ];

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:14,marginBottom:24}}>
        {CARDS.map(s=>(
          <div key={s.label} onClick={()=>s.tab&&onTabChange(s.tab)}
            style={{...glassStyle,padding:'20px',display:'flex',alignItems:'center',gap:14,cursor:s.tab?'pointer':'default',transition:'transform .2s,box-shadow .2s'}}
            onMouseEnter={e=>{if(s.tab){e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow=`0 12px 28px ${s.color}33`;}}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
            <div style={{width:46,height:46,borderRadius:13,background:`${s.color}20`,border:`1px solid ${s.color}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{s.icon}</div>
            <div>
              <div style={{fontSize:26,fontWeight:800,color:C.text,lineHeight:1}}>{s.value??'—'}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:4}}>{s.label}{s.tab&&<span style={{color:s.color,marginLeft:4,fontSize:10}}>↗</span>}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div style={{...glassStyle,padding:24}}>
          <h3 style={{color:C.text,margin:'0 0 16px',fontWeight:600,fontSize:14}}>User Registrations — Last 30 Days</h3>
          <MiniBar data={chartData}/>
          <div style={{display:'flex',justifyContent:'space-between',color:C.muted,fontSize:11,marginTop:6}}>
            <span>{chartData[0]?.label}</span><span>{chartData[chartData.length-1]?.label}</span>
          </div>
        </div>
        <div style={{...glassStyle,padding:24}}>
          <h3 style={{color:C.text,margin:'0 0 14px',fontWeight:600,fontSize:14}}>Recent Activity</h3>
          {!recent?.length?<p style={{color:C.muted,fontSize:13}}>No recent activity.</p>:(
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {recent.slice(0,5).map((log,i)=>(
                <div key={i} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'9px 12px',borderRadius:10,background:C.glassLight,border:`1px solid ${C.border}`}}>
                  <Badge label={log.action_type||log.action}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{color:C.text,fontSize:12,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{log.description||'—'}</div>
                    <div style={{color:C.muted,fontSize:11,marginTop:2}}>{log.email||'System'} · {fmtDT(log.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── UsersTab ──────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users,setUsers]=useState([]); const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState(''); const [role,setRole]=useState('All');
  const [page,setPage]=useState(1); const [total,setTotal]=useState(0);
  const [editModal,setEditModal]=useState(null); const [pwModal,setPwModal]=useState(null);
  const [confirm,setConfirm]=useState(null); const [saving,setSaving]=useState(false);
  const [newPw,setNewPw]=useState('');
  const LIMIT=15;

  const load=useCallback(async()=>{
    setLoading(true);
    try {
      const params={page,limit:LIMIT,search};
      if(role!=='All')params.role=role.toLowerCase();
      const r=await API.get('/admin/users',{params});
      setUsers(r.data.users||r.data);setTotal(r.data.total||(r.data.users||r.data).length);
    } catch{toast.error('Failed to load users');setUsers([]);}
    finally{setLoading(false);}
  },[page,search,role]);

  useEffect(()=>{setPage(1);},[search,role]);
  useEffect(()=>{load();},[load]);

  const handleSave=async()=>{
    setSaving(true);
    try{await API.put(`/admin/users/${editModal.user_id}`,editModal);toast.success('User updated');setEditModal(null);load();}
    catch(err){toast.error(err.response?.data?.error||'Failed');}
    finally{setSaving(false);}
  };

  const handleResetPw=async()=>{
    if(!newPw)return;setSaving(true);
    try{await API.put(`/admin/users/${pwModal.user_id}/reset-password`,{password:newPw});toast.success('Password reset');setPwModal(null);setNewPw('');}
    catch(err){toast.error(err.response?.data?.error||'Failed');}
    finally{setSaving(false);}
  };

  const handleDelete=async id=>{
    try{await API.delete(`/admin/users/${id}`);toast.success('User deleted');load();}
    catch{toast.error('Failed to delete');}
    finally{setConfirm(null);}
  };

  return (
    <div style={{...glassStyle,padding:24}}>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:20,alignItems:'center'}}>
        <h2 style={{margin:0,color:C.text,fontSize:17,fontWeight:700,flex:'none'}}>Users</h2>
        <input placeholder="Search name or email…" value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,flex:1,minWidth:160}}/>
        <select value={role} onChange={e=>setRole(e.target.value)} style={{...inp,width:'auto',cursor:'pointer'}}>
          {['All','User','Admin'].map(o=><option key={o} style={{background:'#1a1a2e'}}>{o}</option>)}
        </select>
        <Btn color={C.info} onClick={()=>exportCSV(users,'users.csv')}>⬇ CSV</Btn>
      </div>

      {loading?<Spinner/>:(
        <>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,color:C.text}}>
              <thead><tr style={{borderBottom:`1px solid ${C.border}`}}>
                {['Name','Email','Phone','Role','Last Login','Actions'].map(h=><TH key={h}>{h}</TH>)}
              </tr></thead>
              <tbody>
                {users.map(u=>(
                  <tr key={u.user_id} style={{borderBottom:`1px solid ${C.glassLight}`}}
                    onMouseEnter={e=>e.currentTarget.style.background=C.glassLight}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <td style={{padding:'10px 12px',fontWeight:500}}>{u.full_name||'—'}</td>
                    <td style={{padding:'10px 12px',color:C.muted}}>{u.email}</td>
                    <td style={{padding:'10px 12px',color:C.muted}}>{u.phone||'—'}</td>
                    <td style={{padding:'10px 12px'}}><Badge label={u.role}/></td>
                    <td style={{padding:'10px 12px',color:C.muted}}>{fmtDate(u.last_login)}</td>
                    <td style={{padding:'10px 12px'}}>
                      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                        <Btn small onClick={()=>setEditModal({...u})}>Edit</Btn>
                        <Btn small color={C.warning} onClick={()=>{setPwModal(u);setNewPw('');}}>Reset PW</Btn>
                        <Btn small danger onClick={()=>setConfirm(u.user_id)}>Delete</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
                {!users.length&&<tr><td colSpan={6} style={{padding:32,textAlign:'center',color:C.muted}}>No users found.</td></tr>}
              </tbody>
            </table>
          </div>
          <Pages page={page} total={total} limit={LIMIT} onPage={setPage}/>
        </>
      )}

      {editModal&&(
        <Modal title="Edit User" onClose={()=>setEditModal(null)}>
          <FF label="Full Name"><input value={editModal.full_name||''} onChange={e=>setEditModal(p=>({...p,full_name:e.target.value}))} style={inp}/></FF>
          <FF label="Email"><input type="email" value={editModal.email||''} onChange={e=>setEditModal(p=>({...p,email:e.target.value}))} style={inp}/></FF>
          <FF label="Phone"><input value={editModal.phone||''} onChange={e=>setEditModal(p=>({...p,phone:e.target.value}))} style={inp}/></FF>
          <FF label="Role">
            <select value={editModal.role||'user'} onChange={e=>setEditModal(p=>({...p,role:e.target.value}))} style={{...inp,cursor:'pointer'}}>
              <option value="user" style={{background:'#1a1a2e'}}>User</option>
              <option value="admin" style={{background:'#1a1a2e'}}>Admin</option>
            </select>
          </FF>
          <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
            <Btn onClick={()=>setEditModal(null)}>Cancel</Btn>
            <Btn color={C.success} onClick={handleSave} disabled={saving}>{saving?'Saving…':'Save'}</Btn>
          </div>
        </Modal>
      )}

      {pwModal&&(
        <Modal title={`Reset Password — ${pwModal.full_name}`} onClose={()=>setPwModal(null)}>
          <FF label="New Password"><input type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} style={inp} placeholder="Enter new password…"/></FF>
          <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
            <Btn onClick={()=>setPwModal(null)}>Cancel</Btn>
            <Btn color={C.warning} onClick={handleResetPw} disabled={saving||!newPw}>{saving?'Resetting…':'Reset Password'}</Btn>
          </div>
        </Modal>
      )}

      {confirm&&<Confirm msg="Permanently delete this user and all their data?" onConfirm={()=>handleDelete(confirm)} onCancel={()=>setConfirm(null)}/>}
    </div>
  );
}

// ── PropertiesTab ─────────────────────────────────────────────────────────────
function PropertiesTab() {
  const [items,setItems]=useState([]); const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState(''); const [page,setPage]=useState(1); const [total,setTotal]=useState(0);
  const [detail,setDetail]=useState(null); const [confirm,setConfirm]=useState(null);
  const LIMIT=15;

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const r=await API.get('/admin/properties',{params:{page,limit:LIMIT,search}});
      setItems(r.data.properties||r.data);setTotal(r.data.total||(r.data.properties||r.data).length);
    }catch{toast.error('Failed to load properties');}
    finally{setLoading(false);}
  },[page,search]);

  useEffect(()=>{setPage(1);},[search]);
  useEffect(()=>{load();},[load]);

  const handleDelete=async id=>{
    try{await API.delete(`/admin/properties/${id}`);toast.success('Deleted');load();}
    catch{toast.error('Failed to delete');}
    finally{setConfirm(null);}
  };

  return (
    <div style={{...glassStyle,padding:24}}>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:20,alignItems:'center'}}>
        <h2 style={{margin:0,color:C.text,fontSize:17,fontWeight:700}}>Properties</h2>
        <input placeholder="Search address or owner…" value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,flex:1,minWidth:160}}/>
        <Btn color={C.info} onClick={()=>exportCSV(items,'properties.csv')}>⬇ CSV</Btn>
      </div>
      {loading?<Spinner/>:(
        <>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,color:C.text}}>
              <thead><tr style={{borderBottom:`1px solid ${C.border}`}}>
                {['Address','Owner','Agent','Current','Lease End','Actions'].map(h=><TH key={h}>{h}</TH>)}
              </tr></thead>
              <tbody>
                {items.map(p=>(
                  <tr key={p.property_id} style={{borderBottom:`1px solid ${C.glassLight}`}}
                    onMouseEnter={e=>e.currentTarget.style.background=C.glassLight}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <td style={{padding:'10px 12px',fontWeight:500}}>{p.address}</td>
                    <td style={{padding:'10px 12px',color:C.muted}}>{p.owner_name||'—'}</td>
                    <td style={{padding:'10px 12px',color:C.muted}}>{p.agent_name||'—'}</td>
                    <td style={{padding:'10px 12px'}}>{p.is_current?<Badge label="Yes"/>:<span style={{color:C.muted}}>No</span>}</td>
                    <td style={{padding:'10px 12px',color:C.muted}}>{fmtDate(p.lease_end||p.lease_end_date)}</td>
                    <td style={{padding:'10px 12px'}}>
                      <div style={{display:'flex',gap:6}}>
                        <Btn small onClick={()=>setDetail(p)}>Details</Btn>
                        <Btn small danger onClick={()=>setConfirm(p.property_id)}>Delete</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
                {!items.length&&<tr><td colSpan={6} style={{padding:32,textAlign:'center',color:C.muted}}>No properties found.</td></tr>}
              </tbody>
            </table>
          </div>
          <Pages page={page} total={total} limit={LIMIT} onPage={setPage}/>
        </>
      )}
      {detail&&(
        <Modal title="Property Details" onClose={()=>setDetail(null)}>
          {Object.entries(detail).map(([k,v])=>v!==null&&v!==undefined&&(
            <div key={k} style={{display:'flex',borderBottom:`1px solid ${C.glassLight}`,padding:'7px 0'}}>
              <span style={{width:140,color:C.muted,fontSize:11,fontWeight:600,textTransform:'uppercase',flexShrink:0}}>{k.replace(/_/g,' ')}</span>
              <span style={{color:C.text,fontSize:13}}>{String(v)}</span>
            </div>
          ))}
        </Modal>
      )}
      {confirm&&<Confirm msg="Delete this property? Associated bonds and inspections may be affected." onConfirm={()=>handleDelete(confirm)} onCancel={()=>setConfirm(null)}/>}
    </div>
  );
}

// ── BondsTab ──────────────────────────────────────────────────────────────────
function BondsTab() {
  const [bonds,setBonds]=useState([]); const [loading,setLoading]=useState(true);
  const [statusFilter,setStatusFilter]=useState('All'); const [page,setPage]=useState(1); const [total,setTotal]=useState(0);
  const [refundModal,setRefundModal]=useState(null); const [saving,setSaving]=useState(false);
  const [refundAmount,setRefundAmount]=useState(''); const [refundDate,setRefundDate]=useState('');
  const LIMIT=15;

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const params={page,limit:LIMIT};
      if(statusFilter!=='All')params.status=statusFilter;
      const r=await API.get('/admin/bonds',{params});
      setBonds(r.data.bonds||r.data);setTotal(r.data.total||(r.data.bonds||r.data).length);
    }catch{toast.error('Failed to load bonds');}
    finally{setLoading(false);}
  },[page,statusFilter]);

  useEffect(()=>{setPage(1);},[statusFilter]);
  useEffect(()=>{load();},[load]);

  const handleStatus=async(id,status)=>{
    try{await API.put(`/admin/bonds/${id}/status`,{status});toast.success('Status updated');load();}
    catch{toast.error('Failed to update status');}
  };

  const handleRefund=async()=>{
    setSaving(true);
    try{await API.post(`/admin/bonds/${refundModal.bond_id}/refund`,{amount:refundAmount,date:refundDate});toast.success('Refund processed');setRefundModal(null);load();}
    catch(err){toast.error(err.response?.data?.error||'Failed');}
    finally{setSaving(false);}
  };

  return (
    <div style={{...glassStyle,padding:24}}>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:20,alignItems:'center'}}>
        <h2 style={{margin:0,color:C.text,fontSize:17,fontWeight:700}}>Bonds</h2>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{...inp,width:'auto',cursor:'pointer'}}>
          {['All','Paid','Pending','Refunded'].map(o=><option key={o} style={{background:'#1a1a2e'}}>{o}</option>)}
        </select>
        <Btn color={C.info} onClick={()=>exportCSV(bonds,'bonds.csv')}>⬇ CSV</Btn>
      </div>
      {loading?<Spinner/>:(
        <>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,color:C.text}}>
              <thead><tr style={{borderBottom:`1px solid ${C.border}`}}>
                {['Property','Tenant','Amount','Status','Paid Date','Actions'].map(h=><TH key={h}>{h}</TH>)}
              </tr></thead>
              <tbody>
                {bonds.map(b=>(
                  <tr key={b.bond_id} style={{borderBottom:`1px solid ${C.glassLight}`}}
                    onMouseEnter={e=>e.currentTarget.style.background=C.glassLight}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <td style={{padding:'10px 12px',fontWeight:500}}>{b.address||`#${b.property_id}`}</td>
                    <td style={{padding:'10px 12px',color:C.muted}}>{b.tenant_name||'—'}</td>
                    <td style={{padding:'10px 12px'}}>{b.amount?`$${Number(b.amount).toFixed(2)}`:'—'}</td>
                    <td style={{padding:'10px 12px'}}><Badge label={b.status}/></td>
                    <td style={{padding:'10px 12px',color:C.muted}}>{fmtDate(b.payment_date)}</td>
                    <td style={{padding:'10px 12px'}}>
                      <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
                        <select value={(b.status||'pending').toLowerCase()} onChange={e=>handleStatus(b.bond_id,e.target.value)}
                          style={{...inp,width:'auto',fontSize:12,padding:'4px 8px',cursor:'pointer'}}>
                          {['pending','paid','refunded'].map(s=><option key={s} style={{background:'#1a1a2e'}}>{s}</option>)}
                        </select>
                        <Btn small color={C.info} onClick={()=>{setRefundModal(b);setRefundAmount('');setRefundDate('');}}>Refund</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
                {!bonds.length&&<tr><td colSpan={6} style={{padding:32,textAlign:'center',color:C.muted}}>No bonds found.</td></tr>}
              </tbody>
            </table>
          </div>
          <Pages page={page} total={total} limit={LIMIT} onPage={setPage}/>
        </>
      )}
      {refundModal&&(
        <Modal title={`Refund — Bond #${refundModal.bond_id}`} onClose={()=>setRefundModal(null)}>
          <p style={{color:C.muted,fontSize:13}}>Property: {refundModal.address}<br/>Amount: ${Number(refundModal.amount||0).toFixed(2)}</p>
          <FF label="Refund Amount ($)"><input type="number" step="0.01" value={refundAmount} onChange={e=>setRefundAmount(e.target.value)} style={inp}/></FF>
          <FF label="Refund Date"><input type="date" value={refundDate} onChange={e=>setRefundDate(e.target.value)} style={inp}/></FF>
          <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
            <Btn onClick={()=>setRefundModal(null)}>Cancel</Btn>
            <Btn color={C.success} onClick={handleRefund} disabled={saving||!refundAmount}>{saving?'Processing…':'Process Refund'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── DocumentsTab ──────────────────────────────────────────────────────────────
function DocumentsTab() {
  const [items,setItems]=useState([]); const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState(''); const [page,setPage]=useState(1); const [total,setTotal]=useState(0);
  const [confirm,setConfirm]=useState(null);
  const LIMIT=15;

  const fmtSize=b=>!b?'—':b<1024?`${b} B`:b<1048576?`${(b/1024).toFixed(1)} KB`:`${(b/1048576).toFixed(1)} MB`;

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const r=await API.get('/admin/documents',{params:{page,limit:LIMIT,search}});
      setItems(r.data.documents||r.data);setTotal(r.data.total||(r.data.documents||r.data).length);
    }catch{toast.error('Failed to load documents');}
    finally{setLoading(false);}
  },[page,search]);

  useEffect(()=>{setPage(1);},[search]);
  useEffect(()=>{load();},[load]);

  const handleDelete=async id=>{
    try{await API.delete(`/admin/documents/${id}`);toast.success('Deleted');load();}
    catch{toast.error('Failed to delete');}
    finally{setConfirm(null);}
  };

  const handleDownload=doc=>{
    const a=document.createElement('a');
    a.href=`${API_BASE}/${(doc.file_path||'').replace(/\\/g,'/')}`;
    a.download=doc.title||'document';a.target='_blank';a.click();
  };

  return (
    <div style={{...glassStyle,padding:24}}>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:20,alignItems:'center'}}>
        <h2 style={{margin:0,color:C.text,fontSize:17,fontWeight:700}}>Documents</h2>
        <input placeholder="Search title or owner…" value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,flex:1,minWidth:160}}/>
        <Btn color={C.info} onClick={()=>exportCSV(items,'documents.csv')}>⬇ CSV</Btn>
      </div>
      {loading?<Spinner/>:(
        <>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,color:C.text}}>
              <thead><tr style={{borderBottom:`1px solid ${C.border}`}}>
                {['Title','Type','Owner','Size','Uploaded','Actions'].map(h=><TH key={h}>{h}</TH>)}
              </tr></thead>
              <tbody>
                {items.map(d=>(
                  <tr key={d.document_id} style={{borderBottom:`1px solid ${C.glassLight}`}}
                    onMouseEnter={e=>e.currentTarget.style.background=C.glassLight}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <td style={{padding:'10px 12px',fontWeight:500}}>{d.title||'Untitled'}</td>
                    <td style={{padding:'10px 12px',color:C.muted}}>{d.document_type||'—'}</td>
                    <td style={{padding:'10px 12px',color:C.muted}}>{d.owner_name||'—'}</td>
                    <td style={{padding:'10px 12px',color:C.muted}}>{fmtSize(d.file_size)}</td>
                    <td style={{padding:'10px 12px',color:C.muted}}>{fmtDate(d.uploaded_at||d.created_at)}</td>
                    <td style={{padding:'10px 12px'}}>
                      <div style={{display:'flex',gap:6}}>
                        <Btn small color={C.info} onClick={()=>handleDownload(d)}>⬇ Download</Btn>
                        <Btn small danger onClick={()=>setConfirm(d.document_id)}>Delete</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
                {!items.length&&<tr><td colSpan={6} style={{padding:32,textAlign:'center',color:C.muted}}>No documents found.</td></tr>}
              </tbody>
            </table>
          </div>
          <Pages page={page} total={total} limit={LIMIT} onPage={setPage}/>
        </>
      )}
      {confirm&&<Confirm msg="Permanently delete this document?" onConfirm={()=>handleDelete(confirm)} onCancel={()=>setConfirm(null)}/>}
    </div>
  );
}

// ── InspectionsTab ────────────────────────────────────────────────────────────
function InspectionsTab() {
  const [items,setItems]=useState([]); const [loading,setLoading]=useState(true);
  const [typeFilter,setTypeFilter]=useState('All'); const [page,setPage]=useState(1); const [total,setTotal]=useState(0);
  const [report,setReport]=useState(null); const [lightbox,setLightbox]=useState(null);
  const LIMIT=15;

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const params={page,limit:LIMIT};
      if(typeFilter!=='All')params.type=typeFilter;
      const r=await API.get('/admin/inspections',{params});
      setItems(r.data.inspections||r.data);setTotal(r.data.total||(r.data.inspections||r.data).length);
    }catch{toast.error('Failed to load inspections');}
    finally{setLoading(false);}
  },[page,typeFilter]);

  useEffect(()=>{setPage(1);},[typeFilter]);
  useEffect(()=>{load();},[load]);

  const imgUrl=p=>p?`${API_BASE}/${p.replace(/\\/g,'/')}`:null;

  return (
    <div style={{...glassStyle,padding:24}}>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:20,alignItems:'center'}}>
        <h2 style={{margin:0,color:C.text,fontSize:17,fontWeight:700}}>Inspections</h2>
        <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} style={{...inp,width:'auto',cursor:'pointer'}}>
          {['All','Entry','Routine','Exit'].map(o=><option key={o} style={{background:'#1a1a2e'}}>{o}</option>)}
        </select>
        <Btn color={C.info} onClick={()=>exportCSV(items,'inspections.csv')}>⬇ CSV</Btn>
      </div>
      {loading?<Spinner/>:(
        <>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,color:C.text}}>
              <thead><tr style={{borderBottom:`1px solid ${C.border}`}}>
                {['Photo','Property','Tenant','Type','Date','Rating','Actions'].map(h=><TH key={h}>{h}</TH>)}
              </tr></thead>
              <tbody>
                {items.map(ins=>{
                  const url=imgUrl(ins.photo_path);
                  return (
                    <tr key={ins.inspection_id} style={{borderBottom:`1px solid ${C.glassLight}`}}
                      onMouseEnter={e=>e.currentTarget.style.background=C.glassLight}
                      onMouseLeave={e=>e.currentTarget.style.background=''}>
                      <td style={{padding:'10px 12px'}}>
                        {url?<img src={url} alt="" onClick={()=>setLightbox(url)} style={{width:40,height:40,objectFit:'cover',borderRadius:8,cursor:'zoom-in',border:`1px solid ${C.border}`}} onError={e=>e.target.style.display='none'}/>:<span style={{color:C.muted,fontSize:11}}>None</span>}
                      </td>
                      <td style={{padding:'10px 12px',fontWeight:500}}>{ins.address||`#${ins.property_id}`}</td>
                      <td style={{padding:'10px 12px',color:C.muted}}>{ins.tenant_name||'—'}</td>
                      <td style={{padding:'10px 12px'}}><Badge label={ins.inspection_type}/></td>
                      <td style={{padding:'10px 12px',color:C.muted}}>{fmtDate(ins.inspection_date)}</td>
                      <td style={{padding:'10px 12px',color:C.warning}}>{ins.overall_rating?'★'.repeat(ins.overall_rating)+'☆'.repeat(5-ins.overall_rating):'—'}</td>
                      <td style={{padding:'10px 12px'}}><Btn small onClick={()=>setReport(ins)}>Report</Btn></td>
                    </tr>
                  );
                })}
                {!items.length&&<tr><td colSpan={7} style={{padding:32,textAlign:'center',color:C.muted}}>No inspections found.</td></tr>}
              </tbody>
            </table>
          </div>
          <Pages page={page} total={total} limit={LIMIT} onPage={setPage}/>
        </>
      )}
      {report&&(
        <Modal title="Inspection Report" onClose={()=>setReport(null)}>
          {imgUrl(report.photo_path)&&<img src={imgUrl(report.photo_path)} alt="" onClick={()=>setLightbox(imgUrl(report.photo_path))} style={{width:'100%',borderRadius:10,marginBottom:16,cursor:'zoom-in',border:`1px solid ${C.border}`}}/>}
          {[['Property',report.address],['Tenant',report.tenant_name],['Type',report.inspection_type],['Date',fmtDate(report.inspection_date)],['Rating',report.overall_rating?`${report.overall_rating}/5`:'—'],['Notes',report.condition_notes]].filter(([,v])=>v).map(([k,v])=>(
            <div key={k} style={{display:'flex',borderBottom:`1px solid ${C.glassLight}`,padding:'7px 0'}}>
              <span style={{width:90,color:C.muted,fontSize:11,fontWeight:600,textTransform:'uppercase',flexShrink:0}}>{k}</span>
              <span style={{color:C.text,fontSize:13,whiteSpace:'pre-wrap'}}>{v}</span>
            </div>
          ))}
        </Modal>
      )}
      {lightbox&&<div onClick={()=>setLightbox(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.9)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:99999,cursor:'zoom-out'}}><img src={lightbox} alt="" style={{maxWidth:'90vw',maxHeight:'85vh',borderRadius:12}}/></div>}
    </div>
  );
}

// ── AuditTab ──────────────────────────────────────────────────────────────────
function AuditTab() {
  const [logs,setLogs]=useState([]); const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState(''); const [action,setAction]=useState('All');
  const [page,setPage]=useState(1); const [total,setTotal]=useState(0);
  const LIMIT=20;

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const params={page,limit:LIMIT,search};
      if(action!=='All')params.action=action;
      const r=await API.get('/admin/audit',{params});
      setLogs(r.data.logs||r.data);setTotal(r.data.total||(r.data.logs||r.data).length);
    }catch{toast.error('Failed to load audit logs');}
    finally{setLoading(false);}
  },[page,search,action]);

  useEffect(()=>{setPage(1);},[search,action]);
  useEffect(()=>{load();},[load]);

  const handleExport=async()=>{
    try{
      const r=await API.get('/admin/audit',{params:{export:'csv',search,action:action!=='All'?action:undefined}});
      exportCSV(r.data.logs||r.data,'audit_logs.csv');
    }catch{toast.error('Export failed');}
  };

  return (
    <div style={{...glassStyle,padding:24}}>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:20,alignItems:'center'}}>
        <h2 style={{margin:0,color:C.text,fontSize:17,fontWeight:700}}>Audit Logs</h2>
        <input placeholder="Search email or description…" value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,flex:1,minWidth:160}}/>
        <select value={action} onChange={e=>setAction(e.target.value)} style={{...inp,width:'auto',cursor:'pointer'}}>
          {['All','CREATE','UPDATE','DELETE','LOGIN'].map(o=><option key={o} style={{background:'#1a1a2e'}}>{o}</option>)}
        </select>
        <Btn color={C.info} onClick={handleExport}>⬇ Export CSV</Btn>
      </div>
      {loading?<Spinner/>:(
        <>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,color:C.text}}>
              <thead><tr style={{borderBottom:`1px solid ${C.border}`}}>
                {['Timestamp','User','Action','Module','Description','IP'].map(h=><TH key={h}>{h}</TH>)}
              </tr></thead>
              <tbody>
                {logs.map((log,i)=>(
                  <tr key={i} style={{borderBottom:`1px solid ${C.glassLight}`}}
                    onMouseEnter={e=>e.currentTarget.style.background=C.glassLight}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <td style={{padding:'10px 12px',color:C.muted,whiteSpace:'nowrap'}}>{fmtDT(log.created_at)}</td>
                    <td style={{padding:'10px 12px'}}>{log.email||'—'}</td>
                    <td style={{padding:'10px 12px'}}><Badge label={log.action_type||log.action}/></td>
                    <td style={{padding:'10px 12px',color:C.muted}}>{log.module||'—'}</td>
                    <td style={{padding:'10px 12px',maxWidth:260,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={log.description}>{log.description||'—'}</td>
                    <td style={{padding:'10px 12px',color:C.muted,fontFamily:'monospace',fontSize:11}}>{log.ip_address||'—'}</td>
                  </tr>
                ))}
                {!logs.length&&<tr><td colSpan={6} style={{padding:32,textAlign:'center',color:C.muted}}>No audit logs found.</td></tr>}
              </tbody>
            </table>
          </div>
          <Pages page={page} total={total} limit={LIMIT} onPage={setPage}/>
        </>
      )}
    </div>
  );
}

// ── Main AdminDashboard ───────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate      = useNavigate();
  const location      = useLocation();
  const [activeTab,setActiveTab]     = useState(location.state?.tab||'overview');
  const [sidebarOpen,setSidebarOpen] = useState(true);
  const [stats,setStats]             = useState(null);
  const [recent,setRecent]           = useState([]);
  const adminUser = JSON.parse(localStorage.getItem('user')||'{}');

  useEffect(()=>{
    if(!adminUser.token||adminUser.role!=='admin'){navigate('/login');return;}
    API.get('/admin/stats').then(r=>{setStats(r.data.stats);setRecent(r.data.recentActivity||[]);}).catch(()=>{});
  },[]);

  useEffect(()=>{if(location.state?.tab)setActiveTab(location.state.tab);},[location.state]);

  const logout=()=>{localStorage.removeItem('user');navigate('/login');};
  const W=sidebarOpen?240:72;

  const renderTab=()=>{
    switch(activeTab){
      case 'overview':    return <OverviewTab stats={stats} recent={recent} onTabChange={setActiveTab}/>;
      case 'users':       return <UsersTab/>;
      case 'properties':  return <PropertiesTab/>;
      case 'bonds':       return <BondsTab/>;
      case 'inspections': return <InspectionsTab/>;
      case 'documents':   return <DocumentsTab/>;
      case 'audit':       return <AuditTab/>;
      default:            return null;
    }
  };

  return (
    <div style={{minHeight:'100vh',position:'relative',fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif"}}>
      <video autoPlay loop muted playsInline style={{position:'fixed',inset:0,width:'100%',height:'100%',objectFit:'cover',zIndex:0}}>
        <source src="/videos/background.mp4" type="video/mp4"/>
      </video>
      <div style={{position:'fixed',inset:0,background:'rgba(5,5,20,0.72)',zIndex:1}}/>

      <div style={{display:'flex',minHeight:'100vh',position:'relative',zIndex:10}}>
        {/* sidebar */}
        <aside style={{position:'fixed',top:0,left:0,height:'100vh',width:W,background:'rgba(10,10,28,0.88)',backdropFilter:'blur(20px)',borderRight:`1px solid ${C.border}`,display:'flex',flexDirection:'column',transition:'width 0.3s cubic-bezier(.4,0,.2,1)',zIndex:100,overflow:'hidden'}}>
          <div style={{padding:'20px 14px',display:'flex',alignItems:'center',gap:10,borderBottom:`1px solid ${C.border}`,minHeight:68}}>
            <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${C.accent},#4f46e5)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>👑</div>
            {sidebarOpen&&<span style={{fontWeight:700,fontSize:14,color:C.text,whiteSpace:'nowrap'}}>Admin Panel</span>}
            <button onClick={()=>setSidebarOpen(o=>!o)} style={{marginLeft:'auto',background:'none',border:`1px solid ${C.border}`,color:C.muted,width:26,height:26,borderRadius:6,cursor:'pointer',fontSize:12,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>{sidebarOpen?'‹':'›'}</button>
          </div>

          <nav style={{flex:1,padding:'14px 10px',display:'flex',flexDirection:'column',gap:4}}>
            {NAV.map(item=>{
              const active=activeTab===item.id;
              return (
                <button key={item.id} onClick={()=>setActiveTab(item.id)}
                  style={{display:'flex',alignItems:'center',gap:12,padding:'11px 13px',borderRadius:12,background:active?`linear-gradient(135deg,${C.accentGlow},rgba(79,70,229,.2))`:'none',border:active?`1px solid ${C.accent}44`:'1px solid transparent',color:active?C.text:C.muted,cursor:'pointer',fontSize:14,fontWeight:active?600:400,width:'100%',textAlign:'left'}}>
                  <span style={{fontSize:17,flexShrink:0,width:20,textAlign:'center'}}>{item.icon}</span>
                  {sidebarOpen&&<span style={{whiteSpace:'nowrap'}}>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          <div style={{padding:'0 10px 16px'}}>
            {sidebarOpen&&(
              <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,marginBottom:8,background:C.glassLight}}>
                <div style={{width:30,height:30,borderRadius:8,background:`linear-gradient(135deg,${C.accent},#4f46e5)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'white',flexShrink:0}}>{(adminUser.full_name||'A')[0].toUpperCase()}</div>
                <div style={{minWidth:0}}>
                  <div style={{color:C.text,fontSize:12,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{adminUser.full_name||'Admin'}</div>
                  <div style={{color:C.muted,fontSize:11}}>Administrator</div>
                </div>
              </div>
            )}
            <button onClick={logout} style={{display:'flex',alignItems:'center',gap:12,width:'100%',padding:'10px 13px',borderRadius:10,background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.25)',color:'#f87171',cursor:'pointer',fontSize:13,fontWeight:600}}>
              <span style={{fontSize:16,flexShrink:0,width:20,textAlign:'center'}}>⏻</span>
              {sidebarOpen&&'Logout'}
            </button>
          </div>
        </aside>

        {/* main */}
        <main style={{flex:1,marginLeft:W,transition:'margin-left 0.3s',padding:'28px 28px 48px',minWidth:0}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
            <div>
              <h1 style={{margin:0,fontSize:24,fontWeight:800,color:C.text}}>{NAV.find(n=>n.id===activeTab)?.label}</h1>
              <p style={{margin:'4px 0 0',color:C.muted,fontSize:13}}>{new Date().toLocaleDateString('en-AU',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
            </div>
            <div style={{color:C.muted,fontSize:13,display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${C.accent},#4f46e5)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'white'}}>{(adminUser.full_name||'A')[0].toUpperCase()}</div>
              <span>{adminUser.full_name||adminUser.email}</span>
            </div>
          </div>
          {renderTab()}
        </main>
      </div>
    </div>
  );
}