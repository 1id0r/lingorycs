/**
 * Tests for lyrics service (LRC parsing and API)
 */
import { parseLrc, searchTrack, getTrackDetails } from '@/services/lyrics'

describe('lyrics service', () => {
  describe('parseLrc', () => {
    it('parses a single line correctly', () => {
      const lrc = '[01:23.45] Hello world'
      const result = parseLrc(lrc)
      
      expect(result).toHaveLength(1)
      expect(result[0].startTime).toBeCloseTo(83.45, 2)
      expect(result[0].text_es).toBe('Hello world')
    })

    it('parses multiple lines and sets endTime correctly', () => {
      const lrc = `[00:05.00] First line
[00:10.00] Second line
[00:15.00] Third line`
      
      const result = parseLrc(lrc)
      
      expect(result).toHaveLength(3)
      expect(result[0].startTime).toBe(5)
      expect(result[0].endTime).toBe(10)
      expect(result[1].startTime).toBe(10)
      expect(result[1].endTime).toBe(15)
      expect(result[2].startTime).toBe(15)
      expect(result[2].endTime).toBe(20) // last line gets +5 seconds
    })

    it('returns empty array for empty string', () => {
      const result = parseLrc('')
      expect(result).toEqual([])
    })

    it('skips lines without timestamps', () => {
      const lrc = `Some random text
[00:05.00] Valid line
Another invalid line`
      
      const result = parseLrc(lrc)
      
      expect(result).toHaveLength(1)
      expect(result[0].text_es).toBe('Valid line')
    })

    it('skips lines with empty text after timestamp', () => {
      const lrc = `[00:05.00] 
[00:10.00] Valid line`
      
      const result = parseLrc(lrc)
      
      expect(result).toHaveLength(1)
      expect(result[0].text_es).toBe('Valid line')
    })

    it('handles Spanish special characters', () => {
      const lrc = '[00:05.00] ¿Cómo estás? ¡Muy bien!'
      const result = parseLrc(lrc)
      
      expect(result[0].text_es).toBe('¿Cómo estás? ¡Muy bien!')
    })

    it('calculates time correctly with minutes and seconds', () => {
      const lrc = '[02:30.50] Test line'
      const result = parseLrc(lrc)
      
      expect(result[0].startTime).toBeCloseTo(150.5, 2)
    })
  })

  describe('searchTrack', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockReset()
    })

    it('calls the correct API endpoint', async () => {
      const mockResponse = [{ id: 1, name: 'Test', artistName: 'Artist' }]
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      await searchTrack('despacito')

      expect(global.fetch).toHaveBeenCalledWith(
        'https://lrclib.net/api/search?q=despacito'
      )
    })

    it('returns track data on success', async () => {
      const mockData = [
        { id: 1, name: 'Despacito', artistName: 'Luis Fonsi', albumName: 'Vida', duration: 280 }
      ]
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData)
      })

      const result = await searchTrack('despacito')

      expect(result).toEqual(mockData)
    })

    it('throws error on failed request', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500
      })

      await expect(searchTrack('test')).rejects.toThrow('Failed to fetch from LRCLIB')
    })

    it('encodes query parameter', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      })

      await searchTrack('test query with spaces')

      expect(global.fetch).toHaveBeenCalledWith(
        'https://lrclib.net/api/search?q=test%20query%20with%20spaces'
      )
    })
  })

  describe('getTrackDetails', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockReset()
    })

    it('calls the correct API endpoint', async () => {
      const mockTrack = { id: 123, name: 'Test', artistName: 'Artist' }
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTrack)
      })

      await getTrackDetails(123)

      expect(global.fetch).toHaveBeenCalledWith('https://lrclib.net/api/get/123')
    })

    it('returns track details on success', async () => {
      const mockTrack = { 
        id: 123, 
        name: 'Despacito', 
        artistName: 'Luis Fonsi',
        albumName: 'Vida',
        duration: 280,
        syncedLyrics: '[00:00.00] Test'
      }
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTrack)
      })

      const result = await getTrackDetails(123)

      expect(result).toEqual(mockTrack)
    })

    it('throws error on failed request', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404
      })

      await expect(getTrackDetails(999)).rejects.toThrow('Failed to fetch track details')
    })
  })
})
