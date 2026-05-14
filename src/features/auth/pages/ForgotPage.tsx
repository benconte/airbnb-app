import { AuthLayout } from '../components/AuthLayout'
import { AuthInput } from '../components/AuthInput'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '../../../lib/api'
import { toast } from 'sonner'

// Zod schema for email validation
const forgotSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
})

type ForgotForm = z.infer<typeof forgotSchema>

export function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) })

  const onSubmit = async (data: ForgotForm) => {
    setLoading(true)
    try {
      await api.post('/api/v1/auth/forgot-password', { email: data.email })
      toast.success('Recovery email sent if the address exists.')
    } catch (err: any) {
      toast.error(err.message || 'Failed to send recovery email')
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
      image="/static/images/forgot-password.png"
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <h1 className="text-4xl font-medium">
            Password{' '}
            <span className="text-[#ff4a26] font-bold font-[caveat]">Reset</span>{' '}
          </h1>
          <p className="space-y-4 text-gray-700">
            Fill with your mail to receive instructions on how to reset your password.
          </p>
        </div>
        <div className="space-y-4">
          <AuthInput
            label="Email Address"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-[#ff4a26] text-white font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Reset Password'}
        </button>
        <p className="text-center text-sm text-gray-500">
          Remembered your password?{' '}
          <a href="/login" className="text-[#ff4a26] font-medium">
            Sign in
          </a>
        </p>
      </form>
    </AuthLayout>
  )
}
