import { useMemo, useState, type PropsWithChildren } from 'react'
import { AuthContext } from './context'
import type { AuthContextValue } from '../types'

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      login: () => setIsAuthenticated(true),
      logout: () => setIsAuthenticated(false),
    }),
    [isAuthenticated],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
