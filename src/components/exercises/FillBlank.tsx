'use client'

import React, { useState } from 'react'
import type { FillBlankExercise } from '@/types/exercises'
import { Button } from '../ui/neon-button'
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
      <p className='text-xl md:text-3xl font-bold text-center leading-relaxed px-2'>
        {parts[0]}
        <span
          className={clsx(
            'inline-block min-w-[80px] md:min-w-[100px] mx-1 md:mx-2 px-2 md:px-4 py-1 rounded-lg border-b-4 transition-all',
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
      <div className='text-center mb-4 md:mb-6 shrink-0'>
        <p className='text-gray-400 text-xs md:text-sm mb-1'>Complete the sentence:</p>
        <p className='text-teal-300 text-base md:text-lg font-medium'>{exercise.text_en}</p>
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
      <div className='grid grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-8'>
        {exercise.options.map((option, index) => (
          <Button
            key={index}
            onClick={() => handleOptionSelect(option)}
            disabled={isChecking}
            neon={selectedOption === option}
            variant={selectedOption === option ? 'solid' : 'ghost'}
            className={clsx(
              'py-3 md:py-4 px-4 md:px-6 h-auto font-bold text-base md:text-lg transition-all duration-200',
              'border-2 touch-manipulation',
              selectedOption === option && feedback === 'correct' && 'bg-green-500 border-green-400',
              selectedOption === option && feedback === 'incorrect' && 'bg-red-500 border-red-400',
              isChecking && 'pointer-events-none',
              // Highlight correct answer after incorrect guess
              feedback === 'incorrect' &&
                option.toLowerCase() === exercise.blankWord.toLowerCase() &&
                'bg-green-500/50 border-green-400 text-green-100'
            )}
          >
            {option}
          </Button>
        ))}
      </div>

      {/* Check Button */}
      <Button
        onClick={checkAnswer}
        disabled={!selectedOption || isChecking}
        variant='solid'
        className={clsx(
          'w-full py-3 md:py-4 h-auto font-bold text-base md:text-lg transition-all shrink-0',
          (!selectedOption || isChecking) && 'opacity-50 cursor-not-allowed'
        )}
      >
        {isChecking ? (feedback === 'correct' ? '✓ Perfect!' : '✗ Not quite') : 'Check'}
      </Button>
    </div>
  )
}
