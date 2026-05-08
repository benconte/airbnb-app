import { AuthLayout } from '../components/AuthLayout'
import { AuthInput } from '../components/AuthInput'
import { Divider } from '../components/Divider'
import { SocialButton } from '../components/SocialButton'
import { FaApple, FaGoogle } from 'react-icons/fa'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    }
  }

  return (
    <AuthLayout
      title={
        <>
          Effortlessly organize your <br />
          workspace with ease.
        </>
      }
      subtitle="It is a long established fact that a reader will be distracted by the readable
content of a page when looking at its layout."
      image="/static/images/login.png"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="space-y-6">
          <h1 className="text-4xl font-medium">
            Welcome back! Please
            <br />
            <span className="text-[#ff4a26] font-bold font-[caveat]">
              Sign in
            </span>{' '}
            in to continue.
          </h1>

          <p className="space-y-4 text-gray-700">
            Unlock a world of exclusive content, enjoy special offers,
            and be the first to dive into exciting news and updates by
            joining our community!
          </p>
        </div>

        <div className="space-y-4">
          <SocialButton
            dark
            text="Continue with Apple"
            icon={<FaApple />}
          />

          <SocialButton
            text="Continue with Google"
            icon={<FaGoogle />}
          />
        </div>

        <p className="space-y-4 text-gray-700">
          We won't post anything without your permission and your
          personal details are kept private
        </p>

        <Divider />

        <div className="space-y-4">
          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
          <AuthInput
            label="Email Address"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />

          <AuthInput
            label="Password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
            <input type="checkbox" className='cursor-pointer' />
            Remember me
          </label>

          <a
            href="/forgot"
            className="text-[#ff4a26] hover:underline"
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          className="w-full h-12 rounded-xl bg-[#ff4a26] text-white font-semibold hover:opacity-90 transition-opacity cursor-pointer"
        >
          Login
        </button>

        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <a
            href="/register"
            className="text-[#ff4a26] font-medium"
          >
            Sign up
          </a>
        </p>
      </form>
    </AuthLayout>
  )
}
