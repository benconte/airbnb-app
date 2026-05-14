import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../../lib/api'
import { toast } from 'sonner'
import { FieldGroup, Field, FieldLabel, FieldError } from '../../../../shared/ui/field'
import { Input } from '../../../../shared/ui/input'
import { useAuth } from '../../../auth/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const bookingSchema = z.object({
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  guests: z.number().min(1).max(10),
}).refine((data) => {
  if (data.checkIn && data.checkOut) {
    return new Date(data.checkIn) < new Date(data.checkOut)
  }
  return true
}, {
  message: 'Check-out date must be after check-in date',
  path: ['checkOut']
})

type BookingForm = z.infer<typeof bookingSchema>

interface Props {
  listingId: string
  price: number
  available: boolean
  availableFrom: string
}

export function BookingSidebar({ listingId, price, available, availableFrom }: Props) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { register, handleSubmit, formState: { errors }, control } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      checkIn: '',
      checkOut: '',
      guests: 1,
    }
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: BookingForm) => {
      const res = await api.post('/api/v1/bookings', {
        listingId,
        checkIn: new Date(data.checkIn).toISOString(),
        checkOut: new Date(data.checkOut).toISOString(),
        guests: data.guests,
      })
      return res
    },
    onSuccess: () => {
      toast.success('Booking request received!', {
        description: 'You will receive an email when approved.'
      })
      queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] })
      navigate('/trips')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to book listing')
    }
  })

  const onSubmit = (data: BookingForm) => {
    if (!user) {
      toast.error('Please login to book')
      navigate('/login')
      return
    }
    mutate(data)
  }

  return (
    <aside className="flex flex-col gap-5">
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-[17px] font-bold text-gray-900">
            Book a room{' '}
            <span className="text-[#ff4a26] font-[caveat] text-xl font-extrabold">online</span>
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-gray-900">${price}</span>
            <span className="text-xs text-gray-400">/night</span>
          </div>
        </div>

        {!available && (
          <div className="flex items-center gap-2 bg-orange-50 text-orange-700 text-xs font-medium px-6 py-2.5 border-b border-orange-100">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Available from{' '}
            {new Date(availableFrom).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 pb-4">
          <FieldGroup>
            <Field data-invalid={!!errors.checkIn}>
              <FieldLabel>Check-in</FieldLabel>
              <Input type="date" {...register('checkIn')} aria-invalid={!!errors.checkIn} />
              <FieldError errors={[{ message: errors.checkIn?.message }]} />
            </Field>

            <Field data-invalid={!!errors.checkOut}>
              <FieldLabel>Check-out</FieldLabel>
              <Input type="date" {...register('checkOut')} aria-invalid={!!errors.checkOut} />
              <FieldError errors={[{ message: errors.checkOut?.message }]} />
            </Field>

            <Field data-invalid={!!errors.guests}>
              <FieldLabel>Guests</FieldLabel>
              <Input type="number" min="1" max="10" {...register('guests', { valueAsNumber: true })} aria-invalid={!!errors.guests} />
              <FieldError errors={[{ message: errors.guests?.message }]} />
            </Field>
          </FieldGroup>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isPending}
              className={`cursor-pointer w-full py-3.5 rounded-xl text-white text-[15px] font-bold transition-colors ${isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#ff4a26] hover:bg-[#e03a18]'
                }`}
            >
              {isPending ? 'Processing...' : 'Reserve'}
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 pt-4">You won't be charged yet</p>
        </form>
      </div>
    </aside>
  )
}
