import { pageBgStyles } from '../styles/pageBackground'

function Profile() {
  return (
    <div style={pageBgStyles.page}>
      <div style={{ ...pageBgStyles.orbBase, ...pageBgStyles.orbLeft }} />
      <div style={{ ...pageBgStyles.orbBase, ...pageBgStyles.orbRight }} />
      <section style={pageBgStyles.shell}>
        <h1 style={{ fontSize: '2rem', color: '#facc15' }}>Profile</h1>
        <p style={{ marginTop: '0.5rem', color: '#dbeafe' }}>Your personal settings and mood history summary will stay here.</p>
      </section>
    </div>
  )
}
export default Profile