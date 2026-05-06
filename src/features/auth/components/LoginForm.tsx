import { useState, type FormEvent } from 'react'

type LoginFormProps = {
  onLogin: (email: string, password: string) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onLogin(email, password)
  }

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <h1>Login</h1>
      <input
        className="auth-input"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <input
        className="auth-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      <button className="auth-button" type="submit">
        Sign in
      </button>
    </form>
  )
}
