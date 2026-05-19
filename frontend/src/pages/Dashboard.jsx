import { Link } from 'react-router-dom'
import { pageBgStyles } from '../styles/pageBackground'

const kpiCards = [
  {
    label: 'Today mood',
    value: 'Calm',
    detail: 'Last scan 2h ago',
    chip: 'steady',
    chipBg: 'rgba(34, 211, 238, 0.12)',
    chipText: '#7dd3fc',
  },
  {
    label: 'Streak',
    value: '6 days',
    detail: 'Best week in 2 months',
    chip: '+2',
    chipBg: 'rgba(251, 191, 36, 0.18)',
    chipText: '#fbbf24',
  },
  {
    label: 'Avg mood',
    value: '7.6 / 10',
    detail: 'Rolling 7-day average',
    chip: 'up',
    chipBg: 'rgba(74, 222, 128, 0.12)',
    chipText: '#86efac',
  },
  {
    label: 'Recovery',
    value: '78%',
    detail: 'Breathwork completion',
    chip: 'today',
    chipBg: 'rgba(248, 113, 113, 0.14)',
    chipText: '#fda4af',
  },
]

const moodTrend = [3, 4, 6, 5, 7, 8, 6, 7, 8, 7, 9, 8]
const energyTrend = [2, 3, 4, 3, 5, 6, 4, 5, 6, 5, 6, 7]

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

const recentMoments = [
  {
    time: '9:18 AM',
    title: 'Mood scan: Calm',
    detail: 'Breathing steady, eyes relaxed',
  },
  {
    time: '12:45 PM',
    title: 'Tracker entry',
    detail: 'Energy dipped after lunch',
  },
  {
    time: '5:02 PM',
    title: 'Story break',
    detail: 'Listened to "Soft waves"',
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

const emotionMix = [
  { label: 'Calm', value: 44, color: '#fbbf24' },
  { label: 'Focused', value: 26, color: '#22d3ee' },
  { label: 'Low', value: 18, color: '#f97316' },
  { label: 'Stressed', value: 12, color: '#f472b6' },
]

function Dashboard() {
  const maxMood = Math.max(...moodTrend)
  const maxEnergy = Math.max(...energyTrend)
  const totalMix = emotionMix.reduce((sum, item) => sum + item.value, 0)
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
            </div>
            <div className="ms-date">
              <div className="ms-date-pill">{todayLabel}</div>
              <div className="ms-date-text">{weekdayLabel}</div>
            </div>
          </header>

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
                  <div className="ms-pill">last 12 check-ins</div>
                </div>
                <div className="ms-spark">
                  {moodTrend.map((value, index) => (
                    <span
                      key={`mood-${index}`}
                      style={{ height: `${(value / maxMood) * 100}%`, animationDelay: `${0.15 + index * 0.05}s` }}
                    />
                  ))}
                </div>
                <div className="ms-chart-meta">
                  <span>Avg 7.6</span>
                  <span>Peak 9.0</span>
                </div>
              </div>

              <div className="ms-card" style={{ marginTop: 20, animationDelay: '0.25s' }}>
                <div className="ms-chart-top">
                  <div>
                    <div className="ms-label">Energy</div>
                    <div className="ms-value" style={{ fontSize: '1.2rem' }}>Daily stamina</div>
                  </div>
                  <div className="ms-pill">last 12 entries</div>
                </div>
                <div className="ms-spark energy">
                  {energyTrend.map((value, index) => (
                    <span
                      key={`energy-${index}`}
                      style={{ height: `${(value / maxEnergy) * 100}%`, animationDelay: `${0.12 + index * 0.04}s` }}
                    />
                  ))}
                </div>
                <div className="ms-chart-meta">
                  <span>Recovery trend: +12%</span>
                  <span>Evening dip: 4 PM</span>
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
                  {recentMoments.map((item) => (
                    <div className="ms-timeline-item" key={item.time}>
                      <div className="ms-time">{item.time}</div>
                      <div className="ms-timeline-card">
                        <div style={{ fontWeight: 600 }}>{item.title}</div>
                        <div className="ms-meta">{item.detail}</div>
                      </div>
                    </div>
                  ))}
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
                  <div className="ms-value" style={{ fontSize: '1.2rem' }}>Last 14 days</div>
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