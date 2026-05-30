// frontend/src/pages/Profile.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Layout from '../components/Layout';
import { toast } from '../components/Toast';

const glass = { background:'rgba(255,255,255,0.08)', backdropFilter:'blur(12px)', borderRadius:20, border:'1px solid rgba(255,255,255,0.15)' };
const inp   = { width:'100%', boxSizing:'border-box', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:12, padding:'11px 14px', color:'white', fontSize:14, outline:'none' };
const lbl   = { display:'block', color:'rgba(255,255,255,0.5)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 };

export default function Profile() {
  const navigate = useNavigate();
  const [profile,setProfile]       = useState({ full_name:'', phone:'', email:'', created_at:'' });
  const [loading,setLoading]       = useState(true);
  const [saving,setSaving]         = useState(false);
  const [pwForm,setPwForm]         = useState({ current:'', newPw:'', confirm:'' });
  const [backupCodes,setBackupCodes] = useState(null);
  const [newCodes,setNewCodes]     = useState(null);
  const [showDelete,setShowDelete] = useState(false);
  const [deletePass,setDeletePass] = useState('');
  const [deleting,setDeleting]     = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('user')) { navigate('/login'); return; }
    const u = JSON.parse(localStorage.getItem('user')||'{}');
    setProfile({ full_name:u.full_name||'', phone:u.phone||'', email:u.email||'', created_at:u.created_at||'' });
    setLoading(false);
  }, [navigate]);

  const handleUpdateProfile = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await API.put('/users/profile', { full_name:profile.full_name, phone:profile.phone });
      const stored = JSON.parse(localStorage.getItem('user')||'{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, full_name:profile.full_name, phone:profile.phone }));
      toast.success('Profile updated');
    } catch(err) { toast.error(err.response?.data?.error||'Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async e => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPw.length < 8) return toast.error('Password must be at least 8 characters');
    setSaving(true);
    try {
      await API.put('/users/change-password', { currentPassword:pwForm.current, newPassword:pwForm.newPw });
      setPwForm({ current:'', newPw:'', confirm:'' });
      toast.success('Password changed successfully');
    } catch(err) { toast.error(err.response?.data?.error||'Failed to change password'); }
    finally { setSaving(false); }
  };

  const loadBackupCodes = async () => {
    try {
      const res = await API.get('/auth/backup-codes');
      setBackupCodes(res.data.backup_codes||[]);
    } catch { toast.error('Failed to load backup codes'); }
  };

  const handleRegenerate = async () => {
    try {
      const res = await API.post('/auth/backup-codes/regenerate');
      setNewCodes(res.data.backup_codes);
      setBackupCodes(null);
      toast.success('New backup codes generated');
    } catch { toast.error('Failed to regenerate backup codes'); }
  };

  const handleDeleteAccount = async e => {
    e.preventDefault(); setDeleting(true);
    try {
      await API.delete('/auth/account', { data:{ password:deletePass } });
      localStorage.removeItem('user');
      navigate('/login');
    } catch(err) { toast.error(err.response?.data?.error||'Failed to delete account'); }
    finally { setDeleting(false); }
  };

  if (loading) return <Layout title="Profile" icon="👤"><div style={{color:'white',padding:40}}>Loading…</div></Layout>;

  return (
    <Layout title="Profile" icon="👤">
      <div style={{display:'flex',flexDirection:'column',gap:20,maxWidth:600}}>

        {/* avatar + meta */}
        <div style={{...glass,padding:24,display:'flex',alignItems:'center',gap:20}}>
          <div style={{width:72,height:72,borderRadius:20,background:'linear-gradient(135deg,rgba(102,126,234,0.6),rgba(118,75,162,0.6))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,border:'1px solid rgba(255,255,255,0.2)',flexShrink:0}}>
            {profile.full_name?.[0]?.toUpperCase()||'?'}
          </div>
          <div>
            <h2 style={{color:'white',margin:'0 0 4px',fontSize:20,fontWeight:700}}>{profile.full_name}</h2>
            <p style={{color:'rgba(255,255,255,0.5)',margin:'0 0 4px',fontSize:13}}>{profile.email}</p>
            {profile.created_at&&<p style={{color:'rgba(255,255,255,0.35)',margin:0,fontSize:12}}>Member since {new Date(profile.created_at).toLocaleDateString('en-AU',{month:'long',year:'numeric'})}</p>}
          </div>
        </div>

        {/* update profile */}
        <div style={{...glass,padding:24}}>
          <h3 style={{color:'white',margin:'0 0 18px',fontSize:16,fontWeight:700}}>✏️ Update Profile</h3>
          <form onSubmit={handleUpdateProfile} style={{display:'flex',flexDirection:'column',gap:14}}>
            <div><label style={lbl}>Full Name</label><input value={profile.full_name} onChange={e=>setProfile({...profile,full_name:e.target.value})} required style={inp}/></div>
            <div><label style={lbl}>Phone Number</label><input type="tel" value={profile.phone} onChange={e=>setProfile({...profile,phone:e.target.value})} style={inp}/></div>
            <div><label style={lbl}>Email (read-only)</label><input value={profile.email} disabled style={{...inp,opacity:0.5,cursor:'not-allowed'}}/></div>
            <button type="submit" disabled={saving} style={{background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',padding:13,border:'none',borderRadius:12,fontWeight:600,cursor:'pointer'}}>
              {saving?'Saving…':'Save Changes'}
            </button>
          </form>
        </div>

        {/* change password */}
        <div style={{...glass,padding:24}}>
          <h3 style={{color:'white',margin:'0 0 18px',fontSize:16,fontWeight:700}}>🔒 Change Password</h3>
          <form onSubmit={handleChangePassword} style={{display:'flex',flexDirection:'column',gap:14}}>
            <div><label style={lbl}>Current Password</label><input type="password" value={pwForm.current} onChange={e=>setPwForm({...pwForm,current:e.target.value})} required style={inp}/></div>
            <div><label style={lbl}>New Password</label><input type="password" value={pwForm.newPw} onChange={e=>setPwForm({...pwForm,newPw:e.target.value})} required minLength={8} style={inp}/></div>
            <div><label style={lbl}>Confirm New Password</label><input type="password" value={pwForm.confirm} onChange={e=>setPwForm({...pwForm,confirm:e.target.value})} required style={inp}/></div>
            <button type="submit" disabled={saving} style={{background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',padding:13,border:'none',borderRadius:12,fontWeight:600,cursor:'pointer'}}>
              {saving?'Changing…':'Change Password'}
            </button>
          </form>
        </div>

        {/* MFA / backup codes */}
        <div style={{...glass,padding:24}}>
          <h3 style={{color:'white',margin:'0 0 6px',fontSize:16,fontWeight:700}}>🔐 Two-Factor Authentication</h3>
          <p style={{color:'rgba(16,185,129,0.9)',margin:'0 0 16px',fontSize:13,display:'flex',alignItems:'center',gap:6}}><span>✓</span> MFA is enabled on your account</p>

          {newCodes && (
            <div style={{background:'rgba(0,0,0,0.35)',borderRadius:12,padding:16,marginBottom:16}}>
              <p style={{color:'#fbbf24',fontWeight:700,fontSize:13,margin:'0 0 10px'}}>⚠️ New backup codes — save these now, they won't be shown again:</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {newCodes.map((c,i)=><code key={i} style={{background:'rgba(255,255,255,0.1)',padding:'5px 10px',borderRadius:8,fontSize:13,color:'white',letterSpacing:2,fontFamily:'monospace'}}>{c}</code>)}
              </div>
              <button onClick={()=>setNewCodes(null)} style={{marginTop:12,background:'rgba(255,255,255,0.1)',color:'white',border:'1px solid rgba(255,255,255,0.2)',padding:'8px 16px',borderRadius:10,cursor:'pointer',fontSize:13}}>Dismiss</button>
            </div>
          )}

          {backupCodes && (
            <div style={{background:'rgba(0,0,0,0.25)',borderRadius:12,padding:16,marginBottom:16}}>
              <p style={{color:'rgba(255,255,255,0.6)',fontSize:13,margin:'0 0 10px'}}>Your backup codes ({backupCodes.filter(c=>!c.used).length} remaining):</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                {backupCodes.map((c,i)=>(
                  <div key={i} style={{background:'rgba(255,255,255,0.08)',padding:'5px 10px',borderRadius:8,fontSize:12,color:c.used?'rgba(255,255,255,0.3)':'white',textDecoration:c.used?'line-through':'none',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontFamily:'monospace',letterSpacing:1}}>•••• ••••</span>
                    {c.used&&<span style={{fontSize:10,color:'#ef4444'}}>Used</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            <button onClick={loadBackupCodes} style={{background:'rgba(102,126,234,0.2)',border:'1px solid rgba(102,126,234,0.4)',color:'#a5b4fc',padding:'10px 18px',borderRadius:12,cursor:'pointer',fontSize:13,fontWeight:600}}>
              View Backup Code Status
            </button>
            <button onClick={handleRegenerate} style={{background:'rgba(245,158,11,0.2)',border:'1px solid rgba(245,158,11,0.4)',color:'#fcd34d',padding:'10px 18px',borderRadius:12,cursor:'pointer',fontSize:13,fontWeight:600}}>
              Regenerate Backup Codes
            </button>
          </div>
        </div>

        {/* delete account */}
        <div style={{...glass,padding:24,border:'1px solid rgba(239,68,68,0.3)'}}>
          <h3 style={{color:'#f87171',margin:'0 0 8px',fontSize:16,fontWeight:700}}>⚠️ Danger Zone</h3>
          <p style={{color:'rgba(255,255,255,0.5)',fontSize:13,margin:'0 0 16px'}}>Permanently delete your account and all associated data. This action cannot be undone.</p>
          {!showDelete ? (
            <button onClick={()=>setShowDelete(true)} style={{background:'rgba(239,68,68,0.2)',border:'1px solid rgba(239,68,68,0.4)',color:'#f87171',padding:'10px 20px',borderRadius:12,cursor:'pointer',fontSize:13,fontWeight:600}}>
              Delete My Account
            </button>
          ) : (
            <form onSubmit={handleDeleteAccount} style={{display:'flex',flexDirection:'column',gap:14}}>
              <p style={{color:'#f87171',fontSize:13,margin:0}}>Enter your password to confirm deletion:</p>
              <input type="password" placeholder="Current password" value={deletePass} onChange={e=>setDeletePass(e.target.value)} required style={inp}/>
              <div style={{display:'flex',gap:12}}>
                <button type="submit" disabled={deleting} style={{flex:1,background:'rgba(239,68,68,0.3)',border:'1px solid rgba(239,68,68,0.5)',color:'#f87171',padding:12,borderRadius:12,cursor:'pointer',fontWeight:600}}>
                  {deleting?'Deleting…':'Confirm Delete'}
                </button>
                <button type="button" onClick={()=>setShowDelete(false)} style={{flex:1,background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',color:'white',padding:12,borderRadius:12,cursor:'pointer'}}>Cancel</button>
              </div>
            </form>
          )}
        </div>

      </div>
    </Layout>
  );
}