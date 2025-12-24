'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useWordBank } from '@/hooks/useWordBank'
import { BookOpen, Sparkles, Trash2, Loader2, Play, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthModal } from '@/components/AuthModal'
import { Flashcard } from '@/components/Flashcard'
import { useAuth } from '@/context/AuthContext'

export default function VocabularyPage() {
  const { user } = useAuth()
  const { words, reviewQueue, reviewCount, loading, removeWord, recordReview } = useWordBank()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [practiceMode, setPracticeMode] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)

  // Not logged in
  if (!user) {
    return (
      <div className='min-h-screen bg-black text-white flex flex-col items-center justify-center px-6'>
        <div className='w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6'>
          <BookOpen size={32} className='text-gray-500' />
        </div>
        <h1 className='text-xl font-bold mb-2'>Word Bank</h1>
        <p className='text-gray-500 text-center text-sm mb-6 max-w-xs'>
          Sign in to save words and practice with flashcards
        </p>
        <button
          onClick={() => setShowAuthModal(true)}
          className='px-5 py-2.5 bg-white text-black rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors'
        >
          Sign In
        </button>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    )
  }

  // Practice mode
  if (practiceMode && reviewQueue.length > 0) {
    const currentWord = reviewQueue[currentCardIndex]

    if (!currentWord) {
      // All cards reviewed
      return (
        <div className='min-h-screen bg-black text-white flex flex-col items-center justify-center px-6'>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className='w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6'
          >
            <Sparkles size={40} className='text-green-400' />
          </motion.div>
          <h1 className='text-2xl font-bold mb-2'>All done! 🎉</h1>
          <p className='text-gray-500 text-center text-sm mb-6'>Come back later for more practice</p>
          <button
            onClick={() => setPracticeMode(false)}
            className='px-5 py-2.5 bg-white text-black rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors'
          >
            Back to Words
          </button>
        </div>
      )
    }

    return (
      <div className='min-h-screen bg-black text-white'>
        {/* Header */}
        <div className='flex items-center justify-between px-4 pt-4'>
          <button
            onClick={() => setPracticeMode(false)}
            className='p-2 hover:bg-white/10 rounded-full transition-colors'
          >
            <X size={20} />
          </button>
          <span className='text-sm text-gray-500'>
            {currentCardIndex + 1} of {reviewQueue.length}
          </span>
        </div>

        {/* Flashcard */}
        <div className='flex-1 flex items-center justify-center px-4 py-8'>
          <Flashcard
            wordEs={currentWord.word_es}
            wordEn={currentWord.word_en}
            songTitle={currentWord.song_title}
            onResult={async (quality) => {
              await recordReview(currentWord.id, quality)
              setCurrentCardIndex((prev) => prev + 1)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-black text-white'>
      {/* Header */}
      <div className='px-4 md:px-8 pt-6 pb-4'>
        <Link
          href='/'
          className='hidden md:inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-3 transition-colors'
        >
          ← Back to Home
        </Link>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>Words</h1>
            <p className='text-gray-500 text-sm'>{words.length} saved</p>
          </div>
          {reviewCount > 0 && (
            <button
              onClick={() => {
                setCurrentCardIndex(0)
                setPracticeMode(true)
              }}
              className='flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors'
            >
              <Play size={14} className='fill-current' />
              Practice ({reviewCount})
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className='px-4 pb-24'>
        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <Loader2 className='animate-spin text-gray-500' size={24} />
          </div>
        ) : words.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 text-center'>
            <div className='w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4'>
              <BookOpen size={24} className='text-gray-600' />
            </div>
            <p className='text-gray-500 text-sm mb-2'>No words saved yet</p>
            <p className='text-gray-600 text-xs mb-4'>Tap words in lyrics to save them</p>
            <Link href='/' className='text-sm text-white font-medium underline underline-offset-4 hover:text-gray-300'>
              Find songs
            </Link>
          </div>
        ) : (
          <div className='space-y-2'>
            <AnimatePresence>
              {words.map((word, index) => (
                <motion.div
                  key={word.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.02 }}
                  className='flex items-center justify-between p-3 rounded-lg bg-white/5 group'
                >
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                      <span className='font-semibold text-sm'>{word.word_es}</span>
                      <span className='text-gray-600'>·</span>
                      <span className='text-gray-400 text-sm truncate'>{word.word_en}</span>
                    </div>
                    {word.song_title && <p className='text-xs text-gray-600 truncate mt-0.5'>{word.song_title}</p>}
                  </div>

                  <button
                    onClick={() => removeWord(word.id)}
                    className='p-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all'
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
