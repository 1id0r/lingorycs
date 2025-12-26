'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Search, CircleDot, Clock, History, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { LrcLibTrack } from '@/services/lyrics'

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  onSelectTrack?: (track: LrcLibTrack) => void
  suggestions?: LrcLibTrack[]
  historyItems?: LrcLibTrack[]
  isLoading?: boolean
  compact?: boolean
  onFocusChange?: (focused: boolean) => void
}

const SearchBar = ({
  placeholder = 'Search for a song...',
  onSearch,
  onSelectTrack,
  suggestions = [],
  historyItems = [],
  isLoading = false,
  compact = false,
  onFocusChange,
}: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)

  // Generate stable random values for particles on mount
  const particleData = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: i * 12.5 + 5,
      top: (i % 4) * 25 + 10,
      xOffset: ((i % 3) - 1) * 15,
      yOffset: ((i % 2) - 0.5) * 20,
      scale: 0.3 + (i % 3) * 0.2,
      duration: 2 + (i % 3),
    }))
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearch?.(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 600)
    }
  }

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const showDropdown =
    isFocused && (suggestions.length > 0 || (searchQuery.trim().length <= 1 && historyItems.length > 0))

  return (
    <div className='relative w-full max-w-xl'>
      <motion.form
        onSubmit={handleSubmit}
        className='relative flex items-center justify-center w-full mx-auto'
        initial={false}
        animate={{ scale: isFocused ? 1.02 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <motion.div
          className={cn(
            'flex items-center w-full rounded-2xl border relative overflow-hidden backdrop-blur-md',
            isFocused ? 'border-blue-500/50 shadow-xl shadow-blue-500/10' : 'border-white/10 bg-black/60'
          )}
        >
          {/* Gradient background when focused */}
          {isFocused && (
            <motion.div
              className='absolute inset-0 -z-10 bg-blue-500/5'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}

          {/* Floating particles when focused */}
          <div className='absolute inset-0 overflow-hidden rounded-2xl -z-5 pointer-events-none'>
            <AnimatePresence>
              {isFocused &&
                particleData.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      x: [0, p.xOffset, 0],
                      y: [0, p.yOffset, 0],
                      scale: [0, p.scale, 0],
                      opacity: [0, 0.6, 0],
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      duration: p.duration,
                      ease: 'easeInOut',
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}
                    className='absolute w-2 h-2 rounded-full bg-blue-400'
                    style={{
                      left: `${p.left}%`,
                      top: `${p.top}%`,
                      filter: 'blur(1px)',
                    }}
                  />
                ))}
            </AnimatePresence>
          </div>

          <motion.div
            className={cn('pl-4', compact ? 'py-2' : 'py-3')}
            animate={{
              rotate: isAnimating ? [0, -10, 10, -5, 5, 0] : 0,
              scale: isAnimating ? [1, 1.2, 1] : 1,
            }}
            transition={{ duration: 0.4 }}
          >
            <Search
              size={18}
              strokeWidth={isFocused ? 2.5 : 2}
              className={cn(
                'transition-all duration-300',
                isAnimating ? 'text-blue-500' : isFocused ? 'text-blue-400' : 'text-gray-400'
              )}
            />
          </motion.div>

          <input
            ref={inputRef}
            type='text'
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => {
              setIsFocused(true)
              onFocusChange?.(true)
            }}
            onBlur={() =>
              setTimeout(() => {
                setIsFocused(false)
                onFocusChange?.(false)
              }, 200)
            }
            className={cn(
              'w-full bg-transparent outline-none placeholder:text-gray-500 font-medium relative z-10',
              compact ? 'py-2 text-sm' : 'py-3 text-sm md:text-base',
              isFocused ? 'text-white tracking-wide' : 'text-gray-300'
            )}
          />

          <AnimatePresence>
            {searchQuery && (
              <motion.button
                type='submit'
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
                className='px-4 md:px-5 py-2 mr-2 text-xs md:text-sm font-medium rounded-xl bg-blue-500 text-white transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50'
              >
                {isLoading ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Search'}
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.form>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className='absolute z-[200] w-full mt-2 overflow-hidden bg-neutral-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10'
            style={{ maxHeight: '300px', overflowY: 'auto' }}
          >
            <div className='p-2'>
              {/* History View */}
              {searchQuery.trim().length <= 1 && historyItems.length > 0 && (
                <>
                  <div className='flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-500 uppercase'>
                    <History size={12} />
                    Recent
                  </div>
                  {historyItems.slice(0, 5).map((track, index) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        onSelectTrack?.(track)
                        setIsFocused(false)
                        setSearchQuery(track.name)
                      }}
                      className='flex items-center gap-3 px-3 py-2 cursor-pointer rounded-lg hover:bg-white/5 group'
                    >
                      <Clock size={14} className='text-gray-500 group-hover:text-purple-400' />
                      <div>
                        <p className='font-medium text-sm text-white group-hover:text-purple-300'>{track.name}</p>
                        <p className='text-xs text-gray-500'>{track.artistName}</p>
                      </div>
                    </motion.div>
                  ))}
                </>
              )}

              {/* Suggestions View */}
              {searchQuery.trim().length > 1 &&
                suggestions.length > 0 &&
                suggestions.slice(0, 8).map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      onSelectTrack?.(track)
                      setIsFocused(false)
                      setSearchQuery(track.name)
                    }}
                    className='flex items-center justify-between px-3 py-2 cursor-pointer rounded-lg hover:bg-white/5 group'
                  >
                    <div className='flex items-center gap-3'>
                      <CircleDot size={14} className='text-gray-500 group-hover:text-purple-400' />
                      <div>
                        <p className='font-medium text-sm text-white group-hover:text-purple-300'>{track.name}</p>
                        <p className='text-xs text-gray-500'>{track.artistName}</p>
                      </div>
                    </div>
                    {track.syncedLyrics && (
                      <span className='text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full'>Synced</span>
                    )}
                  </motion.div>
                ))}

              {searchQuery.trim().length > 1 && suggestions.length === 0 && (
                <div className='p-6 text-center text-gray-500 text-sm'>No results found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isFocused && !compact && (
        <p className='text-center text-gray-500 text-xs mt-3'>
          Press <kbd className='px-1.5 py-0.5 bg-white/10 rounded text-[10px]'>⌘K</kbd> to search
        </p>
      )}
    </div>
  )
}

export { SearchBar }
