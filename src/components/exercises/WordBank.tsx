'use client'

import React, { useState, useRef } from 'react'
import type { WordOrderExercise } from '@/types/exercises'
import { Button } from '../ui/neon-button'
import clsx from 'clsx'

interface WordBankProps {
  exercise: WordOrderExercise
  onComplete: (correct: boolean) => void
}

export const WordBank: React.FC<WordBankProps> = ({ exercise, onComplete }) => {
  const [availableWords, setAvailableWords] = useState<string[]>(exercise.words)
  const [placedWords, setPlacedWords] = useState<string[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)

  const dropZoneRef = useRef<HTMLDivElement>(null)

  // Handle word selection (tap to move)
  const handleWordTap = (word: string, index: number, fromPlaced: boolean) => {
    if (isChecking) return

    if (fromPlaced) {
      // Move from placed back to available
      setPlacedWords((prev) => prev.filter((_, i) => i !== index))
      setAvailableWords((prev) => [...prev, word])
    } else {
      // Move from available to placed
      setAvailableWords((prev) => prev.filter((_, i) => i !== index))
      setPlacedWords((prev) => [...prev, word])
    }
  }

  // Check answer
  const checkAnswer = () => {
    setIsChecking(true)
    const isCorrect = placedWords.join(' ').toLowerCase() === exercise.correctOrder.join(' ').toLowerCase()
    setFeedback(isCorrect ? 'correct' : 'incorrect')

    setTimeout(() => {
      onComplete(isCorrect)
    }, 1500)
  }

  // Reset exercise
  const handleReset = () => {
    setAvailableWords(exercise.words)
    setPlacedWords([])
    setFeedback(null)
    setIsChecking(false)
  }

  const canCheck = placedWords.length === exercise.correctOrder.length

  return (
    <div className='flex flex-col h-full'>
      {/* Instructions */}
      <div className='text-center mb-4 md:mb-6 shrink-0'>
        <p className='text-gray-400 text-xs md:text-sm mb-1'>Arrange the words to form the sentence:</p>
        <p className='text-teal-300 text-base md:text-lg font-medium'>{exercise.text_en}</p>
      </div>

      {/* Drop Zone - Sentence Building Area */}
      <div
        ref={dropZoneRef}
        className={clsx(
          'min-h-[80px] md:min-h-[120px] p-2 md:p-4 rounded-2xl border-2 border-dashed transition-all duration-300 mb-4 md:mb-8 shrink-0',
          placedWords.length === 0 ? 'border-white/20 bg-white/5' : 'border-purple-500/50 bg-purple-500/10',
          feedback === 'correct' && 'border-green-500 bg-green-500/20',
          feedback === 'incorrect' && 'border-red-500 bg-red-500/20 animate-shake'
        )}
      >
        {placedWords.length === 0 ? (
          <p className='text-gray-500 text-center py-4'>Tap words below to build the sentence</p>
        ) : (
          <div className='flex flex-wrap gap-2 justify-center'>
            {placedWords.map((word, index) => (
              <Button
                key={`placed-${index}`}
                onClick={() => handleWordTap(word, index, true)}
                disabled={isChecking}
                neon={false}
                variant='solid'
                className={clsx(
                  'px-3 py-1.5 md:px-4 md:py-2 h-auto text-base md:text-lg transition-all duration-200',
                  'shadow-lg shadow-blue-500/20',
                  isChecking && 'pointer-events-none'
                )}
              >
                {word}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Word Bank - Available Words */}
      <div className='flex-1 flex flex-col justify-center'>
        <div className='flex flex-wrap gap-3 justify-center'>
          {availableWords.map((word, index) => (
            <button
              key={`available-${index}`}
              onClick={() => handleWordTap(word, index, false)}
              disabled={isChecking}
              className={clsx(
                'px-5 py-3 rounded-xl font-medium text-lg transition-all duration-200',
                'bg-white/10 text-white border border-white/20',
                'active:scale-95 active:bg-white/20',
                'hover:bg-white/15 hover:border-white/30',
                'touch-manipulation select-none',
                isChecking && 'pointer-events-none opacity-50'
              )}
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex gap-3 mt-4 md:mt-8 shrink-0'>
        <Button
          onClick={handleReset}
          disabled={isChecking || placedWords.length === 0}
          variant='ghost'
          className={clsx(
            'flex-1 py-3 md:py-4 h-auto font-bold text-base md:text-lg transition-all',
            'disabled:opacity-30 disabled:pointer-events-none'
          )}
        >
          Reset
        </Button>
        <Button
          onClick={checkAnswer}
          disabled={!canCheck || isChecking}
          variant='solid'
          className={clsx(
            'flex-[2] py-3 md:py-4 h-auto font-bold text-base md:text-lg transition-all',
            !canCheck && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isChecking ? (feedback === 'correct' ? '✓ Correct!' : '✗ Try Again') : 'Check'}
        </Button>
      </div>
    </div>
  )
}
