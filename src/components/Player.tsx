'use client'

import React, { useState, useRef, useEffect } from 'react'
import ReactPlayer from 'react-player'
import { useAudioSync } from '../hooks/useAudioSync'
import type { Song } from '../types'
import { GraduationCap } from 'lucide-react'
import clsx from 'clsx'
import { LikeButton } from './LikeButton'
import { WordSelector } from './WordSelector'

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

export const Player: React.FC<PlayerProps> = ({ song, onStartPractice, onLoginRequired }) => {
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
    <div className='flex flex-col h-[calc(100vh-4rem)] bg-neutral-900 text-white overflow-hidden'>
      {/* Song Info Bar - Top */}
      <div className='bg-black/80 backdrop-blur-md border-b border-white/10 p-4 shrink-0 flex items-center justify-between z-20'>
        <div className='flex items-center gap-3'>
          <LikeButton song={song} onLoginRequired={onLoginRequired} />
          <div className='flex flex-col'>
            <span className='font-bold text-lg'>{song.title}</span>
            <span className='text-sm text-gray-400'>{song.artist}</span>
          </div>
        </div>

        <div className='flex items-center gap-4'>
          {onStartPractice && (
            <button
              onClick={onStartPractice}
              className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-teal-500 rounded-full font-bold text-sm hover:from-purple-500 hover:to-teal-400 transition-all active:scale-95'
            >
              <GraduationCap size={18} />
              Practice
            </button>
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
        className='flex-1 overflow-y-auto overflow-x-visible px-6 py-12 space-y-8 text-center scroll-smooth'
        style={{ scrollBehavior: 'smooth' }}
      >
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
                <p className={clsx('font-bold text-2xl md:text-4xl mb-2', 'text-gray-300')}>{line.text_es}</p>
              )}
              <p className={clsx('text-lg md:text-xl font-medium', isActive ? 'text-teal-200' : 'text-gray-500')}>
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
