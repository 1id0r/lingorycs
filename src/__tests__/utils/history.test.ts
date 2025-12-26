/**
 * Tests for history utility (localStorage-based search history)
 */
import { history } from '@/utils/history'
import type { LrcLibTrack } from '@/services/lyrics'

// Mock track data
const mockTrack1: LrcLibTrack = {
  id: 1,
  name: 'Despacito',
  artistName: 'Luis Fonsi',
  albumName: 'Vida',
  duration: 280,
  syncedLyrics: '[00:00.00] Test lyrics'
}

const mockTrack2: LrcLibTrack = {
  id: 2,
  name: 'Bailando',
  artistName: 'Enrique Iglesias',
  albumName: 'Sex and Love',
  duration: 250,
}

const mockTrack3: LrcLibTrack = {
  id: 3,
  name: 'La Bicicleta',
  artistName: 'Carlos Vives',
  albumName: 'Vives',
  duration: 200,
}

describe('history', () => {
  beforeEach(() => {
    // Reset localStorage mock
    ;(localStorage.getItem as jest.Mock).mockReset()
    ;(localStorage.setItem as jest.Mock).mockReset()
    ;(localStorage.removeItem as jest.Mock).mockReset()
  })

  describe('getItems', () => {
    it('returns empty array when localStorage is empty', () => {
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
      
      const result = history.getItems()
      
      expect(result).toEqual([])
      expect(localStorage.getItem).toHaveBeenCalledWith('lyrics_app_history')
    })

    it('returns parsed items from localStorage', () => {
      const storedItems = [mockTrack1, mockTrack2]
      ;(localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(storedItems))
      
      const result = history.getItems()
      
      expect(result).toEqual(storedItems)
    })

    it('returns empty array on parse error', () => {
      ;(localStorage.getItem as jest.Mock).mockReturnValue('invalid json{')
      
      const result = history.getItems()
      
      expect(result).toEqual([])
    })
  })

  describe('addItem', () => {
    it('adds new item to front of empty history', () => {
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
      
      history.addItem(mockTrack1)
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'lyrics_app_history',
        JSON.stringify([mockTrack1])
      )
    })

    it('adds new item to front of existing history', () => {
      ;(localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify([mockTrack2]))
      
      history.addItem(mockTrack1)
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'lyrics_app_history',
        JSON.stringify([mockTrack1, mockTrack2])
      )
    })

    it('removes duplicate and moves to front', () => {
      ;(localStorage.getItem as jest.Mock).mockReturnValue(
        JSON.stringify([mockTrack2, mockTrack1, mockTrack3])
      )
      
      history.addItem(mockTrack1)
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'lyrics_app_history',
        JSON.stringify([mockTrack1, mockTrack2, mockTrack3])
      )
    })

    it('limits history to 10 items', () => {
      const existingItems = Array.from({ length: 10 }, (_, i) => ({
        ...mockTrack1,
        id: i + 100,
        name: `Track ${i}`
      }))
      ;(localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(existingItems))
      
      history.addItem(mockTrack1)
      
      const setItemCall = (localStorage.setItem as jest.Mock).mock.calls[0]
      const savedItems = JSON.parse(setItemCall[1])
      
      expect(savedItems.length).toBe(10)
      expect(savedItems[0]).toEqual(mockTrack1)
    })
  })

  describe('clear', () => {
    it('removes history from localStorage', () => {
      history.clear()
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('lyrics_app_history')
    })
  })
})
