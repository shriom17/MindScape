import { pageBgStyles } from '../styles/pageBackground'

function Stories() {
  return (
    <div style={pageBgStyles.page}>
      <div style={{ ...pageBgStyles.orbBase, ...pageBgStyles.orbLeft }} />
      <div style={{ ...pageBgStyles.orbBase, ...pageBgStyles.orbRight }} />
      <section style={pageBgStyles.shell}>
        <h1 style={{ fontSize: '2rem', color: '#facc15' }}>Stories</h1>
        <p style={{ marginTop: '0.5rem', color: '#dbeafe' }}>Emotion-based story recommendations will render here.</p>
      </section>
    </div>
  )
}
export default Stories