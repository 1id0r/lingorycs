/**
 * Tests for exerciseGenerator utility functions
 */
import { generateExercises, createPracticeSession } from '@/utils/exerciseGenerator'
import type { LyricLine } from '@/types'

// Sample test data
const mockLyrics: LyricLine[] = [
  { startTime: 0, endTime: 5, text_es: '¿Cómo te llamas?', text_en: 'What is your name?' },
  { startTime: 5, endTime: 10, text_es: 'Me llamo Pedro', text_en: 'My name is Pedro' },
  { startTime: 10, endTime: 15, text_es: 'Mucho gusto conocerte', text_en: 'Nice to meet you' },
  { startTime: 15, endTime: 20, text_es: 'El placer es mío', text_en: 'The pleasure is mine' },
  { startTime: 20, endTime: 25, text_es: '¿De dónde eres?', text_en: 'Where are you from?' },
  { startTime: 25, endTime: 30, text_es: 'Soy de España, un país hermoso', text_en: 'I am from Spain, a beautiful country' },
]

describe('exerciseGenerator', () => {
  describe('generateExercises', () => {
    it('generates the correct number of exercises', () => {
      const exercises = generateExercises(mockLyrics, 4)
      expect(exercises.length).toBe(4)
    })

    it('generates no more exercises than available valid lines', () => {
      const exercises = generateExercises(mockLyrics, 100)
      expect(exercises.length).toBeLessThanOrEqual(mockLyrics.length)
    })

    it('returns empty array for empty lyrics', () => {
      const exercises = generateExercises([], 5)
      expect(exercises).toEqual([])
    })

    it('returns empty array for lyrics with only short text', () => {
      const shortLyrics: LyricLine[] = [
        { startTime: 0, endTime: 5, text_es: 'Sí', text_en: 'Yes' },
        { startTime: 5, endTime: 10, text_es: 'No', text_en: 'No' },
      ]
      const exercises = generateExercises(shortLyrics, 5)
      expect(exercises).toEqual([])
    })

    it('generates exercises with valid types', () => {
      const exercises = generateExercises(mockLyrics, 4)
      exercises.forEach(exercise => {
        expect(['word-order', 'fill-blank', 'translation-match']).toContain(exercise.type)
      })
    })

    it('each exercise has required base properties', () => {
      const exercises = generateExercises(mockLyrics, 4)
      exercises.forEach(exercise => {
        expect(exercise).toHaveProperty('id')
        expect(exercise).toHaveProperty('type')
        expect(exercise).toHaveProperty('sourceLineIndex')
        expect(exercise).toHaveProperty('text_es')
        expect(exercise).toHaveProperty('text_en')
      })
    })

    describe('word-order exercises', () => {
      it('has shuffled words array', () => {
        const exercises = generateExercises(mockLyrics, 10)
        const wordOrderExercises = exercises.filter(e => e.type === 'word-order')
        
        wordOrderExercises.forEach(exercise => {
          if (exercise.type === 'word-order') {
            expect(exercise.words).toBeDefined()
            expect(exercise.correctOrder).toBeDefined()
            expect(exercise.words.length).toBe(exercise.correctOrder.length)
          }
        })
      })
    })

    describe('fill-blank exercises', () => {
      it('has sentence with blanks and options', () => {
        const exercises = generateExercises(mockLyrics, 10)
        const fillBlankExercises = exercises.filter(e => e.type === 'fill-blank')
        
        fillBlankExercises.forEach(exercise => {
          if (exercise.type === 'fill-blank') {
            expect(exercise.sentenceWithBlanks).toContain('_____')
            expect(exercise.blankWord).toBeDefined()
            expect(exercise.options).toContain(exercise.blankWord)
          }
        })
      })
    })
  })

  describe('createPracticeSession', () => {
    it('creates a session with exercises array', () => {
      const session = createPracticeSession('song-123', mockLyrics, 5)
      expect(session).toHaveProperty('exercises')
      expect(Array.isArray(session.exercises)).toBe(true)
    })

    it('respects exerciseCount parameter', () => {
      const session = createPracticeSession('song-123', mockLyrics, 3)
      expect(session.exercises.length).toBeLessThanOrEqual(3)
    })

    it('uses default count of 10 when not specified', () => {
      const session = createPracticeSession('song-123', mockLyrics)
      expect(session.exercises.length).toBeLessThanOrEqual(10)
    })
  })
})
