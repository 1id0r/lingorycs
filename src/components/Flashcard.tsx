'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, ArrowRight, Keyboard } from 'lucide-react'

interface FlashcardProps {
  wordEs: string
  wordEn: string
  songTitle?: string
  allWords: Array<{ word_es: string; word_en: string }>
  onResult: (quality: number) => void
}

type ExerciseType = 'es-to-en' | 'en-to-es' | 'type-es'

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function Flashcard({ wordEs, wordEn, songTitle, allWords, onResult }: FlashcardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [key, setKey] = useState(0)
  const [typedAnswer, setTypedAnswer] = useState('')

  // Randomly pick exercise type
  const [exerciseType] = useState<ExerciseType>(() => {
    const types: ExerciseType[] = ['es-to-en', 'en-to-es', 'type-es']
    return types[Math.floor(Math.random() * types.length)]
  })

  // Generate options based on exercise type
  const options = useMemo(() => {
    const isSpanishOptions = exerciseType === 'en-to-es'
    const correctAnswer = isSpanishOptions ? wordEs : wordEn
    const otherAnswers = allWords
      .filter((w) => (isSpanishOptions ? w.word_es !== wordEs : w.word_en !== wordEn))
      .map((w) => (isSpanishOptions ? w.word_es : w.word_en))

    const wrongAnswers = shuffleArray(otherAnswers).slice(0, 3)

    // Fallback options if not enough words
    const fallbacks = isSpanishOptions
      ? ['la casa', 'amar', 'hermoso', 'siempre', 'esta noche']
      : ['the house', 'to love', 'beautiful', 'always', 'tonight']

    while (wrongAnswers.length < 3) {
      const fallback = fallbacks[wrongAnswers.length]
      if (fallback !== correctAnswer) {
        wrongAnswers.push(fallback)
      }
    }

    return shuffleArray([correctAnswer, ...wrongAnswers.slice(0, 3)])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordEs, wordEn, allWords, key, exerciseType])

  const handleSelect = (answer: string) => {
    if (selectedAnswer !== null) return

    setSelectedAnswer(answer)
    const correctAnswer = exerciseType === 'en-to-es' ? wordEs : wordEn
    const correct = answer === correctAnswer
    setIsCorrect(correct)

    setTimeout(() => {
      setSelectedAnswer(null)
      setIsCorrect(null)
      setTypedAnswer('')
      setKey((k) => k + 1)
      onResult(correct ? 5 : 0)
    }, 1200)
  }

  const handleTypeSubmit = () => {
    if (!typedAnswer.trim()) return

    const correct = typedAnswer.trim().toLowerCase() === wordEs.toLowerCase()
    setIsCorrect(correct)
    setSelectedAnswer(typedAnswer)

    setTimeout(() => {
      setSelectedAnswer(null)
      setIsCorrect(null)
      setTypedAnswer('')
      setKey((k) => k + 1)
      onResult(correct ? 5 : 0)
    }, 1500)
  }

  const getQuestion = () => {
    switch (exerciseType) {
      case 'es-to-en':
        return { label: 'What does this mean in English?', word: wordEs, color: 'text-blue-400' }
      case 'en-to-es':
        return { label: 'What is this in Spanish?', word: wordEn, color: 'text-white' }
      case 'type-es':
        return { label: 'Type the Spanish word for:', word: wordEn, color: 'text-blue-400' }
    }
  }

  const question = getQuestion()
  const correctAnswer = exerciseType === 'en-to-es' || exerciseType === 'type-es' ? wordEs : wordEn

  return (
    <div className='flex flex-col items-center gap-6 w-full max-w-md mx-auto px-4'>
      {/* Exercise Type Badge */}
      <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-xs text-gray-400'>
        {exerciseType === 'type-es' ? <Keyboard size={14} /> : <ArrowRight size={14} />}
        {exerciseType === 'es-to-en' && 'Spanish → English'}
        {exerciseType === 'en-to-es' && 'English → Spanish'}
        {exerciseType === 'type-es' && 'Type the Answer'}
      </div>

      {/* Question */}
      <div className='text-center'>
        <span className='text-sm text-gray-500 block mb-3'>{question.label}</span>
        <motion.h2
          key={`${wordEs}-${key}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-4xl md:text-5xl font-bold ${question.color}`}
        >
          {question.word}
        </motion.h2>
        {songTitle && <span className='text-xs text-gray-600 mt-3 block'>from &ldquo;{songTitle}&rdquo;</span>}
      </div>

      {/* Type Exercise */}
      {exerciseType === 'type-es' && selectedAnswer === null && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='w-full space-y-4'>
          <input
            type='text'
            value={typedAnswer}
            onChange={(e) => setTypedAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTypeSubmit()}
            placeholder='Type in Spanish...'
            autoFocus
            className='w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-center text-xl font-semibold focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all placeholder:text-gray-600'
          />
          <button
            onClick={handleTypeSubmit}
            disabled={!typedAnswer.trim()}
            className='w-full py-4 rounded-2xl bg-blue-500 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-lg shadow-blue-500/25'
          >
            Check Answer
          </button>
        </motion.div>
      )}

      {/* Multiple Choice Options */}
      {exerciseType !== 'type-es' && (
        <div className='w-full space-y-3 mt-2'>
          <AnimatePresence mode='wait'>
            {options.map((option, index) => {
              const isSelected = selectedAnswer === option
              const isCorrectOption = option === correctAnswer
              const showResult = selectedAnswer !== null

              let buttonClass = 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'

              if (showResult) {
                if (isCorrectOption) {
                  buttonClass = 'bg-green-500/20 border-green-500/50 text-green-400'
                } else if (isSelected && !isCorrectOption) {
                  buttonClass = 'bg-red-500/20 border-red-500/50 text-red-400'
                } else {
                  buttonClass = 'bg-white/5 border-white/5 opacity-50'
                }
              }

              return (
                <motion.button
                  key={`${option}-${key}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  onClick={() => handleSelect(option)}
                  disabled={selectedAnswer !== null}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${buttonClass}`}
                >
                  <span className='text-lg font-medium'>{option}</span>
                  {showResult && isCorrectOption && <Check className='text-green-400' size={22} />}
                  {showResult && isSelected && !isCorrectOption && <X className='text-red-400' size={22} />}
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Feedback */}
      <AnimatePresence>
        {isCorrect !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center p-5 rounded-2xl w-full ${
              isCorrect ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
            }`}
          >
            <span className='text-2xl font-bold block mb-1'>{isCorrect ? '¡Perfecto! 🎉' : 'Not quite 😅'}</span>
            {!isCorrect && (
              <p className='text-sm opacity-80'>
                The answer was: <strong className='text-white'>{correctAnswer}</strong>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
