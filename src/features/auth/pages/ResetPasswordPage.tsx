import { AuthLayout } from '../components/AuthLayout'
import { AuthInput } from '../components/AuthInput'
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '../../../lib/api'
import { toast } from 'react-hot-toast'

// Zod schema for password reset
const resetSchema = z.object({
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
})

type ResetForm = z.infer<typeof resetSchema>

export function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({ resolver: zodResolver(resetSchema) })

  const onSubmit = async (data: ResetForm) => {
    setLoading(true)
    try {
      await api.post(`/api/v1/auth/reset-password/${token}`, { token, newPassword: data.password })
      toast.success('Password reset successful')
      navigate('/login')
    } catch (err: any) {
      console.log(err.error)
      toast.error(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title={
        <>
          Set your <br />
          new password
        </>
      }
      subtitle="Enter a new password for your account."
      image="/static/images/reset-password.png"
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <AuthInput
            label="New Password"
            type="password"
            {...register('password')}
            error={errors.password?.message}
          />
          <AuthInput
            label="Confirm Password"
            type="password"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-[#ff4a26] text-white font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </AuthLayout>
  )
}
