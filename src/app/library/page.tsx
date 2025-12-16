'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLikedSongs } from '@/hooks/useLikedSongs'
import { ArrowLeft, Heart, Music, Play, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthModal } from '@/components/AuthModal'
import { useAuth } from '@/context/AuthContext'

export default function LibraryPage() {
  const { user } = useAuth()
  const { likedSongs, loading, unlike } = useLikedSongs()
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Not logged in
  if (!user) {
    return (
      <div className='min-h-screen bg-black text-white'>
        <header className='sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5'>
          <div className='container mx-auto px-6 h-16 flex items-center gap-4'>
            <Link href='/' className='p-2 hover:bg-white/10 rounded-full transition-colors'>
              <ArrowLeft size={20} />
            </Link>
            <h1 className='text-xl font-bold'>My Library</h1>
          </div>
        </header>

        <main className='container mx-auto px-6 py-20 flex flex-col items-center justify-center text-center'>
          <div className='p-6 bg-gradient-to-br from-purple-600/20 to-teal-500/20 rounded-full mb-6'>
            <Heart size={48} className='text-purple-400' />
          </div>
          <h2 className='text-2xl font-bold mb-2'>Save your favorite songs</h2>
          <p className='text-gray-400 mb-8 max-w-md'>
            Sign in to create your personal library of liked songs and access them anytime.
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className='px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-500 rounded-full font-bold hover:from-purple-500 hover:to-teal-400 transition-all'
          >
            Sign In
          </button>
        </main>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-black text-white'>
      <header className='sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5'>
        <div className='container mx-auto px-6 h-16 flex items-center gap-4'>
          <Link href='/' className='p-2 hover:bg-white/10 rounded-full transition-colors'>
            <ArrowLeft size={20} />
          </Link>
          <h1 className='text-xl font-bold'>My Library</h1>
          <span className='text-sm text-gray-500'>({likedSongs.length} songs)</span>
        </div>
      </header>

      <main className='container mx-auto px-6 py-8'>
        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <Loader2 className='animate-spin text-purple-400' size={40} />
          </div>
        ) : likedSongs.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-center'>
            <div className='p-6 bg-white/5 rounded-full mb-6'>
              <Music size={48} className='text-gray-500' />
            </div>
            <h2 className='text-xl font-bold mb-2'>No liked songs yet</h2>
            <p className='text-gray-400 mb-6'>Like songs while listening to add them to your library.</p>
            <Link
              href='/'
              className='px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-500 rounded-full font-bold hover:from-purple-500 hover:to-teal-400 transition-all'
            >
              Discover Songs
            </Link>
          </div>
        ) : (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <AnimatePresence>
              {likedSongs.map((song, index) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className='group relative bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all'
                >
                  <div className='flex items-center gap-4'>
                    <div className='shrink-0 w-16 h-16 bg-gradient-to-br from-purple-600/50 to-teal-500/50 rounded-lg flex items-center justify-center'>
                      <Music size={24} className='text-white' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-bold truncate'>{song.title}</h3>
                      <p className='text-sm text-gray-400 truncate'>{song.artist}</p>
                    </div>
                  </div>

                  {/* Hover actions */}
                  <div className='absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 bg-black/60 rounded-xl transition-opacity'>
                    <Link
                      href={`/?play=${encodeURIComponent(song.song_id)}`}
                      className='p-3 bg-gradient-to-r from-purple-600 to-teal-500 rounded-full hover:scale-110 transition-transform'
                    >
                      <Play size={20} className='fill-white' />
                    </Link>
                    <button
                      onClick={() => unlike(song.song_id)}
                      className='p-3 bg-white/10 hover:bg-red-500/20 rounded-full hover:scale-110 transition-all'
                    >
                      <Heart size={20} className='fill-red-500 text-red-500' />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  )
}
