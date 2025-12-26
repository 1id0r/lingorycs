'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLikedSongs } from '@/hooks/useLikedSongs'
import { Heart, Music, Play, Trash2, Compass } from 'lucide-react'
import { LoaderInline } from '@/components/ui/loader'
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
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className='w-24 h-24 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-600/20 flex items-center justify-center mb-8'
        >
          <Heart size={40} className='text-pink-400' />
        </motion.div>
        <h1 className='text-2xl font-bold mb-3'>Your Library</h1>
        <p className='text-gray-400 text-center text-sm mb-8 max-w-xs'>
          Save your favorite songs and access them anytime
        </p>
        <button
          onClick={() => setShowAuthModal(true)}
          className='px-8 py-3 bg-blue-500 text-white rounded-full font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25'
        >
          Sign In to Start
        </button>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-black text-white'>
      {/* Hero Header */}
      <div className='relative px-4 md:px-8 pt-8 pb-6'>
        <div className='flex items-center gap-4 mb-2'>
          <div className='w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/10'>
            <Heart size={24} className='text-blue-400' />
          </div>
          <div>
            <h1 className='text-3xl font-bold'>Library</h1>
            <p className='text-gray-400 text-sm'>
              {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='px-4 md:px-8 pb-24'>
        {loading ? (
          <div className='flex flex-col items-center justify-center py-20'>
            <LoaderInline size={32} />
            <p className='text-gray-500 text-sm mt-4'>Loading your library...</p>
          </div>
        ) : likedSongs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex flex-col items-center justify-center py-16 text-center'
          >
            <div className='w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6'>
              <Music size={32} className='text-gray-600' />
            </div>
            <h2 className='text-lg font-semibold mb-2'>No songs yet</h2>
            <p className='text-gray-500 text-sm mb-6 max-w-xs'>
              Explore songs and tap the heart to save your favorites
            </p>
            <Link
              href='/explore'
              className='flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-colors'
            >
              <Compass size={18} />
              Explore Songs
            </Link>
          </motion.div>
        ) : (
          <div className='space-y-2'>
            <AnimatePresence>
              {likedSongs.map((song, index) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className='flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group cursor-pointer'
                  onClick={() => handlePlay(song)}
                >
                  {/* Index / Play button */}
                  <div className='w-10 h-10 flex items-center justify-center relative'>
                    <span className='text-gray-500 text-sm group-hover:hidden'>{index + 1}</span>
                    <Play size={18} className='fill-white hidden group-hover:block' />
                  </div>

                  {/* Song info */}
                  <div className='flex-1 min-w-0'>
                    <p className='font-semibold truncate'>{song.title}</p>
                    <p className='text-sm text-gray-400 truncate'>{song.artist}</p>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      unlike(song.song_id)
                    }}
                    className='p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 rounded-full'
                  >
                    <Trash2 size={18} />
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
