'use client'

import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { User, LogOut, ChevronDown, Settings, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface UserMenuProps {
  onLoginClick: () => void
}

export const UserMenu: React.FC<UserMenuProps> = ({ onLoginClick }) => {
  const { user, loading, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (loading) {
    return <div className='w-10 h-10 rounded-full bg-white/10 animate-pulse' />
  }

  if (!user) {
    return (
      <motion.button
        onClick={onLoginClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className='flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors shadow-lg'
      >
        <User size={16} />
        Sign In
      </motion.button>
    )
  }

  const avatarUrl = user.user_metadata?.avatar_url
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

  return (
    <div className='relative z-[100]'>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.95 }}
        className='flex items-center gap-2.5 p-1.5 pr-4 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10'
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className='w-9 h-9 rounded-full ring-2 ring-white/10' />
        ) : (
          <div className='w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center'>
            <span className='text-sm font-bold text-blue-400'>{displayName[0].toUpperCase()}</span>
          </div>
        )}
        <span className='text-sm font-medium hidden sm:block max-w-[100px] truncate'>{displayName}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className='text-gray-400' />
        </motion.div>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className='fixed inset-0 z-[90]' onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className='absolute right-0 top-full mt-3 w-56 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden'
            >
              {/* User info */}
              <div className='p-4 bg-white/5 border-b border-white/10'>
                <div className='flex items-center gap-3'>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className='w-11 h-11 rounded-full' />
                  ) : (
                    <div className='w-11 h-11 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center'>
                      <span className='text-lg font-bold text-blue-400'>{displayName[0].toUpperCase()}</span>
                    </div>
                  )}
                  <div className='flex-1 min-w-0'>
                    <p className='font-semibold truncate'>{displayName}</p>
                    <p className='text-xs text-gray-400 truncate'>{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className='p-2 border-b border-white/5'>
                <div className='flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5'>
                  <Sparkles size={18} className='text-yellow-400' />
                  <div>
                    <p className='text-sm font-medium'>0 XP</p>
                    <p className='text-[10px] text-gray-500'>Keep learning!</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className='p-2'>
                <button
                  onClick={() => setIsOpen(false)}
                  className='w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 rounded-xl transition-colors'
                >
                  <Settings size={16} />
                  Settings
                </button>
                <button
                  onClick={async () => {
                    console.log('[SignOut] Button clicked')
                    setIsOpen(false)
                    try {
                      console.log('[SignOut] Calling signOut...')
                      await signOut()
                      console.log('[SignOut] signOut completed, redirecting...')
                      window.location.href = '/'
                    } catch (err) {
                      console.error('[SignOut] Error:', err)
                      window.location.href = '/' // Force redirect anyway
                    }
                  }}
                  className='w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors'
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
