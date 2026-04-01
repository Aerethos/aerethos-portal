import type { SpotifyTrack } from '@/types';

// ── Get access token (Client Credentials flow — no user login needed) ─────────
async function getSpotifyToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID || '';
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials missing from environment variables');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('Spotify auth failed:', res.status, JSON.stringify(data));
    throw new Error(`Spotify auth failed: ${data.error} — ${data.error_description}`);
  }

  console.log('Spotify token obtained successfully');
  return data.access_token;
}

// ── Search for tracks ──────────────────────────────────────────────────────────
export async function searchSpotifyTracks(
  query: string,
  limit = 5
): Promise<SpotifyTrack[]> {
  let token: string;

  try {
    token = await getSpotifyToken();
  } catch (err) {
    console.error('Failed to get Spotify token:', err);
    return [];
  }

  const params = new URLSearchParams({
    q: query,
    type: 'track',
    limit: String(limit),
    market: 'IE',
  });

  const res = await fetch(
    `https://api.spotify.com/v1/search?${params}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    const body = await res.text();
    console.error('Spotify search failed:', res.status, body);
    return [];
  }

  const data = await res.json();

  if (!data.tracks?.items) {
    console.error('Unexpected Spotify response:', JSON.stringify(data));
    return [];
  }

  return data.tracks.items.map((item: SpotifyAPITrack) => ({
    id: item.id,
    title: item.name,
    artist: item.artists.map((a: { name: string }) => a.name).join(', '),
    albumName: item.album.name,
    albumArtUrl: item.album.images[0]?.url ?? '',
    previewUrl: item.preview_url,
  }));
}

// ── Get a specific track by ID ─────────────────────────────────────────────────
export async function getSpotifyTrack(trackId: string): Promise<SpotifyTrack | null> {
  let token: string;

  try {
    token = await getSpotifyToken();
  } catch {
    return null;
  }

  const res = await fetch(
    `https://api.spotify.com/v1/tracks/${trackId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }
  );

  if (!res.ok) return null;

  const item: SpotifyAPITrack = await res.json();

  return {
    id: item.id,
    title: item.name,
    artist: item.artists.map((a: { name: string }) => a.name).join(', '),
    albumName: item.album.name,
    albumArtUrl: item.album.images[0]?.url ?? '',
    previewUrl: item.preview_url,
  };
}

interface SpotifyAPITrack {
  id: string;
  name: string;
  preview_url: string | null;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string; width: number; height: number }>;
  };
}
