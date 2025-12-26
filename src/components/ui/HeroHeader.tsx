'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, Library, Music, Loader2 } from 'lucide-react'
import { UserMenu } from '@/components/UserMenu'
import { Button } from './neon-button'
import clsx from 'clsx'

interface HeroHeaderProps {
  onSearch: (query: string) => void
  onAuthClick: () => void
  isLoading?: boolean
  showCompact?: boolean
}

interface NavLink {
  href: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  onSearch,
  onAuthClick,
  isLoading = false,
  showCompact = false,
}) => {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query)
    }
  }

  const navLinks: NavLink[] = [
    { href: '#explore', label: 'Explore', disabled: false },
    { href: '#library', label: 'Library', icon: <Library size={16} />, disabled: true },
  ]

  // Keyboard shortcut: Cmd/Ctrl + K to focus search
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

  if (showCompact) {
    // Compact header when song is playing
    return (
      <header className='sticky top-0 z-[60] bg-black/60 backdrop-blur-xl border-b border-white/5'>
        <div className='container mx-auto px-6 h-16 flex items-center justify-between gap-6'>
          {/* Logo */}
          <div className='flex items-center gap-3 shrink-0'>
            <div className='p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl shadow-lg'>
              <Music size={20} className='text-blue-400' />
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSubmit} className='flex-1 max-w-lg'>
            <div className='relative'>
              <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
              <input
                ref={inputRef}
                type='text'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search songs... (⌘K)'
                className='w-full bg-white/[0.07] hover:bg-white/10 border border-white/10 rounded-xl px-5 py-2.5 pl-11 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-500 text-sm'
              />
            </div>
          </form>

          {/* User Menu */}
          <UserMenu onLoginClick={onAuthClick} />
        </div>
      </header>
    )
  }

  // Full hero landing
  return (
    <div className='min-h-screen relative overflow-hidden'>
      {/* Background gradient */}
      <div className='absolute inset-0 bg-neutral-900' />
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-600/10 via-transparent to-transparent' />

      {/* Header */}
      <header className='relative z-10 p-6 md:p-8'>
        <div className='container mx-auto flex justify-between items-center'>
          {/* Logo */}
          <div className='flex items-center gap-3'>
            <div className='p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl shadow-lg'>
              <Music size={28} className='text-blue-400' />
            </div>
            <span className='text-2xl font-bold text-white'>Espalingo</span>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className='hidden md:flex items-center space-x-8'>
            {navLinks.map(({ href, label, icon, disabled }) => (
              <a
                key={href}
                href={disabled ? undefined : href}
                className={clsx(
                  'flex items-center gap-2 text-sm font-medium transition-colors',
                  disabled ? 'text-gray-500 cursor-not-allowed' : 'text-gray-300 hover:text-white'
                )}
              >
                {icon}
                {label}
                {disabled && <span className='text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full'>Soon</span>}
              </a>
            ))}
          </nav>

          {/* User Menu */}
          <UserMenu onLoginClick={onAuthClick} />
        </div>
      </header>

      {/* Hero Content */}
      <main className='relative z-10 container mx-auto px-6 md:px-8 flex flex-col items-center justify-center min-h-[70vh]'>
        {/* Badge */}
        <div className='flex items-center gap-2 mb-6 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10'>
          <div className='flex -space-x-2'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='h-6 w-6 rounded-full bg-blue-500/20 ring-2 ring-black flex items-center justify-center text-[10px] font-bold text-blue-400'
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <span className='text-sm text-gray-400'>Join learners mastering Spanish</span>
        </div>

        {/* Title */}
        <h1 className='text-5xl md:text-7xl font-bold text-center leading-tight mb-4'>
          <span className='text-white'>Learn Spanish</span>
          <br />
          <span className='text-blue-400'>Through Music</span>
        </h1>

        {/* Subtitle */}
        <p className='text-lg md:text-xl text-gray-400 text-center max-w-xl mb-10'>
          Sing along with synced lyrics, learn vocabulary, and practice with interactive exercises
        </p>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className='w-full max-w-xl'>
          <div className='relative group w-full'>
            <div className='relative flex'>
              <div className='relative flex-1'>
                <Search
                  className='absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors'
                  size={20}
                />
                <input
                  ref={inputRef}
                  type='text'
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder='Search for a song or artist...'
                  className='w-full bg-black/80 backdrop-blur-sm border border-white/10 rounded-l-2xl px-6 py-4 pl-14 focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-500 text-lg'
                />
              </div>
              <Button
                type='submit'
                variant='solid'
                disabled={isLoading}
                className='px-8 py-4 rounded-r-2xl h-auto rounded-l-none'
              >
                {isLoading ? <Loader2 className='animate-spin' size={20} /> : 'Search'}
              </Button>
            </div>
          </div>
          <p className='text-center text-gray-500 text-sm mt-3'>
            Press <kbd className='px-1.5 py-0.5 bg-white/10 rounded text-xs'>⌘K</kbd> to search anytime
          </p>
        </form>
      </main>
    </div>
  )
}
