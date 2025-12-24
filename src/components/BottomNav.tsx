'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Library, BookOpen, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/library', icon: Library, label: 'Library' },
  { href: '/vocabulary', icon: BookOpen, label: 'Words' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className='fixed bottom-0 left-0 right-0 z-[9999] md:hidden bg-black/90 backdrop-blur-xl border-t border-white/10 safe-area-inset-bottom'>
      <div className='flex items-center justify-around h-16 px-4'>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all',
                isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              )}
            >
              <Icon size={22} className={cn('transition-transform', isActive && 'scale-110')} />
              <span className={cn('text-[10px] font-medium', isActive && 'text-white')}>{item.label}</span>
              {isActive && <div className='absolute bottom-1 w-1 h-1 bg-white rounded-full' />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
