/**
 * Tests for translation service
 */
import { translateText, translateLyrics } from '@/services/translation'

describe('translation service', () => {
  beforeEach(() => {
    ;(global.fetch as jest.Mock).mockReset()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('translateText', () => {
    it('calls API with correct request body', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ translations: ['Hello'] })
      })

      await translateText('Hola')

      expect(global.fetch).toHaveBeenCalledWith('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: ['Hola'], targetLang: 'EN' })
      })
    })

    it('returns translated text on success', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ translations: ['Hello'] })
      })

      const result = await translateText('Hola')

      expect(result).toBe('Hello')
    })
    
    // ... rest of tests ...
  })

  describe('translateLyrics', () => {
    it('calls API with all lines', async () => {
      const lines = ['Hola', '¿Cómo estás?', 'Bien gracias']
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ translations: ['Hello', 'How are you?', 'Good thanks'] })
      })

      await translateLyrics(lines)

      expect(global.fetch).toHaveBeenCalledWith('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: lines, targetLang: 'EN' })
      })
    })

    it('returns translated lyrics on success', async () => {
      const lines = ['Hola', '¿Cómo estás?']
      const translations = ['Hello', 'How are you?']
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ translations })
      })

      const result = await translateLyrics(lines)

      expect(result).toEqual(translations)
    })

    it('returns original lines on API error', async () => {
      const lines = ['Hola', '¿Cómo estás?']
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500
      })

      const result = await translateLyrics(lines)

      expect(result).toEqual(lines)
    })

    it('returns original lines on network error', async () => {
      const lines = ['Hola', '¿Cómo estás?']
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const result = await translateLyrics(lines)

      expect(result).toEqual(lines)
    })

    it('returns empty array for empty input', async () => {
      const result = await translateLyrics([])
      
      expect(result).toEqual([])
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('returns original for null/undefined input', async () => {
      const result = await translateLyrics(null as unknown as string[])
      
      expect(result).toBeNull()
    })
  })
})
