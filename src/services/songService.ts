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
      id: row.id,
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
    id: trackId,
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

// Build song from YouTube ID directly (for playing from library)
export const buildSongFromYouTube = async (
  youtubeId: string,
  title: string,
  artist: string
): Promise<Song | null> => {
  try {
    // Search for synced lyrics using title + artist
    const query = `${artist} ${title}`;
    const tracks = await LrcLib.searchTrack(query);
    const track = tracks.find((t) => t.syncedLyrics) || tracks[0];

    if (!track || !track.syncedLyrics) {
      console.warn('No synced lyrics found for library song');
      return null;
    }

    // Check cache first
    const cached = await getCachedSong(String(track.id));
    if (cached) {
      console.log(`[Supabase Cache] Hit for library song`);
      return { ...cached, youtubeId }; // Use the provided YouTube ID
    }

    // Parse and translate
    const parsedLyrics = LrcLib.parseLrc(track.syncedLyrics);
    const originalTexts = parsedLyrics.map((l) => l.text_es);
    const translatedTexts = await DeepL.translateLyrics(originalTexts);

    const lyrics = parsedLyrics.map((line, index) => ({
      ...line,
      text_en: translatedTexts[index] || '',
    }));

    const song: Song = {
      id: String(track.id),
      title,
      artist,
      youtubeId,
      lyrics,
    };

    // Save to cache
    saveSongToCache(song);

    return song;
  } catch (err) {
    console.error('Error building song from YouTube ID:', err);
    return null;
  }
};
