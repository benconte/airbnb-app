import { useState } from 'react'
import { toast } from 'sonner'
import {
  HiOutlineShieldExclamation,
  HiOutlineMagnifyingGlass,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineFunnel,
  HiOutlineEye,
} from 'react-icons/hi2'
import { useAdminDisputes, useUpdateDisputeStatus, useDeleteDispute } from '../hooks/useAdminData'
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
import type { AdminDispute, DisputeStatus, DisputeReason } from '../types/admin'

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: DisputeStatus[] = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED']
const REASON_OPTIONS: DisputeReason[] = [
  'PROPERTY_CONDITION', 'PAYMENT_ISSUE', 'HOST_BEHAVIOUR',
  'GUEST_BEHAVIOUR', 'CANCELLATION_POLICY', 'OTHER',
]

const statusConfig = {
  OPEN: {
    label: 'Open',
    className: 'bg-orange-50 text-orange-600 border-orange-200',
    icon: HiOutlineClock,
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    className: 'bg-blue-50 text-blue-600 border-blue-200',
    icon: HiOutlineEye,
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    icon: HiOutlineCheckCircle,
  },
  DISMISSED: {
    label: 'Dismissed',
    className: 'bg-gray-50 text-gray-500 border-gray-200',
    icon: HiOutlineXCircle,
  },
}

