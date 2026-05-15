import { useState, useEffect } from 'react'
import Camera from '../components/camera'
import MoodDisplay from '../components/mooddisplay'
import FloatingChat from '../components/FloatingChat'
import { pageBgStyles } from '../styles/pageBackground'

function Home() {
  const [mood, setMood] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [scanComplete, setScanComplete] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [processingError, setProcessingError] = useState(null)

  const startScan = () => {
    setMood(null)
    setScanComplete(false)
    setCountdown(5)
    setCameraOn(true)
    setScanning(true)
    setProcessingError(null)
  }

  useEffect(() => {
    if (!scanning) return
    if (countdown === 0) {
      setScanning(false)
      setScanComplete(true)
      return
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, scanning])

  useEffect(() => {
    if (!scanComplete) return
    // Keep camera on briefly so the final ML response can arrive.
    const delayedCameraOff = setTimeout(() => setCameraOn(false), 3000)
    return () => clearTimeout(delayedCameraOff)
  }, [scanComplete])

  return (
    <div style={pageBgStyles.page}>
      <div style={{ ...pageBgStyles.orbBase, ...pageBgStyles.orbLeft }} />
      <div style={{ ...pageBgStyles.orbBase, ...pageBgStyles.orbRight }} />

      <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8" style={{ position: 'relative', zIndex: 1 }}>

      <h1 className="text-3xl font-bold text-amber-400">
        How are you feeling today, Arjuna?
      </h1>

      {/* Camera — shudhu cameraOn hole show korbe */}
      {cameraOn && (
        <Camera onMoodDetected={setMood} onError={setProcessingError} active={cameraOn} />
      )}

      {/* Start Button */}
      {!cameraOn && !scanComplete && (
        <button onClick={startScan} style={{
          background: 'linear-gradient(135deg, #040d27, #5a83c1)',
          color: '#f59e0b',
          border: 'none',
          padding: '1rem 2.5rem',
          borderRadius: '12px',
          fontSize: '1.1rem',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(199, 181, 67, 0.49)'
        }}>
          Start Scan
        </button>
      )}

      {/* Countdown */}
      {scanning && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-slate-300 text-lg">Scanning your expression...</p>
          <div style={{
            width: '200px', height: '8px',
            background: '#0f3460', borderRadius: '4px', overflow: 'hidden'
          }}>
            <div style={{
              width: `${((5 - countdown) / 5) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #7c3aed, #f59e0b)',
              borderRadius: '4px',
              transition: 'width 1s ease'
            }}/>
          </div>
          <p className="text-amber-400 text-2xl font-bold">{countdown}</p>
        </div>
      )}

      {/* Result */}
      {scanComplete && (
        <>
          {mood?.emotion ? (
            <>
              <MoodDisplay mood={mood} />
              <button onClick={startScan} style={{
                background: '#0f3460',
                color: '#94a3b8',
                border: 'none',
                padding: '0.5rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}>
                Scan Again
              </button>
            </>
          ) : (
            <div style={{
              background: '#16213e',
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
              minWidth: '280px',
              color: '#fecaca'
            }}>
              {processingError ? (
                <>
                  <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    ⚠️ Detection Failed
                  </p>
                  <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                    {processingError}
                  </p>
                </>
              ) : (
                <>
                  <p style={{ fontSize: '1rem' }}>Processing...</p>
                  <div style={{ marginTop: '1rem', fontSize: '2rem' }}>⏳</div>
                </>
              )}
              <button onClick={startScan} style={{
                marginTop: '1rem',
                background: '#0f3460',
                color: '#94a3b8',
                border: 'none',
                padding: '0.5rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}>
                Try Again
              </button>
            </div>
          )}
        </>
      )}

      <FloatingChat mood={mood} />
      </div>
    </div>
  )
}

export default Home