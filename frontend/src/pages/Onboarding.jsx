import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchJson } from '../services/api'
import { getUser } from '../services/supabaseClient'
import './Onboarding.css'

const steps = [
  {
    id: 1,
    title: 'Basic profile',
    subtitle: 'A quick hello for personal touches',
  },
  {
    id: 2,
    title: 'Lifestyle / support',
    subtitle: 'Who is in your circle',
  },
  {
    id: 3,
    title: 'Emotional check-in',
    subtitle: 'What feels heavy lately',
  },
  {
    id: 4,
    title: 'Daily goals',
    subtitle: 'Small wins to focus on',
  },
  {
    id: 5,
    title: 'Safety / support',
    subtitle: 'Only if you want to share',
  },
]

const ageOptions = ['Under 18', '18-24', '25-34', '35+']
const professionOptions = ['Student', 'Working professional', 'Self-employed', 'Homemaker', 'Other']
const relationshipOptions = ['Single', 'Married', 'In a relationship', 'Prefer not to say']
const supportOptions = ['Family', 'Friends', 'Partner', 'No one', 'Prefer not to say']
const difficultyOptions = [
  'Stress',
  'Anxiety',
  'Sleep',
  'Loneliness',
  'Overthinking',
  'Motivation',
  'Work/Study pressure',
  'Relationship issues',
  'Family concerns',
  'Prefer not to say',
]
const goalOptions = ['Reduce stress', 'Track mood', 'Sleep better', 'Stay motivated', 'Feel calmer', 'Build consistency']

const initialForm = {
  first_name: '',
  age_range: '',
  profession: '',
  relationship_status: '',
  stress_support: '',
  difficulties: [],
  goals: [],
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relation: '',
  consent_notify: false,
}

const normalizeList = (value) => (Array.isArray(value) ? value : [])

