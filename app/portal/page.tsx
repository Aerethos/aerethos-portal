'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PortalLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError('Incorrect email or password.');
        setLoading(false);
        return;
      }
      router.push('/portal/dashboard');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#001020;}
        .lw{min-height:100vh;background:#001020;display:flex;align-items:center;justify-content:center;padding:24px;font-family:'DM Sans',sans-serif;}
        .lb{width:100%;max-width:420px;}
        .ll{text-align:center;margin-bottom:40px;}
        .ll-t{font-family:'Cormorant Garamond',serif;font-size:34px;font-weight:600;color:#F5F3EB;letter-spacing:0.05em;display:block;margin-bottom:6px;}
        .ll-s{font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#B08A4A;opacity:0.7;}
        .lc{background:white;border-top:2px solid #B08A4A;padding:36px 36px 32px;}
        .le{display:flex;align-items:center;gap:10px;margin-bottom:14px;}
        .le-l{width:20px;height:1px;background:#B08A4A;}
        .le-t{font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#B08A4A;}
        .lh{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:300;color:#003566;line-height:1.15;margin-bottom:28px;}
        .lh em{font-style:italic;color:#B08A4A;}
        .llab{font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#003566;opacity:0.55;display:block;margin-bottom:7px;}
        .lin{width:100%;padding:13px 14px;border:1.5px solid rgba(0,53,102,0.15);background:#FAFAF8;color:#003566;font-family:'DM Sans',sans-serif;font-size:15px;outline:none;margin-bottom:18px;border-radius:0;-webkit-appearance:none;}
        .lin:focus{border-color:#B08A4A;background:white;}
        .lerr{padding:12px 16px;background:rgba(197,48,48,0.06);border-left:3px solid #c53030;color:#c53030;font-size:13px;margin-bottom:18px;}
        .lbtn{width:100%;padding:15px;background:#B08A4A;color:#001020;border:none;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;cursor:pointer;}
        .lbtn:disabled{opacity:0.6;cursor:not-allowed;}
        .lfg{display:block;text-align:center;margin-top:18px;font-size:12px;color:#B08A4A;opacity:0.7;text-decoration:none;}
        .lhelp{margin-top:20px;text-align:center;font-size:12px;color:#F5F3EB;opacity:0.3;line-height:1.7;}
        .lhelp a{color:#B08A4A;opacity:0.7;text-decoration:none;}
      `}</style>
      <div className="lw">
        <div className="lb">
          <div className="ll">
            <span className="ll-t">AerEthos</span>
            <span className="ll-s">Student Submission Portal</span>
          </div>
          <div className="lc">
            <div className="le">
              <div className="le-l" />
              <span className="le-t">Welcome back</span>
            </div>
            <h1 className="lh">Log in to your<br /><em>yearbook portal.</em></h1>
            {error && <div className="lerr">{error}</div>}
            <form onSubmit={handleLogin}>
              <label className="llab">Email Address</label>
              <input className="lin" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your.name@school.ie" required autoComplete="email" />
              <label className="llab">Password</label>
              <input className="lin" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required autoComplete="current-password" style={{ marginBottom: 24 }} />
              <button className="lbtn" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Log In →'}
              </button>
            </form>
            <a href="#" className="lfg">Forgot your password?</a>
          </div>
          <p className="lhelp">
            First time? Check your email for login details.<br />
            Need help? <a href="mailto:nathan@aerethos.com">nathan@aerethos.com</a>
          </p>
        </div>
      </div>
    </>
  );
}
