import { NextResponse } from 'next/server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_URL = 'https://www.googleapis.com/youtube/v3/search';

interface SearchRequest {
  query: string;
  maxResults?: number;
}

export async function POST(request: Request) {
  try {
    const body: SearchRequest = await request.json();
    const { query, maxResults = 1 } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'query string required' }, { status: 400 });
    }

    if (!YOUTUBE_API_KEY) {
      console.error('[YouTube] API key not configured');
      return NextResponse.json({ error: 'YouTube API not configured' }, { status: 500 });
    }

    // Limit maxResults to prevent quota abuse
    const safeMaxResults = Math.min(Math.max(1, maxResults), 25);

    const url = new URL(YOUTUBE_URL);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', query);
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', String(safeMaxResults));
    url.searchParams.set('key', YOUTUBE_API_KEY);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = await response.text();
      console.error('[YouTube] API error:', error);
      return NextResponse.json({ error: 'YouTube search failed' }, { status: response.status });
    }

    const data = await response.json();

    // Format response to only include what we need
    const items = data.items?.map((item: {
      id: { videoId: string };
      snippet: {
        title: string;
        thumbnails: { high?: { url: string }; medium?: { url: string } };
      };
    }) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || '',
    })) || [];

    console.log(`[YouTube] Found ${items.length} results for: ${query.substring(0, 50)}`);

    return NextResponse.json({ items });
  } catch (error) {
    console.error('[YouTube] Error:', error);
    return NextResponse.json({ error: 'YouTube search failed' }, { status: 500 });
  }
}
