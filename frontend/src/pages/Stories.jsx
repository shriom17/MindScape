import { useEffect, useMemo, useState } from 'react'

import { apiUrl } from '../services/api'
import { pageBgStyles } from '../styles/pageBackground'

const MOOD_OPTIONS = ['happy', 'sad', 'angry', 'fear', 'surprise', 'neutral', 'calm']

const cardBase = {
  background: 'rgba(255,255,255,0.04)',
  borderRadius: 16,
  padding: '1.1rem 1.3rem',
  border: '1px solid rgba(124,58,237,0.13)',
  boxShadow: '0 2px 12px #7c3aed11',
}

const tagBase = {
  borderRadius: 999,
  padding: '4px 10px',
  fontSize: 12,
  letterSpacing: '0.3px',
  background: 'rgba(15,23,42,0.6)',
  border: '1px solid rgba(148,163,184,0.25)',
  color: '#e2e8f0',
}

const getUserId = () => {
  const existing = localStorage.getItem('mindscape_user_id')
  if (existing) return existing
  const next = `user_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`
  localStorage.setItem('mindscape_user_id', next)
  return next
}

const fetchJson = async (path, options = {}) => {
  const response = await fetch(apiUrl(path), {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = payload?.error || 'Request failed'
    throw new Error(message)
  }
  return payload
}

function Stories() {
  const userId = useMemo(() => getUserId(), [])
  const [activeMood, setActiveMood] = useState('')
  const [moodStories, setMoodStories] = useState([])
  const [trendingStories, setTrendingStories] = useState([])
  const [savedStories, setSavedStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const savedIds = useMemo(
    () => new Set(savedStories.map(story => story.id)),
    [savedStories]
  )

  const loadLatestMood = async () => {
    try {
      const data = await fetchJson('/api/moods/latest')
      if (data?.emotion) {
        setActiveMood(data.emotion)
        return data.emotion
      }
    } catch (err) {
      return ''
    }
    return ''
  }

  const loadStories = async moodValue => {
    const query = moodValue ? `?mood=${encodeURIComponent(moodValue)}` : ''
    const data = await fetchJson(`/api/stories${query}`)
    setMoodStories(data.stories || [])
  }

  const loadTrending = async () => {
    const data = await fetchJson('/api/stories/trending')
    setTrendingStories(data.stories || [])
  }

  const loadSaved = async () => {
    const data = await fetchJson(`/api/users/${userId}/saved-stories`)
    setSavedStories(data.stories || [])
  }

  const ensureDemoStories = async () => {
    try {
      await fetchJson('/api/stories/seed-demo', { method: 'POST' })
    } catch (err) {
      // Ignore demo seed errors to keep page usable.
    }
  }

  const refreshAll = async moodValue => {
    try {
      setLoading(true)
      setError('')
      await ensureDemoStories()
      await Promise.all([loadStories(moodValue), loadTrending(), loadSaved()])
    } catch (err) {
      setError(err.message || 'Failed to load stories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      const mood = await loadLatestMood()
      await refreshAll(mood)
    }
    init()
  }, [])

  const handleMoodSelect = mood => {
    setActiveMood(mood)
    refreshAll(mood)
  }

  const toggleSave = async story => {
    const alreadySaved = savedIds.has(story.id)
    const method = alreadySaved ? 'DELETE' : 'POST'
    await fetchJson(`/api/stories/${story.id}/save`, {
      method,
      body: JSON.stringify({ user_id: userId }),
    })
    await loadSaved()
  }

  const likeStory = async story => {
    await fetchJson(`/api/stories/${story.id}/like`, { method: 'POST' })
    await Promise.all([loadStories(activeMood), loadTrending()])
  }

  const viewStory = async story => {
    await fetchJson(`/api/stories/${story.id}/view`, { method: 'POST' })
    await Promise.all([loadStories(activeMood), loadTrending()])
  }

  const renderStoryCard = (story, accent) => (
    <div key={story.id} style={{ ...cardBase, borderColor: accent }}>
      <div style={{ display: 'flex', gap: 16 }}>
        {story.image_url ? (
          <img
            src={story.image_url}
            alt={story.title}
            style={{
              width: 96,
              height: 96,
              objectFit: 'cover',
              borderRadius: 14,
              border: '1px solid rgba(148,163,184,0.3)',
            }}
          />
        ) : null}
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: 18 }}>{story.title}</h3>
          <p style={{ margin: '6px 0 10px', color: '#cbd5f5', fontSize: 14 }}>
            {story.summary}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {story.mood_tags?.slice(0, 4).map(tag => (
              <span key={`${story.id}-${tag}`} style={tagBase}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 14,
        }}
      >
        <span style={{ color: '#94a3b8', fontSize: 13 }}>
          {story.read_time_minutes || 4} min read • {story.views || 0} views
        </span>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => viewStory(story)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(148,163,184,0.4)',
              color: '#e2e8f0',
              borderRadius: 999,
              padding: '6px 12px',
              cursor: 'pointer',
            }}
          >
            Read
          </button>
          <button
            type="button"
            onClick={() => likeStory(story)}
            style={{
              background: 'rgba(250,204,21,0.12)',
              border: '1px solid rgba(250,204,21,0.3)',
              color: '#fde68a',
              borderRadius: 999,
              padding: '6px 12px',
              cursor: 'pointer',
            }}
          >
            {story.likes || 0} likes
          </button>
          <button
            type="button"
            onClick={() => toggleSave(story)}
            style={{
              background: savedIds.has(story.id) ? 'rgba(59,130,246,0.15)' : 'transparent',
              border: '1px solid rgba(59,130,246,0.3)',
              color: '#bfdbfe',
              borderRadius: 999,
              padding: '6px 12px',
              cursor: 'pointer',
            }}
          >
            {savedIds.has(story.id) ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={pageBgStyles.page}>
      <div style={{ ...pageBgStyles.orbBase, ...pageBgStyles.orbLeft }} />
      <div style={{ ...pageBgStyles.orbBase, ...pageBgStyles.orbRight }} />
      <section style={{ ...pageBgStyles.shell, maxWidth: 860, marginTop: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
          <span
            style={{
              fontSize: 38,
              color: '#7c3aed',
              background: 'rgba(124,58,237,0.08)',
              borderRadius: 16,
              padding: 8,
              boxShadow: '0 2px 8px #7c3aed22',
            }}
          >
            📚
          </span>
          <div>
            <h1 style={{ fontSize: '2.2rem', color: '#facc15', margin: 0 }}>Stories</h1>
            <p style={{ margin: 0, color: '#dbeafe', fontSize: 18 }}>
              Emotion-based story recommendations
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: '12px 0 22px' }}>
          {MOOD_OPTIONS.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => handleMoodSelect(option)}
              style={{
                borderRadius: 999,
                padding: '6px 14px',
                fontSize: 13,
                textTransform: 'capitalize',
                background: activeMood === option ? 'rgba(124,58,237,0.18)' : 'transparent',
                border: '1px solid rgba(124,58,237,0.3)',
                color: '#e2e8f0',
                cursor: 'pointer',
              }}
            >
              {option}
            </button>
          ))}
        </div>

        {error ? (
          <div style={{ ...cardBase, borderColor: 'rgba(248,113,113,0.5)' }}>{error}</div>
        ) : null}

        <div style={{ marginTop: 18, display: 'grid', gap: 24 }}>
          <div style={{ ...cardBase, borderColor: 'rgba(124,58,237,0.3)' }}>
            <h2 style={{ color: '#a78bfa', fontSize: 20, margin: 0, marginBottom: 10 }}>
              For Your Mood {activeMood ? `• ${activeMood}` : ''}
            </h2>
            {loading ? (
              <p style={{ color: '#e0e7ef', margin: 0 }}>Loading stories...</p>
            ) : moodStories.length ? (
              <div style={{ display: 'grid', gap: 16 }}>
                {moodStories.map(story => renderStoryCard(story, 'rgba(124,58,237,0.35)'))}
              </div>
            ) : (
              <p style={{ color: '#e0e7ef', margin: 0 }}>No stories yet. Try another mood.</p>
            )}
          </div>

          <div style={{ ...cardBase, borderColor: 'rgba(250,204,21,0.3)' }}>
            <h2 style={{ color: '#fde68a', fontSize: 20, margin: 0, marginBottom: 10 }}>
              Trending Stories
            </h2>
            {loading ? (
              <p style={{ color: '#e0e7ef', margin: 0 }}>Loading trending list...</p>
            ) : trendingStories.length ? (
              <div style={{ display: 'grid', gap: 16 }}>
                {trendingStories.map(story => renderStoryCard(story, 'rgba(250,204,21,0.35)'))}
              </div>
            ) : (
              <p style={{ color: '#e0e7ef', margin: 0 }}>No trending stories yet.</p>
            )}
          </div>

          <div style={{ ...cardBase, borderColor: 'rgba(34,211,238,0.3)' }}>
            <h2 style={{ color: '#67e8f9', fontSize: 20, margin: 0, marginBottom: 10 }}>
              Saved for Later
            </h2>
            {loading ? (
              <p style={{ color: '#e0e7ef', margin: 0 }}>Loading saved list...</p>
            ) : savedStories.length ? (
              <div style={{ display: 'grid', gap: 16 }}>
                {savedStories.map(story => renderStoryCard(story, 'rgba(34,211,238,0.35)'))}
              </div>
            ) : (
              <p style={{ color: '#e0e7ef', margin: 0 }}>No saved stories yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Stories