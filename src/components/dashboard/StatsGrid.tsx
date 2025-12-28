'use client'

import { Music, BookOpen, GraduationCap, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'

interface StatsGridProps {
  stats: {
    likedSongs: number
    wordsLearned: number
    sessionsCompleted: number
    totalXp: number
  }
}

export const StatsGrid = ({ stats }: StatsGridProps) => {
  const cards = [
    {
      label: 'Songs Liked',
      value: stats.likedSongs,
      icon: Music,
      color: 'text-pink-500',
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/20',
    },
    {
      label: 'Words Learned',
      value: stats.wordsLearned,
      icon: BookOpen,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label: 'Lessons Completed',
      value: stats.sessionsCompleted,
      icon: GraduationCap,
      color: 'text-teal-500',
      bg: 'bg-teal-500/10',
      border: 'border-teal-500/20',
    },
    {
      label: 'Total XP',
      value: stats.totalXp,
      icon: Trophy,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
    },
  ]

  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`p-4 rounded-2xl border ${card.border} ${card.bg} backdrop-blur-sm relative overflow-hidden group`}
        >
          <div className='flex items-center justify-between mb-2'>
            <card.icon className={`${card.color} opacity-80`} size={20} />
            <div
              className={`absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110`}
            >
              <card.icon size={80} className={card.color} />
            </div>
          </div>
          <div className='relative z-10'>
            <div className='text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400'>
              {card.value.toLocaleString()}
            </div>
            <div className='text-xs text-gray-400 font-medium uppercase tracking-wider'>{card.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
