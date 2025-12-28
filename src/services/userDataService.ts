import { getSupabase } from '@/lib/supabase'
import type { Song } from '@/types'

// Types for database tables
export interface LikedSong {
  id: string
  user_id: string
  song_id: string
  title: string
  artist: string
  youtube_id: string
  created_at: string
}

export interface WordBankItem {
  id: string
  user_id: string
  word_es: string
  word_en: string
  song_id?: string
  song_title?: string
  ease_factor: number
  interval_days: number
  repetitions: number
  next_review: string
  created_at: string
}

// ===== LIKED SONGS =====

export async function getLikedSongs(userId: string): Promise<LikedSong[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('liked_songs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching liked songs:', error)
    return []
  }
  return data || []
}

export async function likeSong(userId: string, song: Song): Promise<boolean> {
  const supabase = getSupabase()
  const { error } = await supabase.from('liked_songs').upsert({
    user_id: userId,
    song_id: song.id,
    title: song.title,
    artist: song.artist,
    youtube_id: song.youtubeId,
  })

  if (error) {
    console.error('Error liking song:', error)
    return false
  }
  return true
}

export async function unlikeSong(userId: string, songId: string): Promise<boolean> {
  const supabase = getSupabase()
  const { error } = await supabase
    .from('liked_songs')
    .delete()
    .eq('user_id', userId)
    .eq('song_id', songId)

  if (error) {
    console.error('Error unliking song:', error)
    return false
  }
  return true
}

export async function isSongLiked(userId: string, songId: string): Promise<boolean> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('liked_songs')
    .select('id')
    .eq('user_id', userId)
    .eq('song_id', songId)
    .maybeSingle()

  if (error) {
    console.error('Error checking if song is liked:', error)
  }
  return !!data
}

// ===== WORD BANK =====

export async function getWordBank(userId: string): Promise<WordBankItem[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('word_bank')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching word bank:', error)
    return []
  }
  return data || []
}

export async function getWordsForReview(userId: string, limit = 20): Promise<WordBankItem[]> {
  const supabase = getSupabase()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('word_bank')
    .select('*')
    .eq('user_id', userId)
    .lte('next_review', now)
    .order('next_review', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Error fetching words for review:', error)
    return []
  }
  return data || []
}

export interface AddWordParams {
  userId: string
  wordEs: string
  wordEn: string
  songId?: string
  songTitle?: string
}

export async function addToWordBank(params: AddWordParams): Promise<boolean> {
  const supabase = getSupabase()
  const { error } = await supabase.from('word_bank').upsert({
    user_id: params.userId,
    word_es: params.wordEs,
    word_en: params.wordEn,
    song_id: params.songId,
    song_title: params.songTitle,
  })

  if (error) {
    console.error('Error adding to word bank:', error)
    return false
  }
  return true
}

export async function removeFromWordBank(userId: string, wordId: string): Promise<boolean> {
  const supabase = getSupabase()
  const { error } = await supabase
    .from('word_bank')
    .delete()
    .eq('user_id', userId)
    .eq('id', wordId)

  if (error) {
    console.error('Error removing from word bank:', error)
    return false
  }
  return true
}

// Spaced repetition update after flashcard review
// quality: 0-5 (0=complete fail, 5=perfect recall)
export async function updateWordReview(
  userId: string,
  wordId: string,
  quality: number
): Promise<boolean> {
  const supabase = getSupabase()

  // First get current word data
  const { data: word, error: fetchError } = await supabase
    .from('word_bank')
    .select('ease_factor, interval_days, repetitions')
    .eq('id', wordId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !word) {
    console.error('Error fetching word for review update:', fetchError)
    return false
  }

  // SM-2 algorithm calculations
  let { ease_factor, interval_days, repetitions } = word

  if (quality < 3) {
    // Failed: reset repetitions
    repetitions = 0
    interval_days = 1
  } else {
    // Success: update interval
    if (repetitions === 0) {
      interval_days = 1
    } else if (repetitions === 1) {
      interval_days = 6
    } else {
      interval_days = Math.round(interval_days * ease_factor)
    }
    repetitions += 1
  }

  // Update ease factor (min 1.3)
  ease_factor = Math.max(
    1.3,
    ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  )

  // Calculate next review date
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval_days)

  const { error: updateError } = await supabase
    .from('word_bank')
    .update({
      ease_factor,
      interval_days,
      repetitions,
      next_review: nextReview.toISOString(),
    })
    .eq('id', wordId)
    .eq('user_id', userId)

  if (updateError) {
    console.error('Error updating word review:', updateError)
    return false
  }
  return true
}
// ===== PRACTICE HISTORY =====

export interface PracticeSession {
  id?: string
  user_id: string
  song_id: string
  song_title: string
  score: number
  max_score: number
  created_at?: string
}

export async function savePracticeSession(session: PracticeSession): Promise<boolean> {
  const supabase = getSupabase()
  const { error } = await supabase.from('practice_sessions').insert({
    user_id: session.user_id,
    song_id: session.song_id,
    song_title: session.song_title,
    score: session.score,
    max_score: session.max_score,
  })

  if (error) {
    console.error('Error saving practice session:', error)
    return false
  }
  return true
}

export async function getPracticeHistory(userId: string, limit = 10): Promise<PracticeSession[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching practice history:', error)
    return []
  }
  return data || []
}

export async function getUserStats(userId: string) {
  const supabase = getSupabase()
  
  // Parallel fetch for stats
  const [likedRes, wordsRes, practiceRes] = await Promise.all([
    supabase.from('liked_songs').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('word_bank').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('practice_sessions').select('score', { count: 'exact' }).eq('user_id', userId)
  ])

  // Calculate total XP (sum of scores)
  let totalXp = 0
  
  // To get total XP without RPC, we can fetch just the 'score' column
  const { data: scores } = await supabase
    .from('practice_sessions')
    .select('score')
    .eq('user_id', userId)
  
  if (scores) {
    totalXp = scores.reduce((acc: number, curr: { score: number }) => acc + curr.score, 0)
  }

  return {
    likedSongs: likedRes.count || 0,
    wordsLearned: wordsRes.count || 0,
    sessionsCompleted: practiceRes.count || 0,
    totalXp
  }
}
