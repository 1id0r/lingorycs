'use client'

import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { User, LogOut, Star, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

interface UserMenuProps {
  onLoginClick: () => void
}

export const UserMenu: React.FC<UserMenuProps> = ({ onLoginClick }) => {
  const { user, loading, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (loading) {
    return <div className='w-8 h-8 rounded-full bg-white/10 animate-pulse' />
  }

  if (!user) {
    return (
      <button
        onClick={onLoginClick}
        className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-teal-500 rounded-full font-bold text-sm hover:from-purple-500 hover:to-teal-400 transition-all'
      >
        <User size={16} />
        Sign In
      </button>
    )
  }

  const avatarUrl = user.user_metadata?.avatar_url
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

  return (
    <div className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 p-1 pr-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors'
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className='w-8 h-8 rounded-full' />
        ) : (
          <div className='w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center'>
            <span className='text-sm font-bold'>{displayName[0].toUpperCase()}</span>
          </div>
        )}
        <span className='text-sm font-medium hidden sm:block'>{displayName}</span>
        <ChevronDown size={14} className={clsx('transition-transform', isOpen && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div className='fixed inset-0 z-40' onClick={() => setIsOpen(false)} />
          <div className='absolute right-0 top-full mt-2 w-48 bg-neutral-900 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden'>
            <div className='p-3 border-b border-white/10'>
              <p className='font-medium text-sm'>{displayName}</p>
              <p className='text-xs text-gray-400 truncate'>{user.email}</p>
            </div>

            <div className='p-2'>
              <div className='flex items-center gap-2 px-3 py-2 text-sm text-gray-400'>
                <Star size={14} className='text-yellow-400 fill-yellow-400' />
                <span>0 XP</span>
              </div>

              <button
                onClick={() => {
                  signOut()
                  setIsOpen(false)
                }}
                className='w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-white/5 rounded-lg transition-colors'
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
