// ─────────────────────────────────────────────────────────────────────────────
// AERETHOS PORTAL — TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type SubmissionStatus =
  | 'not_started'
  | 'in_progress'
  | 'submitted'
  | 'approved'
  | 'changes_requested';

export type StepKey =
  | 'profile_photo'
  | 'backdrop_color'
  | 'memory_photos'
  | 'quote'
  | 'story'
  | 'top_tracks';

// ── Database types (mirrors Supabase schema) ──────────────────────────────────

export interface School {
  id: string;
  name: string;
  slug: string;           // e.g. "waterpark-college"
  year: string;           // e.g. "2026"
  deadline: string;       // ISO date string
  active: boolean;
  created_at: string;
}

export interface Student {
  id: string;
  school_id: string;
  email: string;
  full_name: string;
  student_id: string;     // school-assigned ID e.g. "WPC-2026-060"
  class_label: string;    // e.g. "Class of 2026"
  created_at: string;
  last_login: string | null;
}

export interface Submission {
  id: string;
  student_id: string;
  school_id: string;
  status: SubmissionStatus;

  // Step data
  profile_photo_url: string | null;
  backdrop_color_hex: string | null;
  backdrop_color_name: string | null;
  memory_photo_urls: string[];
  quote_text: string | null;
  quote_attribution: string | null;
  story_achievement: string | null;
  story_best_memory: string | null;
  story_this_year: string | null;
  story_next: string | null;
  track_1_title: string | null;
  track_1_artist: string | null;
  track_1_album_art_url: string | null;
  track_1_spotify_id: string | null;
  track_2_title: string | null;
  track_2_artist: string | null;
  track_2_album_art_url: string | null;
  track_2_spotify_id: string | null;

  // Meta
  completed_steps: StepKey[];
  submitted_at: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  albumName: string;
  albumArtUrl: string;
  previewUrl: string | null;
}

// ── Client-side form state ────────────────────────────────────────────────────

export interface PortalFormState {
  profilePhotoFile: File | null;
  profilePhotoUrl: string | null;
  backdropColorHex: string;
  backdropColorName: string;
  memoryPhotos: Array<{ id: string; url: string; file: File }>;
  quote: string;
  quoteAttribution: string;
  storyAchievement: string;
  storyBestMemory: string;
  storyThisYear: string;
  storyNext: string;
  track1: SpotifyTrack | null;
  track2: SpotifyTrack | null;
}
