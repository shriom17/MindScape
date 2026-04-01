import { pageBgStyles } from '../styles/pageBackground'

function Dashboard() {
  return (
    <div style={pageBgStyles.page}>
      <div style={{ ...pageBgStyles.orbBase, ...pageBgStyles.orbLeft }} />
      <div style={{ ...pageBgStyles.orbBase, ...pageBgStyles.orbRight }} />
      <section style={pageBgStyles.shell}>
        <h1 style={{ fontSize: '2rem', color: '#facc15' }}>Dashboard</h1>
        <p style={{ marginTop: '0.5rem', color: '#dbeafe' }}>Your insights and activity widgets will appear here.</p>
      </section>
    </div>
  )
}
export default Dashboard