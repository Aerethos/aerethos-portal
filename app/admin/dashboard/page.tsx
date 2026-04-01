'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Submission } from '@/types';

interface SubmissionRow extends Submission {
  students: { full_name: string; email: string; student_id: string; class_label: string };
  schools: { name: string; year: string; deadline: string };
}

const STATUS_COLOURS: Record<string, string> = {
  not_started: 'rgba(0,53,102,0.2)',
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
  const [all, setAll] = useState<SubmissionRow[]>([]);
  const [filtered, setFiltered] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<SubmissionRow | null>(null);
  const [adminKey, setAdminKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSubmissions = useCallback(async (key: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin', {
        headers: { 'x-admin-key': key },
      });
      if (!res.ok) { alert('Wrong admin key'); setAuthed(false); return; }
      const { submissions: data } = await res.json();
      setAll(data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filter whenever all or filter changes
  useEffect(() => {
    if (filter === 'all') {
      setFiltered(all);
    } else {
      setFiltered(all.filter(s => s.status === filter));
    }
  }, [all, filter]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthed(true);
    fetchSubmissions(adminKey);
  };

  const updateStatus = async (submissionId: string, status: string, notes?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ submissionId, status, adminNotes: notes ?? '' }),
      });
      if (res.ok) {
        showToast(status === 'approved' ? '✓ Submission approved' : '✓ Changes requested');
        await fetchSubmissions(adminKey);
        setSelected(null);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const completionPct = (s: SubmissionRow) => {
    const fields = [
      s.profile_photo_url,
      s.backdrop_color_hex,
      (s.memory_photo_urls?.length ?? 0) >= 10,
      s.quote_text,
      s.story_achievement,
      s.track_1_title,
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  const statusCounts = all.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#001020', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', padding: '40px', maxWidth: 400, width: '100%', borderTop: '2px solid #B08A4A' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#003566', marginBottom: 8 }}>
            AerEthos <em style={{ color: '#B08A4A' }}>Admin</em>
          </div>
          <div style={{ fontSize: 12, color: '#003566', opacity: 0.5, marginBottom: 28 }}>Portal management dashboard</div>
          <form onSubmit={handleAuth}>
            <label className="ae-label">Admin Key</label>
            <input className="ae-input" type="password" value={adminKey}
              onChange={e => setAdminKey(e.target.value)} placeholder="Enter your admin key" style={{ marginBottom: 16 }} required/>
            <button type="submit" className="ae-btn-primary" style={{ width: '100%' }}>
              <span>Access Dashboard →</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── DASHBOARD ──────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 9999, background: '#2f855a', color: 'white', padding: '12px 20px', fontSize: 13, fontFamily: "'DM Sans', sans-serif", boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(245,243,235,0.97)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,53,102,0.08)', padding: '0 48px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: 'var(--blue)', letterSpacing: '0.05em' }}>AerEthos</span>
          <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', marginLeft: 12, fontFamily: "'DM Sans', sans-serif" }}>Admin</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--blue)', opacity: 0.4, fontFamily: "'DM Sans', sans-serif" }}>{all.length} students total</span>
          <button className="ae-btn-ghost" onClick={() => fetchSubmissions(adminKey)} style={{ fontSize: 10 }}>Refresh</button>
          <button className="ae-btn-ghost" onClick={() => setAuthed(false)} style={{ fontSize: 10 }}>Log out</button>
        </div>
      </header>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '40px 32px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2, marginBottom: 32 }}>
          {[
            { label: 'Total', value: all.length, color: 'var(--blue)' },
            { label: 'Submitted', value: statusCounts.submitted ?? 0, color: '#2f855a' },
            { label: 'In Progress', value: statusCounts.in_progress ?? 0, color: '#c59a00' },
            { label: 'Approved', value: statusCounts.approved ?? 0, color: '#1a6645' },
            { label: 'Changes Needed', value: statusCounts.changes_requested ?? 0, color: '#c53030' },
          ].map((stat, i) => (
            <div key={i} style={{ background: 'white', padding: '20px 24px', border: '1px solid rgba(0,53,102,0.07)' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 200, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blue)', opacity: 0.4, marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'submitted', label: 'Submitted' },
            { key: 'in_progress', label: 'In Progress' },
            { key: 'approved', label: 'Approved' },
            { key: 'changes_requested', label: 'Changes Needed' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
              padding: '8px 16px',
              background: filter === tab.key ? 'var(--blue)' : 'white',
              color: filter === tab.key ? 'var(--cream)' : 'var(--blue)',
              border: '1px solid rgba(0,53,102,0.12)',
              cursor: 'pointer', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
              fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
            }}>
              {tab.label}
              {tab.key !== 'all' && statusCounts[tab.key] > 0 && (
                <span style={{ marginLeft: 6, opacity: 0.6 }}>({statusCounts[tab.key] ?? 0})</span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: 'white', border: '1px solid rgba(0,53,102,0.08)' }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--blue)', opacity: 0.4, fontFamily: "'DM Sans', sans-serif" }}>Loading submissions...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--blue)', opacity: 0.4, fontFamily: "'DM Sans', sans-serif" }}>
              {filter === 'all' ? 'No submissions yet.' : `No ${STATUS_LABELS[filter]?.toLowerCase()} submissions.`}
            </div>
          ) : (
            filtered.map((s, i) => (
              <div key={s.id}>
                {/* Row */}
                <div
                  onClick={() => setSelected(selected?.id === s.id ? null : s)}
                  style={{
                    padding: '16px 24px', cursor: 'pointer', transition: 'background 0.15s',
                    background: selected?.id === s.id ? 'rgba(0,53,102,0.03)' : 'white',
                    borderBottom: i < filtered.length - 1 || selected?.id === s.id ? '1px solid rgba(0,53,102,0.06)' : 'none',
                  }}
                  onMouseEnter={e => { if (selected?.id !== s.id) (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,53,102,0.02)'; }}
                  onMouseLeave={e => { if (selected?.id !== s.id) (e.currentTarget as HTMLDivElement).style.background = 'white'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOURS[s.status], flexShrink: 0 }}/>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 500, color: 'var(--blue)' }}>{s.students?.full_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--blue)', opacity: 0.45, marginTop: 2 }}>{s.students?.email} · {s.students?.student_id}</div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--blue)', opacity: 0.5, minWidth: 180 }}>{s.schools?.name} {s.schools?.year}</div>
                      <div style={{ width: 100 }}>
                        <div style={{ width: '100%', height: 2, background: 'rgba(0,53,102,0.08)' }}>
                          <div style={{ width: `${completionPct(s)}%`, height: '100%', background: 'var(--gold)', transition: 'width 0.3s' }}/>
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--blue)', opacity: 0.4, marginTop: 4 }}>{completionPct(s)}% complete</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        padding: '4px 10px',
                        background: `${STATUS_COLOURS[s.status]}18`,
                        border: `1px solid ${STATUS_COLOURS[s.status]}44`,
                        fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
                        color: STATUS_COLOURS[s.status], fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap',
                      }}>
                        {STATUS_LABELS[s.status]}
                      </div>
                      <div style={{ fontSize: 14, color: 'var(--blue)', opacity: 0.3, transform: selected?.id === s.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</div>
                    </div>
                  </div>
                </div>

                {/* Expanded detail */}
                {selected?.id === s.id && (
                  <div style={{ padding: '24px', background: 'rgba(0,53,102,0.02)', borderBottom: '1px solid rgba(0,53,102,0.06)' }}
                    onClick={e => e.stopPropagation()}>

                    {/* Field grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
                      {[
                        { label: 'Profile Photo', value: s.profile_photo_url ? '✓ Uploaded' : '— Missing', ok: !!s.profile_photo_url },
                        { label: 'Backdrop', value: s.backdrop_color_name ?? '— Missing', ok: !!s.backdrop_color_hex },
                        { label: 'Memory Photos', value: `${s.memory_photo_urls?.length ?? 0} photos`, ok: (s.memory_photo_urls?.length ?? 0) >= 10 },
                        { label: 'Quote', value: s.quote_text ? `"${s.quote_text.slice(0, 50)}${s.quote_text.length > 50 ? '...' : ''}"` : '— Missing', ok: !!s.quote_text },
                        { label: 'Track 1', value: s.track_1_title ? `${s.track_1_title} — ${s.track_1_artist}` : '— Missing', ok: !!s.track_1_title },
                        { label: 'Track 2', value: s.track_2_title ? `${s.track_2_title} — ${s.track_2_artist}` : '— Missing', ok: !!s.track_2_title },
                        { label: 'Achievement', value: s.story_achievement ?? '— Missing', ok: !!s.story_achievement },
                        { label: 'Best Memory', value: s.story_best_memory ?? '— Missing', ok: !!s.story_best_memory },
                        { label: 'This Year', value: s.story_this_year ?? '— Missing', ok: !!s.story_this_year },
                      ].map((field, j) => (
                        <div key={j} style={{ padding: '10px 14px', background: field.ok ? 'rgba(47,133,90,0.05)' : 'rgba(197,48,48,0.04)', borderLeft: `2px solid ${field.ok ? '#2f855a' : '#c53030'}` }}>
                          <div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: field.ok ? '#2f855a' : '#c53030', marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>{field.label}</div>
                          <div style={{ fontSize: 12, color: 'var(--blue)', opacity: 0.7, lineHeight: 1.4 }}>{field.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Profile photo preview */}
                    {s.profile_photo_url && (
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blue)', opacity: 0.4, marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>Profile Photo</div>
                        <img src={s.profile_photo_url} alt="Profile" style={{ height: 100, objectFit: 'cover', display: 'block' }}/>
                      </div>
                    )}

                    {/* Admin notes */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blue)', opacity: 0.4, display: 'block', marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>
                        Admin Notes (optional — sent to student)
                      </label>
                      <textarea
                        value={adminNotes}
                        onChange={e => setAdminNotes(e.target.value)}
                        placeholder="e.g. Please re-upload your profile photo in higher resolution..."
                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid rgba(0,53,102,0.15)', background: 'white', color: 'var(--blue)', fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                        rows={2}
                      />
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => updateStatus(s.id, 'approved', adminNotes)}
                        disabled={actionLoading}
                        style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #2f855a', color: '#2f855a', cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: actionLoading ? 0.5 : 1, transition: 'all 0.15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(47,133,90,0.07)'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                      >
                        {actionLoading ? 'Saving...' : '✓ Approve'}
                      </button>
                      <button
                        onClick={() => updateStatus(s.id, 'changes_requested', adminNotes)}
                        disabled={actionLoading}
                        style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #c53030', color: '#c53030', cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: actionLoading ? 0.5 : 1, transition: 'all 0.15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(197,48,48,0.04)'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                      >
                        ✕ Request Changes
                      </button>
                      <a
                        href={`mailto:${s.students?.email}?subject=Your AerEthos Yearbook Submission&body=${encodeURIComponent(adminNotes || 'Hi ' + s.students?.full_name + ',\n\n')}`}
                        style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(0,53,102,0.2)', color: 'var(--blue)', fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block', transition: 'all 0.15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--gold)'}
                        onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(0,53,102,0.2)'}
                      >
                        Email Student →
                      </a>
                      <button
                        onClick={() => updateStatus(s.id, 'in_progress', '')}
                        disabled={actionLoading}
                        style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(0,53,102,0.15)', color: 'var(--blue)', opacity: 0.5, cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', transition: 'all 0.15s' }}
                      >
                        Reset to In Progress
                      </button>
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
