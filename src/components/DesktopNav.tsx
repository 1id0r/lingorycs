'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, Library, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserMenu } from './UserMenu'
import { useState } from 'react'
import { AuthModal } from './AuthModal'

const navItems = [
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/library', icon: Library, label: 'Library' },
  { href: '/vocabulary', icon: BookOpen, label: 'Words' },
]

export function DesktopNav() {
  const pathname = usePathname()
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Don't show on home page (it has its own header)
  if (pathname === '/') return null

  return (
    <>
      <header className='hidden md:flex sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5'>
        <div className='container mx-auto px-8 h-16 flex items-center justify-between'>
          {/* Logo */}
          <Link href='/' className='flex items-center gap-3'>
            <img src='/logo.svg' alt='Espalingo' className='h-10 w-10 rounded-xl' />
            <span className='text-xl font-bold'>Espalingo</span>
          </Link>

          {/* Nav Links */}
          <nav className='flex items-center space-x-6'>
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 text-sm font-medium transition-colors',
                    isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User Menu */}
          <UserMenu onLoginClick={() => setShowAuthModal(true)} />
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}
