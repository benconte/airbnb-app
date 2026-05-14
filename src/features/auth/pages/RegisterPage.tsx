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
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

// Validation schema for registration
const registerSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  username: z.string().min(1, { message: 'Username is required' }),
  phone: z.string().min(1, { message: 'Phone is required' }),
  email: z.email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string(),
  role: z.enum(['GUEST', 'HOST']),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
})

type RegisterForm = z.infer<typeof registerSchema>

import { useSearchParams } from 'react-router-dom'

export function RegisterPage() {
  const [searchParams] = useSearchParams()
  const initialRole = (searchParams.get('role') as 'GUEST' | 'HOST') || 'GUEST'

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ 
    resolver: zodResolver(registerSchema),
    defaultValues: { role: initialRole }
  })
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
        role: data.role,
      })
      toast.success('Registration successful')
      navigate('/')
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
        <div className="grid grid-cols-2 gap-4">
          <label className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center gap-2 transition-all ${watch('role') === 'GUEST' ? 'border-[#ff4a26] bg-[#ff4a26]/5' : 'border-gray-200 hover:border-gray-300'}`}>
            <input type="radio" value="GUEST" className="sr-only" {...register('role')} />
            <span className="font-semibold text-gray-900">I'm a Guest</span>
            <span className="text-xs text-gray-500 text-center">Looking for places to stay</span>
          </label>
          <label className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center gap-2 transition-all ${watch('role') === 'HOST' ? 'border-[#ff4a26] bg-[#ff4a26]/5' : 'border-gray-200 hover:border-gray-300'}`}>
            <input type="radio" value="HOST" className="sr-only" {...register('role')} />
            <span className="font-semibold text-gray-900">I'm a Host</span>
            <span className="text-xs text-gray-500 text-center">Want to list my property</span>
          </label>
        </div>
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
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex justify-center items-center cursor-pointer w-full h-12 rounded-xl bg-[#ff4a26] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin w-5 h-5 mr-2" />
              Signing up...
            </>
          ) : (
            'Sign Up'
          )}
        </button>
        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <a href="/login" className="text-[#ff4a26] font-medium">Sign in</a>
        </p>
      </form>
    </AuthLayout>
  )
}
