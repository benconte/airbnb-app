import { useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../../lib/api'
import { toast } from 'sonner'
import { useAuth } from '../../../auth/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import type { ListingPricing } from '../types'
import { Button } from '../../../../shared/ui/button'
import { Input } from '../../../../shared/ui/input'
import { Label } from '../../../../shared/ui/label'
import { Separator } from '../../../../shared/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../shared/ui/select'
import { Badge } from '../../../../shared/ui/badge'
import { differenceInCalendarDays } from 'date-fns'

const SERVICE_FEE_PCT = 0.14 // 14%
const CLEANING_FEE_THRESHOLD_NIGHTS = 1 // only add cleaning fee for multi-night stays

const bookingSchema = z.object({
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  guests: z.number().min(1).max(16),
  pricingId: z.string().optional(),
}).refine((data) => {
  if (data.checkIn && data.checkOut) {
    return new Date(data.checkIn) < new Date(data.checkOut)
  }
  return true
}, {
  message: 'Check-out must be after check-in',
  path: ['checkOut'],
})

type BookingForm = z.infer<typeof bookingSchema>

interface Props {
  listingId: string
  price: number          // base price per night
  available: boolean
  availableFrom: string
  maxGuests?: number
}

export function BookingSidebar({ listingId, price, available, availableFrom, maxGuests = 10 }: Props) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch pricing tiers
  const { data: pricings } = useQuery<ListingPricing[]>({
    queryKey: ['listing-pricings', listingId],
    queryFn: () => api.get(`/api/v1/listings/${listingId}/pricings`),
    staleTime: 5 * 60 * 1000,
  })

  const hasTiers = pricings && pricings.length > 0

  const { register, handleSubmit, formState: { errors }, control, watch } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      checkIn: '',
      checkOut: '',
      guests: 1,
      pricingId: '',
    },
  })

  const watchCheckIn = watch('checkIn')
  const watchCheckOut = watch('checkOut')
  const watchPricingId = watch('pricingId')

  // Calculate the nightly rate to use
  const selectedTier = useMemo(
    () => hasTiers && watchPricingId
      ? pricings!.find((p) => p.id === watchPricingId)
      : null,
    [hasTiers, watchPricingId, pricings],
  )
  const nightlyRate = selectedTier?.price ?? price

  // Price breakdown
  const breakdown = useMemo(() => {
    if (!watchCheckIn || !watchCheckOut) return null
    const nights = differenceInCalendarDays(new Date(watchCheckOut), new Date(watchCheckIn))
    if (nights <= 0) return null
    const roomTotal = nightlyRate * nights
    const cleaningFee = nights > CLEANING_FEE_THRESHOLD_NIGHTS ? Math.round(nightlyRate * 0.12) : 0
    const serviceFee = Math.round(roomTotal * SERVICE_FEE_PCT)
    const total = roomTotal + cleaningFee + serviceFee
    return { nights, nightlyRate, roomTotal, cleaningFee, serviceFee, total }
  }, [watchCheckIn, watchCheckOut, nightlyRate])

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
      toast.success('Booking request submitted!', {
        description: 'You\'ll receive an email when the host approves.',
      })
      queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] })
      navigate('/trips')
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create booking')
    },
  })

  const onSubmit = (data: BookingForm) => {
    if (!user) {
      toast.error('Please log in to book')
      navigate('/login')
      return
    }
    mutate(data)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <aside className="flex flex-col gap-4">
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-linear-to-r from-[#fff4f2] to-white">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Starting from</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-gray-900">${price}</span>
              <span className="text-xs text-gray-400">/night</span>
            </div>
          </div>
          {!available && (
            <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 text-xs">
              Available {new Date(availableFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Badge>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 flex flex-col gap-4">
          {/* Pricing tier selector */}
          {hasTiers && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Room / Package</Label>
              <Controller
                name="pricingId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-10 rounded-xl border-gray-200 text-sm cursor-pointer w-full overflow-hidden">
                      <SelectValue placeholder="Standard rate" className='w-full' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard rate (${price}/night)</SelectItem>
                      {pricings!.map((tier) => (
                        <SelectItem key={tier.id} value={tier.id}>
                          {tier.name} — ${tier.price}/night
                          {tier.badge && (
                            <span className="ml-1 text-[10px] text-gray-400">({tier.badge.replace('_', ' ')})</span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Check-in</Label>
              <Input
                type="date"
                min={today}
                {...register('checkIn')}
                className="cursor-pointer h-10 rounded-xl border-gray-200 text-sm"
              />
              {errors.checkIn && (
                <p className="text-[11px] text-red-500">{errors.checkIn.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Check-out</Label>
              <Input
                type="date"
                min={watchCheckIn || today}
                {...register('checkOut')}
                className="h-10 rounded-xl border-gray-200 text-sm"
              />
              {errors.checkOut && (
                <p className="text-[11px] text-red-500">{errors.checkOut.message}</p>
              )}
            </div>
          </div>

          {/* Guests */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Guests</Label>
            <Input
              type="number"
              min={1}
              max={maxGuests}
              {...register('guests', { valueAsNumber: true })}
              className="h-10 rounded-xl border-gray-200 text-sm"
            />
            {errors.guests && (
              <p className="text-[11px] text-red-500">{errors.guests.message}</p>
            )}
          </div>

          {/* Price breakdown */}
          {breakdown && (
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2.5 text-sm border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  ${breakdown.nightlyRate.toFixed(2)} × {breakdown.nights} night{breakdown.nights !== 1 ? 's' : ''}
                </span>
                <span className="font-semibold text-gray-900">${breakdown.roomTotal.toFixed(2)}</span>
              </div>
              {breakdown.cleaningFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Cleaning fee</span>
                  <span className="font-semibold text-gray-900">${breakdown.cleaningFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Service fee (14%)</span>
                <span className="font-semibold text-gray-900">${breakdown.serviceFee.toFixed(2)}</span>
              </div>
              <Separator className="my-0.5" />
              <div className="flex justify-between">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-extrabold text-[#ff4a26] text-base">${breakdown.total.toFixed(2)}</span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending || !available}
            className="w-full h-12 rounded-xl bg-[#ff4a26] hover:bg-[#e03a18] text-white font-bold text-[15px] transition-colors"
          >
            {isPending ? 'Processing...' : available ? 'Reserve' : 'Not available'}
          </Button>

          <p className="text-center text-[11px] text-gray-400">
            You won't be charged yet — booking is subject to host approval.
          </p>
        </form>
      </div>
    </aside>
  )
}
