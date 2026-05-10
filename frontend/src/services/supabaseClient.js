import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function signUpWithEmail(email, password) {
  return await supabase.auth.signUp({ email, password })
}

export async function signInWithEmail(email, password) {
  return await supabase.auth.signInWithPassword({ email, password })
}

export async function signInWithGoogle() {
  return await supabase.auth.signInWithOAuth({ provider: 'google' })
}

export async function getSession() {
  try {
    const { data } = await supabase.auth.getSession()
    return data?.session || null
  } catch (e) {
    return null
  }
}

export async function getUser() {
  try {
    const { data } = await supabase.auth.getUser()
    return data?.user || null
  } catch (e) {
    return null
  }
}

export default supabase
