'use client'

import * as React from 'react'

interface LoaderProps {
  size?: number
  text?: string
}

export function Loader({ size = 120, text = 'Loading' }: LoaderProps) {
  const letters = text.split('')

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black'>
      <div className='relative flex items-center justify-center select-none' style={{ width: size, height: size }}>
        {/* Animated letters */}
        <div className='flex gap-0.5'>
          {letters.map((letter, index) => (
            <span
              key={index}
              className='inline-block text-white/60 text-lg font-medium animate-pulse'
              style={{
                animationDelay: `${index * 0.15}s`,
                animationDuration: '1.5s',
              }}
            >
              {letter}
            </span>
          ))}
        </div>

        {/* Rotating circle */}
        <div
          className='absolute inset-0 rounded-full animate-spin'
          style={{
            animationDuration: '3s',
            boxShadow: `
              0 6px 12px 0 rgba(56, 189, 248, 0.6) inset,
              0 12px 18px 0 rgba(0, 93, 255, 0.4) inset,
              0 36px 36px 0 rgba(30, 64, 175, 0.3) inset,
              0 0 4px 2px rgba(56, 189, 248, 0.2),
              0 0 8px 4px rgba(0, 93, 255, 0.1)
            `,
          }}
        />
      </div>
    </div>
  )
}

// Smaller inline loader (for buttons, sections)
export function LoaderInline({ size = 20 }: { size?: number }) {
  return (
    <div
      className='rounded-full animate-spin'
      style={{
        width: size,
        height: size,
        boxShadow: `
          0 2px 4px 0 rgba(56, 189, 248, 0.6) inset,
          0 4px 6px 0 rgba(0, 93, 255, 0.4) inset
        `,
      }}
    />
  )
}
