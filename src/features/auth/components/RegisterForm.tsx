import { AuthLayout } from '../components/AuthLayout'
import { AuthInput } from '../components/AuthInput'
import { Divider } from '../components/Divider'
import { SocialButton } from '../components/SocialButton'

export function RegisterPage() {
  return (
    <AuthLayout
      title={
        <>
          Effortlessly organize your <br />
          <span className="text-[#ff4a26] italic">
            workspace with ease.
          </span>
        </>
      }
      subtitle="Unlock a world of exclusive content, enjoy special offers, and be the first to dive into exciting news and updates by joining our community!"
      image="/static/images/real-time-analytics.png"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <SocialButton
            dark
            text="Sign up with Apple"
            icon={<span className="text-xl"></span>}
          />

          <SocialButton
            text="Sign up with Google"
            icon={<span className="font-bold">G</span>}
          />
        </div>

        <p className="text-sm text-gray-500 leading-7">
          We won't post anything without your permission and
          your personal details are kept private
        </p>

        <Divider />

        <div className="space-y-4">
          <AuthInput label="Full Name" />
          <AuthInput
            label="Enter Email"
            type="email"
          />
          <AuthInput
            label="Password"
            type="password"
          />
          <AuthInput
            label="Confirm Password"
            type="password"
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

        <button className="w-full h-12 rounded-xl bg-[#ff4a26] text-white font-semibold hover:opacity-90 transition-opacity">
          Sign Up
        </button>
      </div>
    </AuthLayout>
  )
}
