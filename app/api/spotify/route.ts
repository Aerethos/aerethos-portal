import { NextRequest, NextResponse } from 'next/server';
import { searchSpotifyTracks } from '@/lib/spotify';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ error: 'Query too short' }, { status: 400 });
  }

  try {
    const tracks = await searchSpotifyTracks(query, 5);
    return NextResponse.json({ tracks });
  } catch (err) {
    console.error('Spotify search error:', err);
    // Return empty results instead of crashing
    return NextResponse.json({ tracks: [], error: String(err) }, { status: 200 });
  }
}
