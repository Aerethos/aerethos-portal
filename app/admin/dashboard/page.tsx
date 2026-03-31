'use client';

import { useState, useEffect } from 'react';
import type { Submission } from '@/types';

interface SubmissionWithRelations extends Submission {
  students: { full_name: string; email: string; student_id: string; class_label: string };
  schools: { name: string; year: string; deadline: string };
}

const STATUS_COLOURS: Record<string, string> = {
  not_started: 'rgba(0,53,102,0.15)',
  in_progress: '#c59a00',
  submitted: '#2f855a',
  approved: '#1a6645',
  changes_requested: '#c53030',
};

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  submitted: 'Submitted',
  approved: 'Approved',
  changes_requested: 'Changes needed',
};

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<SubmissionWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<SubmissionWithRelations | null>(null);
  const [adminKey, setAdminKey] = useState('');
  const [authed, setAuthed] = useState(false);

  const fetchSubmissions = async (key: string) => {
    const res = await fetch(`/api/admin${filter !== 'all' ? `?status=${filter}` : ''}`, {
      headers: { 'x-admin-key': key },
    });
    if (!res.ok) return;
    const { submissions: data } = await res.json();
    setSubmissions(data ?? []);
    setLoading(false);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthed(true);
    fetchSubmissions(adminKey);
  };

  const updateStatus = async (submissionId: string, status: string) => {
    await fetch('/api/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ submissionId, status }),
    });
    fetchSubmissions(adminKey);
  };

  const completionPct = (s: SubmissionWithRelations) => {
    const fields = [
      s.profile_photo_url, s.backdrop_color_hex,
      s.memory_photo_urls?.length >= 10,
      s.quote_text, s.story_achievement, s.track_1_title,
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--navy-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', padding: '40px', maxWidth: 400, width: '100%', borderTop: '2px solid var(--gold)' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: 'var(--blue)', marginBottom: 24 }}>
            AerEthos <em style={{ color: 'var(--gold)' }}>Admin</em>
          </div>
          <form onSubmit={handleAuth}>
            <label className="ae-label">Admin Key</label>
            <input
              className="ae-input"
              type="password"
              value={adminKey}
              onChange={e => setAdminKey(e.target.value)}
              placeholder="Enter admin key"
              style={{ marginBottom: 16 }}
            />
            <button type="submit" className="ae-btn-primary" style={{ width: '100%' }}>
              <span>Access Admin →</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const statusCounts = submissions.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(245,243,235,0.97)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,53,102,0.08)',
        padding: '0 48px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: 'var(--blue)', letterSpacing: '0.05em' }}>AerEthos</span>
          <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', marginLeft: 12, fontFamily: "'DM Sans', sans-serif" }}>Admin</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="ae-btn-ghost" onClick={() => fetchSubmissions(adminKey)} style={{ fontSize: 10 }}>Refresh</button>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2, marginBottom: 32 }}>
          {[
            { label: 'Total', value: submissions.length, color: 'var(--blue)' },
            { label: 'Submitted', value: statusCounts.submitted ?? 0, color: '#2f855a' },
            { label: 'In Progress', value: statusCounts.in_progress ?? 0, color: '#c59a00' },
            { label: 'Approved', value: statusCounts.approved ?? 0, color: '#1a6645' },
            { label: 'Changes Needed', value: statusCounts.changes_requested ?? 0, color: '#c53030' },
          ].map((stat, i) => (
            <div key={i} style={{ background: 'white', padding: '20px 24px', border: '1px solid rgba(0,53,102,0.07)' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 200, color: stat.color, lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blue)', opacity: 0.4, marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
          {['all', 'submitted', 'in_progress', 'approved', 'changes_requested'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '8px 16px',
              background: filter === s ? 'var(--blue)' : 'white',
              color: filter === s ? 'var(--cream)' : 'var(--blue)',
              border: '1px solid rgba(0,53,102,0.1)',
              cursor: 'pointer',
              fontSize: 10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'all 0.15s',
            }}>
              {s === 'all' ? 'All' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Submissions table */}
        <div style={{ background: 'white', border: '1px solid rgba(0,53,102,0.08)' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--blue)', opacity: 0.4 }}>Loading...</div>
          ) : submissions.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--blue)', opacity: 0.4 }}>No submissions yet.</div>
          ) : (
            submissions.map((s, i) => (
              <div
                key={s.id}
                onClick={() => setSelected(selected?.id === s.id ? null : s)}
                style={{
                  padding: '16px 24px',
                  borderBottom: i < submissions.length - 1 ? '1px solid rgba(0,53,102,0.06)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  background: selected?.id === s.id ? 'rgba(0,53,102,0.03)' : 'white',
                }}
                onMouseEnter={e => { if (selected?.id !== s.id) (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,53,102,0.02)'; }}
                onMouseLeave={e => { if (selected?.id !== s.id) (e.currentTarget as HTMLDivElement).style.background = 'white'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                    {/* Status dot */}
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOURS[s.status], flexShrink: 0 }}/>
                    {/* Student info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 500, color: 'var(--blue)' }}>
                        {s.students?.full_name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--blue)', opacity: 0.45 }}>
                        {s.students?.email} · {s.students?.student_id}
                      </div>
                    </div>
                    {/* School */}
                    <div style={{ fontSize: 12, color: 'var(--blue)', opacity: 0.5, minWidth: 160 }}>
                      {s.schools?.name} {s.schools?.year}
                    </div>
                    {/* Progress bar */}
                    <div style={{ width: 80 }}>
                      <div style={{ width: '100%', height: 2, background: 'rgba(0,53,102,0.08)' }}>
                        <div style={{ width: `${completionPct(s)}%`, height: '100%', background: 'var(--gold)' }}/>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--blue)', opacity: 0.4, marginTop: 4 }}>{completionPct(s)}% complete</div>
                    </div>
                  </div>
                  {/* Status badge */}
                  <div style={{
                    padding: '4px 10px',
                    background: `${STATUS_COLOURS[s.status]}22`,
                    border: `1px solid ${STATUS_COLOURS[s.status]}44`,
                    fontSize: 9,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: STATUS_COLOURS[s.status],
                    fontFamily: "'DM Sans', sans-serif",
                    whiteSpace: 'nowrap',
                  }}>
                    {STATUS_LABELS[s.status]}
                  </div>
                </div>

                {/* Expanded detail */}
                {selected?.id === s.id && (
                  <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(0,53,102,0.07)' }}
                    onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                      {[
                        { label: 'Profile Photo', value: s.profile_photo_url ? '✓ Uploaded' : '— Missing', ok: !!s.profile_photo_url },
                        { label: 'Backdrop', value: s.backdrop_color_name ?? '— Missing', ok: !!s.backdrop_color_hex },
                        { label: 'Memory Photos', value: `${s.memory_photo_urls?.length ?? 0} photos`, ok: (s.memory_photo_urls?.length ?? 0) >= 10 },
                        { label: 'Quote', value: s.quote_text ? `"${s.quote_text.slice(0, 40)}..."` : '— Missing', ok: !!s.quote_text },
                        { label: 'Track 1', value: s.track_1_title ? `${s.track_1_title} — ${s.track_1_artist}` : '— Missing', ok: !!s.track_1_title },
                        { label: 'Track 2', value: s.track_2_title ? `${s.track_2_title} — ${s.track_2_artist}` : '— Missing', ok: !!s.track_2_title },
                      ].map((field, j) => (
                        <div key={j} style={{ padding: '10px 14px', background: field.ok ? 'rgba(47,133,90,0.05)' : 'rgba(197,48,48,0.04)', borderLeft: `2px solid ${field.ok ? '#2f855a' : '#c53030'}` }}>
                          <div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: field.ok ? '#2f855a' : '#c53030', marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>{field.label}</div>
                          <div style={{ fontSize: 12, color: 'var(--blue)', opacity: 0.7 }}>{field.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Profile photo preview */}
                    {s.profile_photo_url && (
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blue)', opacity: 0.4, marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>Profile Photo</div>
                        <img src={s.profile_photo_url} alt="Profile" style={{ height: 80, objectFit: 'cover' }}/>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="ae-btn-ghost" onClick={() => updateStatus(s.id, 'approved')} style={{ fontSize: 10, borderColor: '#2f855a', color: '#2f855a' }}>
                        ✓ Approve
                      </button>
                      <button className="ae-btn-ghost" onClick={() => updateStatus(s.id, 'changes_requested')} style={{ fontSize: 10, borderColor: '#c53030', color: '#c53030' }}>
                        ✕ Request Changes
                      </button>
                      <a href={`mailto:${s.students?.email}`} className="ae-btn-ghost" style={{ fontSize: 10, textDecoration: 'none', display: 'inline-block' }}>
                        Email Student →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
