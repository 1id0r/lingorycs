'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { 
  getLikedSongs, 
  likeSong, 
  unlikeSong, 
  isSongLiked,
  type LikedSong 
} from '@/services/userDataService'
import type { Song } from '@/types'

export function useLikedSongs() {
  const { user } = useAuth()
  const [likedSongs, setLikedSongs] = useState<LikedSong[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch all liked songs
  const fetchLikedSongs = useCallback(async () => {
    await Promise.resolve() // Ensure async execution to avoid sync setState in effect

    if (!user) {
      setLikedSongs([])
      setLoading(false)
      return
    }

    setLoading(true)
    const songs = await getLikedSongs(user.id)
    setLikedSongs(songs)
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchLikedSongs()
  }, [fetchLikedSongs])

  // Check if a specific song is liked
  const checkIsLiked = useCallback(async (songId: string): Promise<boolean> => {
    if (!user) return false
    return isSongLiked(user.id, songId)
  }, [user])

  // Like a song
  const like = useCallback(async (song: Song): Promise<boolean> => {
    if (!user) return false
    const success = await likeSong(user.id, song)
    if (success) {
      await fetchLikedSongs()
    }
    return success
  }, [user, fetchLikedSongs])

  // Unlike a song
  const unlike = useCallback(async (songId: string): Promise<boolean> => {
    if (!user) return false
    const success = await unlikeSong(user.id, songId)
    if (success) {
      setLikedSongs(prev => prev.filter(s => s.song_id !== songId))
    }
    return success
  }, [user])

  return {
    likedSongs,
    loading,
    like,
    unlike,
    checkIsLiked,
    refetch: fetchLikedSongs,
    isAuthenticated: !!user,
  }
}
