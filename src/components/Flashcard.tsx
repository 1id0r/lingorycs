'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface FlashcardProps {
  wordEs: string
  wordEn: string
  songTitle?: string
  onResult: (quality: number) => void
}

export function Flashcard({ wordEs, wordEn, songTitle, onResult }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showButtons, setShowButtons] = useState(false)

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true)
      // Show rating buttons after flip
      setTimeout(() => setShowButtons(true), 300)
    }
  }

  const handleRating = (quality: number) => {
    setShowButtons(false)
    setIsFlipped(false)
    onResult(quality)
  }

  return (
    <div className='flex flex-col items-center gap-8'>
      {/* Flashcard */}
      <div className='perspective-1000 cursor-pointer' onClick={handleFlip}>
        <motion.div
          className='relative w-80 h-48 md:w-96 md:h-56'
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front - Spanish */}
          <div
            className='absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-purple-600/30 to-teal-500/30 border border-white/10 backdrop-blur-sm flex flex-col items-center justify-center p-6 shadow-2xl'
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className='text-sm text-gray-400 mb-2'>Spanish</span>
            <span className='text-3xl md:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-teal-400'>
              {wordEs}
            </span>
            {songTitle && <span className='text-xs text-gray-500 mt-4'>from "{songTitle}"</span>}
            <span className='text-sm text-gray-500 mt-4'>Tap to reveal</span>
          </div>

          {/* Back - English */}
          <div
            className='absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-teal-600/30 to-purple-500/30 border border-white/10 backdrop-blur-sm flex flex-col items-center justify-center p-6 shadow-2xl'
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <span className='text-sm text-gray-400 mb-2'>English</span>
            <span className='text-3xl md:text-4xl font-bold text-center'>{wordEn}</span>
            <span className='text-sm text-gray-500 mt-4'>How well did you know it?</span>
          </div>
        </motion.div>
      </div>

      {/* Rating buttons */}
      {showButtons && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex gap-3 flex-wrap justify-center'
        >
          <button
            onClick={() => handleRating(0)}
            className='px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl font-medium transition-all hover:scale-105'
          >
            Again
          </button>
          <button
            onClick={() => handleRating(1)}
            className='px-6 py-3 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 rounded-xl font-medium transition-all hover:scale-105'
          >
            Hard
          </button>
          <button
            onClick={() => handleRating(3)}
            className='px-6 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-xl font-medium transition-all hover:scale-105'
          >
            Good
          </button>
          <button
            onClick={() => handleRating(5)}
            className='px-6 py-3 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 border border-teal-500/30 rounded-xl font-medium transition-all hover:scale-105'
          >
            Easy
          </button>
        </motion.div>
      )}
    </div>
  )
}
