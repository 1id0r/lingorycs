// Exercise Types for Spanish Learning Feature

export type ExerciseType = 'word-order' | 'fill-blank' | 'translation-match'

// Base exercise interface
interface BaseExercise {
  id: string
  type: ExerciseType
  sourceLineIndex: number // Reference to the lyric line
  text_es: string // Spanish text
  text_en: string // English translation
}

// Word ordering exercise - rebuild the sentence from scrambled words
export interface WordOrderExercise extends BaseExercise {
  type: 'word-order'
  words: string[] // Scrambled words
  correctOrder: string[] // Correct word order
}

// Fill in the blank exercise
export interface FillBlankExercise extends BaseExercise {
  type: 'fill-blank'
  sentenceWithBlanks: string // e.g., "Yo ___ contigo"
  blankWord: string // The correct word to fill
  options: string[] // Multiple choice options including the correct one
}

// Translation match exercise
export interface TranslationMatchExercise extends BaseExercise {
  type: 'translation-match'
  spanishPhrases: string[]
  englishPhrases: string[]
  correctPairs: [number, number][] // Index pairs of correct matches
}

export type Exercise = WordOrderExercise | FillBlankExercise | TranslationMatchExercise

// Result of a single exercise attempt
export interface ExerciseResult {
  exerciseId: string
  correct: boolean
  timeTakenMs: number
  attempts: number
}

// Overall practice session state
export interface PracticeSession {
  songId: string
  exercises: Exercise[]
  currentIndex: number
  results: ExerciseResult[]
  hearts: number // Lives remaining (starts at 3)
  xp: number // Experience points earned
  streak: number // Consecutive correct answers
  startedAt: number
}

// Session summary for results screen
export interface SessionSummary {
  totalExercises: number
  correctAnswers: number
  xpEarned: number
  maxStreak: number
  timeTakenMs: number
  passed: boolean // true if completed with hearts > 0
}
