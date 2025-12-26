/**
 * Cleans a word by removing punctuation from the beginning and end.
 * It also handles Spanish specific punctuation like ¿ and ¡.
 */
export function cleanWord(word: string): string {
  if (!word) return ''
  
  // Remove punctuation from start and end
  // We keep internal punctuation like apostrophes in English (e.g., "don't")
  // or hyphens in Spanish (if any)
  return word
    .replace(/^[¿¡"'«(]+|[?!.,;:"'»)]+$/g, '')
    .trim()
}

/**
 * Splits a sentence into an array of cleaned words.
 */
export function splitIntoCleanWords(text: string): string[] {
  if (!text) return []
  return text
    .split(/\s+/)
    .map(cleanWord)
    .filter(word => word.length > 0)
}
