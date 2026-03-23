import { useRef, useEffect, useState, useCallback } from 'react'

function Camera({ onMoodDetected, active = true }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [error, setError] = useState(null)
  const frameCount = useRef(0)
  const captureFrame = useCallback(() => {
    if (!active) return    // ← ei line add koro ekhane
    const video = videoRef.current
    

    frameCount.current += 1
    if (frameCount.current % 5 !== 0) return

    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    const frame = canvas.toDataURL('image/jpeg', 0.8).split(',')[1]

    fetch('http://127.0.0.1:5000/api/detect-mood', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frame })
    })
      .then(res => res.json())
      .then(data => {
        if (data.emotion && onMoodDetected) {
          onMoodDetected(data)
        }
      })
      .catch(() => {})
  }, [onMoodDetected])

  useEffect(() => {
    let interval
    let stream

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(s => {
        stream = s
        videoRef.current.srcObject = s
        interval = setInterval(captureFrame, 500)
      })
      .catch(() => setError("Camera access denied!"))

    return () => {
      clearInterval(interval)
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [captureFrame])

  return (
    <div style={{
      borderRadius: '16px',
      padding: '6px',
      background: 'linear-gradient(135deg, #040d27, #5a83c1)',
      boxShadow: '0 4px 15px rgba(199, 181, 67, 0.49)'
    }}>
      {error ? (
        <p className="text-red-400 p-4">{error}</p>
      ) : (
        <>
          <video ref={videoRef} autoPlay muted
            style={{ width: '400px', height: '300px', borderRadius: '12px', objectFit: 'cover' }} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </>
      )}
    </div>
  )
}

export default Camera