import type { LyricLine } from '../types';

const BASE_URL = 'https://lrclib.net/api';

export interface LrcLibTrack {
  id: number;
  name: string;
  artistName: string;
  albumName: string;
  duration: number;
  syncedLyrics?: string;
}

export const searchTrack = async (query: string): Promise<LrcLibTrack[]> => {
  const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Failed to fetch from LRCLIB');
  const data = await response.json();
  return data;
};

export const getTrackDetails = async (id: number): Promise<LrcLibTrack> => {
  const response = await fetch(`${BASE_URL}/get/${id}`);
  if (!response.ok) throw new Error('Failed to fetch track details');
  return await response.json();
};

export const parseLrc = (lrcString: string): Omit<LyricLine, 'text_en'>[] => {
  const lines = lrcString.split('\n');
  const result = [];
  
  // Format: [mm:ss.xx] text
  const regex = /^\[(\d{2}):(\d{2})\.(\d{2})\](.*)/;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(regex);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const hundredths = parseInt(match[3]);
      const text = match[4].trim();
      
      const startTime = minutes * 60 + seconds + hundredths / 100;
      
      if (text) {
        result.push({
          startTime,
          endTime: 0, // Will close gap with next line
          text_es: text // Assuming original is the primary text (can be ES, EN, etc.)
        });
      }
    }
  }

  // Fill end times
  for (let i = 0; i < result.length; i++) {
    if (i < result.length - 1) {
      result[i].endTime = result[i + 1].startTime;
    } else {
      result[i].endTime = result[i].startTime + 5; // Arbitrary 5s for last line
    }
  }

  return result;
};
