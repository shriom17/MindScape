import { useEffect, useMemo, useState } from 'react'
import FloatingChat from '../components/FloatingChat'
import { fetchJson } from '../services/api'
import { pageBgStyles } from '../styles/pageBackground'

const moodPlaylistMap = {
  happy: {
    title: 'Golden Uplift',
    description: 'Bright, uplifting tracks for a good-energy moment.',
    playlistId: '37i9dQZF1DXdPec7aLTmlC',
  },
  calm: {
    title: 'Blue Calm',
    description: 'Soft, steady music for grounding and decompression.',
    playlistId: '37i9dQZF1DX4WYpdgoIcn6',
  },
  sad: {
    title: 'Gentle Healing',
    description: 'Tender songs that leave room to breathe.',
    playlistId: '37i9dQZF1DX7qK8ma5wgG1',
  },
  neutral: {
    title: 'Balanced Flow',
    description: 'Even-tempo listening for staying centered.',
    playlistId: '37i9dQZF1DX4sWSpwq3LiO',
  },
  fear: {
    title: 'Steady Reset',
    description: 'Low-pressure ambient music for reducing tension.',
    playlistId: '37i9dQZF1DX4sWSpwq3LiO',
  },
  angry: {
    title: 'Cool Down',
    description: 'Channel the edge into a smoother mood arc.',
    playlistId: '37i9dQZF1DX4sWSpwq3LiO',
  },
  surprise: {
    title: 'Spark & Drift',
    description: 'A little wonder, a little motion, a little lift.',
    playlistId: '37i9dQZF1DX4sWSpwq3LiO',
  },
  disgust: {
    title: 'Clean Slate',
    description: 'Fresh, uncluttered listening to reset the tone.',
    playlistId: '37i9dQZF1DX4sWSpwq3LiO',
  },
}

const fallbackMood = {
  emotion: 'neutral',
  confidence: null,
}

function toTitleCase(value) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getLocalMood() {
  try {
    const raw = localStorage.getItem('moodTracker')
    if (!raw) return null
    const history = JSON.parse(raw)
    const latest = Array.isArray(history) ? history[history.length - 1] : null
    return latest?.mood ? { emotion: latest.mood, confidence: null } : null
  } catch {
    return null
  }
}

