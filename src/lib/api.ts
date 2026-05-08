// src/lib/api.ts — one shared fetch wrapper used by the whole app
const BASE_URL = import.meta.env.VITE_API_URL  // e.g. https://api.example.com

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (res.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  if (!res.ok) {
    // Parse the error body if the server sends one
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? `HTTP ${res.status}`)
  }

  return res.json()
}

// Convenience methods
export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
