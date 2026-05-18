import { format } from 'date-fns'
import {
  HiOutlineShieldExclamation,
  HiOutlineChevronRight,
  HiOutlineArrowTrendingUp,
  HiOutlinePlus,
} from 'react-icons/hi2'
import type { Dispute } from './types'
import { STATUS_CONFIG, REASON_LABELS } from './types'

// ── DisputeCard — list item that navigates into thread ─────────────────────────

export function DisputeListItem({ dispute, onClick }: { dispute: Dispute; onClick: () => void }) {
  const cfg = STATUS_CONFIG[dispute.status]
  const msgCount = dispute.messages?.length ?? 0

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-[#ff4a26]/20 transition-all group"
    >
      <div className="flex items-start gap-3">
        {/* Status dot */}
        <div className="mt-1 shrink-0 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.dot }} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-sm font-bold text-gray-900 truncate">{dispute.title}</h3>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${cfg.className}`}>
              {cfg.label}
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-2 truncate">
            {dispute.booking.listing.title} · {dispute.booking.listing.location}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
            <span className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
              {REASON_LABELS[dispute.reason]}
            </span>
            <span>Filed {format(new Date(dispute.createdAt), 'MMM d, yyyy')}</span>
            {msgCount > 0 && (
              <span className="flex items-center gap-1 text-[#ff4a26] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff4a26] animate-pulse" />
                {msgCount} message{msgCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <HiOutlineChevronRight className="text-gray-300 group-hover:text-[#ff4a26] transition-colors mt-1 shrink-0" />
      </div>
    </button>
  )
}

// ── Dispute status summary strip ───────────────────────────────────────────────

export function DisputeStatusStrip({ disputes }: { disputes: Dispute[] }) {
  const statuses: Array<keyof typeof STATUS_CONFIG> = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED']
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {statuses.map(s => {
        const count = disputes.filter(d => d.status === s).length
        const cfg = STATUS_CONFIG[s]
        return (
          <div key={s} className={`rounded-xl border p-3 ${cfg.className}`}>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">{cfg.label}</p>
            <p className="text-2xl font-extrabold text-gray-900">{count}</p>
          </div>
        )
      })}
    </div>
  )
}

// ── Escalate banner ────────────────────────────────────────────────────────────

export function EscalateBanner({ onEscalate, isLoading }: { onEscalate: () => void; isLoading: boolean }) {
  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
      <HiOutlineShieldExclamation className="text-amber-500 text-base mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-xs font-semibold text-amber-700 mb-0.5">No resolution yet</p>
        <p className="text-xs text-amber-600 leading-relaxed">
          Escalate this dispute to get admin review and mediation.
        </p>
      </div>
      <button
        disabled={isLoading}
        onClick={onEscalate}
        className="cursor-pointer shrink-0 flex items-center gap-1 text-xs font-semibold text-amber-700 border border-amber-400 rounded-lg px-2.5 py-1 hover:bg-amber-100 transition-colors disabled:opacity-50"
      >
        <HiOutlineArrowTrendingUp className="text-sm" />
        {isLoading ? 'Escalating…' : 'Escalate'}
      </button>
    </div>
  )
}

// ── File dispute CTA ────────────────────────────────────────────────────────────

export function FileDisputeCTA({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-[#ff4a26] hover:bg-[#e03e1e] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
    >
      <HiOutlinePlus className="text-base" />
      File a Dispute
    </button>
  )
}
