// Exercise Generator - Creates exercises from song lyrics

import type { LyricLine } from '@/types'
import type { 
  Exercise, 
  WordOrderExercise, 
  FillBlankExercise,
  TranslationMatchExercise 
} from '@/types/exercises'
import { cleanWord } from './textUtils'

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Generate a unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

// Split sentence into words, keeping meaningful tokens
function splitIntoWords(text: string): string[] {
  return text
    .split(/\s+/)
    .map(cleanWord)
    .filter(w => w.length > 0)
}

// Generate a Word Order exercise from a lyric line
function createWordOrderExercise(line: LyricLine, index: number): WordOrderExercise {
  const correctOrder = splitIntoWords(line.text_es)
  const words = shuffle(correctOrder)
  
  // Ensure shuffled is actually different (try up to 5 times)
  let attempts = 0
  while (words.join(' ') === correctOrder.join(' ') && attempts < 5) {
    shuffle(words)
    attempts++
  }
  
  return {
    id: generateId(),
    type: 'word-order',
    sourceLineIndex: index,
    text_es: line.text_es,
    text_en: line.text_en,
    words,
    correctOrder
  }
}

// Generate a Fill in the Blank exercise
function createFillBlankExercise(
  line: LyricLine, 
  index: number,
  allLines: LyricLine[]
): FillBlankExercise {
  const words = splitIntoWords(line.text_es)
  
  // Pick a word to blank out (prefer longer words, not first/last)
  const candidates = words
    .map((w, i) => ({ word: w, index: i }))
    .filter(({ word, index }) => 
      word.length >= 3 && 
      index > 0 && 
      index < words.length - 1
    )
  
  const target = candidates.length > 0 
    ? candidates[Math.floor(Math.random() * candidates.length)]
    : { word: words[Math.floor(words.length / 2)], index: Math.floor(words.length / 2) }
  
  const blankWord = target.word
  const sentenceWithBlanks = words
    .map((w, i) => i === target.index ? '_____' : w)
    .join(' ')
  
  // Create distractor options from other lines
  const distractors = allLines
    .flatMap(l => splitIntoWords(l.text_es))
    .filter(w => w.toLowerCase() !== blankWord.toLowerCase() && w.length >= 3)
    .slice(0, 20)
  
  const uniqueDistractors = [...new Set(distractors)]
  const shuffledDistractors = shuffle(uniqueDistractors).slice(0, 3)
  
  const options = shuffle([blankWord, ...shuffledDistractors])
  
  return {
    id: generateId(),
    type: 'fill-blank',
    sourceLineIndex: index,
    text_es: line.text_es,
    text_en: line.text_en,
    sentenceWithBlanks,
    blankWord,
    options
  }
}

// Generate Translation Match exercise (groups 3-4 lines)
function createTranslationMatchExercise(
  lines: LyricLine[],
  startIndex: number
): TranslationMatchExercise {
  const spanishPhrases = lines.map(l => l.text_es)
  const englishPhrases = shuffle(lines.map(l => l.text_en))
  
  // Create correct pairs: find where each Spanish line's English ended up
  const correctPairs: [number, number][] = lines.map((line, sIdx) => {
    const eIdx = englishPhrases.findIndex(e => e === line.text_en)
    return [sIdx, eIdx] as [number, number]
  })
  
  return {
    id: generateId(),
    type: 'translation-match',
    sourceLineIndex: startIndex,
    text_es: lines.map(l => l.text_es).join(' | '),
    text_en: lines.map(l => l.text_en).join(' | '),
    spanishPhrases,
    englishPhrases,
    correctPairs
  }
}

// Main generator: create a set of exercises from lyrics
export function generateExercises(
  lyrics: LyricLine[],
  count: number = 10
): Exercise[] {
  const exercises: Exercise[] = []
  const usedIndices = new Set<number>()
  
  // Filter to only lines with both Spanish and English
  const validLines = lyrics.filter(
    (l, i) => l.text_es.trim().length > 5 && l.text_en.trim().length > 3
  )
  
  if (validLines.length === 0) return []
  
  // Generate mix of exercise types
  const targetCount = Math.min(count, validLines.length)
  
  for (let i = 0; i < targetCount; i++) {
    // Pick a random line not yet used
    let lineIndex: number
    let attempts = 0
    do {
      lineIndex = Math.floor(Math.random() * validLines.length)
      attempts++
    } while (usedIndices.has(lineIndex) && attempts < 50)
    
    if (usedIndices.has(lineIndex)) continue
    usedIndices.add(lineIndex)
    
    const line = validLines[lineIndex]
    const originalIndex = lyrics.indexOf(line)
    
    // Alternate between word-order and fill-blank
    // (Translation match can be added later as bonus round)
    const exerciseType = i % 2 === 0 ? 'word-order' : 'fill-blank'
    
    if (exerciseType === 'word-order') {
      exercises.push(createWordOrderExercise(line, originalIndex))
    } else {
      exercises.push(createFillBlankExercise(line, originalIndex, lyrics))
    }
  }
  
  return shuffle(exercises)
}

// Create initial practice session
export function createPracticeSession(
  songId: string,
  lyrics: LyricLine[],
  exerciseCount: number = 10
): { exercises: Exercise[] } {
  const exercises = generateExercises(lyrics, exerciseCount)
  return { exercises }
}