const reasonLabels: Record<DisputeReason, string> = {
  PROPERTY_CONDITION: 'Property Condition',
  PAYMENT_ISSUE: 'Payment Issue',
  HOST_BEHAVIOUR: 'Host Behaviour',
  GUEST_BEHAVIOUR: 'Guest Behaviour',
  CANCELLATION_POLICY: 'Cancellation Policy',
  OTHER: 'Other',
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Detail Modal ──────────────────────────────────────────────────────────────

function DisputeDetailModal({
  dispute,
  onClose,
  onUpdateStatus,
}: {
  dispute: AdminDispute
  onClose: () => void
  onUpdateStatus: (status: DisputeStatus, resolution?: string) => void
}) {
  const [status, setStatus] = useState<DisputeStatus>(dispute.status)
  const [resolution, setResolution] = useState(dispute.resolution ?? '')
  const updateMutation = useUpdateDisputeStatus()

  const handleSave = () => {
    updateMutation.mutate(
      { id: dispute.id, status, resolution: resolution || undefined },
      {
        onSuccess: () => {
          toast.success('Dispute updated successfully.')
          onUpdateStatus(status, resolution)
          onClose()
        },
        onError: (err) => toast.error(err.message),
      }
    )
  }

  const cfg = statusConfig[dispute.status]
  const Icon = cfg.icon

  return (
    <DialogContent className="rounded-2xl max-w-xl">
      <DialogHeader>
        <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <HiOutlineShieldExclamation className="text-[#ff4a26]" />
          Dispute Details
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Status badge */}
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.className}`}>
          <Icon className="text-sm" /> {cfg.label}
        </span>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reporter</p>
            <div className="flex items-center gap-2">
              {dispute.reporter.avatar ? (
                <img src={dispute.reporter.avatar} className="w-6 h-6 rounded-full object-cover" alt={dispute.reporter.name} />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#ff4a26]/10 text-[#ff4a26] flex items-center justify-center text-xs font-bold">
                  {dispute.reporter.name[0]}
                </div>
              )}
              <span className="font-medium text-gray-900">{dispute.reporter.name}</span>
            </div>
            <p className="text-xs text-gray-400">{dispute.reporter.email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Listing</p>
            <p className="font-medium text-gray-900">{dispute.booking.listing.title}</p>
            <p className="text-xs text-gray-400">{dispute.booking.listing.location}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reason</p>
            <p className="font-medium text-gray-900">{reasonLabels[dispute.reason]}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filed</p>
            <p className="font-medium text-gray-900">{fmtDate(dispute.createdAt)}</p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</p>
          <p className="font-semibold text-gray-900">{dispute.title}</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</p>
          <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 leading-relaxed">{dispute.description}</p>
        </div>

        {/* Update Status */}
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Update Status</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as DisputeStatus)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4a26]/20 focus:border-[#ff4a26]"
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Resolution Note (optional)</label>
            <textarea
              value={resolution}
              onChange={e => setResolution(e.target.value)}
              rows={3}
              placeholder="Add a resolution note for the record…"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#ff4a26]/20 focus:border-[#ff4a26]"
            />
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="bg-[#ff4a26] hover:bg-[#e03e1e] text-white rounded-xl"
        >
          {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function AdminDisputesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | ''>('')
  const [reasonFilter, setReasonFilter] = useState<DisputeReason | ''>('')
  const [selectedDispute, setSelectedDispute] = useState<AdminDispute | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminDispute | null>(null)

  const { data, isLoading } = useAdminDisputes(page, 10, statusFilter || undefined, reasonFilter || undefined)
  const deleteMutation = useDeleteDispute()

  const filtered = data?.data.filter(d =>
    search === '' ||
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.reporter.name.toLowerCase().includes(search.toLowerCase()) ||
    d.booking.listing.title.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success('Dispute deleted.')
        setDeleteTarget(null)
      },
      onError: (err) => toast.error(err.message),
    })
  }

  const totalPages = data?.meta.totalPages ?? 1

  // Count by status for the summary strip
  const statusCounts = STATUS_OPTIONS.map(s => ({
    status: s,
    count: data?.data.filter(d => d.status === s).length ?? 0,
    cfg: statusConfig[s],
  }))

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pb-10">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <HiOutlineShieldExclamation className="text-base" />
          <span>Dispute Management</span>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">All Disputes</h1>
        <p className="text-gray-400 text-sm mt-0.5">{data?.meta.total ?? 0} total disputes filed</p>
      </div>

      {/* Status summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statusCounts.map(({ status, count, cfg }) => {
          const Icon = cfg.icon
          return (
            <button
              key={status}
              onClick={() => { setStatusFilter(statusFilter === status ? '' : status); setPage(1) }}
              className={`rounded-xl border p-4 text-left transition-all ${statusFilter === status ? `${cfg.className} shadow-sm` : 'bg-white border-gray-100 hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="text-base" />
                <p className="text-xs font-semibold uppercase tracking-wider text-current opacity-70">{cfg.label}</p>
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{count}</p>
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
                placeholder="Search disputes, reporters, listings…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4a26]/20 focus:border-[#ff4a26] focus:bg-white transition-all"
              />
            </div>
            <div className="relative">
              <HiOutlineFunnel className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none" />
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value as DisputeStatus | ''); setPage(1) }}
                className="pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4a26]/20 focus:border-[#ff4a26] appearance-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
              </select>
            </div>
            <div className="relative">
              <select
                value={reasonFilter}
                onChange={e => { setReasonFilter(e.target.value as DisputeReason | ''); setPage(1) }}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4a26]/20 focus:border-[#ff4a26] appearance-none cursor-pointer"
              >
                <option value="">All Reasons</option>
                {REASON_OPTIONS.map(r => <option key={r} value={r}>{reasonLabels[r]}</option>)}
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
            Disputes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100 bg-gray-50/60">
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider pl-6">#</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Reporter</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Dispute Title</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Reason</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Listing</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Filed</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i} className="border-gray-100">
                      {Array.from({ length: 8 }).map((__, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-gray-100 rounded animate-pulse w-full max-w-[100px]" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                  : filtered.length === 0
                    ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-16 text-gray-400">
                          <HiOutlineShieldExclamation className="text-4xl mx-auto mb-2 opacity-30" />
                          No disputes found
                        </TableCell>
                      </TableRow>
                    )
                    : filtered.map((d, idx) => {
                      const cfg = statusConfig[d.status]
                      const Icon = cfg.icon
                      return (
                        <TableRow key={d.id} className="border-gray-100 hover:bg-gray-50/60 transition-colors">
                          <TableCell className="pl-6 text-gray-400 text-sm font-medium">
                            {String((page - 1) * 10 + idx + 1).padStart(2, '0')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {d.reporter.avatar ? (
                                <img src={d.reporter.avatar} alt={d.reporter.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-[#ff4a26]/10 text-[#ff4a26] flex items-center justify-center font-bold text-xs shrink-0">
                                  {d.reporter.name[0]}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{d.reporter.name}</p>
                                <p className="text-xs text-gray-400">{d.reporter.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm font-semibold text-gray-900 max-w-[180px] truncate">{d.title}</p>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                              {reasonLabels[d.reason]}
                            </span>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-gray-600 max-w-[140px] truncate">{d.booking.listing.title}</p>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>
                              <Icon className="text-xs" />
                              {cfg.label}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-400">{fmtDate(d.createdAt)}</TableCell>
                          <TableCell className="pr-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedDispute(d)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#ff4a26]/10 text-[#ff4a26] hover:bg-[#ff4a26]/20 rounded-lg text-xs font-semibold transition-colors"
                              >
                                <HiOutlineEye className="text-sm" /> Review
                              </button>
                              <button
                                onClick={() => setDeleteTarget(d)}
                                className="w-7 h-7 flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                              >
                                <HiOutlineTrash className="text-sm" />
                              </button>
                            </div>
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
                Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, data.meta.total)} of {data.meta.total} disputes
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

      {/* Detail Dialog */}
      {selectedDispute && (
        <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
          <DisputeDetailModal
            dispute={selectedDispute}
            onClose={() => setSelectedDispute(null)}
            onUpdateStatus={() => setSelectedDispute(null)}
          />
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Delete Dispute?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Are you sure you want to permanently delete this dispute? This cannot be undone.
          </p>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="rounded-xl">Cancel</Button>
            <Button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete Dispute'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
