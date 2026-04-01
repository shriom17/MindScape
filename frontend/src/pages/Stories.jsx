import { pageBgStyles } from '../styles/pageBackground'

function Stories() {
  return (
    <div style={pageBgStyles.page}>
      <div style={{ ...pageBgStyles.orbBase, ...pageBgStyles.orbLeft }} />
      <div style={{ ...pageBgStyles.orbBase, ...pageBgStyles.orbRight }} />
      <section style={{ ...pageBgStyles.shell, maxWidth: 700, marginTop: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
          <span style={{ fontSize: 38, color: '#7c3aed', background: 'rgba(124,58,237,0.08)', borderRadius: 16, padding: 8, boxShadow: '0 2px 8px #7c3aed22' }}>📚</span>
          <div>
            <h1 style={{ fontSize: '2.2rem', color: '#facc15', margin: 0 }}>Stories</h1>
            <p style={{ margin: 0, color: '#dbeafe', fontSize: 18 }}>Emotion-based story recommendations</p>
          </div>
        </div>
        <div style={{ marginTop: 32, display: 'grid', gap: 24 }}>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 16,
            padding: '1.2rem 1.5rem',
            border: '1px solid rgba(124,58,237,0.13)',
            boxShadow: '0 2px 12px #7c3aed11',
          }}>
            <h2 style={{ color: '#a78bfa', fontSize: 20, margin: 0, marginBottom: 6 }}>For Your Mood</h2>
            <p style={{ color: '#e0e7ef', margin: 0, fontSize: 16 }}>Get personalized stories based on your current emotion. (Coming soon!)</p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 16,
            padding: '1.2rem 1.5rem',
            border: '1px solid rgba(250,204,21,0.13)',
            boxShadow: '0 2px 12px #facc1511',
          }}>
            <h2 style={{ color: '#fde68a', fontSize: 20, margin: 0, marginBottom: 6 }}>Trending Stories</h2>
            <p style={{ color: '#e0e7ef', margin: 0, fontSize: 16 }}>See what others are reading and loving right now.</p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 16,
            padding: '1.2rem 1.5rem',
            border: '1px solid rgba(34,211,238,0.13)',
            boxShadow: '0 2px 12px #22d3ee11',
          }}>
            <h2 style={{ color: '#67e8f9', fontSize: 20, margin: 0, marginBottom: 6 }}>Saved for Later</h2>
            <p style={{ color: '#e0e7ef', margin: 0, fontSize: 16 }}>Bookmark your favorite stories and revisit anytime.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
export default Stories