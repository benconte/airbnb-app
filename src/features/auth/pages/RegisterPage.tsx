import { AuthLayout } from '../components/AuthLayout'
import { AuthInput } from '../components/AuthInput'
import { Divider } from '../components/Divider'
import { SocialButton } from '../components/SocialButton'
import { FaApple, FaGoogle } from 'react-icons/fa'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export function RegisterPage() {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      await register({ name, username, phone, email, password })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
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
      subtitle="It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. "
      image="/static/images/real-time-analytics.png"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-6">
          <h1 className='text-4xl font-medium'>
            Welcome back! Please<br />
            <span className="text-[#ff4a26] font-bold font-[caveat]">
              Sign up
            </span>{` `}in to continue.
          </h1>

          <p className='space-y-4 text-sm text-gray-700'>
            Unlock a world of exclusive content, enjoy special offers, and be the first to dive into exciting news and updates by joining our community!
          </p>
        </div>

        <div className="space-y-4">
          <SocialButton
            dark
            text="Sign up with Apple"
            icon={<FaApple />}
          />

          <SocialButton
            text="Sign up with Google"
            icon={<FaGoogle />}
          />
        </div>

        <p className="text-sm text-gray-500 leading-7">
          We won't post anything without your permission and
          your personal details are kept private
        </p>

        <Divider />

        <div className="space-y-4">
          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
          <AuthInput
            label="Full Name"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
          />
          <AuthInput
            label="Username"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
          />
          <AuthInput
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value)
            }
          />
          <AuthInput
            label="Enter Email"
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
          <AuthInput
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
          />
        </div>

        <label className="flex items-start gap-3 text-sm text-gray-600">
          <input
            type="checkbox"
            className="mt-1 rounded border-gray-300"
          />

          <span>
            By signing up, you agree to the{' '}
            <a
              href="/"
              className="underline hover:text-[#ff4a26]"
            >
              terms of service
            </a>
          </span>
        </label>

        <button type="submit" className="w-full h-12 rounded-xl bg-[#ff4a26] text-white font-semibold hover:opacity-90 transition-opacity">
          Sign Up
        </button>
        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <a
            href="/login"
            className="text-[#ff4a26] font-medium"
          >
            Sign in
          </a>
        </p>

      </form>
    </AuthLayout>
  )
}