function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState({ type: '', text: '' })
  const [needsAuth, setNeedsAuth] = useState(false)

  const totalSteps = steps.length
  const progress = useMemo(() => Math.round((step / totalSteps) * 100), [step, totalSteps])

  useEffect(() => {
    let active = true

    const loadData = async () => {
      setLoading(true)
      setStatus({ type: '', text: '' })
      try {
        const user = await getUser().catch(() => null)
        if (!active) return

        if (!user?.id) {
          setNeedsAuth(true)
          return
        }

        setNeedsAuth(false)

        const onboardingResult = await fetchJson('/api/onboarding').catch((err) => {
          if (active) {
            setStatus({ type: 'error', text: err?.message || 'Could not load onboarding data yet. You can still continue.' })
          }
          return null
        })

        if (!active) return

        const onboarding = onboardingResult?.onboarding || null
        if (onboarding) {
          setForm((prev) => ({
            ...prev,
            first_name: onboarding.first_name || prev.first_name,
            age_range: onboarding.age_range || '',
            profession: onboarding.profession || '',
            relationship_status: onboarding.relationship_status || '',
            stress_support: onboarding.stress_support || '',
            difficulties: normalizeList(onboarding.difficulties),
            goals: normalizeList(onboarding.goals),
            emergency_contact_name: onboarding.emergency_contact_name || '',
            emergency_contact_phone: onboarding.emergency_contact_phone || '',
            emergency_contact_relation: onboarding.emergency_contact_relation || '',
            consent_notify: Boolean(onboarding.consent_notify),
          }))
        }

        if (!onboarding?.first_name) {
          const metaName = user?.user_metadata?.full_name || user?.user_metadata?.name || ''
          if (metaName) {
            setForm((prev) => ({ ...prev, first_name: prev.first_name || metaName }))
          }
        }
      } catch (err) {
        if (active) {
          setStatus({ type: 'error', text: 'Could not load onboarding data yet. You can still continue.' })
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadData()
    return () => {
      active = false
    }
  }, [])

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const toggleMulti = (key, value) => {
    setForm((prev) => {
      const current = new Set(normalizeList(prev[key]))
      const isPreferNot = value === 'Prefer not to say'

      if (isPreferNot) {
        if (current.has(value)) {
          current.delete(value)
        } else {
          current.clear()
          current.add(value)
        }
      } else {
        if (current.has(value)) {
          current.delete(value)
        } else {
          current.add(value)
        }
        if (current.has('Prefer not to say')) current.delete('Prefer not to say')
      }

      return { ...prev, [key]: Array.from(current) }
    })
  }

  const goNext = () => setStep((prev) => Math.min(totalSteps, prev + 1))
  const goBack = () => setStep((prev) => Math.max(1, prev - 1))

  const handleSkip = () => {
    navigate('/dashboard')
  }

  const handleFinish = async () => {
    if (needsAuth) {
      setStatus({ type: 'error', text: 'Please log in to save your answers.' })
      return
    }
    setSaving(true)
    setStatus({ type: '', text: '' })

    const payload = {
      ...form,
      first_name: form.first_name.trim(),
      emergency_contact_name: form.emergency_contact_name.trim(),
      emergency_contact_phone: form.emergency_contact_phone.trim(),
      emergency_contact_relation: form.emergency_contact_relation.trim(),
      completed: true,
    }

    try {
      await fetchJson('/api/onboarding', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setStatus({ type: 'success', text: 'Saved. Your dashboard is ready.' })
      setTimeout(() => navigate('/dashboard'), 600)
    } catch (err) {
      setStatus({ type: 'error', text: err?.message || 'Could not save right now.' })
    } finally {
      setSaving(false)
    }
  }

  const renderOptionGrid = (options, value, onSelect) => (
    <div className="ms-option-grid">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`ms-option ${value === option ? 'selected' : ''}`}
          onClick={() => onSelect(option)}
        >
          {option}
        </button>
      ))}
    </div>
  )

  const renderMultiGrid = (options, values, onToggle) => (
    <div className="ms-option-grid">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`ms-option ${values.includes(option) ? 'selected' : ''}`}
          onClick={() => onToggle(option)}
        >
          {option}
        </button>
      ))}
    </div>
  )

  return (
    <div className="ms-onboarding">
      <div className="ms-onboarding-orb ms-orb-1" aria-hidden="true" />
      <div className="ms-onboarding-orb ms-orb-2" aria-hidden="true" />
      <div className="ms-onboarding-orb ms-orb-3" aria-hidden="true" />

      <div className="ms-onboarding-shell">
        <aside className="ms-onboarding-side">
          <div className="ms-brand">MindScape</div>
          <h1>Make your space feel personal.</h1>
          <p>
            Everything here is optional. Answer what feels comfortable, skip anything, and you can always update later.
          </p>

          <div className="ms-stepper">
            {steps.map((stepInfo) => {
              const isActive = step === stepInfo.id
              const isDone = step > stepInfo.id
              return (
                <div key={stepInfo.id} className={`ms-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                  <div className="ms-step-index">{stepInfo.id}</div>
                  <div>
                    <div className="ms-step-title">{stepInfo.title}</div>
                    <div className="ms-step-subtitle">{stepInfo.subtitle}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        <main className="ms-onboarding-main">
          <div className="ms-top-row">
            <div className="ms-progress">
              <span>Step {step} of {totalSteps}</span>
              <div className="ms-progress-bar">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>
            <button type="button" className="ms-ghost-btn" onClick={handleSkip}>
              Skip for now
            </button>
          </div>

          {loading ? (
            <div className="ms-loading">Setting up your calm space...</div>
          ) : (
            <div className="ms-step-card">
              {needsAuth ? (
                <div className="ms-auth-banner">
                  <div>
                    You are not signed in yet. Log in to save your answers and personalize the dashboard.
                  </div>
                  <button type="button" className="ms-link-btn" onClick={() => navigate('/register')}>
                    Go to login
                  </button>
                </div>
              ) : null}
              {step === 1 && (
                <>
                  <h2>Basic profile</h2>
                  <p className="ms-step-hint">Start with the basics. A nickname is enough.</p>

                  <div className="ms-field">
                    <label>First name / nickname</label>
                    <input
                      className="ms-input"
                      placeholder="What should we call you?"
                      value={form.first_name}
                      onChange={(event) => updateField('first_name', event.target.value)}
                    />
                  </div>

                  <div className="ms-field">
                    <label>Age range</label>
                    {renderOptionGrid(ageOptions, form.age_range, (value) => updateField('age_range', value))}
                  </div>

                  <div className="ms-field">
                    <label>Profession</label>
                    {renderOptionGrid(professionOptions, form.profession, (value) => updateField('profession', value))}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h2>Lifestyle / support</h2>
                  <p className="ms-step-hint">Share only what feels easy.</p>

                  <div className="ms-field">
                    <label>Relationship status (optional)</label>
                    {renderOptionGrid(relationshipOptions, form.relationship_status, (value) => updateField('relationship_status', value))}
                  </div>

                  <div className="ms-field">
                    <label>Who do you usually talk to when stressed?</label>
                    {renderOptionGrid(supportOptions, form.stress_support, (value) => updateField('stress_support', value))}
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h2>Emotional check-in</h2>
                  <p className="ms-step-hint">Which areas feel difficult lately?</p>

                  <div className="ms-field">
                    {renderMultiGrid(difficultyOptions, form.difficulties, (value) => toggleMulti('difficulties', value))}
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <h2>Daily goals</h2>
                  <p className="ms-step-hint">What would you like MindScape to help with?</p>

                  <div className="ms-field">
                    {renderMultiGrid(goalOptions, form.goals, (value) => toggleMulti('goals', value))}
                  </div>
                </>
              )}

              {step === 5 && (
                <>
                  <h2>Safety / support</h2>
                  <p className="ms-step-hint">Optional. Only if you want a trusted contact on hand.</p>

                  <div className="ms-field-grid">
                    <div className="ms-field">
                      <label>Emergency contact name (optional)</label>
                      <input
                        className="ms-input"
                        value={form.emergency_contact_name}
                        onChange={(event) => updateField('emergency_contact_name', event.target.value)}
                        placeholder="Name"
                      />
                    </div>
                    <div className="ms-field">
                      <label>Phone (optional)</label>
                      <input
                        className="ms-input"
                        value={form.emergency_contact_phone}
                        onChange={(event) => updateField('emergency_contact_phone', event.target.value)}
                        placeholder="Phone"
                      />
                    </div>
                  </div>

                  <div className="ms-field">
                    <label>Relation (optional)</label>
                    <input
                      className="ms-input"
                      value={form.emergency_contact_relation}
                      onChange={(event) => updateField('emergency_contact_relation', event.target.value)}
                      placeholder="Family, friend, partner"
                    />
                  </div>

                  <label className="ms-toggle">
                    <input
                      type="checkbox"
                      checked={form.consent_notify}
                      onChange={(event) => updateField('consent_notify', event.target.checked)}
                    />
                    <span className="ms-toggle-track" aria-hidden="true" />
                    <span className="ms-toggle-text">
                      In serious emotional distress, I allow MindScape to suggest or notify my trusted contact.
                    </span>
                  </label>
                </>
              )}

              <div className="ms-action-row">
                <button
                  type="button"
                  className="ms-secondary-btn"
                  onClick={goBack}
                  disabled={step === 1}
                >
                  Back
                </button>
                {step < totalSteps ? (
                  <button type="button" className="ms-primary-btn" onClick={goNext}>
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    className="ms-primary-btn"
                    onClick={needsAuth ? () => navigate('/register') : handleFinish}
                    disabled={saving}
                  >
                    {needsAuth ? 'Log in to finish' : saving ? 'Saving...' : 'Finish and go to dashboard'}
                  </button>
                )}
              </div>

              {status.text ? (
                <div className={`ms-status ${status.type}`}>{status.text}</div>
              ) : null}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Onboarding
