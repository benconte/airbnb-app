import { useMemo, useState, useEffect, type PropsWithChildren } from 'react'
import { AuthContext } from './context'
import type { AuthContextValue, User, RegisterData } from '../types'
import { api } from '../../../lib/api'

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const userData = await api.get<User>('/api/v1/auth/me')
          setUser(userData)
          setIsAuthenticated(true)
        } catch (error) {
          localStorage.removeItem('token')
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.message ?? `HTTP ${res.status}`)
      }
      const data = (await res.json()) as { token: string; user: User }
      localStorage.setItem('token', data.token)
      setUser(data.user)
      setIsAuthenticated(true)
    } catch (error: any) {
      // Propagate error to caller without triggering global redirect
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    await api.post('/api/v1/auth/register', data)
    await login(data.email, data.password)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      user,
      login,
      register,
      logout,
    }),
    [isAuthenticated, user],
  )

  if (isLoading) {
    return null
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
