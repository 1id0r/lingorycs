'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Player } from '@/components/Player'
import { PracticeMode } from '@/components/PracticeMode'
import { getSearchSuggestions, processTrackToSong, buildSongFromYouTube } from '@/services/songService'
import type { Song } from '@/types'
import type { LrcLibTrack } from '@/services/lyrics'
import { Library, BookOpen } from 'lucide-react'
import { history } from '@/utils/history'
import { getPlaySong, clearPlaySong } from '@/utils/playSong'
import { UserMenu } from '@/components/UserMenu'
import { AuthModal } from '@/components/AuthModal'
import { SearchBar } from '@/components/ui/SearchBar'

export default function Home() {
  const [query, setQuery] = useState('')
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [practiceMode, setPracticeMode] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Search State
  const [suggestions, setSuggestions] = useState<LrcLibTrack[]>([])
  const [historyItems, setHistoryItems] = useState<LrcLibTrack[]>([])

  // Load history on mount
  useEffect(() => {
    setHistoryItems(history.getItems())
  }, [currentSong])

  // Check for pending song from library
  useEffect(() => {
    const pendingSong = getPlaySong()
    if (pendingSong) {
      clearPlaySong()
      setLoading(true)
      setError(null)
      buildSongFromYouTube(pendingSong.youtubeId, pendingSong.title, pendingSong.artist)
        .then((song: Song | null) => {
          if (song) {
            setCurrentSong(song)
          } else {
            setError('Failed to load song from library.')
          }
        })
        .catch((err: unknown) => {
          console.error(err)
          setError('Failed to load song.')
        })
        .finally(() => setLoading(false))
    }
  }, [])

  // Live search debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        try {
          const results = await getSearchSuggestions(query)
          setSuggestions(results)
        } catch (e) {
          console.error('Failed to fetch suggestions', e)
        }
      } else {
        setSuggestions([])
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelectTrack = async (track: LrcLibTrack) => {
    setLoading(true)
    setError(null)
    setQuery(track.name)
    setCurrentSong(null)

    try {
      const song = await processTrackToSong(track)
      if (song) {
        setCurrentSong(song)
        history.addItem(track)
        setHistoryItems(history.getItems())
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

  // Compact header when song is playing
  const [searchFocused, setSearchFocused] = useState(false)

  if (currentSong) {
    return (
      <div className='min-h-screen bg-black text-white'>
        {/* Compact Header */}
        <header className='sticky top-0 z-[60] bg-black/60 backdrop-blur-xl border-b border-white/5'>
          <div className='container mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4 md:gap-6'>
            {/* Logo - hidden on mobile when search is focused */}
            <button
              onClick={() => setCurrentSong(null)}
              className={`flex items-center gap-3 shrink-0 hover:opacity-80 transition-all ${
                searchFocused ? 'hidden md:flex' : 'flex'
              }`}
            >
              <img src='/logo.svg' alt='Espalingo' className='h-10 w-10 rounded-xl' />
            </button>

            {/* Search Bar - full width on mobile when focused */}
            <div className={`flex-1 ${searchFocused ? 'max-w-full' : 'max-w-lg'} transition-all`}>
              <SearchBar
                placeholder='Search songs... (⌘K)'
                onSearch={(q) => setQuery(q)}
                onSelectTrack={handleSelectTrack}
                suggestions={suggestions}
                historyItems={historyItems}
                isLoading={loading}
                compact
                onFocusChange={setSearchFocused}
              />
            </div>

            {/* User Menu - hidden on mobile when search is focused */}
            <div className={searchFocused ? 'hidden md:block' : 'block'}>
              <UserMenu onLoginClick={() => setShowAuthModal(true)} />
            </div>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div className='max-w-md mx-auto mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-center'>
            {error}
          </div>
        )}

        {/* Player or Practice */}
        {practiceMode ? (
          <PracticeMode song={currentSong} onExit={() => setPracticeMode(false)} />
        ) : (
          <div className='animate-in fade-in slide-in-from-bottom-10 duration-700'>
            <Player
              song={currentSong}
              onStartPractice={() => setPracticeMode(true)}
              onLoginRequired={() => setShowAuthModal(true)}
            />
          </div>
        )}

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    )
  }

  // Full Hero Landing Page
  return (
    <div className='min-h-screen bg-black text-white selection:bg-purple-500/30 relative overflow-hidden'>
      {/* Background Image */}
      <div
        className='absolute inset-0 bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      />
      {/* Dark Overlay for readability */}
      <div className='absolute inset-0 bg-black/60' />
      <div className='absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50' />

      {/* Header */}
      <header className='relative z-[200] p-6 md:p-8'>
        <div className='container mx-auto flex justify-between items-center'>
          {/* Logo */}
          <div className='flex items-center gap-3'>
            <img src='/logo.svg' alt='Espalingo' className='h-12 w-12 rounded-xl' />
            <span className='text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400'>
              Espalingo
            </span>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className='hidden md:flex items-center space-x-6'>
            <Link
              href='/library'
              className='flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors'
            >
              <Library size={16} />
              Library
            </Link>
            <Link
              href='/vocabulary'
              className='flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors'
            >
              <BookOpen size={16} />
              Word Bank
            </Link>
          </nav>

          {/* User Menu */}
          <UserMenu onLoginClick={() => setShowAuthModal(true)} />
        </div>
      </header>

      {/* Hero Content */}
      <main className='relative z-0 container mx-auto px-6 md:px-8 flex flex-col items-center justify-center min-h-[75vh]'>
        {/* Badge */}
        <div className='flex items-center gap-2 mb-4 md:mb-6 px-3 md:px-4 py-1.5 md:py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10'>
          <div className='flex -space-x-2'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='h-5 w-5 md:h-6 md:w-6 rounded-full bg-gradient-to-br from-purple-400 to-teal-400 ring-2 ring-black flex items-center justify-center text-[8px] md:text-[10px] font-bold'
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <span className='text-xs md:text-sm text-gray-400'>Join learners mastering Spanish</span>
        </div>

        {/* Title */}
        <h1 className='text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-center leading-tight mb-3 md:mb-4'>
          <span className='bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-teal-200'>
            Learn Spanish
          </span>
          <br />
          <span className='bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-teal-400'>
            Through Music
          </span>
        </h1>

        {/* Subtitle */}
        <p className='text-xs sm:text-sm md:text-base lg:text-lg text-gray-400 text-center max-w-xl mb-6 md:mb-10 px-4'>
          Sing along with synced lyrics, learn vocabulary, and practice with interactive exercises
        </p>

        {/* Search Bar */}
        <div className='w-full max-w-xl mx-auto px-4 md:px-0'>
          <SearchBar
            placeholder='Search for a song or artist...'
            onSearch={(q) => setQuery(q)}
            onSelectTrack={handleSelectTrack}
            suggestions={suggestions}
            historyItems={historyItems}
            isLoading={loading}
          />
        </div>

        {/* Error */}
        {error && (
          <div className='max-w-md mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-center'>
            {error}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className='absolute bottom-0 inset-x-0 p-6 z-10'>
        <div className='container mx-auto flex justify-center'>
          <div className='flex items-center gap-2 text-sm text-gray-500'>
            <span>Powered by</span>
            <span className='font-medium text-gray-400'>LrcLib</span>
            <span>•</span>
            <span className='font-medium text-gray-400'>DeepL</span>
            <span>•</span>
            <span className='font-medium text-gray-400'>YouTube</span>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}
