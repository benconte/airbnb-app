import { AuthLayout } from '../components/AuthLayout'
import { AuthInput } from '../components/AuthInput'
import { useState } from 'react'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm_password, setConfirmPassword] = useState('')

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
      image="/static/images/forgot-password.png"
    >
      <form
        className="space-y-6"
      >
        <div className="space-y-6">
          <h1 className="text-4xl font-medium">
            Password{' '}
            <span className="text-[#ff4a26] font-bold font-[caveat]">
              Reset
            </span>{' '}
          </h1>

          <p className="space-y-4 text-gray-700">
            Fill with your mail to receive instructions on how to reset your password.
          </p>
        </div>

        <div className="space-y-4">
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

          <AuthInput
            label="Confirm Password"
            type="password"
            value={confirm_password}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
          />
        </div>

        <button
          type="submit"
          className="w-full h-12 rounded-xl bg-[#ff4a26] text-white font-semibold hover:opacity-90 transition-opacity cursor-pointer"
        >
          Reset Password
        </button>

        <p className="text-center text-sm text-gray-500">
          Remembered your password?{' '}
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

