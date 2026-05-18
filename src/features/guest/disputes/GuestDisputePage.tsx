import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { HiArrowLeft, HiOutlineShieldExclamation } from 'react-icons/hi2'
import { Skeleton } from '../../../shared/ui/skeleton'
import { useMyDisputes, useEscalateDispute } from '../../disputes/useDisputeHooks'
import { DisputeListItem, DisputeStatusStrip, EscalateBanner, FileDisputeCTA } from '../../disputes/DisputeComponents'
import { DisputeThread } from '../../disputes/DisputeThread'
import type { Dispute, DisputeReason } from '../../disputes/types'
import { REASON_LABELS } from '../../disputes/types'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'

// ── Dispute detail panel ───────────────────────────────────────────────────────

function GuestDisputeDetailPanel({ dispute, onBack }: { dispute: Dispute; onBack: () => void }) {
  const { user } = useAuth()
  const escalate = useEscalateDispute()
  const canEscalate = dispute.status === 'OPEN' && dispute.reporterId === user?.id

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <HiArrowLeft className="text-gray-600" />
        </button>
        <div>
          <h2 className="text-base font-bold text-gray-900">{dispute.title}</h2>
          <p className="text-xs text-gray-400">{dispute.booking.listing.title} · {dispute.booking.listing.location}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Reason', value: REASON_LABELS[dispute.reason] },
          { label: 'Against', value: dispute.againstRole === 'HOST' ? 'Host' : 'Guest' },
          { label: 'Filed', value: format(new Date(dispute.createdAt), 'MMM d, yyyy') },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-xl px-3 py-2.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
          </div>
        ))}
      </div>

      {canEscalate && (
        <EscalateBanner
          onEscalate={() => escalate.mutate(dispute.id, {
            onSuccess: () => toast.success('Escalated to admin review.'),
            onError: (e) => toast.error(e.message),
          })}
          isLoading={escalate.isPending}
        />
      )}

      <DisputeThread dispute={dispute} currentUserId={user?.id ?? ''} />
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export function GuestDisputesPage() {
  const [page] = useState(1)
  const [selected, setSelected] = useState<Dispute | null>(null)
  const navigate = useNavigate()
  const { data, isLoading, isError } = useMyDisputes(page)
  const disputes = data?.data ?? []

  if (selected) {
    return (
      <div className="container max-w-3xl mx-auto w-full pb-10 px-4">
        <GuestDisputeDetailPanel dispute={selected} onBack={() => setSelected(null)} />
      </div>
    )
  }

  return (
    <div className="container space-y-6 max-w-[1200px] mx-auto w-full pb-10 px-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Disputes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.meta ? `${data.meta.total} dispute${data.meta.total !== 1 ? 's' : ''}` : 'Disputes you have filed against hosts'}
          </p>
        </div>
        <FileDisputeCTA onClick={() => navigate('/bookings')} />
      </div>

      {disputes.length > 0 && <DisputeStatusStrip disputes={disputes} />}

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
        <div className="text-center py-16 text-gray-400"><p>Failed to load disputes.</p></div>
      ) : disputes.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <HiOutlineShieldExclamation className="text-5xl mx-auto mb-3 text-gray-300" />
          <p className="font-semibold text-gray-500">No disputes filed yet</p>
          <p className="text-sm text-gray-400 mt-1">File a dispute from your Bookings page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {disputes.map(d => (
            <DisputeListItem key={d.id} dispute={d} onClick={() => setSelected(d)} />
          ))}
        </div>
      )}
    </div>
  )
}