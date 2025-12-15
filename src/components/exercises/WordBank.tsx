'use client'

import React, { useState, useRef } from 'react'
import type { WordOrderExercise } from '@/types/exercises'
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
      <div className='text-center mb-6'>
        <p className='text-gray-400 text-sm mb-2'>Arrange the words to form the sentence:</p>
        <p className='text-teal-300 text-lg font-medium'>{exercise.text_en}</p>
      </div>

      {/* Drop Zone - Sentence Building Area */}
      <div
        ref={dropZoneRef}
        className={clsx(
          'min-h-[120px] p-4 rounded-2xl border-2 border-dashed transition-all duration-300 mb-8',
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
              <button
                key={`placed-${index}`}
                onClick={() => handleWordTap(word, index, true)}
                disabled={isChecking}
                className={clsx(
                  'px-4 py-2 rounded-xl font-medium text-lg transition-all duration-200',
                  'bg-gradient-to-r from-purple-600 to-purple-700 text-white',
                  'active:scale-95 hover:from-purple-500 hover:to-purple-600',
                  'shadow-lg shadow-purple-500/20',
                  isChecking && 'pointer-events-none'
                )}
              >
                {word}
              </button>
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
      <div className='flex gap-4 mt-8'>
        <button
          onClick={handleReset}
          disabled={isChecking || placedWords.length === 0}
          className={clsx(
            'flex-1 py-4 rounded-xl font-bold text-lg transition-all',
            'bg-white/10 text-gray-300 border border-white/10',
            'hover:bg-white/20 active:scale-95',
            'disabled:opacity-30 disabled:pointer-events-none'
          )}
        >
          Reset
        </button>
        <button
          onClick={checkAnswer}
          disabled={!canCheck || isChecking}
          className={clsx(
            'flex-[2] py-4 rounded-xl font-bold text-lg transition-all',
            canCheck
              ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg shadow-teal-500/30 hover:from-teal-400 hover:to-green-400 active:scale-95'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          )}
        >
          {isChecking ? (feedback === 'correct' ? '✓ Correct!' : '✗ Try Again') : 'Check'}
        </button>
      </div>
    </div>
  )
}
