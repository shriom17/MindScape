import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Tracker from './pages/Tracker'
import Stories from './pages/Stories'
import Music from './pages/Music'
import Profile from './pages/Profile'
import Helpline from './pages/helpline'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Register from './pages/register'
import { supabase } from './services/supabaseClient'

const IDLE_TIMEOUT_MS = 15 * 60 * 1000

function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const idleTimerRef = useRef(null)
  const idleInProgressRef = useRef(false)
  const isRegisterPage = location.pathname === '/register' || location.pathname === '/'

  useEffect(() => {
    let mounted = true

    const clearIdleTimer = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
        idleTimerRef.current = null
      }
    }

    const handleIdle = async () => {
      if (!mounted || idleInProgressRef.current) return
      idleInProgressRef.current = true
      try {
        const { data } = await supabase.auth.getSession()
        if (!data?.session) return
        try {
          await supabase.auth.signOut()
        } catch (e) {
          // ignore sign-out errors
        }
        localStorage.removeItem('mindscape_user_id')
        navigate('/register', { replace: true })
      } finally {
        idleInProgressRef.current = false
      }
    }

    const resetIdleTimer = () => {
      clearIdleTimer()
      idleTimerRef.current = setTimeout(() => {
        handleIdle()
      }, IDLE_TIMEOUT_MS)
    }

    const handleActivity = () => {
      resetIdleTimer()
    }

    const handleVisibility = () => {
      if (!document.hidden) handleActivity()
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'focus']
    events.forEach((eventName) => window.addEventListener(eventName, handleActivity))
    document.addEventListener('visibilitychange', handleVisibility)

    resetIdleTimer()

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) resetIdleTimer()
    })

    return () => {
      mounted = false
      clearIdleTimer()
      events.forEach((eventName) => window.removeEventListener(eventName, handleActivity))
      document.removeEventListener('visibilitychange', handleVisibility)
      if (data?.subscription?.unsubscribe) data.subscription.unsubscribe()
    }
  }, [navigate])

  return (
    <>
      <Navbar />
      <div style={{ display: 'flex' }}>
        {!isRegisterPage && <Sidebar />}
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/music" element={<Music />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/helpline" element={<Helpline />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </div>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App