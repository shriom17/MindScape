import { useState, useEffect } from 'react'
import { fetchJson } from '../services/api'
import { supabase } from '../services/supabaseClient'
import FeatherIcon from '../assets/peakok-feather.png';
function FloatingChat({ mood, isOpen, onOpenChange }) {

  const [internalOpen, setInternalOpen] = useState(false)
  const open = typeof isOpen === 'boolean' ? isOpen : internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const [username, setUsername] = useState("Friend")

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (data.user) {
        setUsername(
          data.user.user_metadata?.full_name ||
          data.user.email?.split("@")[0] ||
          "Friend"
        )
      }
    }

    getUser()}, []) 
    const sendMessage = async () => {
    if (!input.trim()) return

    const userMsg = { role: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const data = await fetchJson('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: input, mood: mood?.emotion || 'neutral' })
    })

    setMessages(prev => [...prev, { role: 'Keshava', text: data.response }])
    setLoading(false)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background:
              'linear-gradient(145deg, #06152f 0%, #14396d 55%, #2c5aa0 100%)',
            border: '2px solid rgba(255,215,0,0.25)',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow:
'0                      10px 30px rgba(0,0,0,.35), 0 0 18px rgba(90,131,193,.45), 0 0 22px rgba(255,215,0,.22)',
            transition:'transform .25s ease, box-shadow .25s ease',
            overflow: 'hidden',
            zIndex: 1000
          }}>
         <img
        src={FeatherIcon}
        alt="Keshava"
        style={{
          width: "100px",
          height: "100px",
          objectFit: "contain",
          pointerEvents: "none",
          filter: "drop-shadow(0 0 8px rgba(255,215,0,.35))"
        }}
      />
      </button>

      {/* Chat Window */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: '6rem',
          right: '2rem',
          width: '320px',
          height: '420px',
          background: '#16213e',
          borderRadius: '16px',
          boxShadow: '0 4px 15px rgba(199, 181, 67, 0.49)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #040d27, #5a83c1)',
            padding: '1rem',
            borderRadius: '16px 16px 0 0',
            color: '#f59e0b',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            Keshava
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {messages.length === 0 && (
              <p style={{ color: '#94a3b8', textAlign: 'center', fontSize: '0.85rem' }}>
                Hello {username}, I am here with you. Share what is on your mind.
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#2d1b69' : '#0f3460',
                color: '#e2e8f0',
                padding: '0.5rem 0.75rem',
                borderRadius: '10px',
                maxWidth: '80%',
                fontSize: '0.85rem'
              }}>
                {msg.text}
              </div>
            ))}
            {loading && <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Keshava is listening...</p>}
          </div>

          {/* Input */}
          <div style={{ display: 'flex', padding: '0.75rem', gap: '0.5rem' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Share what is on your mind..."
              style={{
                flex: 1,
                background: '#0f3460',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem',
                color: '#e2e8f0',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                background: 'linear-gradient(135deg, #040d27, #5a83c1)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 0.75rem',
                color: '#f59e0b',
                cursor: 'pointer'
              }}>
              ►
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default FloatingChat