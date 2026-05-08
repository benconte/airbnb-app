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
          const userData = await api.get<User>('/auth/me')
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
    const data = await api.post<{ token: string; user: User }>('/api/v1/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    setUser(data.user)
    setIsAuthenticated(true)
  }

  const register = async (data: RegisterData) => {
    await api.post('/auth/register', data)
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
