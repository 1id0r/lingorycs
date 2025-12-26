import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div className='min-h-screen bg-black flex items-center justify-center p-4'>
      <div className='max-w-md w-full text-center'>
        <div className='text-6xl mb-4'>😕</div>
        <h1 className='text-2xl font-bold text-white mb-2'>Authentication Error</h1>
        <p className='text-gray-400 mb-6'>
          There was a problem signing you in. This can happen if the login link expired or was already used.
        </p>
        <Link
          href='/'
          className='inline-block px-6 py-3 bg-blue-500 rounded-full font-bold text-white hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/25'
        >
          Go Home & Try Again
        </Link>
      </div>
    </div>
  )
}
