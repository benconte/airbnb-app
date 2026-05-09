import { AuthLayout } from '../components/AuthLayout'
import { AuthInput } from '../components/AuthInput'
import { Divider } from '../components/Divider'
import { SocialButton } from '../components/SocialButton'
import { FaApple, FaGoogle } from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Validation schema for registration
const registerSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  username: z.string().min(1, { message: 'Username is required' }),
  phone: z.string().min(1, { message: 'Phone is required' }),
  email: z.email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
})

type RegisterForm = z.infer<typeof registerSchema>

export function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser({
        name: data.name,
        username: data.username,
        phone: data.phone,
        email: data.email,
        password: data.password,
      })
      navigate('/dashboard')
    } catch (err: any) {
      // Show generic error toast if needed (could integrate toast library)
      console.error(err)
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-6">
          <h1 className='text-4xl font-medium'>
            Welcome back! Please<br />
            <span className="text-[#ff4a26] font-bold font-[caveat]">Sign up</span>{` `}in to continue.
          </h1>
          <p className='space-y-4 text-sm text-gray-700'>
            Unlock a world of exclusive content, enjoy special offers, and be the first to dive into exciting news and updates by joining our community!
          </p>
        </div>
        <div className="space-y-4">
          <SocialButton dark text="Sign up with Apple" icon={<FaApple />} />
          <SocialButton text="Sign up with Google" icon={<FaGoogle />} />
        </div>
        <p className="text-sm text-gray-500 leading-7">
          We won't post anything without your permission and your personal details are kept private
        </p>
        <Divider />
        <div className="space-y-4">
          <AuthInput label="Full Name" {...register('name')} error={errors.name?.message} />
          <AuthInput label="Username" {...register('username')} error={errors.username?.message} />
          <AuthInput label="Phone Number" type="tel" {...register('phone')} error={errors.phone?.message} />
          <AuthInput label="Enter Email" type="email" {...register('email')} error={errors.email?.message} />
          <AuthInput label="Password" type="password" {...register('password')} error={errors.password?.message} />
          <AuthInput label="Confirm Password" type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
        </div>
        <label className="flex items-start gap-3 text-sm text-gray-600">
          <input type="checkbox" className="mt-1 rounded border-gray-300" />
          <span className='cursor-pointer'>
            By signing up, you agree to the{' '}
            <a href="/" className="underline hover:text-[#ff4a26]">terms of service</a>
          </span>
        </label>
        <button type="submit" className="cursor-pointer w-full h-12 rounded-xl bg-[#ff4a26] text-white font-semibold hover:opacity-90 transition-opacity">
          Sign Up
        </button>
        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <a href="/login" className="text-[#ff4a26] font-medium">Sign in</a>
        </p>
      </form>
    </AuthLayout>
  )
}
