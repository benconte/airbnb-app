import { useState } from 'react'
import { toast } from 'sonner'
import {
  HiOutlineCalendarDays,
  HiOutlineMagnifyingGlass,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineFunnel,
} from 'react-icons/hi2'
import { useAdminBookings, useAdminUpdateBookingStatus } from '../hooks/useAdminData'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/dialog'
import type { AdminBooking, BookingStatus } from '../types/admin'

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: BookingStatus[] = ['PENDING', 'CONFIRMED', 'CANCELLED']

const statusConfig = {
  CONFIRMED: { label: 'Confirmed', className: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: HiOutlineCheckCircle },
  PENDING: { label: 'Pending', className: 'bg-amber-50 text-amber-600 border-amber-200', icon: HiOutlineClock },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-50 text-red-500 border-red-200', icon: HiOutlineXCircle },
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Status Modal ──────────────────────────────────────────────────────────────

function StatusUpdateModal({
  booking,
  onClose,
}: {
  booking: AdminBooking
  onClose: () => void
}) {
  const [status, setStatus] = useState<BookingStatus>(booking.status)
  const updateMutation = useAdminUpdateBookingStatus()

  const handleSave = () => {
    updateMutation.mutate({ id: booking.id, status }, {
      onSuccess: () => {
        toast.success('Booking status updated.')
        onClose()
      },
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <DialogContent className="rounded-2xl max-w-md">
      <DialogHeader>
        <DialogTitle className="text-lg font-bold text-gray-900">Update Booking Status</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Booking Info */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-3">
            {booking.guest.avatar ? (
              <img src={booking.guest.avatar} alt={booking.guest.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#ff4a26]/10 text-[#ff4a26] flex items-center justify-center font-bold text-sm">
                {booking.guest.name[0]}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">{booking.guest.name}</p>
              <p className="text-xs text-gray-400">{booking.guest.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-400">Listing</p>
              <p className="font-medium text-gray-900">{booking.listing.title}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total</p>
              <p className="font-bold text-[#ff4a26]">{fmtCurrency(booking.totalPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Check In</p>
              <p className="font-medium text-gray-900">{fmtDate(booking.checkIn)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Check Out</p>
              <p className="font-medium text-gray-900">{fmtDate(booking.checkOut)}</p>
            </div>
          </div>
        </div>

        {/* Status selector */}
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">New Status</label>
          <div className="grid grid-cols-3 gap-2">
            {STATUS_OPTIONS.map(s => {
              const cfg = statusConfig[s]
              const Icon = cfg.icon
              return (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${status === s ? cfg.className + ' border-current shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                  <Icon className="text-xl" />
                  <span className="text-xs font-semibold">{cfg.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2 mt-4">
        <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending || status === booking.status}
          className="bg-[#ff4a26] hover:bg-[#e03e1e] text-white rounded-xl"
        >
          {updateMutation.isPending ? 'Saving…' : 'Update Status'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function AdminBookingsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('')
  const [editTarget, setEditTarget] = useState<AdminBooking | null>(null)

  const { data, isLoading } = useAdminBookings(page, 10, statusFilter || undefined)

  const filtered = data?.data.filter(b =>
    search === '' ||
    b.guest.name.toLowerCase().includes(search.toLowerCase()) ||
    b.guest.email.toLowerCase().includes(search.toLowerCase()) ||
    b.listing.title.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const totalPages = data?.meta.totalPages ?? 1

  const statusCounts = STATUS_OPTIONS.map(s => ({
    status: s,
    count: data?.data.filter(b => b.status === s).length ?? 0,
    cfg: statusConfig[s],
  }))

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pb-10">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <HiOutlineCalendarDays className="text-base" />
          <span>Bookings Management</span>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">All Bookings</h1>
        <p className="text-gray-400 text-sm mt-0.5">{data?.meta.total ?? 0} total bookings</p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-4">
        {statusCounts.map(({ status, count, cfg }) => {
          const Icon = cfg.icon
          return (
            <button
              key={status}
              onClick={() => { setStatusFilter(statusFilter === status ? '' : status); setPage(1) }}
              className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${statusFilter === status ? `${cfg.className} border-current shadow-md` : 'bg-white border-gray-100 hover:bg-gray-50'}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm ${statusFilter === status ? 'text-current' : 'text-gray-400'}`}>
                <Icon className="text-2xl" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{cfg.label}</p>
                <p className="text-2xl font-extrabold text-gray-900">{count}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
              <input
                type="text"
                placeholder="Search by guest name, email, or listing…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4a26]/20 focus:border-[#ff4a26] focus:bg-white transition-all"
              />
            </div>
            <div className="relative">
              <HiOutlineFunnel className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none" />
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value as BookingStatus | ''); setPage(1) }}
                className="pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4a26]/20 focus:border-[#ff4a26] appearance-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="pb-0 px-6 pt-5">
          <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
            <div className="w-1 h-5 bg-[#ff4a26] rounded-full" />
            Bookings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100 bg-gray-50/60">
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider pl-6">#</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Guest</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Listing</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Check In</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Check Out</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Total</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i} className="border-gray-100">
                      {Array.from({ length: 8 }).map((__, j) => (
                        <TableCell key={j}><div className="h-4 bg-gray-100 rounded animate-pulse w-20" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                  : filtered.length === 0
                    ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-16 text-gray-400">
                          <HiOutlineCalendarDays className="text-4xl mx-auto mb-2 opacity-30" />
                          No bookings found
                        </TableCell>
                      </TableRow>
                    )
                    : filtered.map((b, idx) => {
                      const cfg = statusConfig[b.status]
                      const Icon = cfg.icon
                      return (
                        <TableRow key={b.id} className="border-gray-100 hover:bg-gray-50/60 transition-colors">
                          <TableCell className="pl-6 text-gray-400 text-sm font-medium">
                            {String((page - 1) * 10 + idx + 1).padStart(2, '0')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {b.guest.avatar ? (
                                <img src={b.guest.avatar} alt={b.guest.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-[#ff4a26]/10 text-[#ff4a26] flex items-center justify-center font-bold text-xs shrink-0">
                                  {b.guest.name[0]}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{b.guest.name}</p>
                                <p className="text-xs text-gray-400">{b.guest.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm font-medium text-gray-800 max-w-[160px] truncate">{b.listing.title}</p>
                            <p className="text-xs text-gray-400">{b.listing.location}</p>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{fmtDate(b.checkIn)}</TableCell>
                          <TableCell className="text-sm text-gray-600">{fmtDate(b.checkOut)}</TableCell>
                          <TableCell className="text-sm font-bold text-gray-900">{fmtCurrency(b.totalPrice)}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>
                              <Icon className="text-xs" /> {cfg.label}
                            </span>
                          </TableCell>
                          <TableCell className="pr-6 text-right">
                            <button
                              onClick={() => setEditTarget(b)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ff4a26]/10 text-[#ff4a26] hover:bg-[#ff4a26]/20 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Update
                            </button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                }
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, data.meta.total)} of {data.meta.total} bookings
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <HiChevronLeft className="text-sm" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${page === i + 1 ? 'bg-[#ff4a26] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <HiChevronRight className="text-sm" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Status Dialog */}
      {editTarget && (
        <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
          <StatusUpdateModal booking={editTarget} onClose={() => setEditTarget(null)} />
        </Dialog>
      )}
    </div>
  )
}
