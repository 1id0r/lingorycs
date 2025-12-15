'use client'

import React, { useState } from 'react'
import type { FillBlankExercise } from '@/types/exercises'
import clsx from 'clsx'

interface FillBlankProps {
  exercise: FillBlankExercise
  onComplete: (correct: boolean) => void
}

export const FillBlank: React.FC<FillBlankProps> = ({ exercise, onComplete }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const handleOptionSelect = (option: string) => {
    if (isChecking) return
    setSelectedOption(option)
  }

  const checkAnswer = () => {
    if (!selectedOption) return

    setIsChecking(true)
    const isCorrect = selectedOption.toLowerCase() === exercise.blankWord.toLowerCase()
    setFeedback(isCorrect ? 'correct' : 'incorrect')

    setTimeout(() => {
      onComplete(isCorrect)
    }, 1500)
  }

  // Render sentence with blank highlighted
  const renderSentence = () => {
    const parts = exercise.sentenceWithBlanks.split('_____')
    return (
      <p className='text-2xl md:text-3xl font-bold text-center leading-relaxed'>
        {parts[0]}
        <span
          className={clsx(
            'inline-block min-w-[100px] mx-2 px-4 py-1 rounded-lg border-b-4 transition-all',
            selectedOption
              ? feedback === 'correct'
                ? 'bg-green-500/30 border-green-500 text-green-200'
                : feedback === 'incorrect'
                ? 'bg-red-500/30 border-red-500 text-red-200'
                : 'bg-purple-500/30 border-purple-500 text-purple-200'
              : 'bg-white/10 border-white/30 text-gray-400'
          )}
        >
          {selectedOption || '?'}
        </span>
        {parts[1]}
      </p>
    )
  }

  return (
    <div className='flex flex-col h-full'>
      {/* Instructions */}
      <div className='text-center mb-6'>
        <p className='text-gray-400 text-sm mb-2'>Complete the sentence:</p>
        <p className='text-teal-300 text-lg font-medium'>{exercise.text_en}</p>
      </div>

      {/* Sentence with Blank */}
      <div
        className={clsx(
          'flex-1 flex items-center justify-center p-6 rounded-2xl mb-8 transition-all',
          'bg-gradient-to-br from-white/5 to-white/10 border border-white/10',
          feedback === 'correct' && 'from-green-500/10 to-green-500/20 border-green-500/30',
          feedback === 'incorrect' && 'from-red-500/10 to-red-500/20 border-red-500/30 animate-shake'
        )}
      >
        {renderSentence()}
      </div>

      {/* Options */}
      <div className='grid grid-cols-2 gap-3 mb-8'>
        {exercise.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionSelect(option)}
            disabled={isChecking}
            className={clsx(
              'py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200',
              'border-2 touch-manipulation',
              selectedOption === option
                ? feedback === 'correct'
                  ? 'bg-green-500 border-green-400 text-white'
                  : feedback === 'incorrect'
                  ? 'bg-red-500 border-red-400 text-white'
                  : 'bg-purple-600 border-purple-400 text-white scale-105'
                : 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30',
              isChecking && 'pointer-events-none',
              // Highlight correct answer after incorrect guess
              feedback === 'incorrect' &&
                option.toLowerCase() === exercise.blankWord.toLowerCase() &&
                'bg-green-500/50 border-green-400 text-green-100'
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Check Button */}
      <button
        onClick={checkAnswer}
        disabled={!selectedOption || isChecking}
        className={clsx(
          'w-full py-4 rounded-xl font-bold text-lg transition-all',
          selectedOption && !isChecking
            ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg shadow-teal-500/30 hover:from-teal-400 hover:to-green-400 active:scale-98'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        )}
      >
        {isChecking ? (feedback === 'correct' ? '✓ Perfect!' : '✗ Not quite') : 'Check'}
      </button>
    </div>
  )
}
