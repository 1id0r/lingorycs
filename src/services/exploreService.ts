import { getSupabase } from '../lib/supabase';
import { searchVideos } from './youtube';
import { searchTrack } from './lyrics';

const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours

export interface ExploreSong {
  youtubeId: string;
  title: string;
  artist: string;
  thumbnail: string;
  isSynced?: boolean;
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
  const separators = [' - ', ' – ', ' — ', ' | '];

  for (const sep of separators) {
    if (fullTitle.includes(sep)) {
      const parts = fullTitle.split(sep);
      if (parts.length >= 2) {
        return {
          artist: parts[0].trim(),
          title: parts.slice(1).join(sep).trim(),
        };
      }
    }
  }

  return { title: fullTitle, artist: 'Unknown Artist' };
}

// Keywords that indicate a mix/compilation (not a single song)
const EXCLUDE_KEYWORDS = [
  'mix',
  'session',
  'dj set',
  'compilation',
  'playlist',
  'hour',
  'nonstop',
  'megamix',
  'medley',
  'mashup',
  'best of',
  'top 10',
  'top 20',
  'exitos',
  'greatest hits',
  'lo mejor',
];

function isMixOrCompilation(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  return EXCLUDE_KEYWORDS.some((keyword) => lowerTitle.includes(keyword));
}

// Fetch songs from YouTube via secure API route
async function fetchFromYouTube(query: string): Promise<ExploreSong[]> {
  try {
    const items = await searchVideos(query, 80); // Increased from 25 to get a larger pool

    const songs = items.map((item) => {
      const { title, artist } = parseVideoTitle(item.title);
      return {
        youtubeId: item.videoId,
        title,
        artist,
        thumbnail: item.thumbnail,
        rawTitle: item.title,
      };
    });

    // Filter out mixes and compilations
    const filteredSongs = songs.filter((song) => !isMixOrCompilation(song.rawTitle));

    console.log(`[Explore] Filtered ${songs.length - filteredSongs.length} mixes. Checking sync status for the rest...`);

    // Check LRCLIB for synced lyrics for each song (parallel)
    const syncedSongs = await Promise.all(
      filteredSongs.map(async (song) => {
        try {
          const lrcQuery = `${song.artist} ${song.title}`;
          const tracks = await searchTrack(lrcQuery);
          const hasSynced = tracks.some((t) => t.syncedLyrics && t.syncedLyrics.length > 0);
          
          if (hasSynced) {
            return { 
              youtubeId: song.youtubeId,
              title: song.title,
              artist: song.artist,
              thumbnail: song.thumbnail,
              isSynced: true 
            } as ExploreSong;
          }
          return null;
        } catch {
          return null;
        }
      })
    );

    // Keep only synced songs and limit to 20
    const finalSongs = syncedSongs.filter((s): s is ExploreSong => s !== null).slice(0, 24);
    
    console.log(`[Explore] Found ${finalSongs.length} synced songs out of ${filteredSongs.length} candidates`);

    return finalSongs;
  } catch (err) {
    console.error('Failed to fetch from YouTube:', err);
    return [];
  }
}

// Get cached genre data from Supabase
async function getCachedGenre(genre: string): Promise<ExploreSong[] | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('explore_cache').select('*').eq('genre', genre).single();

    if (error || !data) return null;

    const cached = data as CachedGenreData;
    const updatedAt = new Date(cached.updated_at).getTime();
    const now = Date.now();

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
