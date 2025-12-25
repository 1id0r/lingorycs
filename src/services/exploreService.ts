import { getSupabase } from '../lib/supabase';

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours

export interface ExploreSong {
  youtubeId: string;
  title: string;
  artist: string;
  thumbnail: string;
}

interface CachedGenreData {
  genre: string;
  songs: ExploreSong[];
  updated_at: string;
}

export const GENRES = [
  { id: 'reggaeton', label: 'Reggaeton', query: 'reggaeton official music video -mix -live -remix' },
  { id: 'bachata', label: 'Bachata', query: 'bachata official music video -mix -live -remix' },
  { id: 'salsa', label: 'Salsa', query: 'salsa official music video -mix -live' },
  { id: 'cumbia', label: 'Cumbia', query: 'cumbia official music video -mix -live' },
  { id: 'latin-pop', label: 'Latin Pop', query: 'latin pop official music video 2024 -mix -live' },
];

// Parse YouTube video title into title and artist
function parseVideoTitle(fullTitle: string): { title: string; artist: string } {
  // Common patterns: "Artist - Title", "Title - Artist", "Artist | Title"
  const separators = [' - ', ' – ', ' — ', ' | '];
  
  for (const sep of separators) {
    if (fullTitle.includes(sep)) {
      const parts = fullTitle.split(sep);
      if (parts.length >= 2) {
        // Assume first part is artist, second is title
        return {
          artist: parts[0].trim(),
          title: parts.slice(1).join(sep).trim(),
        };
      }
    }
  }
  
  // No separator found, use full title
  return { title: fullTitle, artist: 'Unknown Artist' };
}

// Keywords that indicate a mix/compilation (not a single song)
const EXCLUDE_KEYWORDS = [
  'mix', 'session', 'dj set', 'compilation', 'playlist', 'hour', 
  'nonstop', 'megamix', 'medley', 'mashup', 'best of', 'top 10',
  'top 20', 'exitos', 'greatest hits', 'lo mejor'
];

function isMixOrCompilation(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  return EXCLUDE_KEYWORDS.some(keyword => lowerTitle.includes(keyword));
}

// Fetch songs from YouTube API
async function fetchFromYouTube(query: string): Promise<ExploreSong[]> {
  if (!YOUTUBE_API_KEY) {
    console.error('YouTube API key missing');
    return [];
  }

  try {
    // Fetch more results so we can filter and still have enough
    const response = await fetch(
      `${YOUTUBE_BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=25&videoCategoryId=10&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      console.error('YouTube API error:', await response.text());
      return [];
    }

    const data = await response.json();
    
    const songs = data.items?.map((item: { id: { videoId: string }; snippet: { title: string; thumbnails: { high?: { url: string }; medium?: { url: string } } } }) => {
      const { title, artist } = parseVideoTitle(item.snippet.title);
      return {
        youtubeId: item.id.videoId,
        title,
        artist,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || '',
        rawTitle: item.snippet.title, // Keep original for filtering
      };
    }) || [];

    // Filter out mixes and compilations, then take first 12
    const filteredSongs = songs
      .filter((song: { rawTitle: string }) => !isMixOrCompilation(song.rawTitle))
      .slice(0, 12)
      .map(({ rawTitle, ...rest }: { rawTitle: string; youtubeId: string; title: string; artist: string; thumbnail: string }) => rest);

    console.log(`[Explore] Filtered ${songs.length - filteredSongs.length} mixes, keeping ${filteredSongs.length} songs`);
    
    return filteredSongs;
  } catch (err) {
    console.error('Failed to fetch from YouTube:', err);
    return [];
  }
}

// Get cached genre data from Supabase
async function getCachedGenre(genre: string): Promise<ExploreSong[] | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('explore_cache')
      .select('*')
      .eq('genre', genre)
      .single();

    if (error || !data) return null;

    const cached = data as CachedGenreData;
    const updatedAt = new Date(cached.updated_at).getTime();
    const now = Date.now();

    // Check if cache is still fresh
    if (now - updatedAt < CACHE_DURATION_MS) {
      console.log(`[Explore Cache] Hit for genre: ${genre}`);
      return cached.songs;
    }

    console.log(`[Explore Cache] Stale for genre: ${genre}`);
    return null;
  } catch {
    return null;
  }
}

// Save genre data to Supabase cache
async function saveToCache(genre: string, songs: ExploreSong[]): Promise<void> {
  try {
    const supabase = getSupabase();
    await supabase.from('explore_cache').upsert(
      {
        genre,
        songs,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'genre' }
    );
    console.log(`[Explore Cache] Saved ${songs.length} songs for genre: ${genre}`);
  } catch (err) {
    console.error('Failed to save to cache:', err);
  }
}

// Main function: Get songs for a genre
export async function getGenreSongs(genreId: string): Promise<ExploreSong[]> {
  const genre = GENRES.find((g) => g.id === genreId);
  if (!genre) return [];

  // Check cache first
  const cached = await getCachedGenre(genreId);
  if (cached && cached.length > 0) {
    return cached;
  }

  // Fetch from YouTube
  console.log(`[Explore] Fetching from YouTube for: ${genre.query}`);
  const songs = await fetchFromYouTube(genre.query);

  // Save to cache (async)
  if (songs.length > 0) {
    saveToCache(genreId, songs);
  }

  return songs;
}
