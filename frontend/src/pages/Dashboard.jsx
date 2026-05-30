import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { pageBgStyles } from '../styles/pageBackground'
import { fetchJson } from '../services/api'

const EMOTION_COLORS = {
  Calm: '#fbbf24',
  Happy: '#34d399',
  Neutral: '#94a3b8',
  Sad: '#60a5fa',
  Angry: '#f97316',
  Fear: '#f472b6',
  Disgust: '#a78bfa',
  Surprise: '#22d3ee',
  Unknown: '#64748b',
  'No data': '#1f2937',
}

const focusItems = [
  {
    title: '3-minute reset',
    detail: 'Box breathing to lower tension',
    tag: 'quick',
  },
  {
    title: 'Evening unwind',
    detail: 'Soft music + gratitude note',
    tag: 'wind down',
  },
  {
    title: 'Social recharge',
    detail: 'Ping a friend or journal 5 lines',
    tag: 'connection',
  },
]


const actionItems = [
  {
    title: 'Start a scan',
    detail: 'Capture today mood',
    to: '/home',
  },
  {
    title: 'Log your day',
    detail: 'Add tracker note',
    to: '/tracker',
  },
  {
    title: 'Play a soundscape',
    detail: 'Pick a calm mix',
    to: '/music',
  },
  {
    title: 'Read a story',
    detail: 'Short calming stories',
    to: '/stories',
  },
  {
    title: 'Need support',
    detail: 'Helpline resources',
    to: '/helpline',
  },
]

