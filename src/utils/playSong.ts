import type { LikedSong } from '@/services/userDataService'

const PLAY_SONG_KEY = 'espalingo_play_song'

export interface PlaySongData {
  songId: string
  title: string
  artist: string
  youtubeId: string
}

export function setPlaySong(song: LikedSong | PlaySongData): void {
  if (typeof window === 'undefined') return
  const data: PlaySongData = {
    songId: 'song_id' in song ? song.song_id : song.songId,
    title: song.title,
    artist: song.artist,
    youtubeId: 'youtube_id' in song ? song.youtube_id : song.youtubeId,
  }
  localStorage.setItem(PLAY_SONG_KEY, JSON.stringify(data))
}

export function getPlaySong(): PlaySongData | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(PLAY_SONG_KEY)
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

export function clearPlaySong(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(PLAY_SONG_KEY)
}
