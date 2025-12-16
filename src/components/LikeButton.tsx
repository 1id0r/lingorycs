'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLikedSongs } from '@/hooks/useLikedSongs'
import type { Song } from '@/types'

interface LikeButtonProps {
  song: Song
  onLoginRequired?: () => void
}

export function LikeButton({ song, onLoginRequired }: LikeButtonProps) {
  const { like, unlike, checkIsLiked, isAuthenticated } = useLikedSongs()
  const [isLiked, setIsLiked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showBurst, setShowBurst] = useState(false)

  // Check if song is liked on mount
  useEffect(() => {
    if (isAuthenticated && song?.id) {
      checkIsLiked(song.id).then(setIsLiked)
    }
  }, [isAuthenticated, song?.id, checkIsLiked])

  const handleClick = async () => {
    if (!isAuthenticated) {
      onLoginRequired?.()
      return
    }

    setLoading(true)

    if (isLiked) {
      const success = await unlike(song.id)
      if (success) setIsLiked(false)
    } else {
      const success = await like(song)
      if (success) {
        setIsLiked(true)
        setShowBurst(true)
        setTimeout(() => setShowBurst(false), 600)
      }
    }

    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className='relative p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50'
      aria-label={isLiked ? 'Unlike song' : 'Like song'}
    >
      <motion.div
        animate={loading ? { scale: [1, 0.8, 1] } : {}}
        transition={{ duration: 0.3, repeat: loading ? Infinity : 0 }}
      >
        <Heart
          size={20}
          className={`transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-white'}`}
        />
      </motion.div>

      {/* Burst animation on like */}
      <AnimatePresence>
        {showBurst && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 1 }}
                animate={{
                  scale: 1.5,
                  opacity: 0,
                  x: Math.cos((i * 60 * Math.PI) / 180) * 20,
                  y: Math.sin((i * 60 * Math.PI) / 180) * 20,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className='absolute inset-0 flex items-center justify-center pointer-events-none'
              >
                <Heart size={8} className='fill-red-500 text-red-500' />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </button>
  )
}
