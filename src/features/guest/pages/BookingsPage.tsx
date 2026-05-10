import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/hooks/useAuth'
import { api } from '../../../lib/api'
import { format } from 'date-fns'
import numeral from 'numeral'
import { motion } from 'framer-motion'
import { Badge } from '../../../shared/ui/badge'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'

export function BookingsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async () => {
      if (!user) return []
      const res = await api.get(`/api/v1/users/${user.id}/bookings`)
      return res.data?.data || res.data || []
    },
    enabled: !!user,
  })

  const { mutate: cancelBooking, isPending: isCancelling } = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/bookings/${id}`)
    },
    onSuccess: () => {
      toast.success('Booking cancelled successfully')
      queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] })
    },
    onError: () => {
      toast.error('Failed to cancel booking')
    }
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff4a26]"></div>
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">No trips booked... yet!</h3>
          <p className="text-gray-500 mt-1 max-w-sm mx-auto mb-6">
            Time to dust off your bags and start planning your next adventure.
          </p>
          <Link to="/listings" className="inline-flex items-center gap-2 bg-[#ff4a26] hover:bg-[#e03a18] text-white px-6 py-3 rounded-full font-bold transition-colors no-underline">
            Start searching
          </Link>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking: any) => {
            const isPast = new Date(booking.checkOut) < new Date()
            const isCancelled = booking.status === 'CANCELLED'
            
            return (
              <motion.div 
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row gap-6 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Visual date representation */}
                <div className="shrink-0 flex flex-col items-center justify-center w-full md:w-[140px] h-[140px] bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                    {format(new Date(booking.checkIn), 'MMM')}
                  </span>
                  <span className="text-4xl font-extrabold text-gray-900 my-1">
                    {format(new Date(booking.checkIn), 'dd')}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {format(new Date(booking.checkIn), 'yyyy')}
                  </span>
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 m-0">
                      {booking.listing?.title || 'Listing name unavailable'}
                    </h3>
                    <Badge variant={isCancelled ? 'destructive' : isPast ? 'secondary' : 'default'}>
                      {isCancelled ? 'Cancelled' : isPast ? 'Past' : 'Upcoming'}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-4">
                    {booking.listing?.location || 'Location unavailable'}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-auto p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase mb-0.5">Check out</p>
                      <p className="font-semibold text-gray-800 text-sm">{format(new Date(booking.checkOut), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase mb-0.5">Guests</p>
                      <p className="font-semibold text-gray-800 text-sm">{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase mb-0.5">Total</p>
                      <p className="font-semibold text-[#ff4a26] text-sm">{numeral(booking.totalPrice).format('$0,0.00')}</p>
                    </div>
                    <div className="flex items-center justify-end">
                      {!isPast && !isCancelled && (
                        <button 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to cancel this booking?')) {
                              cancelBooking(booking.id)
                            }
                          }}
                          disabled={isCancelling}
                          className="text-sm font-semibold text-red-500 hover:text-red-700 hover:underline transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
