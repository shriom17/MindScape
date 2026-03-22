function MoodDisplay({ mood }) {
  return <div>Mood: {mood?.emotion || 'Detecting...'}</div>
}

export default MoodDisplay