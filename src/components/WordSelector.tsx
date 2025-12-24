'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, X } from 'lucide-react'
import { useWordBank } from '@/hooks/useWordBank'

interface WordSelectorProps {
  textEs: string
  textEn: string
  songId: string
  songTitle: string
  onLoginRequired?: () => void
}

export function WordSelector({ textEs, textEn, songId, songTitle, onLoginRequired }: WordSelectorProps) {
  const { addWord, isAuthenticated } = useWordBank()
  const [selectedWord, setSelectedWord] = useState<{ word: string; index: number } | null>(null)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState<Set<string>>(new Set())

  const words = textEs.split(/\s+/)
  const translations = textEn.split(/\s+/)

  const handleWordClick = (word: string, index: number) => {
    if (!isAuthenticated) {
      onLoginRequired?.()
      return
    }

    const cleanWord = word.replace(/[.,!?¿¡'"]/g, '')
    if (added.has(cleanWord)) return

    setSelectedWord({ word, index })
  }

  const handleAdd = async () => {
    if (!selectedWord) return

    setAdding(true)
    const cleanWord = selectedWord.word.replace(/[.,!?¿¡'"]/g, '')
    const translation = translations[selectedWord.index] || textEn

    const success = await addWord(cleanWord, translation, songId, songTitle)

    if (success) {
      setAdded((prev) => new Set([...prev, cleanWord]))
    }

    setAdding(false)
    setSelectedWord(null)
  }

  return (
    <>
      {/* Words */}
      <p className='text-lg sm:text-xl md:text-3xl lg:text-4xl font-bold'>
        {words.map((word, index) => {
          const cleanWord = word.replace(/[.,!?¿¡'"]/g, '')
          const isAdded = added.has(cleanWord)

          return (
            <span
              key={index}
              onClick={() => handleWordClick(word, index)}
              className={`cursor-pointer transition-all inline-block mx-0.5 select-none ${
                isAdded ? 'text-green-400' : 'hover:text-white/70 hover:underline'
              }`}
            >
              {word}
            </span>
          )
        })}
      </p>

      {/* Fixed Popup Overlay */}
      <AnimatePresence>
        {selectedWord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center'
            style={{ zIndex: 99999 }}
            onClick={() => setSelectedWord(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className='bg-neutral-900 border border-white/20 rounded-2xl p-6 min-w-[280px] shadow-2xl'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='text-center mb-5'>
                <p className='text-2xl font-bold text-white mb-1'>{selectedWord.word}</p>
                <p className='text-gray-400'>{translations[selectedWord.index] || textEn}</p>
              </div>
              <div className='flex gap-3 justify-center'>
                <button
                  type='button'
                  onClick={() => setSelectedWord(null)}
                  className='px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors text-white'
                >
                  Cancel
                </button>
                <button
                  type='button'
                  onClick={handleAdd}
                  disabled={adding}
                  className='flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-all disabled:opacity-50'
                >
                  {adding ? (
                    <span>Adding...</span>
                  ) : (
                    <>
                      <Plus size={18} />
                      Add
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success indicator */}
      {added.size > 0 && (
        <div className='absolute -right-6 top-1 text-green-400'>
          <Check size={16} />
        </div>
      )}
    </>
  )
}
