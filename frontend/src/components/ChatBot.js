// frontend/src/components/ChatBot.js
import React, { useState, useRef, useEffect } from 'react';

const SUPPORT_PHONE = '0426 465 416';

const RULES = [
  { patterns:['hello','hi','hey','g\'day'], reply:'G\'day! I\'m the Rental Bond Tracker assistant. How can I help you today?' },
  { patterns:['bond','lodg','deposit'], reply:'A rental bond is a security deposit paid at the start of a tenancy. In Victoria it\'s typically held by the RTBA. You can record and track your bonds in the Bonds section.' },
  { patterns:['inspection','routine','entry','exit'], reply:'You can log rental inspections (Entry, Routine, or Exit) in the Inspections section. Each inspection can include notes, a rating, and a photo.' },
  { patterns:['property','address','lease'], reply:'Add your rental properties in the Properties section. You can store landlord details, agent contacts, and lease dates.' },
  { patterns:['document','upload','pdf','file'], reply:'Upload and organise your rental documents (leases, receipts, notices) in the Documents section. Supported formats: PDF, Word, Excel, and images.' },
  { patterns:['password','login','account','forgot'], reply:'You can change your password in the Profile section. If you\'ve forgotten it, use the Forgot Password link on the login page.' },
  { patterns:['mfa','two factor','authenticator','2fa','qr'], reply:'MFA (Two-Factor Authentication) is required for all accounts and helps keep your data secure. Use any TOTP app (Google Authenticator, Authy). Backup codes are shown during registration — save them!' },
  { patterns:['backup code','recovery code'], reply:'Backup codes let you log in if you lose your authenticator app. You can view and regenerate them from your Profile page.' },
  { patterns:['delete','remove','cancel'], reply:'You can delete properties, bonds, inspections, and documents from their respective pages. To delete your account, go to Profile → Danger Zone.' },
  { patterns:['admin','dashboard'], reply:'The admin dashboard is only accessible to admin-role accounts. It provides an overview of all users, properties, bonds, inspections, and audit logs.' },
  { patterns:['status','paid','pending','refund'], reply:'Bond statuses: Pending (waiting for confirmation), Paid (bond lodged), Refunded (bond returned at end of tenancy). You can update status in the Bonds section.' },
  { patterns:['thank','thanks','cheers'], reply:'You\'re welcome! Is there anything else I can help you with?' },
  { patterns:['bye','goodbye','see ya'], reply:'Goodbye! Feel free to chat again if you need help. Take care! 👋' },
  { patterns:['help','what can','feature'], reply:'I can help with: 🏘️ Properties · 💰 Bonds · 📋 Inspections · 📄 Documents · 🔐 MFA/Security · 👤 Profile & account. What would you like to know?' },
];

const match = (input) => {
  const low = input.toLowerCase();
  for (const rule of RULES) {
    if (rule.patterns.some(p => low.includes(p))) return rule.reply;
  }
  return `I'm sorry, I couldn't understand that. Please contact support at ${SUPPORT_PHONE} for further assistance.`;
};

