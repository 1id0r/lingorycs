'use client'

import React, { useState, useRef, useEffect } from 'react'
import ReactPlayer from 'react-player'
import { useAudioSync } from '../hooks/useAudioSync'
import type { Song } from '../types'
import { Volume2 } from 'lucide-react'
import clsx from 'clsx'

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
}

export const Player: React.FC<PlayerProps> = ({ song }) => {
  const [playing] = useState(true) // Auto-start
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const playerRef = useRef<ReactPlayerInstance | null>(null)
  const lyricsContainerRef = useRef<HTMLDivElement>(null)

  const activeLineIndex = useAudioSync(currentTime, song.lyrics)

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setCurrentTime(e.currentTarget.currentTime)
  }

  const handleDurationChange = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setDuration(e.currentTarget.duration)
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
    <div className='flex flex-col h-screen bg-neutral-900 text-white overflow-hidden'>
      {/* Video Player (Hidden or integrated) */}
      <div
        className='w-auto md:w-full max-w-5xl mx-4 md:mx-auto mt-4 md:mt-8 rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black aspect-video max-h-[50vh] shrink-0 relative z-10'
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
        className='flex-1 overflow-y-auto px-6 py-12 space-y-8 text-center scroll-smooth'
        style={{ scrollBehavior: 'smooth' }}
      >
        {song.lyrics.map((line, index) => {
          const isActive = index === activeLineIndex
          return (
            <div
              key={index}
              className={clsx(
                'transition-all duration-500 ease-in-out transform',
                isActive ? 'opacity-100 scale-105' : 'opacity-30 scale-95 blur-[0.5px]'
              )}
            >
              <p
                className={clsx(
                  'font-bold text-2xl md:text-4xl mb-2',
                  isActive
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-500 animate-pulse drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                    : 'text-gray-300'
                )}
              >
                {line.text_es}
              </p>
              <p className={clsx('text-lg md:text-xl font-medium', isActive ? 'text-teal-200' : 'text-gray-500')}>
                {line.text_en}
              </p>
            </div>
          )
        })}
        {/* Spacer for bottom scrolling */}
        <div className='h-[40vh]'></div>
      </div>

      {/* Persistent Footer Controls (Song Info) */}
      <div className='bg-black/80 backdrop-blur-md border-t border-white/10 p-4 shrink-0 flex items-center justify-between z-20'>
        <div className='flex flex-col'>
          <span className='font-bold text-lg'>{song.title}</span>
          <span className='text-sm text-gray-400'>{song.artist}</span>
        </div>

        <div className='flex items-center gap-4'>
          <span className='text-xs font-mono text-gray-400'>
            {new Date(currentTime * 1000).toISOString().substr(14, 5)} /{' '}
            {new Date(duration * 1000).toISOString().substr(14, 5)}
          </span>
          <Volume2 size={20} className='text-gray-400' />
        </div>
      </div>
    </div>
  )
}
