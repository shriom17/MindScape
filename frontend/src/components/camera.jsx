import { useRef, useEffect, useState, useCallback } from 'react'
import { apiUrl } from '../services/api'

function Camera({ onMoodDetected, active = true }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const [error, setError] = useState(null)
  const frameCount = useRef(0)

  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const captureFrame = useCallback(() => {
    if (!active) return
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas || video.readyState < 2) return

    frameCount.current += 1
    if (frameCount.current % 5 !== 0) return

    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    const frame = canvas.toDataURL('image/jpeg', 0.8).split(',')[1]

    fetch(apiUrl('/api/detect-mood'), {
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
  }, [active, onMoodDetected])

  useEffect(() => {
    let cancelled = false

    if (!active) {
      stopCamera()
      return
    }

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (cancelled || !active) {
          stream.getTracks().forEach(track => track.stop())
          return
        }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        intervalRef.current = setInterval(captureFrame, 500)
      })
      .catch(() => setError('Camera access denied!'))

    return () => {
      cancelled = true
      stopCamera()
    }
  }, [active, captureFrame, stopCamera])

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