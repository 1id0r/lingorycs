/**
 * Tests for YouTube service
 */
import { findVideoId, searchVideos } from '@/services/youtube'

describe('youtube service', () => {
  beforeEach(() => {
    ;(global.fetch as jest.Mock).mockReset()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('findVideoId', () => {
    it('calls API with correct request body', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [{ videoId: 'abc123' }] })
      })

      await findVideoId('despacito luis fonsi')

      expect(global.fetch).toHaveBeenCalledWith('/api/youtube-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'despacito luis fonsi', maxResults: 1 })
      })
    })

    it('returns video ID on success', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [{ videoId: 'xyz789' }] })
      })

      const result = await findVideoId('test query')

      expect(result).toBe('xyz789')
    })

    it('returns null when no items found', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [] })
      })

      const result = await findVideoId('nonexistent video')

      expect(result).toBeNull()
    })

    it('returns null on API error', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500
      })

      const result = await findVideoId('test')

      expect(result).toBeNull()
    })

    it('returns null on network error', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const result = await findVideoId('test')

      expect(result).toBeNull()
    })

    it('returns null when items is undefined', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({})
      })

      const result = await findVideoId('test')

      expect(result).toBeNull()
    })
  })

  describe('searchVideos', () => {
    it('calls API with correct request body and default maxResults', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [] })
      })

      await searchVideos('spanish music')

      expect(global.fetch).toHaveBeenCalledWith('/api/youtube-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'spanish music', maxResults: 25 })
      })
    })

    it('uses custom maxResults', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [] })
      })

      await searchVideos('test', 10)

      expect(global.fetch).toHaveBeenCalledWith('/api/youtube-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'test', maxResults: 10 })
      })
    })

    it('returns video items on success', async () => {
      const mockItems = [
        { videoId: 'vid1', title: 'Video 1', thumbnail: 'thumb1.jpg' },
        { videoId: 'vid2', title: 'Video 2', thumbnail: 'thumb2.jpg' }
      ]
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: mockItems })
      })

      const result = await searchVideos('spanish')

      expect(result).toEqual(mockItems)
    })

    it('returns empty array on API error', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500
      })

      const result = await searchVideos('test')

      expect(result).toEqual([])
    })

    it('returns empty array on network error', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const result = await searchVideos('test')

      expect(result).toEqual([])
    })

    it('returns empty array when items is undefined', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({})
      })

      const result = await searchVideos('test')

      expect(result).toEqual([])
    })
  })
})
