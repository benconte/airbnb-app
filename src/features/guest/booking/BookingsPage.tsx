import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/hooks/useAuth'
import { api } from '../../../lib/api'
import { format } from 'date-fns'
import numeral from 'numeral'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '../../../shared/ui/badge'
import { Button } from '../../../shared/ui/button'
import { Textarea } from '../../../shared/ui/textarea'
import { Label } from '../../../shared/ui/label'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/ui/select'
import {
  HiOutlineCalendarDays,
  HiOutlineUsers,
  HiOutlineBanknotes,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2'
import { DisputeFormDialog } from '../../bookings/components/DisputeFormDialog'

const CANCELLATION_REASONS = [
  'Change of plans',
  'Found a better deal',
  'Travel dates changed',
  'Personal emergency',
  'Work conflict',
  'Health reasons',
  'Weather concerns',
  'Other',
]

// ── Cancellation Dialog ────────────────────────────────────────────────────────
interface CancelDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  onConfirm: (reason: string) => void
  isPending: boolean
}

function CancelBookingDialog({ open, onOpenChange, onConfirm, isPending }: CancelDialogProps) {
  const [reason, setReason] = useState('')
  const [customReason, setCustomReason] = useState('')

  const handleConfirm = () => {
    const finalReason = reason === 'Other' ? customReason.trim() : reason
    onConfirm(finalReason)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HiOutlineExclamationTriangle className="text-red-500 text-xl" />
            Cancel Booking
          </DialogTitle>
          <DialogDescription>
            Please tell us why you're cancelling so we can improve our service.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold">Reason for cancellation</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="rounded-xl cursor-pointer">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {CANCELLATION_REASONS.map((r) => (
                  <SelectItem key={r} value={r} className='cursor-pointer'>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {reason === 'Other' && (
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold">Please specify</Label>
              <Textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Describe your reason..."
                rows={3}
                className="resize-none rounded-xl"
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" className="rounded-full cursor-pointer" onClick={() => onOpenChange(false)}>
            Keep booking
          </Button>
          <Button
            variant="destructive"
            className="rounded-full cursor-pointer"
            onClick={handleConfirm}
            disabled={isPending || !reason || (reason === 'Other' && !customReason.trim())}
          >
            {isPending ? 'Cancelling...' : 'Yes, cancel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function BookingsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [cancelTarget, setCancelTarget] = useState<string | null>(null)
  const [disputeTarget, setDisputeTarget] = useState<string | null>(null)

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async () => {
      if (!user) return []
      const res = await api.get<{ data: { data: any } }>(`/api/v1/users/${user.id}/bookings`)
      console.log(res.data.data)
      return res.data?.data || res.data || []
    },
    enabled: !!user,
  })

  const { mutate: cancelBooking, isPending: isCancelling } = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      await api.delete(`/api/v1/bookings/${id}`, { data: { reason } })
    },
    onSuccess: () => {
      toast.success('Booking cancelled', {
        description: 'A confirmation email has been sent.',
      })
      setCancelTarget(null)
      queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] })
    },
    onError: () => {
      toast.error('Failed to cancel booking')
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff4a26]" />
      </div>
    )
  }

  const bookings = Array.isArray(bookingsData) ? bookingsData : []

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
          Your <span className="text-[#ff4a26] font-[caveat] text-4xl">Trips</span>
        </h1>
        <p className="text-gray-500 mt-2">Manage your upcoming and past adventures.</p>
      </div>

      {bookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200"
        >
          <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-[#ff4a26]">
            <HiOutlineCalendarDays className="text-2xl" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No trips booked... yet!</h3>
          <p className="text-gray-500 mt-1 max-w-sm mx-auto mb-6">
            Time to dust off your bags and start planning your next adventure.
          </p>
          <Link
            to="/listings"
            className="inline-flex items-center gap-2 bg-[#ff4a26] hover:bg-[#e03a18] text-white px-6 py-3 rounded-full font-bold transition-colors no-underline"
          >
            Start searching
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          <AnimatePresence>
            {bookings.map((booking: any) => {
              const isPast = new Date(booking.checkOut) < new Date()
              const isCancelled = booking.status === 'CANCELLED'
              const isConfirmed = booking.status === 'CONFIRMED'
              const canCancel = !isPast && !isCancelled
              const canDispute = (isConfirmed || isCancelled) && !isPast

              return (
                <motion.div
                  key={booking.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="flex flex-col md:flex-row gap-5 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Visual date panel */}
                  <div className="shrink-0 flex flex-col items-center justify-center w-full md:w-[130px] h-[130px] bg-linear-to-br from-[#fff4f2] to-white rounded-xl border border-[#ffd0c5]">
                    <span className="text-xs font-semibold text-[#ff4a26] uppercase tracking-wide">
                      {format(new Date(booking.checkIn), 'MMM')}
                    </span>
                    <span className="text-4xl font-extrabold text-gray-900 my-0.5">
                      {format(new Date(booking.checkIn), 'dd')}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {format(new Date(booking.checkIn), 'yyyy')}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col gap-3">
                    {/* Header row */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 m-0">
                          {booking.listing?.title || 'Listing unavailable'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {booking.listing?.location || 'Location unavailable'}
                        </p>
                      </div>
                      <Badge
                        variant={
                          isCancelled ? 'destructive'
                            : isPast ? 'secondary'
                              : isConfirmed ? 'success'
                                : 'warning'
                        }
                      >
                        {isCancelled ? 'Cancelled'
                          : isPast ? 'Past'
                            : isConfirmed ? 'Confirmed'
                              : 'Pending'}
                      </Badge>
                    </div>

                    {/* Cancellation reason */}
                    {isCancelled && booking.cancellationReason && (
                      <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs text-red-700">
                        <HiOutlineExclamationTriangle className="mt-0.5 shrink-0" />
                        <span><strong>Reason: </strong>{booking.cancellationReason}</span>
                      </div>
                    )}

                    {/* Details grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-xs text-gray-400 font-medium uppercase">
                          <HiOutlineCalendarDays className="text-sm" /> Check-out
                        </div>
                        <p className="text-sm font-semibold text-gray-800">
                          {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-xs text-gray-400 font-medium uppercase">
                          <HiOutlineUsers className="text-sm" /> Guests
                        </div>
                        <p className="text-sm font-semibold text-gray-800">
                          {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
                        </p>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-xs text-gray-400 font-medium uppercase">
                          <HiOutlineBanknotes className="text-sm" /> Total
                        </div>
                        <p className="text-sm font-bold text-[#ff4a26]">
                          {numeral(booking.totalPrice).format('$0,0.00')}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {canDispute && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer rounded-full border-amber-300 text-amber-700 hover:bg-amber-50 text-xs h-7 px-3"
                            onClick={() => setDisputeTarget(booking.id)}
                          >
                            Dispute
                          </Button>
                        )}
                        {canCancel && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer rounded-full border-red-200 text-red-600 hover:bg-red-50 text-xs h-7 px-3"
                            onClick={() => setCancelTarget(booking.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Cancel dialog */}
      <CancelBookingDialog
        open={!!cancelTarget}
        onOpenChange={(v) => !v && setCancelTarget(null)}
        isPending={isCancelling}
        onConfirm={(reason) => {
          if (cancelTarget) cancelBooking({ id: cancelTarget, reason })
        }}
      />

      {/* Dispute dialog */}
      {disputeTarget && (
        <DisputeFormDialog
          open={!!disputeTarget}
          onOpenChange={(v) => !v && setDisputeTarget(null)}
          bookingId={disputeTarget}
          role="GUEST"
        />
      )}
    </div>
  )
}
