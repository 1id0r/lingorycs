'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLikedSongs } from '@/hooks/useLikedSongs'
import { Heart, Music, Play, Loader2, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthModal } from '@/components/AuthModal'
import { useAuth } from '@/context/AuthContext'
import { setPlaySong } from '@/utils/playSong'
import type { LikedSong } from '@/services/userDataService'

export default function LibraryPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { likedSongs, loading, unlike } = useLikedSongs()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handlePlay = (song: LikedSong) => {
    setPlaySong(song)
    router.push('/')
  }

  // Not logged in
  if (!user) {
    return (
      <div className='min-h-screen bg-black text-white flex flex-col items-center justify-center px-6'>
        <div className='w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6'>
          <Heart size={32} className='text-gray-500' />
        </div>
        <h1 className='text-xl font-bold mb-2'>Your Library</h1>
        <p className='text-gray-500 text-center text-sm mb-6 max-w-xs'>Sign in to save your favorite songs</p>
        <button
          onClick={() => setShowAuthModal(true)}
          className='px-5 py-2.5 bg-white text-black rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors'
        >
          Sign In
        </button>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-black text-white'>
      {/* Header */}
      <div className='px-4 md:px-8 pt-6 pb-4'>
        <Link
          href='/'
          className='hidden md:inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-3 transition-colors'
        >
          ← Back to Home
        </Link>
        <h1 className='text-2xl font-bold'>Library</h1>
        <p className='text-gray-500 text-sm'>{likedSongs.length} liked songs</p>
      </div>

      {/* Content */}
      <div className='px-4 pb-24'>
        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <Loader2 className='animate-spin text-gray-500' size={24} />
          </div>
        ) : likedSongs.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 text-center'>
            <div className='w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4'>
              <Music size={24} className='text-gray-600' />
            </div>
            <p className='text-gray-500 text-sm mb-4'>No liked songs yet</p>
            <Link href='/' className='text-sm text-white font-medium underline underline-offset-4 hover:text-gray-300'>
              Discover songs
            </Link>
          </div>
        ) : (
          <div className='space-y-1'>
            <AnimatePresence>
              {likedSongs.map((song, index) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.03 }}
                  className='flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group'
                >
                  {/* Play button / Music icon */}
                  <button
                    onClick={() => handlePlay(song)}
                    className='w-10 h-10 shrink-0 rounded-md bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors'
                  >
                    <Play size={16} className='fill-current ml-0.5' />
                  </button>

                  {/* Song info */}
                  <div className='flex-1 min-w-0' onClick={() => handlePlay(song)}>
                    <p className='font-medium text-sm truncate'>{song.title}</p>
                    <p className='text-xs text-gray-500 truncate'>{song.artist}</p>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => unlike(song.song_id)}
                    className='p-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all'
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
