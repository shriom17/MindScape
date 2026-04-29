import { useState, useEffect, useRef } from 'react';
import FloatingChat from '../components/FloatingChat';
import { pageBgStyles } from '../styles/pageBackground';

function Music() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectMusic, setSelectMusic] = useState('');
  const [jamendoTracks, setJamendoTracks] = useState([]);
  const audioRef = useRef(null)
  const [currentPlaying, setCurrentPlaying] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const musicList = [
    { id: 1, title: 'Morning Drift', artist: 'Ari Sol' },
    { id: 2, title: 'Silent Neon', artist: 'Luma Sky' },
    { id: 3, title: 'Cloud Memory', artist: 'Kairo' },
    { id: 4, title: 'Midnight Bloom', artist: 'Nova Rae' },
  ];

  const currentSong = musicList.find(song => song.id === Number(selectMusic));

  useEffect(() => {
    // optional: preload Jamendo results
    // fetchMusic()
  }, [])

  async function fetchMusic() {
    try {
      const res = await fetch(
        "https://api.jamendo.com/v3.0/tracks/?client_id=d4f850a4&format=json&tags=calm&limit=10"
      )
      const data = await res.json()
      setJamendoTracks(data.results || [])
      console.log(data.results)
    } catch (e) {
      console.error('Jamendo fetch error', e)
    }
  }

  function playJamendo(track) {
    if (!track || !track.audio) return alert('No audio URL')
    if (!audioRef.current) audioRef.current = new Audio()
    // if same track toggle play
    if (currentPlaying && currentPlaying.id === track.id && audioRef.current.src === track.audio) {
      audioRef.current.play()
      setIsPlaying(true)
      return
    }
    audioRef.current.src = track.audio
    audioRef.current.play()
    setCurrentPlaying(track)
    setIsPlaying(true)
  }

  function togglePlayPause() {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  // attach listeners to update play state
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => {
      setIsPlaying(false)
      setCurrentPlaying(null)
    }
    const onTime = () => setCurrentTime(a.currentTime || 0)
    const onLoaded = () => setDuration(a.duration || 0)
    a.addEventListener('play', onPlay)
    a.addEventListener('pause', onPause)
    a.addEventListener('ended', onEnded)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onLoaded)
    return () => {
      a.removeEventListener('play', onPlay)
      a.removeEventListener('pause', onPause)
      a.removeEventListener('ended', onEnded)
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('loadedmetadata', onLoaded)
    }
  }, [audioRef.current])

  const styles = {
    shell: {
      position: 'relative',
      zIndex: 1,
      width: 'min(1000px, 100%)',
      margin: '0 auto',
      padding: '1.6rem',
      border: '1px solid rgba(255, 255, 255, 0.14)',
      borderRadius: 24,
      background: 'rgba(7, 18, 26, 0.64)',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 16px 40px rgba(5, 10, 20, 0.35)',
      color: '#f8fbff',
    },
    eyebrow: {
      display: 'inline-block',
      marginBottom: '0.4rem',
      fontSize: '0.8rem',
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      color: '#facc15',
    },
    title: {
      fontSize: 'clamp(1.6rem, 3.8vw, 2.4rem)',
      letterSpacing: '0.02em',
    },
    subtitle: {
      marginTop: '0.5rem',
      maxWidth: '48ch',
      color: 'rgba(232, 240, 248, 0.84)',
      lineHeight: 1.5,
    },
    controls: {
      marginTop: '1.4rem',
      display: 'grid',
      gap: '0.45rem',
    },
    select: {
      width: '100%',
      padding: '0.72rem 0.8rem',
      borderRadius: 12,
      border: '1px solid rgba(255, 255, 255, 0.2)',
      background: 'rgba(12, 30, 44, 0.75)',
      color: '#ecfeff',
    },
    grid: {
      marginTop: '1.5rem',
      display: 'grid',
      gap: '1rem',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    },
    card: {
      borderRadius: 18,
      border: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'rgba(11, 28, 41, 0.78)',
      padding: '1rem',
    },
    list: {
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.55rem',
      marginTop: '0.8rem',
    },
    songBtn: {
      width: '100%',
      textAlign: 'left',
      padding: '0.65rem 0.75rem',
      borderRadius: 12,
      border: '1px solid transparent',
      background: 'rgba(15, 36, 52, 0.9)',
      color: '#e2e8f0',
      cursor: 'pointer',
    },
    songBtnActive: {
      border: '1px solid rgba(250, 204, 21, 0.65)',
      background: 'rgba(56, 189, 248, 0.18)',
    },
    songTitle: {
      fontSize: '1.3rem',
      fontWeight: 700,
      color: '#fef3c7',
      marginTop: '0.8rem',
    },
    songArtist: {
      marginTop: '0.28rem',
      color: '#bae6fd',
    },
    actions: {
      marginTop: '1rem',
      display: 'flex',
      gap: '0.7rem',
      flexWrap: 'wrap',
    },
    primaryBtn: {
      padding: '0.55rem 1rem',
      borderRadius: 999,
      border: '1px solid rgba(255, 255, 255, 0.2)',
      background: '#facc15',
      color: '#0f172a',
      fontWeight: 600,
      cursor: 'pointer',
    },
    ghostBtn: {
      padding: '0.55rem 1rem',
      borderRadius: 999,
      border: '1px solid rgba(255, 255, 255, 0.2)',
      background: 'transparent',
      color: '#f8fafc',
      fontWeight: 600,
      cursor: 'pointer',
    },
    chatRow: {
      marginTop: '1.2rem',
    },
    chatBtn: {
      padding: '0.55rem 1rem',
      borderRadius: 999,
      border: '1px solid rgba(255, 255, 255, 0.2)',
      background: 'rgba(56, 189, 248, 0.2)',
      color: '#e0f2fe',
      fontWeight: 600,
      cursor: 'pointer',
    },
    muted: {
      color: '#bfdbfe',
      marginTop: '0.8rem',
    },
    smallArtist: {
      color: '#93c5fd',
    },
  };

  return (
    <div style={pageBgStyles.page}>
      <div style={{ ...pageBgStyles.orbBase, ...pageBgStyles.orbLeft }} />
      <div style={{ ...pageBgStyles.orbBase, ...pageBgStyles.orbRight }} />

      <section style={styles.shell}>
        <div>
          <p style={styles.eyebrow}>MindScape Audio</p>
          <h2 style={styles.title}>Music Lounge</h2>
          <p style={styles.subtitle}>Jamendo integration — free tracks for mood-based listening.</p>
        </div>

        <div style={styles.controls}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="song-select">Pick a track</label>
            <div>
              <button type="button" onClick={fetchMusic} style={{ ...styles.chatBtn, marginLeft: 8 }}>
                Load Jamendo
              </button>
            </div>
          </div>
          <select id="song-select" value={selectMusic} onChange={e => setSelectMusic(e.target.value)} style={styles.select}>
            <option value="">Select a song</option>
            {musicList.map(song => (
              <option key={song.id} value={song.id}>
                {song.title} - {song.artist}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.grid}>
          <article style={styles.card}>
            <h3>Featured Playlist</h3>
            <ul style={styles.list}>
              {musicList.map(song => (
                <li key={song.id}>
                  <button
                    type="button"
                    onClick={() => setSelectMusic(String(song.id))}
                    style={String(song.id) === selectMusic ? { ...styles.songBtn, ...styles.songBtnActive } : styles.songBtn}
                  >
                    <span style={{ display: 'block', fontWeight: 600 }}>{song.title}</span>
                    <small style={styles.smallArtist}>{song.artist}</small>
                  </button>
                </li>
              ))}
            </ul>
          </article>

          

          <article style={styles.card}>
            <h3>Jamendo Results</h3>
            {jamendoTracks.length === 0 ? (
              <p style={styles.muted}>No Jamendo tracks loaded — click "Load Jamendo".</p>
            ) : (
              <ul style={styles.list}>
                {jamendoTracks.map(t => (
                  <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{t.name}</div>
                      <div style={styles.smallArtist}>{t.artist_name}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" style={styles.primaryBtn} onClick={() => playJamendo(t)}>
                        Play
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>

          {/* Now Playing moved to bottom fixed player bar */}
        </div>

        
      </section>

      <FloatingChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Bottom player bar */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(11, 28, 41, 0.95)',
          color: '#f8fbff',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '0.6rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          zIndex: 1000,
        }}
      >
        <div style={{ flex: 1 }}>
          {currentPlaying ? (
            <>
              <div style={{ fontWeight: 700 }}>{currentPlaying.name}</div>
              <div style={{ color: '#93c5fd', fontSize: 12 }}>{currentPlaying.artist_name}</div>
            </>
          ) : (
            <div style={{ color: '#bfdbfe' }}>No track playing</div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="button" onClick={togglePlayPause} style={styles.primaryBtn}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.currentTime = 0
              }
              setIsPlaying(false)
              setCurrentPlaying(null)
              setCurrentTime(0)
            }}
            style={styles.ghostBtn}
          >
            Stop
          </button>
        </div>

        <div style={{ width: 240, marginLeft: 12 }}>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                background: '#facc15',
                width: duration ? `${(currentTime / duration) * 100}%` : '0%',
                transition: 'width 0.2s linear',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Music;