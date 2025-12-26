'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { 
  getWordBank, 
  getWordsForReview,
  addToWordBank, 
  removeFromWordBank, 
  updateWordReview,
  type WordBankItem,
  type AddWordParams 
} from '@/services/userDataService'
import { cleanWord } from '@/utils/textUtils'

export function useWordBank() {
  const { user } = useAuth()
  const [words, setWords] = useState<WordBankItem[]>([])
  const [reviewQueue, setReviewQueue] = useState<WordBankItem[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch all words
  const fetchWords = useCallback(async () => {
    await Promise.resolve() // Ensure async execution

    if (!user) {
      setWords([])
      setLoading(false)
      return
    }

    setLoading(true)
    const allWords = await getWordBank(user.id)
    setWords(allWords)
    setLoading(false)
  }, [user])

  // Fetch words due for review
  const fetchReviewQueue = useCallback(async () => {
    if (!user) {
      setReviewQueue([])
      return
    }

    const wordsToReview = await getWordsForReview(user.id)
    setReviewQueue(wordsToReview)
  }, [user])

  useEffect(() => {
    fetchWords()
    fetchReviewQueue()
  }, [fetchWords, fetchReviewQueue])

  // Add a word to the word bank
  const addWord = useCallback(async (
    wordEs: string, 
    wordEn: string, 
    songId?: string, 
    songTitle?: string
  ): Promise<boolean> => {
    if (!user) return false

    const params: AddWordParams = {
      userId: user.id,
      wordEs: cleanWord(wordEs),
      wordEn: cleanWord(wordEn),
      songId,
      songTitle,
    }

    const success = await addToWordBank(params)
    if (success) {
      await fetchWords()
    }
    return success
  }, [user, fetchWords])

  // Remove a word from the word bank
  const removeWord = useCallback(async (wordId: string): Promise<boolean> => {
    if (!user) return false
    const success = await removeFromWordBank(user.id, wordId)
    if (success) {
      setWords(prev => prev.filter(w => w.id !== wordId))
      setReviewQueue(prev => prev.filter(w => w.id !== wordId))
    }
    return success
  }, [user])

  // Record a flashcard review result
  // quality: 0 = again, 1 = hard, 3 = good, 5 = easy
  const recordReview = useCallback(async (
    wordId: string, 
    quality: number
  ): Promise<boolean> => {
    if (!user) return false
    const success = await updateWordReview(user.id, wordId, quality)
    if (success) {
      // Remove from current review queue
      setReviewQueue(prev => prev.filter(w => w.id !== wordId))
    }
    return success
  }, [user])

  return {
    words,
    reviewQueue,
    reviewCount: reviewQueue.length,
    loading,
    addWord,
    removeWord,
    recordReview,
    refetch: fetchWords,
    refetchReview: fetchReviewQueue,
    isAuthenticated: !!user,
  }
}
