import React from 'react'

export const PlayerSkeleton = () => {
  return (
    <div className='flex flex-col h-[calc(100vh-4rem)] bg-neutral-900 overflow-hidden animate-pulse'>
      {/* Song Info Bar Skeleton */}
      <div className='bg-black/80 border-b border-white/10 p-3 md:p-4 shrink-0 flex items-center justify-between z-20'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-full bg-white/10' />
          <div className='flex flex-col gap-2'>
            <div className='h-4 w-32 bg-white/10 rounded' />
            <div className='h-3 w-24 bg-white/5 rounded' />
          </div>
        </div>

        <div className='flex items-center gap-4'>
          {/* Language Selector Skeleton */}
          <div className='h-8 w-24 bg-white/5 rounded' />
          {/* Practice Button Skeleton */}
          <div className='h-8 w-28 bg-white/10 rounded-full' />
        </div>
      </div>

      {/* Video Player Skeleton */}
      <div className='w-auto md:w-full max-w-5xl mx-4 md:mx-auto mt-4 md:mt-8 rounded-3xl overflow-hidden border border-white/5 bg-white/5 aspect-video max-h-[45vh] shrink-0 relative flex items-center justify-center'>
        <div className='w-16 h-16 rounded-full bg-white/5' />
      </div>

      {/* Lyrics Display Skeleton */}
      <div className='flex-1 overflow-visible px-6 py-12 space-y-8 text-center'>
        {[1, 2, 3].map((i) => (
          <div key={i} className={`flex flex-col items-center gap-3 ${i === 2 ? 'opacity-100' : 'opacity-30'}`}>
            <div className='h-6 md:h-8 w-3/4 max-w-lg bg-white/10 rounded' />
            <div className='h-4 md:h-6 w-1/2 max-w-md bg-white/5 rounded' />
          </div>
        ))}
      </div>
    </div>
  )
}