function Music() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [currentMood, setCurrentMood] = useState(fallbackMood)
  const [moodSource, setMoodSource] = useState('system')
  const [isLoadingMood, setIsLoadingMood] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadMood() {
      setIsLoadingMood(true)

      const localMood = getLocalMood()
      if (localMood && mounted) {
        setCurrentMood(localMood)
        setMoodSource('local history')
      }

      try {
        const latestMood = await fetchJson('/api/moods/latest')
        if (mounted && latestMood?.emotion) {
          setCurrentMood({
            emotion: latestMood.emotion,
            confidence: latestMood.confidence ?? latestMood.confidence_score ?? null,
          })
          setMoodSource('latest scan')
        }
      } catch {
        if (mounted && !localMood) {
          setCurrentMood(fallbackMood)
          setMoodSource('default')
        }
      } finally {
        if (mounted) setIsLoadingMood(false)
      }
    }

    loadMood()

    return () => {
      mounted = false
    }
  }, [])

  const moodKey = (currentMood?.emotion || 'neutral').toLowerCase()
  const playlist = moodPlaylistMap[moodKey] || moodPlaylistMap.neutral
  const embedSrc = useMemo(
    () => `https://open.spotify.com/embed/playlist/${playlist.playlistId}?utm_source=generator`,
    [playlist.playlistId]
  )

  const confidenceValue = currentMood?.confidence
  const confidenceLabel =
    Number.isFinite(confidenceValue) && confidenceValue !== null
      ? `${Math.round(confidenceValue > 1 ? confidenceValue : confidenceValue * 100)}%`
      : 'n/a'

  const styles = {
    shell: {
      position: 'relative',
      zIndex: 1,
      width: 'min(1120px, 100%)',
      margin: '0 auto',
      padding: 'clamp(1rem, 2vw, 1.5rem)',
      borderRadius: 28,
      border: '1px solid rgba(255, 255, 255, 0.14)',
      background: 'linear-gradient(180deg, rgba(8, 16, 28, 0.74), rgba(7, 18, 26, 0.9))',
      backdropFilter: 'blur(18px)',
      boxShadow: '0 24px 70px rgba(3, 8, 18, 0.4)',
      color: '#f8fbff',
    },
    hero: {
      display: 'grid',
      gap: 12,
      padding: '0.35rem 0.15rem 1.25rem',
    },
    eyebrow: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      width: 'fit-content',
      padding: '0.42rem 0.72rem',
      borderRadius: 999,
      border: '1px solid rgba(250, 204, 21, 0.24)',
      background: 'rgba(250, 204, 21, 0.08)',
      color: '#facc15',
      fontSize: '0.78rem',
      textTransform: 'uppercase',
      letterSpacing: '0.14em',
    },
    title: {
      fontSize: 'clamp(1.9rem, 4vw, 3rem)',
      lineHeight: 1.05,
      margin: 0,
    },
    subtitle: {
      maxWidth: '60ch',
      color: 'rgba(224, 236, 247, 0.84)',
      lineHeight: 1.6,
      margin: 0,
    },
    metaRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 6,
    },
    pill: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '0.48rem 0.8rem',
      borderRadius: 999,
      border: '1px solid rgba(255, 255, 255, 0.12)',
      background: 'rgba(255, 255, 255, 0.06)',
      color: '#dbeafe',
      fontSize: 13,
    },
    grid: {
      display: 'grid',
      gap: 16,
      gridTemplateColumns: 'minmax(0, 0.8fr) minmax(0, 1.2fr)',
      alignItems: 'start',
    },
    card: {
      borderRadius: 24,
      border: '1px solid rgba(255, 255, 255, 0.12)',
      background: 'linear-gradient(180deg, rgba(18, 28, 44, 0.72), rgba(11, 20, 34, 0.86))',
      boxShadow: '0 18px 48px rgba(2, 6, 23, 0.3)',
      backdropFilter: 'blur(16px)',
      padding: '1.15rem',
    },
    cardAccent: {
      border: '1px solid rgba(250, 204, 21, 0.16)',
      background:
        'linear-gradient(145deg, rgba(250, 204, 21, 0.08), rgba(14, 32, 52, 0.88) 46%, rgba(8, 16, 28, 0.94))',
    },
    sectionLabel: {
      margin: 0,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: '0.16em',
      color: '#93c5fd',
    },
    playlistTitle: {
      margin: '0.45rem 0 0.35rem',
      fontSize: 'clamp(1.35rem, 2.8vw, 2rem)',
      color: '#fef3c7',
    },
    description: {
      margin: 0,
      color: '#dbeafe',
      lineHeight: 1.6,
    },
    iframeShell: {
      marginTop: 16,
      borderRadius: 20,
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      background: '#08111c',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
    },
    iframe: {
      display: 'block',
      width: '100%',
      height: 352,
      border: 0,
    },
    infoList: {
      display: 'grid',
      gap: 12,
      marginTop: 14,
    },
    infoItem: {
      padding: '0.95rem 1rem',
      borderRadius: 18,
      border: '1px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(255, 255, 255, 0.04)',
      color: '#e2e8f0',
    },
    infoValue: {
      marginTop: 4,
      color: '#facc15',
      fontWeight: 700,
      fontSize: 16,
    },
    helperCard: {
      display: 'grid',
      gap: 12,
    },
    helperText: {
      margin: 0,
      color: 'rgba(226, 232, 240, 0.86)',
      lineHeight: 1.6,
    },
    status: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      width: 'fit-content',
      padding: '0.45rem 0.75rem',
      borderRadius: 999,
      border: '1px solid rgba(56, 189, 248, 0.18)',
      background: 'rgba(56, 189, 248, 0.08)',
      color: '#bfdbfe',
      fontSize: 13,
    },
    chatButton: {
      marginTop: 4,
      width: 'fit-content',
      padding: '0.7rem 1rem',
      borderRadius: 999,
      border: '1px solid rgba(250, 204, 21, 0.28)',
      background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.16), rgba(59, 130, 246, 0.16))',
      color: '#f8fbff',
      fontWeight: 700,
      cursor: 'pointer',
    },
  }

  return (
    <div style={pageBgStyles.page}>
      <div style={{ ...pageBgStyles.orbBase, ...pageBgStyles.orbLeft }} />
      <div style={{ ...pageBgStyles.orbBase, ...pageBgStyles.orbRight }} />

      <section style={styles.shell}>
        <header style={styles.hero}>
          <p style={styles.eyebrow}>MindScape Audio</p>
          <h2 style={styles.title}>Music Lounge</h2>
          <p style={styles.subtitle}>
            A mood-aware Spotify space that reads your latest detected emotion and shifts the playlist to match the moment.
          </p>
          <div style={styles.metaRow}>
            <div style={styles.pill}>Detected mood: {toTitleCase(currentMood?.emotion || 'neutral')}</div>
            <div style={styles.pill}>Source: {moodSource}</div>
            <div style={styles.pill}>Confidence: {confidenceLabel}</div>
          </div>
        </header>

        <div style={styles.grid}>
          <article style={{ ...styles.card, ...styles.cardAccent }}>
            <p style={styles.sectionLabel}>Spotify playlist</p>
            <h3 style={styles.playlistTitle}>{playlist.title}</h3>
            <p style={styles.description}>{playlist.description}</p>

            <div style={styles.iframeShell}>
              <iframe
                title={`${playlist.title} playlist for ${currentMood?.emotion || 'neutral'} mood`}
                src={embedSrc}
                style={styles.iframe}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>
          </article>

          <aside style={{ ...styles.card, ...styles.helperCard }}>
            <p style={styles.sectionLabel}>Mood bridge</p>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fbff' }}>How the match works</h3>
            <p style={styles.helperText}>
              Music tailored to your current mood. MindScape automatically recommends playlists based on your latest mood analysis.
            </p>

            <div style={styles.infoList}>
              <div style={styles.infoItem}>
                <div>Current playlist</div>
                <div style={styles.infoValue}>{playlist.title}</div>
              </div>
              <div style={styles.infoItem}>
                <div>Detected emotion</div>
                <div style={styles.infoValue}>{toTitleCase(currentMood?.emotion || 'neutral')}</div>
              </div>
              <div style={styles.infoItem}>
                <div>Confidence</div>
                <div style={styles.infoValue}>{confidenceLabel}</div>
              </div>
            </div>

            {isLoadingMood ? (
              <div style={styles.status}>Loading detected mood...</div>
            ) : (
              <div style={styles.status}>Ready in dark mode with blue and gold accents</div>
            )}

           
          </aside>
        </div>
      </section>

      <FloatingChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  )
}

export default Music