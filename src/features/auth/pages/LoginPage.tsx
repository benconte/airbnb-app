import { useNavigate } from 'react-router-dom'
import { LoginForm } from '../components/LoginForm'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = (email: string, password: string) => {
    login(email, password)
    navigate('/dashboard')
  }

  return (
    <main className="page-container page-pad">
      <LoginForm onLogin={handleLogin} />
    </main>
  )
}
