import { useRef, useEffect, useState, useCallback } from 'react'
import { fetchJson } from '../services/api'

function Camera({ onMoodDetected, onError, active = true }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const faceDetectorRef = useRef(null)
  const processingRef = useRef(false)
  const [error, setError] = useState(null)
  const [serverError, setServerError] = useState(null)
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
    // Use MediaPipe FaceDetection (if loaded) to crop face before sending.
    const fd = faceDetectorRef.current
    if (fd && typeof fd.send === 'function' && !processingRef.current) {
      try {
        processingRef.current = true
        fd.send({ image: video })
      } catch (e) {
        processingRef.current = false
      }
      return
    }

    // Fallback: send full frame if no face detector available
    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    const frame = canvas.toDataURL('image/jpeg', 0.8).split(',')[1]

    fetchJson('/api/detect-mood', {
      method: 'POST',
      body: JSON.stringify({ frame })
    })
      .then(data => {
        console.log('Mood fallback response:', data)
        if (data?.emotion && onMoodDetected) onMoodDetected(data)
        else if (data?.error) {
          setServerError(data.error)
          if (onError) onError(data.error)
          console.error('Mood error response:', data)
        }
      })
      .catch(err => {
        console.error('Mood request failed:', err)
        const errMsg = err?.message || 'Mood request failed'
        setServerError(errMsg)
        if (onError) onError(errMsg)
      })
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

        // Initialize MediaPipe FaceDetection if available
        try {
          if (window?.FaceDetection) {
            const fd = new window.FaceDetection({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}` })
            fd.setOptions({ model: 'short', minDetectionConfidence: 0.6 })
            fd.onResults(async (results) => {
              try {
                const detections = results?.detections || []
                if (!detections.length) {
                  processingRef.current = false
                  return
                }
                const detection = detections[0]
                const rel = detection?.locationData?.relativeBoundingBox || detection?.boundingBox || detection?.locationData || null
                if (!rel) {
                  processingRef.current = false
                  return
                }

                const videoEl = videoRef.current
                const canvasEl = canvasRef.current
                if (!videoEl || !canvasEl) {
                  processingRef.current = false
                  return
                }

                const vw = videoEl.videoWidth
                const vh = videoEl.videoHeight
                // support different bounding box shapes
                const xmin = rel.xmin ?? (rel.xCenter && rel.width ? (rel.xCenter - rel.width / 2) : 0)
                const ymin = rel.ymin ?? (rel.yCenter && rel.height ? (rel.yCenter - rel.height / 2) : 0)
                const w = rel.width ?? (rel.xmax ? (rel.xmax - xmin) : 0)
                const h = rel.height ?? (rel.ymax ? (rel.ymax - ymin) : 0)

                let sx = Math.max(0, Math.floor(xmin * vw))
                let sy = Math.max(0, Math.floor(ymin * vh))
                let sw = Math.max(20, Math.floor(w * vw))
                let sh = Math.max(20, Math.floor(h * vh))

                // expand box a bit
                const pad = 0.25
                const ex = Math.floor(sw * pad)
                const ey = Math.floor(sh * pad)
                sx = Math.max(0, sx - ex)
                sy = Math.max(0, sy - ey)
                sw = Math.min(vw - sx, sw + ex * 2)
                sh = Math.min(vh - sy, sh + ey * 2)

                // draw crop to temp canvas and resize
                const tmp = document.createElement('canvas')
                const OUT = 224
                tmp.width = OUT
                tmp.height = OUT
                const tctx = tmp.getContext('2d')
                tctx.drawImage(videoEl, sx, sy, sw, sh, 0, 0, OUT, OUT)
                const b64 = tmp.toDataURL('image/jpeg', 0.85).split(',')[1]

                // send to mood detection endpoint
                try {
                  const res = await fetchJson('/api/detect-mood', { method: 'POST', body: JSON.stringify({ frame: b64 }) })
                  console.log('Mood response (face crop):', res)
                  if (res?.emotion && onMoodDetected) onMoodDetected(res)
                  else if (res?.error) {
                    setServerError(res.error)
                    if (onError) onError(res.error)
                    console.error('Mood error response:', res)
                  }
                } catch (e) {
                  console.error('Mood request error (face crop):', e)
                  const errMsg = e?.message || 'Mood request failed'
                  setServerError(errMsg)
                  if (onError) onError(errMsg)
                }
              } finally {
                processingRef.current = false
              }
            })
            faceDetectorRef.current = fd
          }
        } catch (e) {
          // ignore init errors
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
          {serverError && (
            <div style={{ marginTop: 8, color: '#fecaca', fontSize: 13 }}>{serverError}</div>
          )}
        </>
      )}
    </div>
  )
}

export default Camera