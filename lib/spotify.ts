import type { SpotifyTrack } from '@/types';

// ── Get access token (Client Credentials flow — no user login needed) ─────────
async function getSpotifyToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    next: { revalidate: 3500 }, // Cache token for ~1 hour
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Spotify auth failed: ${data.error}`);
  return data.access_token;
}

// ── Search for tracks ──────────────────────────────────────────────────────────
export async function searchSpotifyTracks(
  query: string,
  limit = 5
): Promise<SpotifyTrack[]> {
  const token = await getSpotifyToken();

  const params = new URLSearchParams({
    q: query,
    type: 'track',
    limit: String(limit),
    market: 'IE', // Prioritise Irish market results
  });

  const res = await fetch(
    `https://api.spotify.com/v1/search?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) throw new Error('Spotify search failed');
  const data = await res.json();

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
  const token = await getSpotifyToken();

  const res = await fetch(
    `https://api.spotify.com/v1/tracks/${trackId}`,
    { headers: { Authorization: `Bearer ${token}` } }
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
