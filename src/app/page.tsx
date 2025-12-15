'use client'

import { useState, useEffect, useRef } from 'react'
import { Player } from '@/components/Player'
import { searchAndBuildSong, getSearchSuggestions, processTrackToSong } from '@/services/songService'
import type { Song } from '@/types'
import type { LrcLibTrack } from '@/services/lyrics'
import { Search, Loader2, Music, History, Clock } from 'lucide-react'
import { history } from '@/utils/history'
import { VideoTest } from '@/components/VideoTest' // DEBUG

export default function Home() {
  const [query, setQuery] = useState('')
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search State
  const [suggestions, setSuggestions] = useState<LrcLibTrack[]>([])
  const [historyItems, setHistoryItems] = useState<LrcLibTrack[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const searchContainerRef = useRef<HTMLFormElement>(null)

  // Load history on mount
  useEffect(() => {
    setHistoryItems(history.getItems())
  }, [currentSong]) // Update history when a song is played

  // CLICK OUTSIDE to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // LIVE SEARCH DEBOUNCE
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        // Only fetch if we are typing (not if we just clicked history item)
        // Actually, simple way: always fetch, user can ignore if they want.
        try {
          const results = await getSearchSuggestions(query)
          setSuggestions(results)
        } catch (e) {
          console.error('Failed to fetch suggestions', e)
        }
      } else {
        setSuggestions([])
      }
    }, 400) // 400ms debounce
    return () => clearTimeout(timer)
  }, [query])

  // TEMPORARY: Show video test instead
  // Note: verify if window is defined for SSR safety, though useEffect handles client-side usually.
  // In 'use client', this runs on client but initial render on server might fail if window accessed?
  // We should wrap this in useEffect or check typeof window.
  // Ideally move to useEffect, but for quick port:
  const [showTest, setShowTest] = useState<string | null>(null)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShowTest(new URLSearchParams(window.location.search).get('test'))
    }
  }, [])

  if (showTest === 'video') {
    return <VideoTest />
  }

  const handleSelectTrack = async (track: LrcLibTrack) => {
    setLoading(true)
    setError(null)
    setIsFocused(false) // Close dropdown
    setQuery(track.name) // Update input to show selected song name (optional)
    setCurrentSong(null)

    try {
      const song = await processTrackToSong(track)
      if (song) {
        setCurrentSong(song)
        history.addItem(track)
        setHistoryItems(history.getItems()) // Refresh history
      } else {
        setError('Failed to process song.')
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load song. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Manual Enter Key / Button Click
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setCurrentSong(null)
    setIsFocused(false)

    try {
      const song = await searchAndBuildSong(query)
      if (song) {
        setCurrentSong(song)
        // Need to add to history... but we don't have the original track easily here unless we refactor searchAndBuildSong to return it or we just don't add "search query" to history (only specific tracks).
        // For now, let's leave pure manual search out of specific track history or we'd need to fetch details.
        // Actually, searchAndBuildSong calls getSearchSuggestions internally and picks first.
        // We can trust the user will mostly use suggestions now.
      } else {
        setError('Song not found or no synced lyrics available.')
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load song. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-black text-white selection:bg-purple-500/30'>
      {/* Header / Search Bar */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          currentSong
            ? 'h-16 bg-neutral-900 border-b border-white/10'
            : 'h-screen flex flex-col justify-center items-center'
        }`}
      >
        <div
          className={`container mx-auto px-4 flex ${
            currentSong ? 'items-center justify-between h-full' : 'flex-col items-center gap-8'
          }`}
        >
          {/* Logo / Title */}
          <div className='flex items-center gap-2'>
            <div className='p-2 bg-gradient-to-br from-purple-600 to-teal-400 rounded-lg'>
              <Music size={currentSong ? 24 : 48} className='text-white' />
            </div>
            <h1
              className={`${
                currentSong ? 'text-xl' : 'text-5xl'
              } font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400`}
            >
              Ritmo
            </h1>
          </div>

          {/* Search Form */}
          <form
            ref={searchContainerRef}
            onSubmit={handleSearch}
            className={`relative group ${currentSong ? 'w-full max-w-md ml-8' : 'w-full max-w-xl'} z-50`}
          >
            <div className='relative'>
              <input
                type='text'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                placeholder='Search for a song...'
                className='w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white/10 transition-all placeholder:text-gray-500 relative z-20'
              />
              <Search
                className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors z-20'
                size={20}
              />
              <button
                type='submit'
                disabled={loading}
                className='absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors disabled:opacity-50 z-20'
              >
                {loading ? (
                  <Loader2 className='animate-spin' size={16} />
                ) : (
                  <span className='text-xs font-bold px-2'>GO</span>
                )}
              </button>
            </div>

            {/* Dropdown Suggestions */}
            {isFocused && (
              <div className='absolute top-full left-0 w-full mt-2 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200'>
                {query.trim().length <= 1 ? (
                  // History View
                  historyItems.length > 0 && (
                    <div className='p-2'>
                      <div className='flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider'>
                        <History size={12} />
                        <span>Recent</span>
                      </div>
                      {historyItems.map((item) => (
                        <button
                          key={item.id}
                          type='button'
                          onClick={() => handleSelectTrack(item)}
                          className='w-full text-left flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition-colors group/item'
                        >
                          <div className='p-2 bg-white/5 rounded-lg text-gray-400 group-hover/item:text-purple-400 transition-colors'>
                            <Clock size={16} />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <div className='font-medium text-white truncate'>{item.name}</div>
                            <div className='text-sm text-gray-400 truncate'>{item.artistName}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                ) : (
                  // Suggestions View
                  <div className='p-2'>
                    <div className='flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider'>
                      <Music size={12} />
                      <span>Suggestions</span>
                    </div>
                    {suggestions.map((item) => (
                      <button
                        key={item.id}
                        type='button'
                        onClick={() => handleSelectTrack(item)}
                        className='w-full text-left flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition-colors group/item'
                      >
                        {/* Abstract Album Art placeholder since LrcLib doesn't give images */}
                        <div className='w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center shrink-0 border border-white/5'>
                          <Music size={16} className='text-gray-500 group-hover/item:text-teal-400 transition-colors' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='font-medium text-white truncate group-hover/item:text-teal-200 transition-colors'>
                            {item.name}
                          </div>
                          <div className='text-sm text-gray-400 truncate flex items-center gap-2'>
                            <span>{item.artistName}</span>
                            {item.albumName && <span className='text-gray-600'>• {item.albumName}</span>}
                          </div>
                        </div>
                        {item.syncedLyrics && (
                          <span className='text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full border border-green-500/30'>
                            SYNCED
                          </span>
                        )}
                      </button>
                    ))}
                    {suggestions.length === 0 && (
                      <div className='p-8 text-center text-gray-500 text-sm'>No results found</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className='max-w-md mx-auto mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-center animate-fade-in'>
          {error}
        </div>
      )}

      {/* Main Player */}
      {currentSong && (
        <div className='animate-in fade-in slide-in-from-bottom-10 duration-700'>
          <Player song={currentSong} />
        </div>
      )}
    </div>
  )
}
