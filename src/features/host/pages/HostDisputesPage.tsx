import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import { format } from 'date-fns'
import {
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiChevronLeft,
  HiChevronRight,
} from 'react-icons/hi2'
import { Badge } from '../../../shared/ui/badge'
import { Button } from '../../../shared/ui/button'
import { Skeleton } from '../../../shared/ui/skeleton'

type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED'

interface Dispute {
  id: string
  title: string
  description: string
  reason: string
  status: DisputeStatus
  resolution: string | null
  againstRole: string
  createdAt: string
  booking: {
    listing: { title: string; location: string }
    guest: { name: string; email: string }
  }
}

const STATUS_CONFIG: Record<DisputeStatus, { label: string; icon: React.ElementType; variant: 'default' | 'warning' | 'success' | 'secondary' | 'destructive' }> = {
  OPEN: { label: 'Open', icon: HiOutlineExclamationTriangle, variant: 'warning' },
  UNDER_REVIEW: { label: 'Under Review', icon: HiOutlineClock, variant: 'default' },
  RESOLVED: { label: 'Resolved', icon: HiOutlineCheckCircle, variant: 'success' },
  DISMISSED: { label: 'Dismissed', icon: HiOutlineXCircle, variant: 'secondary' },
}

function DisputeCard({ dispute }: { dispute: Dispute }) {
  const cfg = STATUS_CONFIG[dispute.status]
  const Icon = cfg.icon
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 truncate">{dispute.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {dispute.booking.listing.title} · {dispute.booking.listing.location}
          </p>
        </div>
        <Badge variant={cfg.variant} className="flex items-center gap-1 shrink-0">
          <Icon className="text-xs" /> {cfg.label}
        </Badge>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 flex-wrap">
        <span>
          Reason: <strong className="text-gray-700">{dispute.reason.replace(/_/g, ' ')}</strong>
        </span>
        <span>
          Against: <strong className="text-gray-700">{dispute.againstRole}</strong>
        </span>
        <span>Filed {format(new Date(dispute.createdAt), 'MMM d, yyyy')}</span>
      </div>

      {expanded && (
        <div className="mt-3 flex flex-col gap-3">
          <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-3 border border-gray-100">
            {dispute.description}
          </p>
          {dispute.resolution && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
              <p className="text-xs font-semibold text-emerald-700 mb-1">Admin Resolution</p>
              <p className="text-sm text-emerald-800">{dispute.resolution}</p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setExpanded((p) => !p)}
        className="mt-2 text-xs text-[#ff4a26] font-semibold hover:underline cursor-pointer"
      >
        {expanded ? 'Show less ↑' : 'View details ↓'}
      </button>
    </div>
  )
}

export function HostDisputesPage() {
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, isError } = useQuery<{ data: Dispute[]; meta: { page: number; totalPages: number; total: number } }>({
    queryKey: ['my-disputes', page],
    queryFn: () => api.get(`/api/v1/disputes/me?page=${page}&limit=${limit}`),
    placeholderData: (prev) => prev,
  })

  const disputes = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Disputes</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {meta ? `${meta.total} dispute${meta.total !== 1 ? 's' : ''} filed` : 'Disputes you have filed against guests'}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2 mb-4" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 text-gray-400">
          <p className="font-medium">Failed to load disputes</p>
        </div>
      ) : disputes.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <HiOutlineExclamationTriangle className="text-5xl mx-auto mb-3 text-gray-300" />
          <p className="font-semibold text-gray-500">No disputes filed yet</p>
          <p className="text-sm text-gray-400 mt-1">
            You can file a dispute from the Bookings page against a guest.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {disputes.map((d) => (
            <DisputeCard key={d.id} dispute={d} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {meta.page} of {meta.totalPages} · {meta.total} disputes
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <HiChevronLeft className="mr-1" /> Prev
            </Button>
            <Button variant="outline" size="sm" className="rounded-full" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
              Next <HiChevronRight className="ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
