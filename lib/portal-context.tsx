'use client';

import {
  createContext, useContext, useEffect, useState, useCallback,
  type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import type { PortalFormState, Submission, SpotifyTrack } from '@/types';

const DEFAULT_STATE: PortalFormState = {
  profilePhotoFile: null,
  profilePhotoUrl: null,
  backdropColorHex: '#4A7BA7',
  backdropColorName: 'Ocean Blue',
  memoryPhotos: [],
  quote: '',
  quoteAttribution: '',
  storyAchievement: '',
  storyBestMemory: '',
  storyThisYear: '',
  storyNext: '',
  track1: null,
  track2: null,
};

interface PortalContextValue {
  form: PortalFormState;
  updateForm: (updates: Partial<PortalFormState>) => void;
  submission: Submission | null;
  loading: boolean;
  saving: boolean;
  saveStep: (stepData: Record<string, unknown>) => Promise<void>;
  submitAll: () => Promise<boolean>;
  completedSteps: Set<string>;
}

const PortalContext = createContext<PortalContextValue | null>(null);

export function PortalProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<PortalFormState>(DEFAULT_STATE);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // Load existing submission on mount
  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setLoading(false); return; }

      const res = await fetch('/api/submit', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        const { submission: existing } = await res.json();
        if (existing) {
          setSubmission(existing);
          // Hydrate form state from saved submission
          setForm(prev => ({
            ...prev,
            profilePhotoUrl: existing.profile_photo_url,
            backdropColorHex: existing.backdrop_color_hex ?? prev.backdropColorHex,
            backdropColorName: existing.backdrop_color_name ?? prev.backdropColorName,
            quote: existing.quote_text ?? '',
            quoteAttribution: existing.quote_attribution ?? '',
            storyAchievement: existing.story_achievement ?? '',
            storyBestMemory: existing.story_best_memory ?? '',
            storyThisYear: existing.story_this_year ?? '',
            storyNext: existing.story_next ?? '',
            track1: existing.track_1_spotify_id ? {
              id: existing.track_1_spotify_id,
              title: existing.track_1_title,
              artist: existing.track_1_artist,
              albumArtUrl: existing.track_1_album_art_url,
              albumName: '',
              previewUrl: null,
            } : null,
            track2: existing.track_2_spotify_id ? {
              id: existing.track_2_spotify_id,
              title: existing.track_2_title,
              artist: existing.track_2_artist,
              albumArtUrl: existing.track_2_album_art_url,
              albumName: '',
              previewUrl: null,
            } : null,
          }));
          setCompletedSteps(new Set(existing.completed_steps ?? []));
        }
      }
      setLoading(false);
      } catch (err) {
        console.error('Portal load error:', err);
        setLoading(false);
      }
    }
    load();
  }, []);

  const updateForm = useCallback((updates: Partial<PortalFormState>) => {
    setForm(prev => ({ ...prev, ...updates }));
  }, []);

  const saveStep = useCallback(async (stepData: Record<string, unknown>) => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch('/api/submit', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(stepData),
      });
    } finally {
      setSaving(false);
    }
  }, []);

  const submitAll = useCallback(async (): Promise<boolean> => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const payload = {
        profile_photo_url: form.profilePhotoUrl,
        backdrop_color_hex: form.backdropColorHex,
        backdrop_color_name: form.backdropColorName,
        memory_photo_urls: form.memoryPhotos.map(p => p.url),
        quote_text: form.quote,
        quote_attribution: form.quoteAttribution || null,
        story_achievement: form.storyAchievement,
        story_best_memory: form.storyBestMemory,
        story_this_year: form.storyThisYear,
        story_next: form.storyNext,
        track_1_title: form.track1?.title ?? null,
        track_1_artist: form.track1?.artist ?? null,
        track_1_album_art_url: form.track1?.albumArtUrl ?? null,
        track_1_spotify_id: form.track1?.id ?? null,
        track_2_title: form.track2?.title ?? null,
        track_2_artist: form.track2?.artist ?? null,
        track_2_album_art_url: form.track2?.albumArtUrl ?? null,
        track_2_spotify_id: form.track2?.id ?? null,
        completed_steps: Array.from(completedSteps),
      };

      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      return res.ok;
    } finally {
      setSaving(false);
    }
  }, [form, completedSteps]);

  return (
    <PortalContext.Provider value={{
      form, updateForm, submission, loading, saving,
      saveStep, submitAll, completedSteps,
    }}>
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error('usePortal must be used inside PortalProvider');
  return ctx;
}
