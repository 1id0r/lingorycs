'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useWordBank } from '@/hooks/useWordBank'
import { BookOpen, Sparkles, Trash2, Play, X, Trophy, Target, Zap } from 'lucide-react'
import { LoaderInline } from '@/components/ui/loader'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthModal } from '@/components/AuthModal'
import { Flashcard } from '@/components/Flashcard'
import { useAuth } from '@/context/AuthContext'

export default function VocabularyPage() {
  const { user } = useAuth()
  const { words, reviewQueue, reviewCount, loading, removeWord, recordReview } = useWordBank()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [practiceMode, setPracticeMode] = useState(false)
  const [practiceAll, setPracticeAll] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  // Determine which words to practice
  const practiceWords = practiceAll ? words : reviewQueue

  // Not logged in
  if (!user) {
    return (
      <div className='min-h-screen bg-black text-white flex flex-col items-center justify-center px-6'>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className='w-24 h-24 rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-600/20 flex items-center justify-center mb-8'
        >
          <BookOpen size={40} className='text-teal-400' />
        </motion.div>
        <h1 className='text-2xl font-bold mb-3'>Word Bank</h1>
        <p className='text-gray-400 text-center text-sm mb-8 max-w-xs'>
          Build your vocabulary with words from songs you love
        </p>
        <button
          onClick={() => setShowAuthModal(true)}
          className='px-8 py-3 bg-blue-500 text-white rounded-full font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25'
        >
          Sign In to Start
        </button>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    )
  }

  // Practice mode
  if (practiceMode && practiceWords.length > 0) {
    const currentWord = practiceWords[currentCardIndex]
    const progress = (currentCardIndex / practiceWords.length) * 100

    if (!currentWord) {
      // All cards reviewed - show results
      const accuracy = Math.round((correctCount / practiceWords.length) * 100)

      return (
        <div className='min-h-screen bg-black text-white flex flex-col items-center justify-center px-6'>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className='w-28 h-28 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-8'
          >
            <Trophy size={48} className='text-yellow-400' />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='text-3xl font-bold mb-2'
          >
            Practice Complete!
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='flex items-center gap-6 my-8'
          >
            <div className='text-center'>
              <div className='text-4xl font-bold text-green-400'>{correctCount}</div>
              <div className='text-xs text-gray-500'>Correct</div>
            </div>
            <div className='w-px h-12 bg-white/10' />
            <div className='text-center'>
              <div className='text-4xl font-bold text-white'>{accuracy}%</div>
              <div className='text-xs text-gray-500'>Accuracy</div>
            </div>
            <div className='w-px h-12 bg-white/10' />
            <div className='text-center'>
              <div className='text-4xl font-bold text-blue-400'>{practiceWords.length}</div>
              <div className='text-xs text-gray-500'>Total</div>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => {
              setPracticeMode(false)
              setCorrectCount(0)
              setCurrentCardIndex(0)
            }}
            className='px-8 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-colors'
          >
            Back to Words
          </motion.button>
        </div>
      )
    }

    return (
      <div className='min-h-screen bg-black text-white flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between px-4 py-4'>
          <button
            onClick={() => {
              setPracticeMode(false)
              setCorrectCount(0)
              setCurrentCardIndex(0)
            }}
            className='p-2 hover:bg-white/10 rounded-full transition-colors'
          >
            <X size={24} />
          </button>

          {/* Progress bar */}
          <div className='flex-1 mx-4'>
            <div className='h-2 bg-white/10 rounded-full overflow-hidden'>
              <motion.div
                className='h-full bg-blue-500'
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Zap size={16} className='text-yellow-400' />
            <span className='text-sm font-semibold'>{correctCount}</span>
          </div>
        </div>

        {/* Flashcard */}
        <div className='flex-1 flex items-center justify-center px-4 py-8'>
          <Flashcard
            key={currentWord.id}
            wordEs={currentWord.word_es}
            wordEn={currentWord.word_en}
            songTitle={currentWord.song_title}
            allWords={words}
            onResult={async (quality) => {
              if (quality >= 3) setCorrectCount((c) => c + 1)
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
      {/* Hero Header */}
      <div className='relative px-4 md:px-8 pt-8 pb-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/10'>
              <BookOpen size={24} className='text-blue-400' />
            </div>
            <div>
              <h1 className='text-3xl font-bold'>Words</h1>
              <p className='text-gray-400 text-sm'>
                {words.length} {words.length === 1 ? 'word' : 'words'} saved
              </p>
            </div>
          </div>
        </div>

        {/* Practice Buttons */}
        {words.length > 0 && (
          <div className='flex gap-3 mt-6'>
            <button
              onClick={() => {
                setCurrentCardIndex(0)
                setCorrectCount(0)
                setPracticeAll(true)
                setPracticeMode(true)
              }}
              className='flex-1 flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group'
            >
              <Target size={20} className='text-teal-400 group-hover:scale-110 transition-transform' />
              <div className='text-left'>
                <div className='font-semibold'>Practice All</div>
                <div className='text-xs text-gray-500'>{words.length} words</div>
              </div>
            </button>

            {reviewCount > 0 && (
              <button
                onClick={() => {
                  setCurrentCardIndex(0)
                  setCorrectCount(0)
                  setPracticeAll(false)
                  setPracticeMode(true)
                }}
                className='flex-1 flex items-center justify-center gap-2 py-4 bg-blue-500 rounded-2xl transition-all hover:opacity-90 shadow-lg shadow-blue-500/25'
              >
                <Sparkles size={20} className='text-white' />
                <div className='text-left'>
                  <div className='font-semibold'>Review Due</div>
                  <div className='text-xs text-white/70'>{reviewCount} words</div>
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Word List */}
      <div className='px-4 md:px-8 pb-24'>
        {loading ? (
          <div className='flex flex-col items-center justify-center py-20'>
            <LoaderInline size={32} />
            <p className='text-gray-500 text-sm mt-4'>Loading your words...</p>
          </div>
        ) : words.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex flex-col items-center justify-center py-16 text-center'
          >
            <div className='w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6'>
              <BookOpen size={32} className='text-gray-600' />
            </div>
            <h2 className='text-lg font-semibold mb-2'>Start Building Your Vocabulary</h2>
            <p className='text-gray-500 text-sm mb-6 max-w-xs'>
              Tap on any word in the lyrics while listening to save it
            </p>
            <Link
              href='/explore'
              className='flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-colors'
            >
              <Play size={18} className='fill-current' />
              Find Songs
            </Link>
          </motion.div>
        ) : (
          <div className='grid gap-2'>
            <AnimatePresence>
              {words.map((word, index) => (
                <motion.div
                  key={word.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.03 }}
                  className='flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group'
                >
                  {/* Word badge */}
                  <div className='w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0'>
                    <span className='text-lg font-bold text-teal-400'>{word.word_es.charAt(0).toUpperCase()}</span>
                  </div>

                  {/* Word info */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-baseline gap-2'>
                      <span className='font-bold text-lg'>{word.word_es}</span>
                      <span className='text-gray-500'>→</span>
                      <span className='text-gray-300'>{word.word_en}</span>
                    </div>
                    {word.song_title && (
                      <p className='text-xs text-gray-500 truncate mt-0.5'>from &ldquo;{word.song_title}&rdquo;</p>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => removeWord(word.id)}
                    className='p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 rounded-full'
                  >
                    <Trash2 size={18} />
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
