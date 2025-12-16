'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useWordBank } from '@/hooks/useWordBank'
import { ArrowLeft, BookOpen, Sparkles, Trash2, Loader2, GraduationCap } from 'lucide-react'
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
      <div className='min-h-screen bg-black text-white'>
        <header className='sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5'>
          <div className='container mx-auto px-6 h-16 flex items-center gap-4'>
            <Link href='/' className='p-2 hover:bg-white/10 rounded-full transition-colors'>
              <ArrowLeft size={20} />
            </Link>
            <h1 className='text-xl font-bold'>Word Bank</h1>
          </div>
        </header>

        <main className='container mx-auto px-6 py-20 flex flex-col items-center justify-center text-center'>
          <div className='p-6 bg-gradient-to-br from-purple-600/20 to-teal-500/20 rounded-full mb-6'>
            <BookOpen size={48} className='text-purple-400' />
          </div>
          <h2 className='text-2xl font-bold mb-2'>Build your vocabulary</h2>
          <p className='text-gray-400 mb-8 max-w-md'>
            Sign in to save words from songs and practice them with flashcards.
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className='px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-500 rounded-full font-bold hover:from-purple-500 hover:to-teal-400 transition-all'
          >
            Sign In
          </button>
        </main>

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
        <div className='min-h-screen bg-black text-white'>
          <header className='sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5'>
            <div className='container mx-auto px-6 h-16 flex items-center gap-4'>
              <button
                onClick={() => setPracticeMode(false)}
                className='p-2 hover:bg-white/10 rounded-full transition-colors'
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className='text-xl font-bold'>Practice Complete!</h1>
            </div>
          </header>

          <main className='container mx-auto px-6 py-20 flex flex-col items-center justify-center text-center'>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className='p-8 bg-gradient-to-br from-green-600/20 to-teal-500/20 rounded-full mb-6'
            >
              <Sparkles size={64} className='text-green-400' />
            </motion.div>
            <h2 className='text-3xl font-bold mb-2'>Great job! 🎉</h2>
            <p className='text-gray-400 mb-8'>You've reviewed all due words. Come back later for more practice.</p>
            <button
              onClick={() => setPracticeMode(false)}
              className='px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-500 rounded-full font-bold hover:from-purple-500 hover:to-teal-400 transition-all'
            >
              Back to Word Bank
            </button>
          </main>
        </div>
      )
    }

    return (
      <div className='min-h-screen bg-black text-white'>
        <header className='sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5'>
          <div className='container mx-auto px-6 h-16 flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => setPracticeMode(false)}
                className='p-2 hover:bg-white/10 rounded-full transition-colors'
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className='text-xl font-bold'>Practice</h1>
            </div>
            <span className='text-sm text-gray-400'>
              {currentCardIndex + 1} / {reviewQueue.length}
            </span>
          </div>
        </header>

        <main className='container mx-auto px-6 py-16 flex flex-col items-center justify-center'>
          <Flashcard
            wordEs={currentWord.word_es}
            wordEn={currentWord.word_en}
            songTitle={currentWord.song_title}
            onResult={async (quality) => {
              await recordReview(currentWord.id, quality)
              setCurrentCardIndex((prev) => prev + 1)
            }}
          />
        </main>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-black text-white'>
      <header className='sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5'>
        <div className='container mx-auto px-6 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link href='/' className='p-2 hover:bg-white/10 rounded-full transition-colors'>
              <ArrowLeft size={20} />
            </Link>
            <h1 className='text-xl font-bold'>Word Bank</h1>
            <span className='text-sm text-gray-500'>({words.length} words)</span>
          </div>

          {reviewCount > 0 && (
            <button
              onClick={() => {
                setCurrentCardIndex(0)
                setPracticeMode(true)
              }}
              className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-teal-500 rounded-full font-bold text-sm hover:from-purple-500 hover:to-teal-400 transition-all'
            >
              <GraduationCap size={18} />
              Practice ({reviewCount})
            </button>
          )}
        </div>
      </header>

      <main className='container mx-auto px-6 py-8'>
        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <Loader2 className='animate-spin text-purple-400' size={40} />
          </div>
        ) : words.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-center'>
            <div className='p-6 bg-white/5 rounded-full mb-6'>
              <BookOpen size={48} className='text-gray-500' />
            </div>
            <h2 className='text-xl font-bold mb-2'>No words saved yet</h2>
            <p className='text-gray-400 mb-6 max-w-md'>
              While listening to songs, tap on words in the lyrics to add them to your word bank.
            </p>
            <Link
              href='/'
              className='px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-500 rounded-full font-bold hover:from-purple-500 hover:to-teal-400 transition-all'
            >
              Discover Songs
            </Link>
          </div>
        ) : (
          <div className='space-y-3'>
            <AnimatePresence>
              {words.map((word, index) => (
                <motion.div
                  key={word.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.03 }}
                  className='group flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all'
                >
                  <div className='flex-1'>
                    <div className='flex items-center gap-3'>
                      <span className='font-bold text-lg'>{word.word_es}</span>
                      <span className='text-gray-500'>→</span>
                      <span className='text-gray-300'>{word.word_en}</span>
                    </div>
                    {word.song_title && <span className='text-xs text-gray-500'>from "{word.song_title}"</span>}
                  </div>

                  <button
                    onClick={() => removeWord(word.id)}
                    className='p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-all'
                    title='Remove word'
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  )
}
