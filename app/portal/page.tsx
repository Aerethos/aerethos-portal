'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function PortalLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError('Incorrect email or password. Check your details and try again.');
        setLoading(false);
        return;
      }
      router.push('/portal/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#001020',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position:'absolute',inset:0,opacity:0.04,pointerEvents:'none',backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}/>
      <div style={{ position:'absolute',top:'35%',left:'50%',transform:'translate(-50%,-50%)',width:600,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(176,138,74,0.07) 0%,transparent 65%)',pointerEvents:'none' }}/>

      <div style={{ width:'100%',maxWidth:440,position:'relative',zIndex:2 }}>
        <div style={{ textAlign:'center',marginBottom:48 }}>
          <div style={{ fontFamily:"Georgia,serif",fontSize:36,fontWeight:600,color:'#F5F3EB',letterSpacing:'0.05em',marginBottom:6 }}>AerEthos</div>
          <div style={{ fontSize:10,letterSpacing:'0.22em',textTransform:'uppercase',color:'#B08A4A',opacity:0.7,fontFamily:"sans-serif" }}>Student Submission Portal</div>
        </div>

        <div style={{ background:'white',borderTop:'2px solid #B08A4A',padding:'40px 40px 36px' }}>
          <div style={{ marginBottom:32 }}>
            <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:16 }}>
              <div style={{ width:24,height:1,background:'#B08A4A' }}/>
              <span style={{ fontSize:10,letterSpacing:'0.22em',textTransform:'uppercase',color:'#B08A4A',fontFamily:'sans-serif' }}>Welcome back</span>
            </div>
            <h1 style={{ fontFamily:"Georgia,serif",fontSize:28,fontWeight:300,color:'#003566',lineHeight:1.1,margin:0 }}>
              Log in to your<br/><em style={{ fontStyle:'italic',color:'#B08A4A' }}>yearbook portal.</em>
            </h1>
          </div>

          {error && (
            <div style={{ padding:'16px 20px',borderLeft:'3px solid #c53030',background:'rgba(197,48,48,0.04)',marginBottom:24 }}>
              <div style={{ fontSize:13,color:'#003566',opacity:0.7 }}>{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:10,letterSpacing:'0.18em',textTransform:'uppercase',color:'#003566',opacity:0.6,display:'block',marginBottom:8,fontFamily:'sans-serif' }}>Email Address</label>
              <input
                type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="your.name@school.ie" required
                style={{ width:'100%',padding:'14px 16px',border:'1.5px solid rgba(0,53,102,0.15)',background:'#FAFAF8',color:'#003566',fontFamily:'sans-serif',fontSize:15,outline:'none',boxSizing:'border-box' }}
              />
            </div>
            <div style={{ marginBottom:28 }}>
              <label style={{ fontSize:10,letterSpacing:'0.18em',textTransform:'uppercase',color:'#003566',opacity:0.6,display:'block',marginBottom:8,fontFamily:'sans-serif' }}>Password</label>
              <input
                type="password" value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="Enter your password" required
                style={{ width:'100%',padding:'14px 16px',border:'1.5px solid rgba(0,53,102,0.15)',background:'#FAFAF8',color:'#003566',fontFamily:'sans-serif',fontSize:15,outline:'none',boxSizing:'border-box' }}
              />
            </div>
            <button type="submit" disabled={loading} style={{
              width:'100%',padding:'16px',background:loading?'rgba(0,53,102,0.12)':'#B08A4A',
              color:loading?'rgba(0,53,102,0.3)':'#001020',border:'none',cursor:loading?'not-allowed':'pointer',
              fontFamily:'sans-serif',fontSize:11,fontWeight:500,letterSpacing:'0.14em',textTransform:'uppercase',
            }}>
              {loading ? 'Signing in...' : 'Log In →'}
            </button>
          </form>

          <div style={{ marginTop:20,textAlign:'center' }}>
            <a href="#" style={{ fontSize:12,color:'#B08A4A',opacity:0.7,textDecoration:'none' }}>Forgot your password?</a>
          </div>
        </div>

        <div style={{ marginTop:24,textAlign:'center' }}>
          <p style={{ fontSize:12,color:'#F5F3EB',opacity:0.35,fontFamily:'sans-serif',lineHeight:1.7,margin:0 }}>
            First time? Check your email for your login details.<br/>
            Need help? <a href="mailto:nathan@aerethos.com" style={{ color:'#B08A4A',opacity:0.7,textDecoration:'none' }}>nathan@aerethos.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
