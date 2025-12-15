import type { LrcLibTrack } from '../services/lyrics';

const HISTORY_KEY = 'lyrics_app_history';
const MAX_HISTORY_ITEMS = 10;

export const history = {
  getItems: (): LrcLibTrack[] => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading history:', error);
      return [];
    }
  },

  addItem: (track: LrcLibTrack): void => {
    try {
      const current = history.getItems();
      // Remove valid duplicate if exists
      const filtered = current.filter(item => item.id !== track.id);
      
      // Add to front
      const updated = [track, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error writing history:', error);
    }
  },

  clear: (): void => {
    localStorage.removeItem(HISTORY_KEY);
  }
};
