import { useEffect, useState } from 'react'
import { pageBgStyles } from '../styles/pageBackground'
import { supabase, getUser } from '../services/supabaseClient'
import { fetchJson } from '../services/api'

function calculateAge(dobStr) {
  if (!dobStr) return null
  const dob = new Date(dobStr)
  if (isNaN(dob.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
  return age
}

function formatUsingTime(createdAt) {
  if (!createdAt) return ''
  const created = new Date(createdAt)
  if (isNaN(created.getTime())) return ''
  const diffMs = Date.now() - created.getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days < 1) return 'Using since today'
  if (days < 30) return `Using for ${days} day${days > 1 ? 's' : ''}`
  const months = Math.floor(days / 30)
  if (months < 12) return `Using for ${months} month${months > 1 ? 's' : ''}`
  const years = Math.floor(months / 12)
  return `Using for ${years} year${years > 1 ? 's' : ''}`
}

function Profile() {
  const [user, setUser] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [dailyMood, setDailyMood] = useState('')
  const [dailyMoodTs, setDailyMoodTs] = useState(null)

  const [formName, setFormName] = useState('')
  const [formBirthdate, setFormBirthdate] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const u = await getUser()
        if (!mounted) return
        setUser(u)
        const avatar = u?.user_metadata?.avatar_url || u?.user_metadata?.avatar || u?.user_metadata?.picture || u?.avatar_url || u?.picture || null
        setAvatarUrl(avatar)

        // populate form fields from metadata (signup values)
        const rawBirth = u?.user_metadata?.birthdate || u?.user_metadata?.dob || ''
        let isoBirth = ''
        if (rawBirth) {
          const d = new Date(rawBirth)
          if (!isNaN(d.getTime())) isoBirth = d.toISOString().slice(0, 10)
          else isoBirth = rawBirth
        }
        setFormName(u?.user_metadata?.full_name || u?.user_metadata?.name || '')
        setFormBirthdate(isoBirth)
        setFormEmail(u?.email || '')
      } catch (e) {
        // ignore
      }
    })()

    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await fetchJson('/api/moods/latest')
        if (!mounted) return
        setDailyMood(data?.emotion || '')
        setDailyMoodTs(data?.timestamp || null)
      } catch (e) {
        // ignore
      }
    })()
    return () => { mounted = false }
  }, [])

  // Clear daily mood when it becomes older than 24 hours.
  useEffect(() => {
    const MOOD_WINDOW_MS = 24 * 60 * 60 * 1000
    if (!dailyMoodTs) return
    const ts = Date.parse(dailyMoodTs)
    if (isNaN(ts)) return
    const elapsed = Date.now() - ts
    const remaining = MOOD_WINDOW_MS - elapsed
    if (remaining <= 0) {
      setDailyMood('')
      setDailyMoodTs(null)
      return
    }
    const timer = setTimeout(() => {
      setDailyMood('')
      setDailyMoodTs(null)
    }, remaining)
    return () => clearTimeout(timer)
  }, [dailyMoodTs])

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    setStatusMsg('')
    try {
      const ext = file.name.split('.').pop()
      const filePath = `${user.id}/avatar-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: urlData, error: urlError } = supabase.storage.from('avatars').getPublicUrl(filePath)
      if (urlError) throw urlError
      const publicUrl = urlData?.publicUrl || urlData?.public_url || null
      if (!publicUrl) throw new Error('Failed to get avatar URL')

      // save to user metadata
      try {
        const { error: metaErr } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } })
        if (metaErr) throw metaErr
      } catch (e) {
        // ignore update errors but still show avatar locally
      }
      setAvatarUrl(publicUrl)
      // refresh user
      try { const fresh = await getUser(); setUser(fresh) } catch (e) {}
      setStatusMsg('Avatar uploaded')
    } catch (err) {
      setStatusMsg(err?.message || 'Upload failed')
    } finally {
      setUploading(false)
      setTimeout(() => setStatusMsg(''), 3500)
    }
  }

  const handleSave = async (e) => {
    e?.preventDefault()
    if (!user) return
    setSaving(true)
    setStatusMsg('')
    try {
      const updateData = { full_name: formName }
      if (formBirthdate) updateData.birthdate = formBirthdate
      const { error } = await supabase.auth.updateUser({ data: updateData })
      if (error) throw error
      const fresh = await getUser()
      setUser(fresh)
      setStatusMsg('Profile saved')
    } catch (err) {
      setStatusMsg(err?.message || 'Save failed')
    } finally {
      setSaving(false)
      setTimeout(() => setStatusMsg(''), 3500)
    }
  }

  const birthdateMeta = user?.user_metadata?.birthdate || user?.user_metadata?.dob || null
  const age = calculateAge(formBirthdate || birthdateMeta)
  const usingTime = formatUsingTime(user?.created_at)

  const MOOD_WINDOW_MS = 24 * 60 * 60 * 1000
  const moodTsParsed = dailyMoodTs ? Date.parse(dailyMoodTs) : null
  const moodIsRecent = moodTsParsed && !isNaN(moodTsParsed) && (Date.now() - moodTsParsed) < MOOD_WINDOW_MS

  return (
    <div style={pageBgStyles.page}>
      <div style={{ ...pageBgStyles.orbBase, ...pageBgStyles.orbLeft }} />
      <div style={{ ...pageBgStyles.orbBase, ...pageBgStyles.orbRight }} />

      <section style={{ ...pageBgStyles.shell, maxWidth: 880, margin: '24px auto' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 12, border: '1px solid rgba(148,163,184,0.06)' }}>
          <h2 style={{ margin: 0, color: '#f59e0b' }}>Profile</h2>

          {/* Photo on top */}
          <div style={{ marginTop: 16, display: 'flex', gap: 16, alignItems: 'center', flexDirection: 'column' }}>
            <div style={{ width: 140, height: 140, borderRadius: 999, background: '#0b1220', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '3px solid rgba(245,158,11,0.12)' }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#f59e0b', fontSize: 48, fontWeight: 700 }}>{(formName || 'M').trim().charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
              <label style={{ display: 'block', color: '#cbd5e1', marginBottom: 8 }}>Upload a photo</label>
              <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
              {uploading && <p style={{ color: '#94a3b8', marginTop: 8 }}>Uploading...</p>}
              {statusMsg && <p style={{ color: statusMsg.includes('failed') ? '#fecaca' : '#86efac', marginTop: 8 }}>{statusMsg}</p>}
            </div>
          </div>

          {/* Editable form fields under photo */}
          <form onSubmit={handleSave} style={{ marginTop: 18, display: 'grid', gap: 12 }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>Name</div>
              <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Your name" style={{ width: '100%', marginTop: 6, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(148,163,184,0.08)', background: '#07102a', color: '#e2e8f0' }} />
            </div>

            <div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>Email (cannot be changed)</div>
              <input value={formEmail} readOnly style={{ width: '100%', marginTop: 6, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(148,163,184,0.04)', background: '#0b1220', color: '#94a3b8' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12 }}>
              <div>
                <div style={{ color: '#94a3b8', fontSize: 13 }}>Birthdate</div>
                <input type="date" value={formBirthdate} onChange={(e) => setFormBirthdate(e.target.value)} style={{ width: '100%', marginTop: 6, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(148,163,184,0.08)', background: '#07102a', color: '#e2e8f0' }} />
              </div>

              <div>
                <div style={{ color: '#94a3b8', fontSize: 13 }}>Age</div>
                <div style={{ color: '#e2e8f0', marginTop: 6 }}>{age ?? '—'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 6 }}>
              <button type="submit" disabled={saving} style={{ backgroundColor: '#f59e0b', color: '#041026', padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>
              {statusMsg && <div style={{ color: '#86efac' }}>{statusMsg}</div>}
              <div style={{ marginLeft: 'auto' }}>
                {moodIsRecent && dailyMood ? (
                  <div style={{ display: 'inline-block', background: 'linear-gradient(90deg,#f59e0b,#fb923c)', color: '#041026', padding: '6px 12px', borderRadius: 999, fontWeight: 700, boxShadow: '0 4px 12px rgba(245,158,11,0.15)' }}>
                    {dailyMood}
                  </div>
                ) : (
                  <div style={{ color: '#64748b', fontSize: 13 }}>No mood recorded in last 24h</div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 6, color: '#94a3b8' }}>{usingTime || ''}</div>
          </form>
        </div>
      </section>
    </div>
  )
}

export default Profile