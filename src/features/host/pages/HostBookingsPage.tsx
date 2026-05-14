import { useState } from 'react'
import { toast } from 'sonner'
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineCalendarDays,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineFunnel,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2'
import { useHostBookings, useUpdateBookingStatus } from '../hooks/useHostData'
import { Button } from '../../../shared/ui/button'
import { DisputeFormDialog } from '../../bookings/components/DisputeFormDialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../shared/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/ui/select'
import type { BookingStatus, HostBooking } from '../types/host'

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function nightsBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24))
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const configs: Record<BookingStatus, { label: string; icon: React.ElementType; className: string }> = {
    CONFIRMED: { label: 'Confirmed', icon: HiOutlineCheckCircle, className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    PENDING: { label: 'Pending', icon: HiOutlineClock, className: 'bg-amber-100 text-amber-700 border-amber-200' },
    CANCELLED: { label: 'Cancelled', icon: HiOutlineXCircle, className: 'bg-red-100 text-red-700 border-red-200' },
  }
  const cfg = configs[status]
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>
      <Icon className="text-xs" /> {cfg.label}
    </span>
  )
}

// ── Booking Actions ───────────────────────────────────────────────────────────

function BookingActions({ booking }: { booking: HostBooking }) {
  const updateStatus = useUpdateBookingStatus()
  const [disputeOpen, setDisputeOpen] = useState(false)

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate(
      { id: booking.id, status: newStatus },
      {
        onSuccess: () => toast.success(`Booking ${newStatus.toLowerCase()} successfully`),
        onError: (err) => toast.error(err.message ?? 'Failed to update booking'),
      },
    )
  }

  if (booking.status === 'CANCELLED') {
    return <span className="text-xs text-gray-400">No actions</span>
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {booking.status === 'PENDING' && (
          <Button
            size="sm"
            className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-3"
            onClick={() => handleStatusChange('CONFIRMED')}
            disabled={updateStatus.isPending}
          >
            Confirm
          </Button>
        )}
        {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full border-red-200 text-red-600 hover:bg-red-50 text-xs h-7 px-3"
            onClick={() => handleStatusChange('CANCELLED')}
            disabled={updateStatus.isPending}
          >
            Cancel
          </Button>
        )}
        {booking.status === 'CONFIRMED' && (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full border-amber-200 text-amber-700 hover:bg-amber-50 text-xs h-7 px-3"
            onClick={() => setDisputeOpen(true)}
          >
            <HiOutlineExclamationTriangle className="mr-1 text-xs" />
            Dispute
          </Button>
        )}
      </div>

      <DisputeFormDialog
        open={disputeOpen}
        onOpenChange={setDisputeOpen}
        bookingId={booking.id}
        role="HOST"
      />
    </>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function HostBookingsPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const { data, isLoading, isError } = useHostBookings(
    page,
    10,
    statusFilter === 'ALL' ? undefined : statusFilter,
  )

  const bookings = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pb-10">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {meta ? `${meta.total} booking${meta.total !== 1 ? 's' : ''}` : 'Manage guest bookings'}
          </p>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <HiOutlineFunnel className="text-gray-400 text-lg shrink-0" />
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
            <SelectTrigger className="w-40 rounded-full border-gray-200 text-sm h-9">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Summary Pills ── */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'All', value: 'ALL', icon: HiOutlineCalendarDays, color: 'bg-gray-100 text-gray-700' },
          { label: 'Pending', value: 'PENDING', icon: HiOutlineClock, color: 'bg-amber-100 text-amber-700' },
          { label: 'Confirmed', value: 'CONFIRMED', icon: HiOutlineCheckCircle, color: 'bg-emerald-100 text-emerald-700' },
          { label: 'Cancelled', value: 'CANCELLED', icon: HiOutlineXCircle, color: 'bg-red-100 text-red-700' },
        ].map((pill) => {
          const Icon = pill.icon
          const isActive = statusFilter === pill.value
          return (
            <button
              key={pill.value}
              onClick={() => { setStatusFilter(pill.value); setPage(1) }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${isActive
                  ? `${pill.color} border-transparent shadow-sm`
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
            >
              <Icon className="text-base" /> {pill.label}
            </button>
          )
        })}
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-gray-400">
            <p className="font-medium">Failed to load bookings</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <HiOutlineCalendarDays className="text-6xl mx-auto mb-4 text-gray-200" />
            <p className="text-gray-500 font-semibold text-lg">No bookings found</p>
            <p className="text-gray-400 text-sm mt-1">
              {statusFilter !== 'ALL' ? `No ${statusFilter.toLowerCase()} bookings` : 'Guests haven\'t booked your listings yet'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80">
                <TableHead className="pl-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Guest</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Listing</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Check-in</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Check-out</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Nights</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Total</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Status</TableHead>
                <TableHead className="pr-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id} className="hover:bg-gray-50/60 transition-colors">

                  {/* Guest */}
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      {booking.guest.avatar ? (
                        <img
                          src={booking.guest.avatar}
                          alt={booking.guest.name}
                          className="w-9 h-9 rounded-full object-cover border border-gray-100 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#ff4a26]/10 text-[#ff4a26] flex items-center justify-center font-bold text-sm shrink-0">
                          {booking.guest.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate max-w-[140px]">{booking.guest.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[140px]">{booking.guest.email}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Listing */}
                  <TableCell>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate max-w-[180px]">{booking.listing.title}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[180px]">{booking.listing.location}</p>
                    </div>
                  </TableCell>

                  {/* Check-in */}
                  <TableCell>
                    <span className="text-sm text-gray-700 font-medium">{fmtDate(booking.checkIn)}</span>
                  </TableCell>

                  {/* Check-out */}
                  <TableCell>
                    <span className="text-sm text-gray-700 font-medium">{fmtDate(booking.checkOut)}</span>
                  </TableCell>

                  {/* Nights */}
                  <TableCell>
                    <span className="text-sm font-semibold text-gray-900">
                      {nightsBetween(booking.checkIn, booking.checkOut)} nights
                    </span>
                  </TableCell>

                  {/* Total */}
                  <TableCell>
                    <span className="text-sm font-bold text-gray-900">{fmtCurrency(booking.totalPrice)}</span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <StatusBadge status={booking.status} />
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="pr-6 text-right">
                    <BookingActions booking={booking} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* ── Pagination ── */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {meta.page} of {meta.totalPages} · {meta.total} bookings
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              <HiChevronLeft className="mr-1" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={page >= meta.totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next <HiChevronRight className="ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
