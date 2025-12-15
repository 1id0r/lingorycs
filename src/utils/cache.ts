const CACHE_PREFIX = 'lyrics_app_cache_';

export const cache = {
  getItem: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  },

  setItem: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error('Error removing from cache:', error);
    }
  }
};
