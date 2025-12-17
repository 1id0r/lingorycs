import type { Song, LyricLine } from '../types';
import * as LrcLib from './lyrics';
import type { LrcLibTrack } from './lyrics';
import * as YouTube from './youtube';
import * as DeepL from './translation';
import { cache } from '../utils/cache';

// Expose for UI suggestions
export const getSearchSuggestions = async (query: string): Promise<LrcLibTrack[]> => {
  if (!query.trim()) return [];
  return await LrcLib.searchTrack(query);
};

// Process a specific track into a full Song object (YouTube + Translations)
export const processTrackToSong = async (track: LrcLibTrack): Promise<Song> => {
  // 0. Check Cache by Track ID (Canonical Cache)
  const cacheKey = `song_${track.id}`;
  const cachedSong = cache.getItem<Song>(cacheKey);
  if (cachedSong) {
    console.log(`Cache hit for track ID: ${track.id}`);
    return cachedSong;
  }

  if (!track.syncedLyrics) {
      console.warn("No synced lyrics found for this track");
  }

  // 1. Search YouTube for Video ID using Artist + Title
  const videoSearchQuery = `${track.artistName} ${track.name} official video`;
  let youtubeId = await YouTube.findVideoId(videoSearchQuery);
  
  if (!youtubeId) {
      console.warn("YouTube API failed or returned no results. Using fallback video.");
      youtubeId = 'K4DyBUG242c'; // Elektronomia - Sky High (NCS Release)
  }

  // 2. Parse Lyrics
  const parsedLyrics = LrcLib.parseLrc(track.syncedLyrics || "");

  // 3. Translate Lyrics (Batch Request)
  const originalTexts = parsedLyrics.map(l => l.text_es);
  const translatedTexts = await DeepL.translateLyrics(originalTexts);

  // 4. Construct Final Song Object
  const lyrics: LyricLine[] = parsedLyrics.map((line, index) => ({
    ...line,
    text_en: translatedTexts[index] || ""
  }));

  const song: Song = {
    id: String(track.id),
    title: track.name,
    artist: track.artistName,
    youtubeId: youtubeId,
    lyrics: lyrics
  };

  // 5. Save to Cache (Canonical)
  cache.setItem(cacheKey, song);
  return song;
};

// Legacy/Direct Search wrapper
export const searchAndBuildSong = async (query: string): Promise<Song | null> => {
  const normalizedQuery = query.trim().toLowerCase();
  
  // 0. Check Cache (Query Cache)
  const cachedSong = cache.getItem<Song>(normalizedQuery);
  if (cachedSong) {
    console.log(`Cache hit for query: "${query}"`);
    return cachedSong;
  }

  // 1. Search for track
  const tracks = await getSearchSuggestions(query);
  if (!tracks || tracks.length === 0) return null;

  // Pick the first synced track preferably, or just first one
  const track = tracks.find(t => t.syncedLyrics) || tracks[0];
  
  // 2. Process
  const song = await processTrackToSong(track);

  // 3. Save to Cache (Query Cache)
  // We map the query string to the result we got
  cache.setItem(normalizedQuery, song);
  console.log(`Cache miss. Saved result for query: "${query}"`);

  return song;
};

// Build song from YouTube ID directly (for playing from library)
export const buildSongFromYouTube = async (
  youtubeId: string, 
  title: string, 
  artist: string
): Promise<Song | null> => {
  const cacheKey = `song_yt_${youtubeId}`;
  const cachedSong = cache.getItem<Song>(cacheKey);
  if (cachedSong) {
    console.log(`Cache hit for YouTube ID: ${youtubeId}`);
    return cachedSong;
  }

  try {
    // Search for synced lyrics using title + artist
    const query = `${artist} ${title}`;
    const tracks = await LrcLib.searchTrack(query);
    const track = tracks.find(t => t.syncedLyrics) || tracks[0];

    if (!track || !track.syncedLyrics) {
      console.warn('No synced lyrics found for library song');
      return null;
    }

    // Parse lyrics
    const parsedLyrics = LrcLib.parseLrc(track.syncedLyrics);

    // Translate
    const originalTexts = parsedLyrics.map(l => l.text_es);
    const translatedTexts = await DeepL.translateLyrics(originalTexts);

    const lyrics = parsedLyrics.map((line, index) => ({
      ...line,
      text_en: translatedTexts[index] || ""
    }));

    const song: Song = {
      id: String(track.id),
      title,
      artist,
      youtubeId,
      lyrics
    };

    cache.setItem(cacheKey, song);
    return song;
  } catch (err) {
    console.error('Error building song from YouTube ID:', err);
    return null;
  }
};
