'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getGenreSongs, GENRES, ExploreSong } from '@/services/exploreService'
import { Heart, Play, Loader2, Music } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLikedSongs } from '@/hooks/useLikedSongs'
import { AuthModal } from '@/components/AuthModal'
import { useAuth } from '@/context/AuthContext'
import { setPlaySong } from '@/utils/playSong'

export default function ExplorePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { like, unlike, checkIsLiked } = useLikedSongs()
  const [selectedGenre, setSelectedGenre] = useState(GENRES[0].id)
  const [songs, setSongs] = useState<ExploreSong[]>([])
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [likedStatus, setLikedStatus] = useState<Record<string, boolean>>({})

  // Fetch songs when genre changes
  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true)
      const result = await getGenreSongs(selectedGenre)
      setSongs(result)
      setLoading(false)
    }
    fetchSongs()
  }, [selectedGenre])

  // Check liked status for songs
  useEffect(() => {
    if (!user || songs.length === 0) return

    const checkLikes = async () => {
      const statuses: Record<string, boolean> = {}
      for (const song of songs) {
        statuses[song.youtubeId] = await checkIsLiked(song.youtubeId)
      }
      setLikedStatus(statuses)
    }
    checkLikes()
  }, [songs, user, checkIsLiked])

  const handlePlay = (song: ExploreSong) => {
    setPlaySong({
      songId: song.youtubeId,
      title: song.title,
      artist: song.artist,
      youtubeId: song.youtubeId,
    })
    router.push('/')
  }

  const handleLike = async (song: ExploreSong) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    const isLiked = likedStatus[song.youtubeId]
    if (isLiked) {
      await unlike(song.youtubeId)
      setLikedStatus((prev) => ({ ...prev, [song.youtubeId]: false }))
    } else {
      // Create a Song-like object for the like function
      const songObj = {
        id: song.youtubeId,
        title: song.title,
        artist: song.artist,
        youtubeId: song.youtubeId,
        lyrics: [],
      }
      await like(songObj)
      setLikedStatus((prev) => ({ ...prev, [song.youtubeId]: true }))
    }
  }

  return (
    <div className='min-h-screen bg-black text-white'>
      {/* Header */}
      <div className='px-4 md:px-8 pt-6 pb-2'>
        <h1 className='text-2xl font-bold mb-1'>Explore</h1>
        <p className='text-gray-500 text-sm'>Discover Latin music</p>
      </div>

      {/* Genre Pills - Sticky */}
      <div className='sticky top-0 md:top-16 z-40 bg-black/90 backdrop-blur-xl px-4 md:px-8 py-4 overflow-x-auto border-b border-white/5'>
        <div className='flex gap-2'>
          {GENRES.map((genre) => (
            <button
              key={genre.id}
              onClick={() => setSelectedGenre(genre.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedGenre === genre.id ? 'bg-white text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {genre.label}
            </button>
          ))}
        </div>
      </div>

      {/* Songs Grid */}
      <div className='px-4 md:px-8 pb-24'>
        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <Loader2 className='animate-spin text-gray-500' size={24} />
          </div>
        ) : songs.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 text-center'>
            <div className='w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4'>
              <Music size={24} className='text-gray-600' />
            </div>
            <p className='text-gray-500 text-sm'>No songs found</p>
          </div>
        ) : (
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
            {songs.map((song, index) => (
              <motion.div
                key={song.youtubeId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className='group relative'
              >
                {/* Thumbnail */}
                <div className='relative aspect-video rounded-lg overflow-hidden bg-white/5 mb-2'>
                  {song.thumbnail ? (
                    <img src={song.thumbnail} alt={song.title} className='w-full h-full object-cover' />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                      <Music size={32} className='text-gray-600' />
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2'>
                    <button
                      onClick={() => handlePlay(song)}
                      className='p-2.5 bg-white rounded-full hover:scale-110 transition-transform'
                    >
                      <Play size={18} className='fill-black text-black ml-0.5' />
                    </button>
                    <button
                      onClick={() => handleLike(song)}
                      className='p-2.5 bg-white/20 rounded-full hover:scale-110 transition-transform'
                    >
                      <Heart
                        size={18}
                        className={likedStatus[song.youtubeId] ? 'fill-red-500 text-red-500' : 'text-white'}
                      />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <p className='font-medium text-sm truncate'>{song.title}</p>
                <p className='text-xs text-gray-500 truncate'>{song.artist}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}
