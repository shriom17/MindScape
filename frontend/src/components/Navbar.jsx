import { Link } from 'react-router-dom'

function Navbar() {
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

        <button style={{
          backgroundColor: '#16213e',
          color: '#e2e8f0',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '3px 3px 6px #0d0d1a, -3px -3px 6px #252545'
        }}>🔓 Login</button>
        {/* Logout button can be conditionally rendered if user is logged in */}
      </div>
    </nav>
  )
}

export default Navbar