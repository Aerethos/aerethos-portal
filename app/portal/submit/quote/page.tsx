'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CHAR_LIMIT = 150;

export default function QuoteStep() {
  const router = useRouter();
  const [quote, setQuote] = useState('');
  const [attribution, setAttribution] = useState('');

  const remaining = CHAR_LIMIT - quote.length;
  const canProceed = quote.trim().length > 0 && quote.length <= CHAR_LIMIT;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <header className="portal-header">
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span className="portal-logo">AerEthos</span>
          <span className="portal-logo-sub">Student Portal</span>
        </div>
        <a href="/portal/dashboard" className="ae-btn-secondary" style={{ fontSize: 10, textDecoration: 'none' }}>Dashboard</a>
      </header>

      <div style={{ paddingTop: 64 }}>
        <div className="progress-strip">
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="progress-meta">
              <span className="progress-step-label">Step 4 of 6</span>
              <span className="progress-name">Your Quote</span>
            </div>
            <div className="progress-track"><div className="progress-fill" style={{ width: '66.6%' }}/></div>
          </div>
        </div>
      </div>

      <div className="portal-content">
        <div className="ae-card fade-up">
          <div className="ae-eyebrow"><div className="ae-eyebrow-line"/><span className="ae-eyebrow-text">Step 04</span></div>
          <h1 className="ae-h1">Your memorable<br/><em>quote.</em></h1>
          <p className="ae-lead">A funny moment, a teacher quote, or a personal motto. This appears prominently in italic on your yearbook page.</p>

          {/* Examples */}
          <div style={{ padding: '20px 24px', background: 'rgba(0,53,102,0.03)', border: '1px solid rgba(0,53,102,0.07)', marginBottom: 32 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--blue)', opacity: 0.4, marginBottom: 14, fontFamily: "'DM Sans', sans-serif" }}>Examples</div>
            {[
              ['"Conor, should I check everyone\'s homework?"', '— Mr Heuston'],
              ['"To infinity and beyond."', ''],
              ['"The best is yet to come."', ''],
              ['"Not all who wander are lost."', ''],
            ].map(([q, a], i) => (
              <div key={i} style={{ marginBottom: i < 3 ? 10 : 0 }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontStyle: 'italic', color: 'var(--blue)', opacity: 0.7 }}>{q}</span>
                {a && <span style={{ fontSize: 12, color: 'var(--gold)', marginLeft: 8, fontFamily: "'DM Sans', sans-serif" }}>{a}</span>}
              </div>
            ))}
          </div>

          {/* Quote input */}
          <div style={{ marginBottom: 24 }}>
            <label className="ae-label">Your Quote <span style={{ color: '#c53030' }}>*</span></label>
            <textarea
              className="ae-textarea"
              value={quote}
              onChange={e => setQuote(e.target.value)}
              placeholder='Enter your memorable quote...'
              rows={3}
              maxLength={CHAR_LIMIT}
            />
            <div className={`ae-char-count ${remaining < 20 ? 'warning' : ''}`}>{remaining} characters remaining</div>
          </div>

          {/* Attribution */}
          <div style={{ marginBottom: 32 }}>
            <label className="ae-label">Who said it? <span style={{ fontSize: 10, opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>optional</span></label>
            <input
              className="ae-input"
              type="text"
              value={attribution}
              onChange={e => setAttribution(e.target.value)}
              placeholder="e.g. Mr Heuston, Mam, Coach Kelly..."
              maxLength={50}
            />
            <div style={{ fontSize: 11, color: 'var(--blue)', opacity: 0.4, marginTop: 6 }}>Leave blank if it&apos;s a personal motto.</div>
          </div>

          {/* Live preview */}
          {quote && (
            <div style={{ padding: '28px 32px', background: 'var(--navy-deep)', marginBottom: 36, position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', opacity: 0.6, marginBottom: 14, fontFamily: "'DM Sans', sans-serif" }}>Preview</div>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 20,
                fontStyle: 'italic',
                fontWeight: 300,
                color: 'var(--cream)',
                lineHeight: 1.4,
                marginBottom: attribution ? 10 : 0,
              }}>
                &ldquo;{quote}&rdquo;
              </div>
              {attribution && (
                <div style={{ fontSize: 12, color: 'var(--gold)', fontFamily: "'DM Sans', sans-serif" }}>— {attribution}</div>
              )}
            </div>
          )}

          <div className="step-nav">
            <button className="ae-btn-secondary" onClick={() => router.push('/portal/submit/memory-photos')}>← Back</button>
            <button className="ae-btn-primary" onClick={() => router.push('/portal/submit/story')} disabled={!canProceed}>
              <span>Next: Your Story →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
