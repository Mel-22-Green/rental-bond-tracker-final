// frontend/src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import Layout from '../components/Layout';

const glass = { background:'rgba(255,255,255,0.08)', backdropFilter:'blur(12px)', borderRadius:20, border:'1px solid rgba(255,255,255,0.15)' };
const STAT_CONFIG = [
  { key:'properties',  label:'Properties',  icon:'🏘️', color:'#667eea', link:'/properties' },
  { key:'bondTotal',   label:'Total Bonds',  icon:'💰', color:'#10b981', link:'/bonds', prefix:'$' },
  { key:'inspections', label:'Inspections',  icon:'📋', color:'#f59e0b', link:'/inspections' },
  { key:'documents',   label:'Documents',    icon:'📄', color:'#8b5cf6', link:'/documents' },
];
const QUICK = [
  { label:'Add Property',   icon:'🏘️', link:'/properties', color:'#667eea' },
  { label:'Record Bond',    icon:'💰', link:'/bonds',       color:'#10b981' },
  { label:'Add Inspection', icon:'📋', link:'/inspections', color:'#f59e0b' },
  { label:'Upload Document',icon:'📄', link:'/documents',   color:'#8b5cf6' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats,setStats]             = useState(null);
  const [recentProps,setRecentProps] = useState([]);
  const [recentDocs,setRecentDocs]   = useState([]);
  const [loading,setLoading]         = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!localStorage.getItem('user')) { navigate('/login'); return; }
    (async () => {
      setLoading(true);
      try {
        const [p,b,i,d] = await Promise.all([API.get('/properties'),API.get('/bonds'),API.get('/inspections'),API.get('/documents')]);
        const props=p.data||[]; const bonds=b.data||[]; const docs=d.data||[];
        setStats({ properties:props.length, bondTotal:bonds.reduce((s,x)=>s+Number(x.amount||0),0).toFixed(2), inspections:(i.data||[]).length, documents:docs.length });
        setRecentProps(props.slice(0,3));
        setRecentDocs(docs.slice(0,3));
      } catch { setStats({properties:0,bondTotal:'0.00',inspections:0,documents:0}); }
      finally { setLoading(false); }
    })();
  }, [navigate]);

  const hr = new Date().getHours();
  const greet = hr<12?'Good morning':hr<17?'Good afternoon':'Good evening';

  return (
    <Layout>
      <div style={{marginBottom:32}}>
        <h1 style={{fontSize:30,fontWeight:800,color:'white',margin:'0 0 6px',textShadow:'0 2px 4px rgba(0,0,0,0.3)'}}>
          {greet}, {user.full_name?.split(' ')[0]||'there'} 👋
        </h1>
        <p style={{color:'rgba(255,255,255,0.55)',margin:0,fontSize:15}}>
          {new Date().toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
        </p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:16,marginBottom:32}}>
        {STAT_CONFIG.map(s=>(
          <Link key={s.key} to={s.link} style={{textDecoration:'none'}}>
            <div style={{...glass,padding:'22px 20px',cursor:'pointer',transition:'transform 0.2s,box-shadow 0.2s'}}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow=`0 12px 32px ${s.color}33`;}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
              <div style={{width:48,height:48,borderRadius:14,background:`${s.color}22`,border:`1px solid ${s.color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,marginBottom:14}}>{s.icon}</div>
              <div style={{fontSize:28,fontWeight:800,color:'white',lineHeight:1}}>{loading?'—':`${s.prefix||''}${stats?.[s.key]??'—'}`}</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.55)',marginTop:5}}>{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{...glass,padding:24,marginBottom:24}}>
        <h2 style={{color:'white',margin:'0 0 18px',fontSize:17,fontWeight:700}}>⚡ Quick Actions</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12}}>
          {QUICK.map(a=>(
            <Link key={a.label} to={a.link} style={{textDecoration:'none'}}>
              <div style={{background:`${a.color}15`,border:`1px solid ${a.color}35`,borderRadius:14,padding:'16px',textAlign:'center',cursor:'pointer',transition:'all 0.2s'}}
                onMouseEnter={e=>e.currentTarget.style.background=`${a.color}30`}
                onMouseLeave={e=>e.currentTarget.style.background=`${a.color}15`}>
                <div style={{fontSize:28,marginBottom:8}}>{a.icon}</div>
                <div style={{color:'white',fontSize:13,fontWeight:600}}>{a.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20}}>
        <div style={{...glass,padding:24}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <h2 style={{color:'white',margin:0,fontSize:16,fontWeight:700}}>🏘️ Recent Properties</h2>
            <Link to="/properties" style={{color:'rgba(255,255,255,0.5)',fontSize:13,textDecoration:'none'}}>View all →</Link>
          </div>
          {loading?<MiniSpinner/>:recentProps.length===0?<EmptyMini text="No properties yet" link="/properties" btnText="Add Property"/>:(
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {recentProps.map(p=>(
                <div key={p.property_id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',background:'rgba(255,255,255,0.05)',borderRadius:12}}>
                  <span style={{fontSize:22}}>{p.is_current?'🏡':'🏘️'}</span>
                  <div style={{minWidth:0}}>
                    <p style={{color:'white',margin:0,fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.address}</p>
                    <p style={{color:'rgba(255,255,255,0.45)',margin:0,fontSize:11}}>{p.landlord_name}</p>
                  </div>
                  {p.is_current&&<span style={{marginLeft:'auto',fontSize:10,background:'rgba(16,185,129,0.2)',border:'1px solid #10b98144',color:'#6ee7b7',padding:'2px 8px',borderRadius:20,flexShrink:0}}>Current</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{...glass,padding:24}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <h2 style={{color:'white',margin:0,fontSize:16,fontWeight:700}}>📄 Recent Documents</h2>
            <Link to="/documents" style={{color:'rgba(255,255,255,0.5)',fontSize:13,textDecoration:'none'}}>View all →</Link>
          </div>
          {loading?<MiniSpinner/>:recentDocs.length===0?<EmptyMini text="No documents yet" link="/documents" btnText="Upload Document"/>:(
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {recentDocs.map(d=>(
                <div key={d.document_id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',background:'rgba(255,255,255,0.05)',borderRadius:12}}>
                  <span style={{fontSize:22}}>📄</span>
                  <div style={{minWidth:0}}>
                    <p style={{color:'white',margin:0,fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.title||'Untitled'}</p>
                    <p style={{color:'rgba(255,255,255,0.45)',margin:0,fontSize:11}}>{d.document_type||'Document'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
function MiniSpinner(){return <div style={{display:'flex',justifyContent:'center',padding:20}}><div style={{width:24,height:24,border:'2px solid rgba(255,255,255,0.15)',borderTopColor:'#667eea',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;}
function EmptyMini({text,link,btnText}){return <div style={{textAlign:'center',padding:'20px 0'}}><p style={{color:'rgba(255,255,255,0.4)',fontSize:13,marginBottom:12}}>{text}</p><Link to={link} style={{background:'rgba(102,126,234,0.25)',border:'1px solid rgba(102,126,234,0.4)',color:'white',padding:'7px 16px',borderRadius:10,fontSize:12,fontWeight:600,textDecoration:'none'}}>{btnText}</Link></div>;}