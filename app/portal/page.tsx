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

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Incorrect email or password. Check your details and try again.');
      setLoading(false);
      return;
    }
    router.push('/portal/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--navy-deep)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position:'absolute',inset:0,opacity:0.04,pointerEvents:'none',backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}/>
      <div style={{ position:'absolute',top:'35%',left:'50%',transform:'translate(-50%,-50%)',width:600,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(176,138,74,0.07) 0%,transparent 65%)',pointerEvents:'none' }}/>
      <div style={{ width:'100%',maxWidth:440,position:'relative',zIndex:2 }} className="fade-up">
        <div style={{ textAlign:'center',marginBottom:48 }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:600,color:'var(--cream)',letterSpacing:'0.05em',marginBottom:6 }}>AerEthos</div>
          <div style={{ fontSize:10,letterSpacing:'0.22em',textTransform:'uppercase',color:'var(--gold)',opacity:0.7,fontFamily:"'DM Sans',sans-serif" }}>Student Submission Portal</div>
        </div>
        <div style={{ background:'white',border:'1px solid rgba(0,53,102,0.1)',borderTop:'2px solid var(--gold)',padding:'40px 40px 36px' }}>
          <div style={{ marginBottom:32 }}>
            <div className="ae-eyebrow"><div className="ae-eyebrow-line"/><span className="ae-eyebrow-text">Welcome back</span></div>
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:300,color:'var(--blue)',lineHeight:1.1 }}>
              Log in to your<br/><em style={{ fontStyle:'italic',color:'var(--gold)' }}>yearbook portal.</em>
            </h1>
          </div>
          {error && <div className="ae-notice warning" style={{ marginBottom:24 }}><div className="ae-notice-body">{error}</div></div>}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom:20 }}>
              <label className="ae-label">Email Address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your.name@school.ie" className="ae-input" required/>
            </div>
            <div style={{ marginBottom:28 }}>
              <label className="ae-label">Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" className="ae-input" required/>
            </div>
            <button type="submit" className="ae-btn-primary" style={{ width:'100%' }} disabled={loading}>
              <span style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:10 }}>
                {loading && <span style={{ width:14,height:14,border:'2px solid rgba(0,16,32,0.2)',borderTopColor:'var(--navy-deep)',borderRadius:'50%',display:'inline-block',animation:'spin 0.7s linear infinite' }}/>}
                {loading ? 'Signing in...' : 'Log In →'}
              </span>
            </button>
          </form>
          <div style={{ marginTop:20,textAlign:'center' }}>
            <a href="#" style={{ fontSize:12,color:'var(--gold)',opacity:0.7,textDecoration:'none',fontFamily:"'DM Sans',sans-serif" }}>Forgot your password?</a>
          </div>
        </div>
        <div style={{ marginTop:24,textAlign:'center' }}>
          <p style={{ fontSize:12,color:'var(--cream)',opacity:0.35,fontFamily:"'DM Sans',sans-serif",lineHeight:1.7 }}>
            First time? Check your email for your login details.<br/>
            Need help? <a href="mailto:nathan@aerethos.com" style={{ color:'var(--gold)',opacity:0.7,textDecoration:'none' }}>nathan@aerethos.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
