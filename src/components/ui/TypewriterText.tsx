'use client'

import { useState, useEffect, useCallback } from 'react'

interface TypewriterTextProps {
  phrases: string[]
  typingSpeed?: number
  deletingSpeed?: number
  pauseTime?: number
  className?: string
}

export function TypewriterText({
  phrases,
  typingSpeed = 50,
  deletingSpeed = 30,
  pauseTime = 2000,
  className = '',
}: TypewriterTextProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const currentPhrase = phrases[currentPhraseIndex]

  const tick = useCallback(() => {
    if (isPaused) return

    if (!isDeleting) {
      // Typing
      if (currentText.length < currentPhrase.length) {
        setCurrentText(currentPhrase.slice(0, currentText.length + 1))
      } else {
        // Finished typing, pause before deleting
        setIsPaused(true)
        setTimeout(() => {
          setIsPaused(false)
          setIsDeleting(true)
        }, pauseTime)
      }
    } else {
      // Deleting
      if (currentText.length > 0) {
        setCurrentText(currentText.slice(0, -1))
      } else {
        // Finished deleting, move to next phrase
        setIsDeleting(false)
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
      }
    }
  }, [currentText, currentPhrase, isDeleting, isPaused, pauseTime, phrases.length])

  useEffect(() => {
    const speed = isDeleting ? deletingSpeed : typingSpeed
    const timer = setTimeout(tick, speed)
    return () => clearTimeout(timer)
  }, [tick, isDeleting, typingSpeed, deletingSpeed])

  return (
    <span className={className}>
      {currentText}
      <span className='animate-pulse text-blue-400'>|</span>
    </span>
  )
}
