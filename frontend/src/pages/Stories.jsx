import { useCallback, useEffect, useMemo, useState } from 'react'

import { fetchJson } from '../services/api'
import { supabase } from '../services/supabaseClient'
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

const previewSummary = summary => {
  const text = (summary || '').trim()
  if (!text) return ''
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean)
  const preview = lines.slice(0, 2).join(' ')
  return preview.length > 180 ? `${preview.slice(0, 177).trimEnd()}...` : preview
}

const storyDetailLines = summary => {
  const text = (summary || '').trim()
  if (!text) return []

  const newlineLines = text.split('\n').map(line => line.trim()).filter(Boolean)
  if (newlineLines.length > 1) return newlineLines

  const sentenceLines = text
    .split(/(?<=[.!?])\s+/)
    .map(line => line.trim())
    .filter(Boolean)

  return sentenceLines.length ? sentenceLines : [text]
}

const getUserId = () => {
  const existing = localStorage.getItem('mindscape_user_id')
  if (existing) return existing
  const next = `user_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`
  localStorage.setItem('mindscape_user_id', next)
  return next
}


function Stories() {
  const userId = useMemo(() => getUserId(), [])
  const [activeMood, setActiveMood] = useState('')
  const [moodStories, setMoodStories] = useState([])
  const [trendingStories, setTrendingStories] = useState([])
  const [savedStories, setSavedStories] = useState([])
  const [selectedStory, setSelectedStory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const savedIds = useMemo(
    () => new Set(savedStories.map(story => story.id)),
    [savedStories]
  )

  const loadLatestMood = useCallback(async () => {
    try {
      const data = await fetchJson('/api/moods/latest')
      if (data?.emotion) {
        setActiveMood(data.emotion)
        return data.emotion
      }
    } catch {
      return ''
    }
    return ''
  }, [])

  const loadStories = useCallback(async moodValue => {
    const query = moodValue ? `?mood=${encodeURIComponent(moodValue)}` : ''
    const data = await fetchJson(`/api/stories${query}`)
    setMoodStories(data.stories || [])
  }, [])

  const loadTrending = useCallback(async () => {
    const data = await fetchJson('/api/stories/trending')
    setTrendingStories(data.stories || [])
  }, [])

  const loadSaved = useCallback(async () => {
    const data = await fetchJson(`/api/users/${userId}/saved-stories`)
    setSavedStories(data.stories || [])
  }, [userId])

  const ensureDemoStories = useCallback(async () => {
    try {
      await fetchJson('/api/stories/seed-demo', { method: 'POST' })
    } catch {
      // Ignore demo seed errors to keep page usable.
    }
  }, [])

  const refreshAll = useCallback(async moodValue => {
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
  }, [ensureDemoStories, loadSaved, loadStories, loadTrending])

  useEffect(() => {
    const init = async () => {
      const mood = await loadLatestMood()
      await refreshAll(mood)
    }
    init()
  }, [loadLatestMood, refreshAll])

  useEffect(() => {
    // Sync Supabase user id into localStorage so legacy endpoints receive a consistent user_id
    ;(async () => {
      try {
        const { data } = await supabase.auth.getUser()
        const user = data?.user
        if (user?.id) {
          localStorage.setItem('mindscape_user_id', user.id)
        }
      } catch (e) {
        // ignore
      }
    })()
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

  const openStory = async story => {
    setSelectedStory(story)

    try {
      const data = await fetchJson(`/api/stories/${story.id}`)
      setSelectedStory(data.story || story)
    } catch {
      // Keep the modal open with the list item content if the detail fetch fails.
    }

    try {
      await viewStory(story)
    } catch {
      // Keep the modal usable even if view tracking fails.
    }
  }

  const closeStory = () => {
    setSelectedStory(null)
  }

  const renderStoryCard = (story, accent) => (
    <div key={story.id} style={{ ...cardBase, borderColor: accent }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: 18 }}>{story.title}</h3>
            <p
              style={{
                margin: '6px 0 10px',
                color: '#cbd5f5',
                fontSize: 14,
                lineHeight: 1.75,
                whiteSpace: 'pre-wrap',
              }}
            >
              {previewSummary(story.summary)}
            </p>
          </div>
          {story.image_url ? (
            <span
              aria-hidden="true"
              style={{
                width: 10,
                minWidth: 10,
                height: 10,
                borderRadius: 999,
                marginTop: 8,
                background: accent,
                boxShadow: `0 0 0 6px ${accent.replace('0.35', '0.08')}`,
              }}
            />
          ) : null}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {story.mood_tags?.slice(0, 4).map(tag => (
            <span key={`${story.id}-${tag}`} style={tagBase}>
              {tag}
            </span>
          ))}
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
            onClick={() => openStory(story)}
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

      {selectedStory ? (
        <div
          role="presentation"
          onClick={closeStory}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2,6,23,0.78)',
            backdropFilter: 'blur(10px)',
            display: 'grid',
            placeItems: 'center',
            padding: '20px',
            zIndex: 50,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selectedStory.title}
            onClick={event => event.stopPropagation()}
            style={{
              width: 'min(760px, 100%)',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'linear-gradient(180deg, rgba(15,23,42,0.98), rgba(2,6,23,0.98))',
              border: '1px solid rgba(148,163,184,0.18)',
              borderRadius: 24,
              boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
              padding: '1.4rem 1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '1.8rem' }}>
                  {selectedStory.title}
                </h2>
                <p style={{ margin: '0.5rem 0 0', color: '#cbd5e1', fontSize: 14 }}>
                  {selectedStory.read_time_minutes || 4} min read • {selectedStory.views || 0} views • {selectedStory.likes || 0} likes
                </p>
              </div>
              <button
                type="button"
                onClick={closeStory}
                style={{
                  background: 'rgba(148,163,184,0.12)',
                  border: '1px solid rgba(148,163,184,0.24)',
                  color: '#e2e8f0',
                  borderRadius: 999,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  height: 'fit-content',
                }}
              >
                Close
              </button>
            </div>

            <div style={{ marginTop: 18 }}>
              {storyDetailLines(selectedStory.summary)
                .map((line, index) => (
                  <p
                    key={`${selectedStory.id}-line-${index}`}
                    style={{
                      margin: index === 0 ? 0 : '0.85rem 0 0',
                      color: '#dbeafe',
                      fontSize: 15,
                      lineHeight: 1.9,
                    }}
                  >
                    {line}
                  </p>
                ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
              {selectedStory.mood_tags?.map(tag => (
                <span key={`modal-${selectedStory.id}-${tag}`} style={tagBase}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Stories