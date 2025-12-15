export interface LyricLine {
  startTime: number;
  endTime: number;
  text_es: string;
  text_en: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  lyrics: LyricLine[];
}
