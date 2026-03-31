'use client';

import Link from 'next/link';

const student = {
  name: 'Nathan',
  school: 'Waterpark College',
  year: 'Class of 2027',
  deadline: 'May 15, 2027',
};

const progress = {
  profilePhoto: true,
  backdropColor: true,
  memoryPhotos: 8,
  quote: true,
  storyFields: false,
  topTracks: false,
};

const completionPercentage = 45;

const steps = [
  { key: 'profilePhoto', label: 'Profile Photo', href: '/portal/submit/profile-photo', status: progress.profilePhoto ? 'complete' : 'incomplete' as const },
  { key: 'backdropColor', label: 'Backdrop Colour', href: '/portal/submit/backdrop-color', status: progress.backdropColor ? 'complete' : 'incomplete' as const },
  { key: 'memoryPhotos', label: 'Memory Photos', href: '/portal/submit/memory-photos', status: (progress.memoryPhotos >= 10 ? 'complete' : 'warning') as 'complete'|'warning'|'incomplete', detail: `${progress.memoryPhotos} of 10 minimum uploaded` },
  { key: 'quote', label: 'Personal Quote', href: '/portal/submit/quote', status: progress.quote ? 'complete' : 'incomplete' as const },
  { key: 'storyFields', label: 'Your Story', href: '/portal/submit/story', status: progress.storyFields ? 'complete' : 'incomplete' as const },
  { key: 'topTracks', label: 'Top Tracks', href: '/portal/submit/top-tracks', status: progress.topTracks ? 'complete' : 'incomplete' as const },
];

export default function Dashboard() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>

      {/* Header */}
      <header className="portal-header">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
          <span className="portal-logo">AerEthos</span>
          <span className="portal-logo-sub">Student Portal</span>
        </div>
        <button className="ae-btn-secondary" style={{ fontSize: 10 }}>Log Out</button>
      </header>

      <div className="portal-main">
        <div className="portal-content-wide">

          {/* Welcome */}
          <div className="fade-up" style={{ marginBottom: 40 }}>
            <div className="ae-eyebrow">
              <div className="ae-eyebrow-line"/>
              <span className="ae-eyebrow-text">{student.school} · {student.year}</span>
            </div>
            <h1 className="ae-h1">
              Welcome back,<br/>
              <em>{student.name}.</em>
            </h1>
            <p className="ae-lead" style={{ marginBottom: 0 }}>
              Your yearbook page is in progress. Complete all sections before the deadline.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

            {/* Progress card */}
            <div className="ae-card fade-up-1">
              {/* Progress header */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <div className="ae-eyebrow" style={{ marginBottom: 4 }}>
                    <div className="ae-eyebrow-line"/>
                    <span className="ae-eyebrow-text">Submission Progress</span>
                  </div>
                </div>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 44,
                  fontWeight: 200,
                  color: 'var(--gold)',
                  lineHeight: 1,
                }}>{completionPercentage}%</div>
              </div>

              {/* Progress track */}
              <div style={{
                width: '100%', height: 2,
                background: 'rgba(0,53,102,0.08)',
                marginBottom: 36,
              }}>
                <div style={{
                  width: `${completionPercentage}%`,
                  height: '100%',
                  background: 'var(--gold)',
                  transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
                }}/>
              </div>

              {/* Checklist */}
              <div>
                {steps.map((step) => (
                  <Link key={step.key} href={step.href} style={{ textDecoration: 'none' }}>
                    <div className="ae-check-item" style={{ cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.paddingLeft = '4px'}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.paddingLeft = '0'}
                    >
                      <div className="ae-check-left">
                        <div className={`ae-check-dot ${step.status}`}/>
                        <div>
                          <div className="ae-check-label">{step.label}</div>
                          {step.detail && <div className="ae-check-detail">{step.detail}</div>}
                        </div>
                      </div>
                      <span className={`ae-check-status ${step.status}`}>
                        {step.status === 'complete' ? 'Complete' : step.status === 'warning' ? 'In progress' : 'Not started'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* CTA */}
              <div style={{ marginTop: 36 }}>
                <Link href="/portal/submit/profile-photo">
                  <button className="ae-btn-primary" style={{ width: '100%' }}>
                    <span>Continue Submission →</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Deadline */}
              <div className="ae-card-sm fade-up-2" style={{ borderLeft: '3px solid var(--gold)' }}>
                <div className="ae-notice-title">Submission Deadline</div>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 24,
                  fontWeight: 300,
                  color: 'var(--blue)',
                  margin: '8px 0 4px',
                }}>{student.deadline}</div>
                <div style={{ fontSize: 12, color: 'var(--blue)', opacity: 0.45 }}>
                  Submit all sections before this date.
                </div>
              </div>

              {/* What happens next */}
              <div className="ae-card-sm fade-up-3">
                <div className="ae-notice-title" style={{ marginBottom: 12 }}>What happens next</div>
                {[
                  'Complete all six sections',
                  'AerEthos designs your page',
                  'You approve the final layout',
                  'Your book goes to print',
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    padding: '8px 0',
                    borderBottom: i < 3 ? '1px solid rgba(0,53,102,0.06)' : 'none',
                  }}>
                    <span style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 16,
                      color: 'var(--gold)',
                      opacity: 0.6,
                      flexShrink: 0,
                      lineHeight: 1.4,
                    }}>0{i+1}</span>
                    <span style={{ fontSize: 13, color: 'var(--blue)', opacity: 0.6, lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>

              {/* Help */}
              <div className="ae-card-sm fade-up-3">
                <div className="ae-notice-title" style={{ marginBottom: 8 }}>Need help?</div>
                <p style={{ fontSize: 13, color: 'var(--blue)', opacity: 0.55, lineHeight: 1.6, marginBottom: 12 }}>
                  If you&apos;re having trouble with any step, get in touch.
                </p>
                <a href="mailto:nathan@aerethos.com" style={{
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--gold)',
                  textDecoration: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  nathan@aerethos.com →
                </a>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
