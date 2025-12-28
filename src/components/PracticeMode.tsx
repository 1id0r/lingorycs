'use client'

import React, { useState, useEffect } from 'react'
import type { Song } from '@/types'
import type { PracticeSession, SessionSummary } from '@/types/exercises'
import { createPracticeSession } from '@/utils/exerciseGenerator'
import { savePracticeSession } from '@/services/userDataService'
import { useAuth } from '@/context/AuthContext'
import { WordBank } from './exercises/WordBank'
import { FillBlank } from './exercises/FillBlank'
import { Heart, Star, Flame, X, Trophy, RotateCcw } from 'lucide-react'
import { Button } from './ui/neon-button'
import clsx from 'clsx'

interface PracticeModeProps {
  song: Song
  onExit: () => void
}

export const PracticeMode: React.FC<PracticeModeProps> = ({ song, onExit }) => {
  const { user } = useAuth()
  // Initialize session - compute initial session
  const [session, setSession] = useState<PracticeSession>(() => {
    const { exercises } = createPracticeSession(song.id, song.lyrics, 10)
    return {
      songId: song.id,
      exercises,
      currentIndex: 0,
      results: [],
      hearts: 3,
      xp: 0,
      streak: 0,
      startedAt: Date.now(),
    }
  })
  const [summary, setSummary] = useState<SessionSummary | null>(null)

  // Save session when completion summary is shown
  useEffect(() => {
    if (summary && summary.passed && user) {
      savePracticeSession({
        user_id: user.id,
        song_id: song.id,
        song_title: song.title,
        score: summary.xpEarned,
        max_score: session.exercises.length * 10,
      })
    }
  }, [summary, user, song.id, song.title, session.exercises.length])

  // Check if session is complete
  if (summary) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white p-6'>
        <div className='max-w-md w-full text-center'>
          {/* Trophy or Broken Heart */}
          <div className='mb-8'>
            {summary.passed ? (
              <div className='w-24 h-24 mx-auto bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-blue-500/20'>
                <Trophy size={48} className='text-blue-400' />
              </div>
            ) : (
              <div className='w-24 h-24 mx-auto bg-gray-700/50 border border-white/10 rounded-full flex items-center justify-center'>
                <Heart size={48} className='text-red-400' />
              </div>
            )}
          </div>

          <h1 className='text-3xl font-bold mb-2'>{summary.passed ? 'Great Job!' : 'Keep Practicing!'}</h1>
          <p className='text-gray-400 mb-8'>
            {summary.passed ? `You completed the lesson for "${song.title}"` : 'You ran out of hearts. Try again!'}
          </p>

          {/* Stats */}
          <div className='grid grid-cols-2 gap-4 mb-8'>
            <div className='bg-white/5 rounded-xl p-4'>
              <div className='text-3xl font-bold text-teal-400'>{summary.correctAnswers}</div>
              <div className='text-sm text-gray-400'>Correct</div>
            </div>
            <div className='bg-white/5 rounded-xl p-4'>
              <div className='text-3xl font-bold text-purple-400'>+{summary.xpEarned}</div>
              <div className='text-sm text-gray-400'>XP Earned</div>
            </div>
            <div className='bg-white/5 rounded-xl p-4'>
              <div className='text-3xl font-bold text-orange-400'>{summary.maxStreak}</div>
              <div className='text-sm text-gray-400'>Best Streak</div>
            </div>
            <div className='bg-white/5 rounded-xl p-4'>
              <div className='text-3xl font-bold text-gray-300'>{Math.round(summary.timeTakenMs / 1000)}s</div>
              <div className='text-sm text-gray-400'>Time</div>
            </div>
          </div>

          {/* Actions */}
          <div className='flex gap-4'>
            <Button
              onClick={() => {
                const { exercises } = createPracticeSession(song.id, song.lyrics, 10)
                setSession({
                  songId: song.id,
                  exercises,
                  currentIndex: 0,
                  results: [],
                  hearts: 3,
                  xp: 0,
                  streak: 0,
                  startedAt: Date.now(),
                })
                setSummary(null)
              }}
              variant='solid'
              className='flex-1 py-4 h-auto flex items-center justify-center gap-2 transition-all'
            >
              <RotateCcw size={20} />
              Try Again
            </Button>
            <button
              onClick={onExit}
              className='flex-1 py-4 rounded-xl font-bold bg-white/10 text-white hover:bg-white/20 transition-all'
            >
              Back to Song
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentExercise = session.exercises[session.currentIndex]
  const progress = (session.currentIndex / session.exercises.length) * 100

  // Handle exercise completion
  const handleExerciseComplete = (correct: boolean) => {
    const newXp = correct ? session.xp + 10 : session.xp
    const newStreak = correct ? session.streak + 1 : 0
    const newHearts = correct ? session.hearts : session.hearts - 1

    const newResults = [
      ...session.results,
      {
        exerciseId: currentExercise.id,
        correct,
        timeTakenMs: Date.now() - session.startedAt,
        attempts: 1,
      },
    ]

    // Check for game over (no hearts)
    if (newHearts <= 0) {
      setSummary({
        totalExercises: session.exercises.length,
        correctAnswers: newResults.filter((r) => r.correct).length,
        xpEarned: newXp,
        maxStreak: Math.max(newStreak, session.streak),
        timeTakenMs: Date.now() - session.startedAt,
        passed: false,
      })
      return
    }

    // Check for session complete
    if (session.currentIndex >= session.exercises.length - 1) {
      setSummary({
        totalExercises: session.exercises.length,
        correctAnswers: newResults.filter((r) => r.correct).length,
        xpEarned: newXp,
        maxStreak: Math.max(newStreak, session.streak),
        timeTakenMs: Date.now() - session.startedAt,
        passed: true,
      })
      return
    }

    // Move to next exercise
    setSession({
      ...session,
      currentIndex: session.currentIndex + 1,
      results: newResults,
      hearts: newHearts,
      xp: newXp,
      streak: newStreak,
    })
  }

  return (
    <div className='flex flex-col h-[100dvh] bg-neutral-900 text-white overflow-hidden'>
      {/* Header */}
      <div className='shrink-0 p-4 border-b border-white/10 bg-black/50'>
        <div className='flex items-center justify-between max-w-2xl mx-auto'>
          {/* Close Button */}
          <button onClick={onExit} className='p-2 rounded-full hover:bg-white/10 transition-colors'>
            <X size={24} />
          </button>

          {/* Progress Bar */}
          <div className='flex-1 mx-4'>
            <div className='h-3 bg-white/10 rounded-full overflow-hidden'>
              <div className='h-full bg-blue-500 transition-all duration-500' style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Hearts */}
          <div className='flex items-center gap-1'>
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                size={24}
                className={clsx(
                  'transition-all duration-300',
                  i < session.hearts ? 'fill-red-500 text-red-500' : 'text-gray-600'
                )}
              />
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className='flex items-center justify-center gap-6 mt-3 max-w-2xl mx-auto'>
          <div className='flex items-center gap-1 text-sm'>
            <Star size={16} className='text-yellow-400 fill-yellow-400' />
            <span className='font-bold'>{session.xp} XP</span>
          </div>
          {session.streak > 0 && (
            <div className='flex items-center gap-1 text-sm animate-pulse'>
              <Flame size={16} className='text-orange-400' />
              <span className='font-bold text-orange-400'>{session.streak} streak!</span>
            </div>
          )}
          <div className='text-sm text-gray-400'>
            {session.currentIndex + 1} / {session.exercises.length}
          </div>
        </div>
      </div>

      {/* Exercise Content */}
      <div className='flex-1 overflow-auto p-6 max-w-2xl mx-auto w-full'>
        {currentExercise.type === 'word-order' && (
          <WordBank key={currentExercise.id} exercise={currentExercise} onComplete={handleExerciseComplete} />
        )}
        {currentExercise.type === 'fill-blank' && (
          <FillBlank key={currentExercise.id} exercise={currentExercise} onComplete={handleExerciseComplete} />
        )}
      </div>
    </div>
  )
}
