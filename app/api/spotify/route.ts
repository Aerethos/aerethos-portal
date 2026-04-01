import { NextRequest, NextResponse } from 'next/server';
import { searchSpotifyTracks } from '@/lib/spotify';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ tracks: [] });
  }

  try {
    const tracks = await searchSpotifyTracks(query, 5);
    return NextResponse.json({ tracks });
  } catch (err) {
    console.error('Music search error:', err);
    return NextResponse.json({ tracks: [] });
  }
}