const toTitle = (value) => {
  if (!value) return ''
  const str = String(value)
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

const buildPersonalPrompt = (profile) => {
  if (!profile) return ''
  const name = profile.first_name ? String(profile.first_name).trim() : ''
  const prefix = name ? `Welcome back, ${name}. ` : 'Welcome back. '
  const profession = String(profile.profession || '').toLowerCase()
  const difficulties = (profile.difficulties || []).map((item) => String(item).toLowerCase())
  const goals = (profile.goals || []).map((item) => String(item).toLowerCase())

  const hasDifficulty = (value) => difficulties.includes(String(value).toLowerCase())
  const hasGoal = (value) => goals.includes(String(value).toLowerCase())

  if (profession === 'student' && (hasDifficulty('work/study pressure') || hasDifficulty('overthinking'))) {
    return `${prefix}Let's take one small step today. How has study pressure felt this week?`
  }
  if (profession === 'working professional' && hasDifficulty('sleep')) {
    return `${prefix}You mentioned sleep has been difficult lately. Would you like a short calming story tonight?`
  }
  if (hasDifficulty('stress') || hasDifficulty('anxiety')) {
    return `${prefix}Want a 3-minute reset or a gentle breathing check-in?`
  }
  if (hasGoal('sleep better')) {
    return `${prefix}We can help you wind down tonight with a short story or soundscape.`
  }
  if (hasGoal('track mood')) {
    return `${prefix}Ready for a quick mood check-in to keep your streak steady?`
  }
  return `${prefix}Let's take one small step today. Want to check in with your mood?`
}

const formatShortTime = (iso) => {
  if (!iso) return '--'
  const dt = new Date(iso)
  if (Number.isNaN(dt.getTime())) return '--'
  return dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

const formatRelativeTime = (iso) => {
  if (!iso) return 'No scans yet'
  const dt = new Date(iso)
  if (Number.isNaN(dt.getTime())) return 'No scans yet'
  const diffMs = Date.now() - dt.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

function Dashboard() {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [onboarding, setOnboarding] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchJson('/api/moods/insights?trend=12&recent=5&days=14')
      .then((data) => {
        if (!active) return
        setInsights(data)
        setErrorMsg('')
      })
      .catch((err) => {
        if (!active) return
        setErrorMsg(err?.message || 'Failed to load dashboard insights')
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    fetchJson('/api/onboarding')
      .then((data) => {
        if (!active) return
        setOnboarding(data?.onboarding || null)
      })
      .catch(() => {
        // ignore onboarding errors
      })
    return () => {
      active = false
    }
  }, [])

  const latest = insights?.latest
  const stats = insights?.stats || {}
  const trendPoints = insights?.trend || []
  const moodTrend = trendPoints.map((point) => point?.mood_score ?? 0)
  const confidenceTrend = trendPoints.map((point) => point?.confidence_score ?? 0)

  const maxMood = moodTrend.length ? Math.max(...moodTrend) : 10
  const maxConfidence = confidenceTrend.length ? Math.max(...confidenceTrend) : 10

  const avgMoodScore = Number.isFinite(stats.avg_mood_score_7d) ? stats.avg_mood_score_7d.toFixed(1) : 'N/A'
  const avgConfidenceScore = Number.isFinite(stats.avg_confidence_score_7d) ? stats.avg_confidence_score_7d.toFixed(1) : 'N/A'
  const avgMoodValue = avgMoodScore === 'N/A' ? 'N/A' : `${avgMoodScore} / 10`
  const streakDays = Number.isFinite(stats.streak_days) ? stats.streak_days : 0
  const consistency = Number.isFinite(stats.consistency_14d) ? stats.consistency_14d : 0
  const windowDays = Number.isFinite(stats.window_days) ? stats.window_days : 14

  const latestEmotion = latest?.emotion ? toTitle(latest.emotion) : 'No data'
  const lastScanLabel = latest?.timestamp ? formatRelativeTime(latest.timestamp) : 'No scans yet'

  const latestConfidence = Number(latest?.confidence)
  const latestConfidenceLabel = Number.isFinite(latestConfidence) ? `${latestConfidence.toFixed(1)}%` : 'N/A'
  const trendCount = trendPoints.length
  const personalPrompt = buildPersonalPrompt(onboarding)

  const kpiCards = [
    {
      label: 'Latest mood',
      value: latestEmotion,
      detail: lastScanLabel,
      chip: 'live',
      chipBg: 'rgba(34, 211, 238, 0.12)',
      chipText: '#7dd3fc',
    },
    {
      label: 'Streak',
      value: `${streakDays} day${streakDays === 1 ? '' : 's'}`,
      detail: 'Consecutive scan days',
      chip: 'days',
      chipBg: 'rgba(251, 191, 36, 0.18)',
      chipText: '#fbbf24',
    },
    {
      label: 'Avg mood',
      value: avgMoodValue,
      detail: 'Average last 7 days',
      chip: '7d',
      chipBg: 'rgba(74, 222, 128, 0.12)',
      chipText: '#86efac',
    },
    {
      label: 'Consistency',
      value: `${consistency}%`,
      detail: `Days with scans (${windowDays}d)`,
      chip: `${windowDays}d`,
      chipBg: 'rgba(248, 113, 113, 0.14)',
      chipText: '#fda4af',
    },
  ]

  const recentMoments = (insights?.recent || []).map((item) => {
    const confidence = Number(item?.confidence)
    const confidenceLabel = Number.isFinite(confidence) ? `Confidence ${confidence.toFixed(1)}%` : 'Mood captured'
    return {
      time: formatShortTime(item?.timestamp),
      title: item?.emotion ? `Mood scan: ${toTitle(item.emotion)}` : 'Mood scan',
      detail: confidenceLabel,
    }
  })

  const mixSource = insights?.mix || []
  const emotionMix = mixSource.length
    ? mixSource.map((item) => ({
        label: item.label,
        value: Number.isFinite(item.percent) ? item.percent : 0,
        color: EMOTION_COLORS[item.label] || EMOTION_COLORS.Unknown,
      }))
    : [{ label: 'No data', value: 100, color: EMOTION_COLORS['No data'] }]

  const totalMix = emotionMix.reduce((sum, item) => sum + item.value, 0) || 1
  let mixCursor = 0
  const mixStops = emotionMix.map((item) => {
    const start = mixCursor
    const segment = (item.value / totalMix) * 360
    mixCursor += segment
    return `${item.color} ${start.toFixed(1)}deg ${mixCursor.toFixed(1)}deg`
  })
  const mixGradient = `conic-gradient(${mixStops.join(', ')})`
  const today = new Date()
  const todayLabel = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const weekdayLabel = today.toLocaleDateString('en-US', { weekday: 'long' })

  return (
    <div style={pageBgStyles.page}>
      <div style={{ ...pageBgStyles.orbBase, ...pageBgStyles.orbLeft }} />
      <div style={{ ...pageBgStyles.orbBase, ...pageBgStyles.orbRight }} />
      <section className="ms-dashboard" style={{ ...pageBgStyles.shell, padding: '2rem' }}>
        <style>{`
          .ms-dashboard {
            --ms-card: rgba(7, 16, 28, 0.82);
            --ms-card-strong: rgba(12, 24, 38, 0.9);
            --ms-border: rgba(255, 255, 255, 0.12);
            --ms-muted: rgba(226, 232, 240, 0.7);
            --ms-ink: #f8fbff;
            position: relative;
            overflow: hidden;
            font-family: var(--font-body);
          }
          .ms-grid-bg {
            position: absolute;
            inset: 0;
            background-image: linear-gradient(120deg, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0)),
              repeating-linear-gradient(90deg, rgba(148, 163, 184, 0.08) 0 1px, transparent 1px 36px),
              repeating-linear-gradient(0deg, rgba(148, 163, 184, 0.08) 0 1px, transparent 1px 36px);
            opacity: 0.35;
            pointer-events: none;
          }
          .ms-content {
            position: relative;
            z-index: 1;
          }
          .ms-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            flex-wrap: wrap;
          }
          .ms-kicker {
            color: var(--accent-cyan);
            text-transform: uppercase;
            letter-spacing: 0.24em;
            font-size: 0.7rem;
            font-weight: 600;
          }
          .ms-title {
            font-family: var(--font-heading);
            font-size: clamp(1.8rem, 2.4vw, 2.6rem);
            margin: 0.2rem 0;
            color: var(--ms-ink);
          }
          .ms-subtitle {
            color: var(--ms-muted);
            max-width: 520px;
          }
          .ms-date {
            display: grid;
            gap: 4px;
            text-align: right;
          }
          .ms-date-pill {
            padding: 0.45rem 0.85rem;
            border-radius: 999px;
            border: 1px solid rgba(34, 211, 238, 0.4);
            color: #bae6fd;
            font-weight: 600;
            background: rgba(15, 23, 42, 0.55);
          }
          .ms-date-text {
            color: var(--ms-muted);
            font-size: 0.9rem;
          }
          .ms-personal-card {
            margin-top: 1.2rem;
            padding: 1.1rem 1.4rem;
            border-radius: 18px;
            border: 1px solid rgba(34, 211, 238, 0.25);
            background: linear-gradient(120deg, rgba(15, 23, 42, 0.75), rgba(7, 18, 26, 0.85));
            box-shadow: 0 12px 30px rgba(2, 8, 18, 0.35);
          }
          .ms-personal-head {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 0.4rem;
          }
          .ms-personal-badge {
            padding: 0.25rem 0.7rem;
            border-radius: 999px;
            background: rgba(251, 191, 36, 0.18);
            color: #fbbf24;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .ms-personal-label {
            color: var(--ms-muted);
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.18em;
          }
          .ms-personal-text {
            color: var(--ms-ink);
            font-size: 1rem;
            line-height: 1.6;
          }
          .ms-kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 16px;
            margin-top: 1.8rem;
          }
          .ms-grid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 340px;
            gap: 20px;
            margin-top: 1.8rem;
          }
          .ms-card {
            background: var(--ms-card);
            border: 1px solid var(--ms-border);
            border-radius: 18px;
            padding: 16px;
            box-shadow: 0 14px 32px rgba(4, 10, 20, 0.35);
            position: relative;
            overflow: hidden;
            animation: ms-fade-up 0.55s ease both;
          }
          .ms-card::after {
            content: "";
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 20% 20%, rgba(34, 211, 238, 0.08), transparent 50%);
            opacity: 0;
            transition: opacity 0.25s ease;
            pointer-events: none;
          }
          .ms-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 18px 38px rgba(2, 8, 18, 0.45);
          }
          .ms-card:hover::after {
            opacity: 1;
          }
          .ms-label {
            color: var(--ms-muted);
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
          .ms-value {
            font-size: 1.6rem;
            font-weight: 700;
            color: var(--ms-ink);
            margin-top: 0.6rem;
          }
          .ms-meta {
            margin-top: 0.35rem;
            color: var(--ms-muted);
            font-size: 0.9rem;
          }
          .ms-chip {
            padding: 0.2rem 0.6rem;
            border-radius: 999px;
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-weight: 700;
          }
          .ms-kpi-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
          }
          .ms-chart-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
          }
          .ms-pill {
            padding: 0.35rem 0.7rem;
            border-radius: 999px;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #cbd5f5;
            font-size: 0.75rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .ms-spark {
            display: flex;
            gap: 6px;
            align-items: flex-end;
            height: 140px;
            margin-top: 1rem;
          }
          .ms-spark span {
            flex: 1;
            border-radius: 8px 8px 6px 6px;
            background: linear-gradient(180deg, rgba(34, 211, 238, 0.85), rgba(56, 189, 248, 0.2));
            transform-origin: bottom;
            animation: ms-rise 0.6s ease both;
          }
          .ms-spark.energy span {
            background: linear-gradient(180deg, rgba(251, 191, 36, 0.85), rgba(251, 191, 36, 0.2));
          }
          .ms-chart-meta {
            display: flex;
            justify-content: space-between;
            margin-top: 0.9rem;
            color: var(--ms-muted);
            font-size: 0.85rem;
          }
          .ms-timeline {
            display: grid;
            gap: 14px;
            margin-top: 1rem;
          }
          .ms-timeline-item {
            display: grid;
            grid-template-columns: 62px 1fr;
            gap: 12px;
            align-items: start;
          }
          .ms-time {
            color: #bae6fd;
            font-weight: 600;
            font-size: 0.85rem;
          }
          .ms-timeline-card {
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(148, 163, 184, 0.08);
            padding: 12px;
            border-radius: 14px;
          }
          .ms-actions {
            display: grid;
            gap: 10px;
            margin-top: 0.8rem;
          }
          .ms-action {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            border-radius: 14px;
            background: rgba(7, 16, 28, 0.8);
            border: 1px solid rgba(148, 163, 184, 0.1);
            color: var(--ms-ink);
            text-decoration: none;
            transition: transform 0.2s ease, border 0.2s ease;
          }
          .ms-action:hover {
            transform: translateX(2px);
            border-color: rgba(34, 211, 238, 0.4);
          }
          .ms-action span {
            display: block;
            color: var(--ms-muted);
            font-size: 0.82rem;
            margin-top: 2px;
          }
          .ms-focus-list {
            display: grid;
            gap: 10px;
            margin-top: 0.8rem;
          }
          .ms-focus-item {
            display: grid;
            gap: 4px;
            padding: 12px;
            border-radius: 14px;
            background: rgba(15, 23, 42, 0.65);
            border: 1px solid rgba(148, 163, 184, 0.08);
          }
          .ms-tag {
            align-self: start;
            padding: 0.2rem 0.5rem;
            border-radius: 999px;
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            background: rgba(56, 189, 248, 0.2);
            color: #7dd3fc;
            width: fit-content;
          }
          .ms-mix {
            display: grid;
            gap: 14px;
          }
          .ms-ring {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            display: grid;
            place-items: center;
            background: var(--ms-ring-bg);
            position: relative;
          }
          .ms-ring::after {
            content: "";
            width: 82px;
            height: 82px;
            border-radius: 50%;
            background: rgba(7, 16, 28, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.08);
            position: absolute;
          }
          .ms-ring-label {
            position: relative;
            z-index: 1;
            font-weight: 700;
          }
          .ms-legend {
            display: grid;
            gap: 8px;
          }
          .ms-legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--ms-muted);
            font-size: 0.85rem;
          }
          .ms-dot {
            width: 10px;
            height: 10px;
            border-radius: 999px;
          }
          @keyframes ms-fade-up {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes ms-rise {
            from { transform: scaleY(0.2); opacity: 0.4; }
            to { transform: scaleY(1); opacity: 1; }
          }
          @media (max-width: 1100px) {
            .ms-kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .ms-grid { grid-template-columns: 1fr; }
          }
          @media (max-width: 680px) {
            .ms-kpi-grid { grid-template-columns: 1fr; }
            .ms-date { text-align: left; }
          }
        `}</style>
        <div className="ms-grid-bg" aria-hidden="true" />
        <div className="ms-content">
          <header className="ms-header">
            <div>
              <div className="ms-kicker">Daily overview</div>
              <h1 className="ms-title">Your MindScape Dashboard</h1>
              <p className="ms-subtitle">Snapshot of your mood, focus, and recovery rhythms. Keep the calm going.</p>
              {errorMsg ? (
                <p style={{ marginTop: '0.6rem', color: '#fca5a5' }}>{errorMsg}</p>
              ) : loading ? (
                <p style={{ marginTop: '0.6rem', color: '#94a3b8' }}>Loading live data...</p>
              ) : null}
            </div>
            <div className="ms-date">
              <div className="ms-date-pill">{todayLabel}</div>
              <div className="ms-date-text">{weekdayLabel}</div>
            </div>
          </header>

          {personalPrompt ? (
            <div className="ms-personal-card">
              <div className="ms-personal-head">
                <span className="ms-personal-badge">Keshava</span>
                <span className="ms-personal-label">Gentle check-in</span>
              </div>
              <p className="ms-personal-text">{personalPrompt}</p>
            </div>
          ) : null}

          <section className="ms-kpi-grid">
            {kpiCards.map((card, index) => (
              <div className="ms-card" style={{ animationDelay: `${index * 0.08}s` }} key={card.label}>
                <div className="ms-kpi-top">
                  <span className="ms-label">{card.label}</span>
                  <span className="ms-chip" style={{ background: card.chipBg, color: card.chipText }}>{card.chip}</span>
                </div>
                <div className="ms-value">{card.value}</div>
                <div className="ms-meta">{card.detail}</div>
              </div>
            ))}
          </section>

          <section className="ms-grid">
            <div>
              <div className="ms-card" style={{ animationDelay: '0.2s' }}>
                <div className="ms-chart-top">
                  <div>
                    <div className="ms-label">Mood trend</div>
                    <div className="ms-value" style={{ fontSize: '1.2rem' }}>Week flow</div>
                  </div>
                  <div className="ms-pill">{trendCount ? `last ${trendCount} check-ins` : 'no scans yet'}</div>
                </div>
                {moodTrend.length ? (
                  <div className="ms-spark">
                    {moodTrend.map((value, index) => (
                      <span
                        key={`mood-${index}`}
                        style={{ height: `${(value / maxMood) * 100}%`, animationDelay: `${0.15 + index * 0.05}s` }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="ms-meta" style={{ marginTop: '1rem' }}>No scans yet. Start a scan to build your trend.</div>
                )}
                <div className="ms-chart-meta">
                  <span>Avg {avgMoodScore}</span>
                  <span>{latestEmotion !== 'No data' ? `Latest ${latestEmotion}` : 'No recent mood'}</span>
                </div>
              </div>

              <div className="ms-card" style={{ marginTop: 20, animationDelay: '0.25s' }}>
                <div className="ms-chart-top">
                  <div>
                    <div className="ms-label">Confidence</div>
                    <div className="ms-value" style={{ fontSize: '1.2rem' }}>Detection certainty</div>
                  </div>
                  <div className="ms-pill">{trendCount ? `last ${trendCount} entries` : 'no scans yet'}</div>
                </div>
                {confidenceTrend.length ? (
                  <div className="ms-spark energy">
                    {confidenceTrend.map((value, index) => (
                      <span
                        key={`confidence-${index}`}
                        style={{ height: `${(value / maxConfidence) * 100}%`, animationDelay: `${0.12 + index * 0.04}s` }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="ms-meta" style={{ marginTop: '1rem' }}>No confidence data yet.</div>
                )}
                <div className="ms-chart-meta">
                  <span>Avg {avgConfidenceScore} / 10</span>
                  <span>Latest {latestConfidenceLabel}</span>
                </div>
              </div>

              <div className="ms-card" style={{ marginTop: 20, animationDelay: '0.3s' }}>
                <div className="ms-chart-top">
                  <div>
                    <div className="ms-label">Recent moments</div>
                    <div className="ms-value" style={{ fontSize: '1.2rem' }}>Last check-ins</div>
                  </div>
                  <div className="ms-pill">today</div>
                </div>
                <div className="ms-timeline">
                  {recentMoments.length ? (
                    recentMoments.map((item) => (
                      <div className="ms-timeline-item" key={`${item.time}-${item.title}`}>
                        <div className="ms-time">{item.time}</div>
                        <div className="ms-timeline-card">
                          <div style={{ fontWeight: 600 }}>{item.title}</div>
                          <div className="ms-meta">{item.detail}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="ms-meta" style={{ marginTop: '0.8rem' }}>No recent scans yet.</div>
                  )}
                </div>
              </div>
            </div>

            <aside>
              <div className="ms-card" style={{ animationDelay: '0.2s' }}>
                <div className="ms-label">Quick actions</div>
                <div className="ms-value" style={{ fontSize: '1.2rem' }}>Keep the flow</div>
                <div className="ms-actions">
                  {actionItems.map((action) => (
                    <Link key={action.title} to={action.to} className="ms-action">
                      <div>
                        {action.title}
                        <span>{action.detail}</span>
                      </div>
                      <div style={{ color: '#7dd3fc', fontSize: '1.1rem' }}>+</div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="ms-card" style={{ marginTop: 20, animationDelay: '0.25s' }}>
                <div className="ms-label">Daily focus</div>
                <div className="ms-value" style={{ fontSize: '1.2rem' }}>Tune your reset</div>
                <div className="ms-focus-list">
                  {focusItems.map((item) => (
                    <div className="ms-focus-item" key={item.title}>
                      <div className="ms-tag">{item.tag}</div>
                      <div style={{ fontWeight: 600 }}>{item.title}</div>
                      <div className="ms-meta">{item.detail}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ms-card ms-mix" style={{ marginTop: 20, animationDelay: '0.3s' }}>
                <div>
                  <div className="ms-label">Emotion mix</div>
                  <div className="ms-value" style={{ fontSize: '1.2rem' }}>Last {windowDays} days</div>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="ms-ring" style={{ '--ms-ring-bg': mixGradient }}>
                    <div className="ms-ring-label">Mix</div>
                  </div>
                  <div className="ms-legend">
                    {emotionMix.map((item) => (
                      <div key={item.label} className="ms-legend-item">
                        <span className="ms-dot" style={{ background: item.color }} />
                        {item.label} {item.value}%
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </section>
    </div>
  )
}
export default Dashboard