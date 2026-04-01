import type { SpotifyTrack } from '@/types';

// ── iTunes Search API — free, no auth, no Premium needed ─────────────────────
// Reuses SpotifyTrack type — shape is identical

export async function searchSpotifyTracks(
  query: string,
  limit = 5
): Promise<SpotifyTrack[]> {
  const params = new URLSearchParams({
    term: query,
    entity: 'song',
    limit: String(limit),
    country: 'IE',
  });

  try {
    const res = await fetch(
      `https://itunes.apple.com/search?${params}`,
      { cache: 'no-store' }
    );

    if (!res.ok) {
      console.error('iTunes search failed:', res.status);
      return [];
    }

    const data = await res.json();
    if (!data.results?.length) return [];

    return data.results.map((item: iTunesTrack) => ({
      id: String(item.trackId),
      title: item.trackName,
      artist: item.artistName,
      albumName: item.collectionName ?? '',
      albumArtUrl: (item.artworkUrl100 ?? '').replace('100x100bb', '300x300bb'),
      previewUrl: item.previewUrl ?? null,
    }));
  } catch (err) {
    console.error('iTunes search error:', err);
    return [];
  }
}

export async function getSpotifyTrack(trackId: string): Promise<SpotifyTrack | null> {
  try {
    const res = await fetch(
      `https://itunes.apple.com/lookup?id=${trackId}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.results?.[0]) return null;
    const item: iTunesTrack = data.results[0];
    return {
      id: String(item.trackId),
      title: item.trackName,
      artist: item.artistName,
      albumName: item.collectionName ?? '',
      albumArtUrl: (item.artworkUrl100 ?? '').replace('100x100bb', '300x300bb'),
      previewUrl: item.previewUrl ?? null,
    };
  } catch {
    return null;
  }
}

interface iTunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  previewUrl?: string;
}
