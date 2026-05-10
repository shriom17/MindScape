import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getUser, supabase } from '../services/supabaseClient'

function Navbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const u = await getUser()
        if (mounted) setUser(u)
      } catch (e) {
        // ignore
      }
    })()

    const { subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      if (subscription?.unsubscribe) subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('mindscape_user_id')
    setUser(null)
    navigate('/')
  }

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #040d27, #5a83c1, #07246a)',
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 4px 15px rgba(199, 181, 67, 0.49)'
    }}>
      {/* Logo */}
      <div style={{ color: '#f59e0b', fontSize: '1.5rem', fontWeight: 'bold' }}>
        🧠 MindScape
      </div>

      {/* Nav Links removed; now handled by Sidebar */}

      {/* Right side: Profile, Settings, Lang, Login/Logout */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button style={{
          backgroundColor: '#16213e',
          color: '#f59e0b',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '3px 3px 6px #0d0d1a, -3px -3px 6px #252545'
        }}>🌐 Lang</button>

        <Link to="/profile" style={{
          backgroundColor: '#16213e',
          color: '#e2e8f0',
          textDecoration: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          boxShadow: '3px 3px 6px #0d0d1a, -3px -3px 6px #252545'
        }}>👤 Profile</Link>

        <button style={{
          backgroundColor: '#16213e',
          color: '#e2e8f0',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '3px 3px 6px #0d0d1a, -3px -3px 6px #252545'
        }}>⚙️ Settings</button>

        {user ? (
          <button onClick={handleLogout} style={{
            backgroundColor: '#f59e0b',
            color: '#0f172a',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '3px 3px 6px #0d0d1a, -3px -3px 6px #252545'
          }}>🔒 Logout</button>
        ) : (
          <Link to="/register" style={{
            backgroundColor: '#16213e',
            color: '#e2e8f0',
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            boxShadow: '3px 3px 6px #0d0d1a, -3px -3px 6px #252545'
          }}>🔓 Login</Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar