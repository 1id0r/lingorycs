/**
 * Tests for playSong utility (localStorage-based song playback state)
 */
import { setPlaySong, getPlaySong, clearPlaySong, type PlaySongData } from '@/utils/playSong'

const mockPlaySongData: PlaySongData = {
  songId: 'song-123',
  title: 'Despacito',
  artist: 'Luis Fonsi',
  youtubeId: 'abc123'
}

const mockLikedSong = {
  id: 'liked-1',
  song_id: 'song-456',
  title: 'Bailando',
  artist: 'Enrique Iglesias',
  youtube_id: 'def456',
  user_id: 'user-1',
  created_at: '2024-01-01'
}

describe('playSong', () => {
  beforeEach(() => {
    ;(localStorage.getItem as jest.Mock).mockReset()
    ;(localStorage.setItem as jest.Mock).mockReset()
    ;(localStorage.removeItem as jest.Mock).mockReset()
  })

  describe('setPlaySong', () => {
    it('sets PlaySongData correctly', () => {
      setPlaySong(mockPlaySongData)
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'espalingo_play_song',
        JSON.stringify(mockPlaySongData)
      )
    })

    it('converts LikedSong format to PlaySongData', () => {
      setPlaySong(mockLikedSong as never)
      
      const expectedData: PlaySongData = {
        songId: 'song-456',
        title: 'Bailando',
        artist: 'Enrique Iglesias',
        youtubeId: 'def456'
      }
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'espalingo_play_song',
        JSON.stringify(expectedData)
      )
    })
  })

  describe('getPlaySong', () => {
    it('returns null when localStorage is empty', () => {
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
      
      const result = getPlaySong()
      
      expect(result).toBeNull()
    })

    it('returns parsed PlaySongData from localStorage', () => {
      ;(localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockPlaySongData))
      
      const result = getPlaySong()
      
      expect(result).toEqual(mockPlaySongData)
    })

    it('returns null on parse error', () => {
      ;(localStorage.getItem as jest.Mock).mockReturnValue('invalid{json')
      
      const result = getPlaySong()
      
      expect(result).toBeNull()
    })
  })

  describe('clearPlaySong', () => {
    it('removes play song from localStorage', () => {
      clearPlaySong()
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('espalingo_play_song')
    })
  })
})
