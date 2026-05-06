export type AuthContextValue = {
  isAuthenticated: boolean
  login: (email: string, password: string) => void
  logout: () => void
}