export default function ChatBot() {
  const [open,setOpen]       = useState(false);
  const [msgs,setMsgs]       = useState([{ from:'bot', text:'Hello! I\'m your Rental Bond Tracker assistant. How can I help you today? 😊' }]);
  const [input,setInput]     = useState('');
  const [typing,setTyping]   = useState(false);
  const endRef               = useRef(null);

  useEffect(() => { if (open) endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs, open]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setMsgs(m => [...m, { from:'user', text }]);
    setInput('');
    setTyping(true);
    await new Promise(r => setTimeout(r, 600 + Math.random()*400));
    setTyping(false);
    setMsgs(m => [...m, { from:'bot', text: match(text) }]);
  };

  const clear = () => setMsgs([{ from:'bot', text:'Conversation cleared. How can I help you?' }]);

  return (
    <>
      {/* toggle button */}
      <button onClick={()=>setOpen(o=>!o)} style={{position:'fixed',bottom:24,right:24,width:58,height:58,borderRadius:'50%',background:'linear-gradient(135deg,#667eea,#764ba2)',border:'none',color:'white',fontSize:26,cursor:'pointer',zIndex:1000,boxShadow:'0 6px 24px rgba(102,126,234,0.5)',display:'flex',alignItems:'center',justifyContent:'center',transition:'transform 0.2s'}}
        onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'}
        onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
        {open?'✕':'💬'}
      </button>

      {open && (
        <div style={{position:'fixed',bottom:96,right:24,width:340,height:480,background:'rgba(15,15,35,0.95)',backdropFilter:'blur(20px)',borderRadius:24,border:'1px solid rgba(255,255,255,0.15)',display:'flex',flexDirection:'column',zIndex:999,boxShadow:'0 24px 64px rgba(0,0,0,0.5)',overflow:'hidden'}}>
          {/* header */}
          <div style={{padding:'16px 20px',background:'linear-gradient(135deg,rgba(102,126,234,0.3),rgba(118,75,162,0.2))',borderBottom:'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:38,height:38,borderRadius:12,background:'linear-gradient(135deg,#667eea,#764ba2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>🤖</div>
            <div style={{flex:1}}>
              <p style={{color:'white',fontWeight:700,margin:0,fontSize:14}}>Bond Tracker Assistant</p>
              <p style={{color:'rgba(16,185,129,0.9)',margin:0,fontSize:11,display:'flex',alignItems:'center',gap:4}}><span style={{width:6,height:6,borderRadius:'50%',background:'#10b981',display:'inline-block'}}/>Online</p>
            </div>
            <button onClick={clear} title="Clear conversation" style={{background:'rgba(255,255,255,0.1)',border:'none',color:'rgba(255,255,255,0.6)',padding:'5px 10px',borderRadius:8,cursor:'pointer',fontSize:12}}>Clear</button>
          </div>

          {/* messages */}
          <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:10}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:'flex',justifyContent:m.from==='user'?'flex-end':'flex-start'}}>
                <div style={{maxWidth:'82%',padding:'10px 14px',borderRadius:m.from==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px',background:m.from==='user'?'linear-gradient(135deg,#667eea,#764ba2)':'rgba(255,255,255,0.1)',color:'white',fontSize:13,lineHeight:1.5,border:m.from==='bot'?'1px solid rgba(255,255,255,0.08)':'none'}}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div style={{display:'flex',justifyContent:'flex-start'}}>
                <div style={{padding:'12px 16px',borderRadius:'18px 18px 18px 4px',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',gap:4,alignItems:'center'}}>
                  {[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:'50%',background:'rgba(255,255,255,0.5)',animation:`bounce 1s ${i*0.2}s infinite`}}/>)}
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* suggestions */}
          <div style={{padding:'0 12px 8px',display:'flex',gap:6,flexWrap:'wrap'}}>
            {['What is a bond?','How do I upload a photo?','MFA help'].map(s=>(
              <button key={s} onClick={()=>{setInput(s);}} style={{background:'rgba(102,126,234,0.2)',border:'1px solid rgba(102,126,234,0.35)',color:'#a5b4fc',padding:'5px 10px',borderRadius:20,fontSize:11,cursor:'pointer',whiteSpace:'nowrap'}}>{s}</button>
            ))}
          </div>

          {/* input */}
          <div style={{padding:'10px 14px 14px',borderTop:'1px solid rgba(255,255,255,0.1)',display:'flex',gap:8}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
              placeholder="Type a message…"
              style={{flex:1,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:12,padding:'10px 14px',color:'white',fontSize:13,outline:'none'}}/>
            <button onClick={send} disabled={!input.trim()} style={{width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#667eea,#764ba2)',border:'none',color:'white',cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',opacity:input.trim()?1:0.5}}>↑</button>
          </div>
          <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
        </div>
      )}
    </>
  );
}