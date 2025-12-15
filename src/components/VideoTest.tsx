import ReactPlayer from 'react-player'

export const VideoTest = () => {
  return (
    <div style={{ width: '100%', height: '400px', background: '#000' }}>
      <h1 style={{ color: 'white', padding: '20px' }}>Video Test</h1>

      {/* Test 1: Simplest possible ReactPlayer */}
      <div style={{ width: '640px', height: '360px', margin: '20px' }}>
        <ReactPlayer
          url='https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          controls={true}
          width='100%'
          height='100%'
          onReady={() => console.log('✅ Video Ready')}
          onError={(e) => console.error('❌ Video Error:', e)}
        />
      </div>
    </div>
  )
}
