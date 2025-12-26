import type { Song, LyricLine } from '../types';
import * as LrcLib from './lyrics';
import type { LrcLibTrack } from './lyrics';
import * as YouTube from './youtube';
import * as DeepL from './translation';
import { getSupabase } from '../lib/supabase';

// ============ Supabase Song Cache ============

interface CachedSongRow {
  id: string;
  title: string;
  artist: string;
  youtube_id: string;
  lyrics: LyricLine[];
}

async function getCachedSong(trackId: string): Promise<Song | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('songs_cache')
      .select('*')
      .eq('id', trackId)
      .single();

    if (error || !data) return null;

    const row = data as CachedSongRow;
    return {
      id: row.youtube_id, // Always use youtube_id as the song ID for consistency
      title: row.title,
      artist: row.artist,
      youtubeId: row.youtube_id,
      lyrics: row.lyrics,
    };
  } catch {
    return null;
  }
}

async function saveSongToCache(song: Song): Promise<void> {
  try {
    const supabase = getSupabase();
    await supabase.from('songs_cache').upsert({
      id: song.id,
      title: song.title,
      artist: song.artist,
      youtube_id: song.youtubeId,
      lyrics: song.lyrics,
    });
  } catch (err) {
    console.error('Failed to save song to cache:', err);
  }
}

// ============ Public API ============

// Expose for UI suggestions
export const getSearchSuggestions = async (query: string): Promise<LrcLibTrack[]> => {
  if (!query.trim()) return [];
  return await LrcLib.searchTrack(query);
};

// Process a specific track into a full Song object (YouTube + Translations)
export const processTrackToSong = async (track: LrcLibTrack): Promise<Song> => {
  const trackId = String(track.id);

  // 1. Check Supabase cache first
  const cachedSong = await getCachedSong(trackId);
  if (cachedSong) {
    console.log(`[Supabase Cache] Hit for track ID: ${trackId}`);
    return cachedSong;
  }

  console.log(`[Supabase Cache] Miss for track ID: ${trackId}. Fetching and translating...`);

  if (!track.syncedLyrics) {
    console.warn('No synced lyrics found for this track');
  }

  // 2. Search YouTube for Video ID
  const videoSearchQuery = `${track.artistName} ${track.name} official video`;
  let youtubeId = await YouTube.findVideoId(videoSearchQuery);

  if (!youtubeId) {
    console.warn('YouTube API failed. Using fallback video.');
    youtubeId = 'K4DyBUG242c';
  }

  // 3. Parse Lyrics
  const parsedLyrics = LrcLib.parseLrc(track.syncedLyrics || '');

  // 4. Translate Lyrics (this consumes API tokens)
  const originalTexts = parsedLyrics.map((l) => l.text_es);
  const translatedTexts = await DeepL.translateLyrics(originalTexts);

  // 5. Construct Final Song Object
  const lyrics: LyricLine[] = parsedLyrics.map((line, index) => ({
    ...line,
    text_en: translatedTexts[index] || '',
  }));

  const song: Song = {
    id: youtubeId, // Use youtubeId as the primary identifier
    title: track.name,
    artist: track.artistName,
    youtubeId: youtubeId,
    lyrics: lyrics,
  };

  // 6. Save to Supabase cache (async, don't wait)
  saveSongToCache(song);

  return song;
};

// Legacy/Direct Search wrapper
export const searchAndBuildSong = async (query: string): Promise<Song | null> => {
  // 1. Search for track
  const tracks = await getSearchSuggestions(query);
  if (!tracks || tracks.length === 0) return null;

  // Pick the first synced track preferably, or just first one
  const track = tracks.find((t) => t.syncedLyrics) || tracks[0];

  // 2. Process (will check cache internally)
  return await processTrackToSong(track);
};

// Build song from YouTube ID directly (for playing from library/explore)
export const buildSongFromYouTube = async (
  youtubeId: string,
  title: string,
  artist: string
): Promise<Song | null> => {
  try {
    console.log(`[buildSongFromYouTube] Building song: ${artist} - ${title}`);
    
    // Search for synced lyrics using title + artist
    const query = `${artist} ${title}`;
    const tracks = await LrcLib.searchTrack(query);
    
    console.log(`[buildSongFromYouTube] Found ${tracks?.length || 0} tracks from LrcLib`);
    
    // Find track with synced lyrics preferably
    const syncedTrack = tracks?.find((t) => t.syncedLyrics);
    const anyTrack = tracks?.[0];
    const track = syncedTrack || anyTrack;
    
    // If we found a cached version by youtube_id, return it
    const supabase = getSupabase();
    const { data: cachedRow } = await supabase
      .from('songs_cache')
      .select('*')
      .eq('youtube_id', youtubeId)
      .single();

    if (cachedRow) {
      console.log(`[Supabase Cache] Hit for song`);
      return {
        id: cachedRow.youtube_id, // Always use youtube_id as the song ID for consistency
        title: cachedRow.title,
        artist: cachedRow.artist,
        youtubeId: cachedRow.youtube_id,
        lyrics: cachedRow.lyrics,
      };
    }

    // If we have synced lyrics, parse and translate them
    if (track?.syncedLyrics) {
      console.log(`[buildSongFromYouTube] Found synced lyrics, translating...`);
      const parsedLyrics = LrcLib.parseLrc(track.syncedLyrics);
      const originalTexts = parsedLyrics.map((l) => l.text_es);
      const translatedTexts = await DeepL.translateLyrics(originalTexts);

      const lyrics = parsedLyrics.map((line, index) => ({
        ...line,
        text_en: translatedTexts[index] || '',
      }));

      const song: Song = {
        id: youtubeId,
        title,
        artist,
        youtubeId,
        lyrics,
      };

      saveSongToCache(song);
      return song;
    }

    // Fallback: Return song with empty lyrics so video can still play
    console.warn(`[buildSongFromYouTube] No synced lyrics found, returning song without lyrics`);
    const song: Song = {
      id: youtubeId, // Use YouTube ID as the song ID
      title,
      artist,
      youtubeId,
      lyrics: [], // Empty lyrics - video will still play
    };

    return song;
  } catch (err) {
    console.error('[buildSongFromYouTube] Error:', err);
    
    return {
      id: youtubeId,
      title,
      artist,
      youtubeId,
      lyrics: [],
    };
  }
};

// Re-translate an existing song to a new target language
export const translateSongLyrics = async (song: Song, targetLang: string): Promise<Song> => {
  // If no lyrics, nothing to translate
  if (!song.lyrics || song.lyrics.length === 0) return song;

  console.log(`[translateSongLyrics] Translating song "${song.title}" to ${targetLang}...`);

  // Extract original texts (assuming text_es is the source/original)
  const originalTexts = song.lyrics.map((l) => l.text_es);
  
  // Translate
  const translatedTexts = await DeepL.translateLyrics(originalTexts, targetLang);

  // Update lyrics
  const newLyrics = song.lyrics.map((line, index) => ({
    ...line,
    text_en: translatedTexts[index] || '', // Overwriting text_en with new translation
  }));

  const updatedSong: Song = {
    ...song,
    lyrics: newLyrics,
  };

  // Update cache (WARNING: This overwrites the cached version with the new language)
  // This effectively changes the "default" language for this song in the DB.
  saveSongToCache(updatedSong);

  return updatedSong;
};
