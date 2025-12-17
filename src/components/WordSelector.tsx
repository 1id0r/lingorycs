'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, X } from 'lucide-react'
import { useWordBank } from '@/hooks/useWordBank'
import { createPortal } from 'react-dom'

interface WordSelectorProps {
  textEs: string
  textEn: string
  songId: string
  songTitle: string
  onLoginRequired?: () => void
}

export function WordSelector({ textEs, textEn, songId, songTitle, onLoginRequired }: WordSelectorProps) {
  const { addWord, isAuthenticated } = useWordBank()
  const [selectedWord, setSelectedWord] = useState<{ word: string; index: number; rect: DOMRect } | null>(null)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)

  const words = textEs.split(/\s+/)
  const translations = textEn.split(/\s+/)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleWordClick = (word: string, index: number, e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation()

    if (!isAuthenticated) {
      onLoginRequired?.()
      return
    }

    const cleanWord = word.replace(/[.,!?¿¡'"]/g, '')
    if (added.has(cleanWord)) return

    const rect = e.currentTarget.getBoundingClientRect()
    setSelectedWord({ word, index, rect })
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

  const handleClose = () => {
    setSelectedWord(null)
  }

  const popup =
    selectedWord && mounted
      ? createPortal(
          <div className='fixed inset-0 z-[99999]' onClick={handleClose}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className='absolute bg-black border border-white/30 rounded-xl p-4 shadow-2xl min-w-[240px] select-none'
              style={{
                top: selectedWord.rect.bottom + 8,
                left: selectedWord.rect.left + selectedWord.rect.width / 2,
                transform: 'translateX(-50%)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className='text-center mb-4'>
                <p className='text-xl font-bold text-white'>{selectedWord.word}</p>
                <p className='text-sm text-gray-400'>{translations[selectedWord.index] || '(translation)'}</p>
              </div>
              <div className='flex gap-2 justify-center'>
                <button
                  type='button'
                  onClick={handleClose}
                  className='p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors cursor-pointer'
                >
                  <X size={18} className='text-white' />
                </button>
                <button
                  type='button'
                  onClick={handleAdd}
                  disabled={adding}
                  className='flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-lg font-medium text-sm hover:bg-gray-200 transition-all disabled:opacity-50 cursor-pointer'
                >
                  {adding ? (
                    <span>Adding...</span>
                  ) : (
                    <>
                      <Plus size={16} />
                      Add to Word Bank
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>,
          document.body
        )
      : null

  return (
    <div className='relative'>
      {/* Words */}
      <p className='text-2xl md:text-4xl font-bold'>
        {words.map((word, index) => {
          const cleanWord = word.replace(/[.,!?¿¡'"]/g, '')
          const isAdded = added.has(cleanWord)

          return (
            <span
              key={index}
              onClick={(e) => handleWordClick(word, index, e)}
              className={`
                cursor-pointer transition-all inline-block mx-0.5 select-none
                ${isAdded ? 'text-green-400' : 'hover:text-white/70 hover:underline'}
              `}
              title={isAdded ? 'Already in Word Bank' : 'Click to add to Word Bank'}
            >
              {word}
            </span>
          )
        })}
      </p>

      {/* Popup via Portal */}
      <AnimatePresence>{popup}</AnimatePresence>

      {/* Success indicator */}
      <AnimatePresence>
        {added.size > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='absolute -right-8 top-0 text-green-400'
          >
            <Check size={16} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
