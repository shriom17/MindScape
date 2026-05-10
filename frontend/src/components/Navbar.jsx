import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { getUser, supabase } from '../services/supabaseClient'

function Navbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const avatarRef = useRef(null)
  const menuRef = useRef(null)

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

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      if (data?.subscription?.unsubscribe) data.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    setMenuOpen(false)
    try {
      await supabase.auth.signOut()
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('mindscape_user_id')
    setUser(null)
    navigate('/')
  }

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || ''
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.avatar || user?.user_metadata?.picture || user?.avatar_url || user?.picture || null
  const initial = displayName ? displayName.trim().charAt(0).toUpperCase() : (user?.email ? user.email.trim().charAt(0).toUpperCase() : 'M')
  const avatarStyle = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: avatarUrl ? 'transparent' : '#f59e0b',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    marginRight: 12,
  }

  useEffect(() => {
    if (!menuOpen) return
    const handleDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && avatarRef.current && !avatarRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    const handleEsc = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', handleDocClick)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleDocClick)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [menuOpen])

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

      {/* Right side controls */}
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

        {user && (
          <div style={{ position: 'relative' }}>
            <div
              ref={avatarRef}
              style={{ ...avatarStyle, cursor: 'pointer' }}
              title={displayName}
              onClick={() => setMenuOpen((s) => !s)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setMenuOpen((s) => !s) }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                <span style={{ color: '#0f172a', fontWeight: 700 }}>{initial}</span>
              )}
            </div>

            {menuOpen && (
              <div ref={menuRef} style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#0b1220', borderRadius: 8, padding: '0.4rem', boxShadow: '0 8px 24px rgba(0,0,0,0.35)', minWidth: 160, zIndex: 60 }}>
                <button onClick={() => { setMenuOpen(false); navigate('/profile') }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 0.8rem', background: 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer' }}>Profile</button>
                <button onClick={() => { setMenuOpen(false); navigate('/profile?tab=settings') }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 0.8rem', background: 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer' }}>Settings</button>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0.3rem 0' }} />
                <button onClick={() => { setMenuOpen(false); handleLogout() }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 0.8rem', background: 'transparent', border: 'none', color: '#fda4af', cursor: 'pointer' }}>Logout</button>
              </div>
            )}
          </div>
        )}

        {!user && (
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