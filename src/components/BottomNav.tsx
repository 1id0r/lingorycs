'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Library, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/library', icon: Library, label: 'Library' },
  { href: '/vocabulary', icon: BookOpen, label: 'Words' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className='fixed bottom-0 left-0 right-0 z-[9999] md:hidden'>
      {/* Blur background */}
      <div className='absolute inset-0 bg-black/50 backdrop-blur-2xl border-t border-white/10' />

      {/* Content */}
      <div
        className='relative flex items-center justify-around h-20 px-2'
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.5rem)' }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className='relative flex flex-col items-center justify-center w-full py-3'
            >
              {/* Active indicator pill */}
              {isActive && (
                <motion.div
                  layoutId='activeTab'
                  className='absolute top-0 w-12 h-1 bg-white rounded-full'
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              {/* Icon container */}
              <motion.div
                className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-colors ${
                  isActive ? 'bg-white/10' : ''
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <Icon
                  size={isActive ? 28 : 26}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-all ${isActive ? 'text-white' : 'text-gray-400'}`}
                />
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
