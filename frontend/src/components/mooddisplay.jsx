function MoodDisplay({ mood }) {
  const emojiMap = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    fear: '😨',
    surprise: '😲',
    disgust: '🤢',
    neutral: '😐'
  }

  const colorMap = {
    happy: '#f59e0b',
    sad: '#3b82f6',
    angry: '#ef4444',
    fear: '#8b5cf6',
    surprise: '#06b6d4',
    disgust: '#10b981',
    neutral: '#94a3b8'
  }

  if (!mood) return null

  const emotion = mood.emotion || 'neutral'
  // Convert confidence to percentage if it's between 0-1
  const rawConfidence = mood.confidence || 0
  const confidence = rawConfidence > 1 ? Math.round(rawConfidence) : Math.round(rawConfidence * 100)
  const color = colorMap[emotion] || '#94a3b8'
  const emoji = emojiMap[emotion] || '😐'

  return (
    <div style={{
      background: '#16213e',
      borderRadius: '16px',
      padding: '2rem',
      textAlign: 'center',
      boxShadow: `0 4px 20px ${color}44`,
      minWidth: '280px'
    }}>
      <div style={{ fontSize: '4rem' }}>{emoji}</div>
      <p style={{
        color: color,
        fontSize: '1.5rem',
        fontWeight: 'bold',
        textTransform: 'capitalize',
        margin: '0.5rem 0'
      }}>
        {emotion}
      </p>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
        Confidence: {confidence}%
      </p>

      {/* Emotion bars */}
      {mood.all_emotions && (
        <div style={{ marginTop: '1rem', textAlign: 'left' }}>
          {Object.entries(mood.all_emotions)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([em, val]) => (
              <div key={em} style={{ marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.75rem' }}>
                  <span style={{ textTransform: 'capitalize' }}>{em}</span>
                  <span>{val}%</span>
                </div>
                <div style={{ background: '#0f3460', borderRadius: '4px', height: '6px' }}>
                  <div style={{
                    width: `${val}%`,
                    height: '100%',
                    borderRadius: '4px',
                    background: colorMap[em] || '#7c3aed',
                    transition: 'width 0.5s ease'
                  }}/>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default MoodDisplay