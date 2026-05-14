import { AuthLayout } from '../components/AuthLayout'
import { AuthInput } from '../components/AuthInput'
import { Divider } from '../components/Divider'
import { SocialButton } from '../components/SocialButton'
import { FaApple, FaGoogle } from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Spinner } from '../../../shared/components/Spinner'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'sonner'

// Validation schema for login
const loginSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      const loggedInUser = await login(data.email, data.password)
      const role = loggedInUser?.role?.toUpperCase()
      toast.success(`Welcome ${loggedInUser.name}, you're now logged in`)
      if (role === 'ADMIN') {
        navigate('/admin')
      } else if (role === 'HOST') {
        navigate('/dashboard')
      } else {
        navigate('/')
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed')
      console.error(err)
    } finally {
      setLoading(false)
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
      subtitle="It is a long established fact that a reader will be distracted by the readable\ncontent of a page when looking at its layout."
      image="/static/images/login.png"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          <h1 className="text-4xl font-medium">
            Welcome back! Please<br />
            <span className="text-[#ff4a26] font-bold font-[caveat]">Sign in</span>{' '}in to continue.
          </h1>
          <p className="space-y-4 text-gray-700">
            Unlock a world of exclusive content, enjoy special offers, and be the first to dive into exciting news and updates by joining our community!
          </p>
        </div>
        <div className="space-y-4">
          <SocialButton dark text="Continue with Apple" icon={<FaApple />} />
          <SocialButton text="Continue with Google" icon={<FaGoogle />} />
        </div>
        <p className="space-y-4 text-gray-700">
          We won't post anything without your permission and your personal details are kept private
        </p>
        <Divider />
        <div className="space-y-4">
          <AuthInput label="Email Address" type="email" {...register('email')} error={errors.email?.message} />
          <AuthInput label="Password" type="password" {...register('password')} error={errors.password?.message} />
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
            <input type="checkbox" className='cursor-pointer' />
            Remember me
          </label>
          <a href="/forgot" className="text-[#ff4a26] hover:underline">Forgot password?</a>
        </div>
        <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-[#ff4a26] text-white font-semibold hover:opacity-90 transition-opacity cursor-pointer">
          {loading ? <Spinner /> : 'Login'}
        </button>
        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account? <a href="/register" className="text-[#ff4a26] font-medium">Sign up</a>
        </p>
      </form>
    </AuthLayout>
  )
}
