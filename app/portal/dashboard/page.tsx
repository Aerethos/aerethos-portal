'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface StudentData {
  full_name: string;
  class_label: string;
  schools: { name: string; deadline: string; year: string };
}

interface SubmissionData {
  status: string;
  profile_photo_url: string | null;
  backdrop_color_hex: string | null;
  memory_photo_urls: string[];
  quote_text: string | null;
  story_achievement: string | null;
  track_1_title: string | null;
  track_2_title: string | null;
  submitted_at: string | null;
}

export default function Dashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/portal'); return; }

      // Load student
      const { data: studentData } = await supabase
        .from('students')
        .select('full_name, class_label, schools(name, deadline, year)')
        .eq('id', session.user.id)
        .single();

      if (studentData) setStudent(studentData as unknown as StudentData);

      // Load submission
      const res = await fetch('/api/submit', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const { submission: sub } = await res.json();
        if (sub) setSubmission(sub);
      }

      setLoading(false);
    }
    load();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/portal');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: 'var(--blue)', opacity: 0.4 }}>Loading...</div>
      </div>
    );
  }

  const firstName = student?.full_name?.split(' ')[0] ?? 'Student';
  const schoolName = student?.schools?.name ?? 'Your School';
  const classLabel = student?.class_label ?? 'Class of 2026';
  const deadline = student?.schools?.deadline
    ? new Date(student.schools.deadline).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'May 15, 2026';

  // Calculate real completion
  const checks = [
    !!submission?.profile_photo_url,
    !!submission?.backdrop_color_hex,
    (submission?.memory_photo_urls?.length ?? 0) >= 10,
    !!submission?.quote_text,
    !!submission?.story_achievement,
    !!(submission?.track_1_title && submission?.track_2_title),
  ];
  const completionPct = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const memCount = submission?.memory_photo_urls?.length ?? 0;

  const steps = [
    { label: 'Profile Photo', href: '/portal/submit/profile-photo', complete: !!submission?.profile_photo_url },
    { label: 'Backdrop Colour', href: '/portal/submit/backdrop-color', complete: !!submission?.backdrop_color_hex },
    { label: 'Memory Photos', href: '/portal/submit/memory-photos', complete: memCount >= 10, warning: memCount > 0 && memCount < 10, detail: memCount > 0 ? `${memCount} of 10 minimum uploaded` : undefined },
    { label: 'Personal Quote', href: '/portal/submit/quote', complete: !!submission?.quote_text },
    { label: 'Your Story', href: '/portal/submit/story', complete: !!submission?.story_achievement },
    { label: 'Top Tracks', href: '/portal/submit/top-tracks', complete: !!(submission?.track_1_title && submission?.track_2_title) },
  ];

  const nextIncomplete = steps.find(s => !s.complete);
  const allComplete = steps.every(s => s.complete);
  const isSubmitted = submission?.status === 'submitted' || submission?.status === 'approved';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <header className="portal-header">
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span className="portal-logo">AerEthos</span>
          <span className="portal-logo-sub">Student Portal</span>
        </div>
        <button className="ae-btn-secondary" style={{ fontSize: 10 }} onClick={handleLogout}>Log Out</button>
      </header>

      <div className="portal-main">
        <div className="portal-content-wide">

          {/* Welcome */}
          <div className="fade-up" style={{ marginBottom: 40 }}>
            <div className="ae-eyebrow">
              <div className="ae-eyebrow-line"/>
              <span className="ae-eyebrow-text">{schoolName} · {classLabel}</span>
            </div>
            <h1 className="ae-h1">Welcome back,<br/><em>{firstName}.</em></h1>
            <p className="ae-lead" style={{ marginBottom: 0 }}>
              {isSubmitted
                ? 'Your submission is in. AerEthos will be in touch with your page proof.'
                : 'Your yearbook page is in progress. Complete all sections before the deadline.'}
            </p>
          </div>

          {/* Submitted banner */}
          {isSubmitted && (
            <div className="fade-up" style={{ padding: '20px 24px', borderLeft: '3px solid #2f855a', background: 'rgba(47,133,90,0.06)', marginBottom: 24 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#2f855a', fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>
                {submission?.status === 'approved' ? '✓ Approved' : '✓ Submitted'}
              </div>
              <div style={{ fontSize: 14, color: 'var(--blue)', opacity: 0.7 }}>
                {submission?.status === 'approved'
                  ? 'Your page has been approved by AerEthos. It will go to print shortly.'
                  : 'Received. You can still edit your submission until the deadline.'}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

            {/* Progress card */}
            <div className="ae-card fade-up-1">
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
                <div className="ae-eyebrow" style={{ marginBottom: 0 }}>
                  <div className="ae-eyebrow-line"/>
                  <span className="ae-eyebrow-text">Submission Progress</span>
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 200, color: 'var(--gold)', lineHeight: 1 }}>{completionPct}%</div>
              </div>

              <div style={{ width: '100%', height: 2, background: 'rgba(0,53,102,0.08)', marginBottom: 36 }}>
                <div style={{ width: `${completionPct}%`, height: '100%', background: 'var(--gold)', transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)' }}/>
              </div>

              <div>
                {steps.map(step => {
                  const status = step.complete ? 'complete' : step.warning ? 'warning' : 'incomplete';
                  return (
                    <Link key={step.label} href={step.href} style={{ textDecoration: 'none' }}>
                      <div className="ae-check-item" style={{ cursor: 'pointer', transition: 'padding-left 0.2s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.paddingLeft = '4px'}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.paddingLeft = '0'}>
                        <div className="ae-check-left">
                          <div className={`ae-check-dot ${status}`}/>
                          <div>
                            <div className="ae-check-label">{step.label}</div>
                            {step.detail && <div className="ae-check-detail">{step.detail}</div>}
                          </div>
                        </div>
                        <span className={`ae-check-status ${status}`}>
                          {status === 'complete' ? 'Complete' : status === 'warning' ? 'In progress' : 'Not started'}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div style={{ marginTop: 36 }}>
                {allComplete ? (
                  <Link href="/portal/submit/review">
                    <button className="ae-btn-primary" style={{ width: '100%' }}>
                      <span>{isSubmitted ? 'Review & Edit Submission →' : 'Review & Submit →'}</span>
                    </button>
                  </Link>
                ) : (
                  <Link href={nextIncomplete?.href ?? '/portal/submit/profile-photo'}>
                    <button className="ae-btn-primary" style={{ width: '100%' }}>
                      <span>Continue Submission →</span>
                    </button>
                  </Link>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="ae-card-sm fade-up-2" style={{ borderLeft: '3px solid var(--gold)' }}>
                <div className="ae-notice-title">Submission Deadline</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: 'var(--blue)', margin: '8px 0 4px' }}>{deadline}</div>
                <div style={{ fontSize: 12, color: 'var(--blue)', opacity: 0.45 }}>Submit all sections before this date.</div>
              </div>

              <div className="ae-card-sm fade-up-3">
                <div className="ae-notice-title" style={{ marginBottom: 12 }}>What happens next</div>
                {['Complete all six sections', 'AerEthos designs your page', 'You approve the final layout', 'Your book goes to print'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '8px 0', borderBottom: i < 3 ? '1px solid rgba(0,53,102,0.06)' : 'none' }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: 'var(--gold)', opacity: 0.6, flexShrink: 0, lineHeight: 1.4 }}>0{i+1}</span>
                    <span style={{ fontSize: 13, color: 'var(--blue)', opacity: 0.6, lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>

              <div className="ae-card-sm fade-up-3">
                <div className="ae-notice-title" style={{ marginBottom: 8 }}>Need help?</div>
                <p style={{ fontSize: 13, color: 'var(--blue)', opacity: 0.55, lineHeight: 1.6, marginBottom: 12 }}>Having trouble with any step? Get in touch.</p>
                <a href="mailto:nathan@aerethos.com" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>
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
