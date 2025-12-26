'use client'

import React, { useState, useRef, useEffect } from 'react'
import ReactPlayer from 'react-player'
import { useAudioSync } from '../hooks/useAudioSync'
import type { Song } from '../types'
import { GraduationCap, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { LikeButton } from './LikeButton'
import { WordSelector } from './WordSelector'
import { Button } from './ui/neon-button'
import { LanguageSelector } from './LanguageSelector'
import { translateSongLyrics } from '../services/songService'

// Define the ReactPlayer instance type for ref access
interface ReactPlayerInstance {
  seekTo: (amount: number, type?: 'seconds' | 'fraction') => void
  getCurrentTime: () => number
  getSecondsLoaded: () => number
  getDuration: () => number
  getInternalPlayer: () => unknown
}

interface PlayerProps {
  song: Song
  onStartPractice?: () => void
  onLoginRequired?: () => void
}

export const Player: React.FC<PlayerProps> = ({ song: initialSong, onStartPractice, onLoginRequired }) => {
  const [song, setSong] = useState<Song>(initialSong)
  const [playing] = useState(true) // Auto-start
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentLang, setCurrentLang] = useState('EN')
  const [isTranslating, setIsTranslating] = useState(false)

  const playerRef = useRef<ReactPlayerInstance | null>(null)
  const lyricsContainerRef = useRef<HTMLDivElement>(null)

  // Reset song state when prop changes
  useEffect(() => {
    setSong(initialSong)
    // We ideally should detect the language of the loaded song if stored, but default to EN for now or keep persistent state
  }, [initialSong])

  const activeLineIndex = useAudioSync(currentTime, song.lyrics)

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setCurrentTime(e.currentTarget.currentTime)
  }

  const handleDurationChange = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setDuration(e.currentTarget.duration)
  }

  const handleLanguageChange = async (langCode: string) => {
    if (langCode === currentLang) return

    setIsTranslating(true)
    try {
      const updatedSong = await translateSongLyrics(song, langCode)
      setSong(updatedSong)
      setCurrentLang(langCode)
    } catch (error) {
      console.error('Failed to change language:', error)
    } finally {
      setIsTranslating(false)
    }
  }

  // Auto-scroll to active line
  useEffect(() => {
    if (activeLineIndex !== -1 && lyricsContainerRef.current) {
      const activeElement = lyricsContainerRef.current.children[activeLineIndex] as HTMLElement
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }
  }, [activeLineIndex])

  return (
    <div className='flex flex-col h-[calc(100vh-4rem)] bg-neutral-900 text-white overflow-hidden'>
      {/* Song Info Bar - Top */}
      <div className='bg-black/80 backdrop-blur-md border-b border-white/10 p-3 md:p-4 shrink-0 flex items-center justify-between z-20'>
        <div className='flex items-center gap-2 md:gap-3'>
          <LikeButton song={song} onLoginRequired={onLoginRequired} />
          <div className='flex flex-col'>
            <span className='font-bold text-sm md:text-lg line-clamp-1'>{song.title}</span>
            <span className='text-xs md:text-sm text-gray-400'>{song.artist}</span>
          </div>
        </div>

        <div className='flex items-center gap-2 md:gap-4'>
          <LanguageSelector
            currentLanguage={currentLang}
            onLanguageChange={handleLanguageChange}
            disabled={isTranslating}
          />

          {onStartPractice && (
            <Button
              onClick={onStartPractice}
              variant='solid'
              size='sm'
              className='flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full font-bold transition-all active:scale-95'
            >
              <GraduationCap size={16} className='md:w-[18px] md:h-[18px]' />
              <span className='hidden sm:inline'>Practice</span>
            </Button>
          )}
        </div>
      </div>

      {/* Video Player */}
      <div
        className='w-auto md:w-full max-w-5xl mx-4 md:mx-auto mt-4 md:mt-8 rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black aspect-video max-h-[45vh] shrink-0 relative z-10'
        style={{ pointerEvents: 'auto' }}
      >
        <ReactPlayer
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref={playerRef as any}
          src={`https://www.youtube.com/watch?v=${song.youtubeId}`}
          autoPlay={playing}
          controls={true}
          width='100%'
          height='100%'
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          onError={(e: unknown) => console.error('ReactPlayer Error:', e)}
          onCanPlay={() => console.log('ReactPlayer Ready')}
        />
      </div>

      {/* Lyrics Display */}
      <div
        ref={lyricsContainerRef}
        className='flex-1 overflow-y-auto overflow-x-visible px-6 py-12 space-y-8 text-center scroll-smooth relative'
        style={{ scrollBehavior: 'smooth' }}
      >
        {isTranslating && (
          <div className='absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-teal-400'>
            <Loader2 size={48} className='animate-spin mb-4' />
            <p className='font-bold text-xl animate-pulse'>Translating...</p>
          </div>
        )}

        {song.lyrics.map((line, index) => {
          const isActive = index === activeLineIndex
          return (
            <div
              key={index}
              className={clsx(
                'transition-all duration-500 ease-in-out transform relative',
                isActive ? 'opacity-100 scale-105 z-[100]' : 'opacity-30 scale-95 blur-[0.5px]'
              )}
              style={isActive ? { overflow: 'visible' } : undefined}
            >
              {isActive ? (
                <WordSelector
                  textEs={line.text_es}
                  textEn={line.text_en}
                  songId={song.id}
                  songTitle={song.title}
                  onLoginRequired={onLoginRequired}
                />
              ) : (
                <p className={clsx('font-bold text-lg sm:text-xl md:text-3xl lg:text-4xl mb-2', 'text-gray-300')}>
                  {line.text_es}
                </p>
              )}
              <p
                className={clsx(
                  'text-sm sm:text-base md:text-lg lg:text-xl font-medium',
                  isActive ? 'text-teal-200' : 'text-gray-500'
                )}
              >
                {line.text_en}
              </p>
            </div>
          )
        })}
        {/* Spacer for bottom scrolling */}
        <div className='h-[40vh]'></div>
      </div>
    </div>
  )
}
