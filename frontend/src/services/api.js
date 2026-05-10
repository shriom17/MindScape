import supabase from './supabaseClient'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000').replace(/\/$/, '')

export const apiUrl = path => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`

export async function fetchJson(path, options = {}) {
	const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }

	try {
		const { data } = await supabase.auth.getSession()
		const token = data?.session?.access_token
		if (token) {
			headers['Authorization'] = `Bearer ${token}`
		}
	} catch (e) {
		// ignore session errors
	}

	const response = await fetch(apiUrl(path), {
		...options,
		headers,
	})

	const payload = await response.json().catch(() => ({}))
	if (!response.ok) {
		const message = payload?.error || payload?.message || 'Request failed'
		throw new Error(message)
	}
	return payload
}

