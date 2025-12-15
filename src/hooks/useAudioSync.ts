import { useMemo } from 'react';
import type { LyricLine } from '../types';

export const useAudioSync = (currentTime: number, lyrics: LyricLine[]) => {
  const activeIndex = useMemo(() => {
    return lyrics.findIndex(
      (line) => currentTime >= line.startTime && currentTime < line.endTime
    );
  }, [currentTime, lyrics]);

  return activeIndex;
};
