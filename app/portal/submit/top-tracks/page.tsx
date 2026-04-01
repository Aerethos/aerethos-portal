'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePortal } from '@/lib/portal-context';
import type { SpotifyTrack } from '@/types';

function TrackSearch({
  num,
  selected,
  onSelect,
}: {
  num: 1 | 2;
  selected: SpotifyTrack | null;
  onSelect: (t: SpotifyTrack) => void;
}) {
  const [query, setQuery] = useState(selected ? `${selected.title} ${selected.artist}` : '');
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Spotify search with debounce
  useEffect(() => {
    if (query.length < 2) { setResults([]); setShowResults(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/spotify?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setResults(data.tracks ?? []);
        setShowResults(true);
      } catch {
        setResults([]);
        setShowResults(false);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [query]);

  const handleSelect = (track: SpotifyTrack) => {
    onSelect(track);
    setQuery(`${track.title} — ${track.artist}`);
    setShowResults(false);
    setResults([]);
  };

  return (
    <div className="track-card" ref={containerRef}>
      <div className="track-card-label">Track 0{num}</div>

      {/* Confirmed track display */}
      {selected && !showResults && (
        <div className="track-found" style={{ marginBottom: 16 }}>
          {selected.albumArtUrl && (
            <img
              src={selected.albumArtUrl}
              alt={selected.albumName}
              style={{ width: 56, height: 56, flexShrink: 0, objectFit: 'cover' }}
            />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#2f855a', marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
              ✓ Track confirmed
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: 'var(--blue)', marginBottom: 2 }}>
              {selected.title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--blue)', opacity: 0.5 }}>
              {selected.artist} · {selected.albumName}
            </div>
          </div>
          <button
            onClick={() => { onSelect(null as unknown as SpotifyTrack); setQuery(''); setResults([]); }}
            className="ae-btn-ghost"
            style={{ fontSize: 10, padding: '6px 12px' }}
          >
            Change
          </button>
        </div>
      )}

      {/* Search input */}
      <div style={{ position: 'relative' }}>
        <label className="ae-label">
          {selected && !showResults ? 'Search for a different track' : 'Search Spotify'}
        </label>
        <div style={{ position: 'relative' }}>
          <input
            className="ae-input"
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              if (e.target.value.length >= 2) setShowResults(true);
            }}
            onFocus={() => results.length > 0 && setShowResults(true)}
            placeholder="Song title or artist..."
            autoComplete="off"
          />
          {searching && (
            <div style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              width: 14, height: 14,
              border: '2px solid rgba(0,53,102,0.1)',
              borderTopColor: 'var(--gold)',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }}/>
          )}
        </div>

        {/* Results dropdown */}
        {showResults && results.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
            background: 'white',
            border: '1px solid rgba(0,53,102,0.1)',
            borderTop: '2px solid var(--gold)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            maxHeight: 320,
            overflowY: 'auto',
          }}>
            {results.map(track => (
              <button
                key={track.id}
                onMouseDown={e => e.preventDefault()}
                onClick={() => handleSelect(track)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: '1px solid rgba(0,53,102,0.05)',
                  textAlign: 'left', transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,53,102,0.04)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
              >
                {track.albumArtUrl ? (
                  <img
                    src={track.albumArtUrl}
                    alt={track.albumName}
                    style={{ width: 40, height: 40, flexShrink: 0, objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: 40, height: 40, flexShrink: 0, background: 'rgba(0,53,102,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>♫</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--blue)', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {track.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--blue)', opacity: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {track.artist} · {track.albumName}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No results message */}
        {showResults && !searching && results.length === 0 && query.length >= 2 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
            background: 'white',
            border: '1px solid rgba(0,53,102,0.1)',
            borderTop: '2px solid var(--gold)',
            padding: '16px 14px',
            fontSize: 13, color: 'var(--blue)', opacity: 0.5,
          }}>
            No results found. Try a different search.
          </div>
        )}
      </div>
    </div>
  );
}

export default function TopTracksStep() {
  const router = useRouter();
  const { form, updateForm, saveStep, saving } = usePortal();

  const handleNext = async () => {
    await saveStep({
      track_1_title: form.track1?.title,
      track_1_artist: form.track1?.artist,
      track_1_album_art_url: form.track1?.albumArtUrl,
      track_1_spotify_id: form.track1?.id,
      track_2_title: form.track2?.title,
      track_2_artist: form.track2?.artist,
      track_2_album_art_url: form.track2?.albumArtUrl,
      track_2_spotify_id: form.track2?.id,
    });
    router.push('/portal/submit/review');
  };

  const canProceed = !!form.track1 && !!form.track2;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <header className="portal-header">
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span className="portal-logo">AerEthos</span>
          <span className="portal-logo-sub">Student Portal</span>
        </div>
        <a href="/portal/dashboard" className="ae-btn-secondary" style={{ fontSize: 10, textDecoration: 'none' }}>
          {saving ? 'Saving...' : 'Dashboard'}
        </a>
      </header>

      <div style={{ paddingTop: 64 }}>
        <div className="progress-strip">
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="progress-meta">
              <span className="progress-step-label">Step 6 of 6</span>
              <span className="progress-name">Top Tracks</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: '100%' }}/>
            </div>
          </div>
        </div>
      </div>

      <div className="portal-content">
        <div className="ae-card fade-up">
          <div className="ae-eyebrow"><div className="ae-eyebrow-line"/><span className="ae-eyebrow-text">Step 06</span></div>
          <h1 className="ae-h1">Your top<br/><em>two tracks.</em></h1>
          <p className="ae-lead">Search Spotify and select the two songs that defined your year. Album artwork is pulled automatically.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 32 }}>
            <TrackSearch
              num={1}
              selected={form.track1}
              onSelect={t => updateForm({ track1: t })}
            />
            <TrackSearch
              num={2}
              selected={form.track2}
              onSelect={t => updateForm({ track2: t })}
            />
          </div>

          <div className="ae-notice" style={{ marginBottom: 36 }}>
            <div className="ae-notice-body">
              Can&apos;t find your track? Try searching just the song title, or just the artist name.
              Spotify&apos;s catalogue covers most songs — if yours isn&apos;t there, contact{' '}
              <a href="mailto:nathan@aerethos.com" style={{ color: 'var(--gold)' }}>nathan@aerethos.com</a> and we&apos;ll sort it.
            </div>
          </div>

          <div className="step-nav">
            <button className="ae-btn-secondary" onClick={() => router.push('/portal/submit/story')}>← Back</button>
            <button className="ae-btn-primary" onClick={handleNext} disabled={!canProceed || saving}>
              <span>{saving ? 'Saving...' : 'Review & Submit →'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
