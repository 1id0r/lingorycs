'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getGenreSongs, GENRES, ExploreSong } from '@/services/exploreService'
import { Heart, Play, Music, Compass } from 'lucide-react'
import { LoaderInline } from '@/components/ui/loader'
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
      {/* Hero Header */}
      <div className='relative px-4 md:px-8 pt-8 pb-4'>
        <div className='flex items-center gap-4 mb-4'>
          <div className='w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/10'>
            <Compass size={24} className='text-blue-400' />
          </div>
          <div>
            <h1 className='text-3xl font-bold'>Explore</h1>
            <p className='text-gray-400 text-sm'>Discover Latin music</p>
          </div>
        </div>
      </div>

      {/* Genre Pills - Sticky */}
      <div className='sticky top-0 md:top-16 z-40 bg-gray-900/95 backdrop-blur-xl px-4 md:px-8 py-3 overflow-x-auto border-b border-white/5'>
        <div className='flex gap-2'>
          {GENRES.map((genre) => (
            <button
              key={genre.id}
              onClick={() => setSelectedGenre(genre.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                selectedGenre === genre.id
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {genre.label}
            </button>
          ))}
        </div>
      </div>

      {/* Songs Grid */}
      <div className='px-4 md:px-8 py-6 pb-28'>
        {loading ? (
          <div className='flex flex-col items-center justify-center py-20'>
            <LoaderInline size={32} />
            <p className='text-gray-500 text-sm mt-4'>Finding great music...</p>
          </div>
        ) : songs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex flex-col items-center justify-center py-16 text-center'
          >
            <div className='w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6'>
              <Music size={32} className='text-gray-600' />
            </div>
            <h2 className='text-lg font-semibold mb-2'>No songs found</h2>
            <p className='text-gray-500 text-sm'>Try another genre</p>
          </motion.div>
        ) : (
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
            {songs.map((song, index) => (
              <motion.div
                key={song.youtubeId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className='group'
              >
                {/* Thumbnail */}
                <div className='relative aspect-video rounded-2xl overflow-hidden bg-white/5 mb-3 shadow-lg'>
                  {song.thumbnail ? (
                    <img src={song.thumbnail} alt={song.title} className='w-full h-full object-cover' />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                      <Music size={32} className='text-gray-600' />
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3'>
                    <button
                      onClick={() => handlePlay(song)}
                      className='p-3 bg-white rounded-full hover:scale-110 transition-transform shadow-lg'
                    >
                      <Play size={16} className='fill-black text-black ml-0.5' />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLike(song)
                      }}
                      className='p-2.5 bg-white/20 backdrop-blur-sm rounded-full hover:scale-110 transition-transform'
                    >
                      <Heart
                        size={16}
                        className={likedStatus[song.youtubeId] ? 'fill-red-500 text-red-500' : 'text-white'}
                      />
                    </button>
                  </div>

                  {/* Synced Badge */}
                  {song.isSynced && (
                    <div className='absolute top-2 left-2 px-2 py-0.5 bg-teal-500/90 backdrop-blur-sm text-[10px] font-bold text-white rounded-md shadow-lg flex items-center gap-1'>
                      <div className='w-1 h-1 rounded-full bg-white animate-pulse' />
                      SYNCED
                    </div>
                  )}
                </div>

                {/* Info */}
                <h3 className='font-semibold text-sm truncate leading-tight'>{song.title}</h3>
                <p className='text-xs text-gray-500 truncate mt-0.5'>{song.artist}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}
