'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { getUserStats, getPracticeHistory, PracticeSession } from '@/services/userDataService'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { LoaderInline } from '@/components/ui/loader'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    likedSongs: 0,
    wordsLearned: 0,
    sessionsCompleted: 0,
    totalXp: 0,
  })
  const [history, setHistory] = useState<PracticeSession[]>([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
      return
    }

    if (user) {
      const fetchData = async () => {
        try {
          const [statsData, historyData] = await Promise.all([getUserStats(user.id), getPracticeHistory(user.id)])
          setStats(statsData)
          setHistory(historyData)
        } catch (error) {
          console.error('Failed to load dashboard data:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchData()
    }
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <LoaderInline size={40} />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className='min-h-screen bg-black text-white p-6 md:p-8 pb-32'>
      <div className='max-w-5xl mx-auto space-y-8'>
        {/* Header */}
        <div className='flex items-center gap-4'>
          <Link href='/' className='p-2 bg-white/5 rounded-full hover:bg-white/10 transition'>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className='text-3xl font-bold'>Dashboard</h1>
            <p className='text-gray-400'>Welcome back!</p>
          </div>
        </div>

        {/* Stats */}
        <section>
          <StatsGrid stats={stats} />
        </section>

        {/* Activity */}
        <section>
          <ActivityFeed sessions={history} />
        </section>
      </div>
    </div>
  )
}
