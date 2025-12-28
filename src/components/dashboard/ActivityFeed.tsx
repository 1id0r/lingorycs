'use client'

import { PracticeSession } from '@/services/userDataService'
import { Music, Calendar, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'

interface ActivityFeedProps {
  sessions: PracticeSession[]
}

export const ActivityFeed = ({ sessions }: ActivityFeedProps) => {
  if (sessions.length === 0) {
    return (
      <div className='text-center py-10 text-gray-500 bg-white/5 rounded-2xl border border-white/5'>
        <p>No recent activity. Start practicing!</p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-bold text-gray-300 mb-4'>Recent Activity</h3>
      <div className='space-y-3'>
        {sessions.map((session, index) => (
          <motion.div
            key={session.id || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className='flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group'
          >
            <div className='w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0'>
              <Music size={18} className='text-blue-400' />
            </div>

            <div className='flex-1 min-w-0'>
              <h4 className='font-semibold truncate text-white'>{session.song_title}</h4>
              <p className='text-xs text-gray-400 flex items-center gap-1'>
                <Calendar size={12} />
                {session.created_at ? new Date(session.created_at).toLocaleDateString() : 'Just now'}
              </p>
            </div>

            <div className='text-right'>
              <div className='flex items-center gap-1.5 justify-end text-yellow-400 font-bold'>
                <Trophy size={14} />
                <span>{session.score} XP</span>
              </div>
              <div className='text-xs text-gray-500'>
                {Math.round((session.score / session.max_score) * 100)}% Accuracy
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
