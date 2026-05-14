export type User = {
  id: string
  email: string
  name: string
  username: string
  phone: string
  role: string
}

export type RegisterData = {
  name: string
  email: string
  username: string
  password: string
  phone: string
  role?: 'GUEST' | 'HOST'
}

export type AuthContextValue = {
  isAuthenticated: boolean
  user: User | null
  login: (email: string, password: string) => Promise<User>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}
