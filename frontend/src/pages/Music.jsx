import { useState } from 'react';
import FloatingChat from '../components/FloatingChat';
import { pageBgStyles } from '../styles/pageBackground';

function Music() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectMusic, setSelectMusic] = useState('');

  const musicList = [
    { id: 1, title: 'Morning Drift', artist: 'Ari Sol' },
    { id: 2, title: 'Silent Neon', artist: 'Luma Sky' },
    { id: 3, title: 'Cloud Memory', artist: 'Kairo' },
    { id: 4, title: 'Midnight Bloom', artist: 'Nova Rae' },
  ];

  const currentSong = musicList.find(song => song.id === Number(selectMusic));

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
          <p style={styles.subtitle}>Spotify API integration-ready layout with curated mood playlist slots.</p>
        </div>

        <div style={styles.controls}>
          <label htmlFor="song-select">Pick a track</label>
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
            <h3>Now Playing</h3>
            {currentSong ? (
              <>
                <p style={styles.songTitle}>{currentSong.title}</p>
                <p style={styles.songArtist}>{currentSong.artist}</p>
                <div style={styles.actions}>
                  <button type="button" style={styles.primaryBtn}>
                    Play
                  </button>
                  <button type="button" style={styles.ghostBtn}>
                    Queue
                  </button>
                </div>
              </>
            ) : (
              <p style={styles.muted}>Select a track to start previewing here.</p>
            )}
          </article>
        </div>

        <div style={styles.chatRow}>
          <button type="button" onClick={() => setIsChatOpen(!isChatOpen)} style={styles.chatBtn}>
            {isChatOpen ? 'Close Chat' : 'Open Chat'}
          </button>
        </div>
      </section>

      <FloatingChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}

export default Music;