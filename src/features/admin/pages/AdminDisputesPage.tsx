import { useState } from 'react'
import { toast } from 'sonner'
import {
  HiOutlineShieldExclamation,
  HiOutlineMagnifyingGlass,
  HiOutlineTrash,
  HiOutlineFunnel,
  HiChevronLeft,
  HiChevronRight,
} from 'react-icons/hi2'
import { useAdminDisputes, useUpdateDisputeStatus, useDeleteDispute, useAdminDisputeDetail } from '../hooks/useAdminData'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import type { AdminDispute, DisputeStatus, DisputeReason } from '../types/admin'
import { DisputeThread } from '../../disputes/DisputeThread'
import { STATUS_CONFIG, REASON_LABELS } from '../../disputes/types'
import { format } from 'date-fns'

const STATUS_OPTIONS: DisputeStatus[] = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED']
const REASON_OPTIONS: DisputeReason[] = [
  'PROPERTY_CONDITION', 'PAYMENT_ISSUE', 'HOST_BEHAVIOUR',
  'GUEST_BEHAVIOUR', 'CANCELLATION_POLICY', 'OTHER',
]

function fmtDate(d: string) {
  return format(new Date(d), 'MMM d, yyyy')
}

// ── Admin dispute detail modal with thread ─────────────────────────────────────

function AdminDisputeDetailModal({ dispute, onClose }: { dispute: AdminDispute; onClose: () => void }) {
  const [status, setStatus] = useState<DisputeStatus>(dispute.status)
  const [resolution, setResolution] = useState(dispute.resolution ?? '')
  const updateMutation = useUpdateDisputeStatus()

  const { data: full } = useAdminDisputeDetail(dispute.id)

  function handleSave() {
    updateMutation.mutate({ id: dispute.id, status, resolution: resolution || undefined }, {
      onSuccess: () => { toast.success('Dispute updated.'); onClose() },
      onError: (e) => toast.error(e.message),
    })
  }

  const cfg = STATUS_CONFIG[dispute.status]

  return (
    <DialogContent className="!max-w-[90vw] !w-[90vw] !h-[85vh] rounded-2xl overflow-hidden p-0">
      <div className="flex h-full">

        {/* ── Left column: Details & Admin controls ── */}
        <div className="w-[420px] shrink-0 flex flex-col border-r border-gray-100 overflow-y-auto">
          <div className="px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <HiOutlineShieldExclamation className="text-[#ff4a26]" /> Dispute Details
            </DialogTitle>
          </div>

          <div className="flex-1 px-6 py-5 space-y-4">
            {/* Status + reporter */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.className}`}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
                {cfg.label}
              </span>
              <div className="flex items-center gap-2">
                {dispute.reporter.avatar
                  ? <img src={dispute.reporter.avatar} className="w-6 h-6 rounded-full object-cover" alt={dispute.reporter.name} />
                  : <div className="w-6 h-6 rounded-full bg-[#ff4a26]/10 text-[#ff4a26] flex items-center justify-center text-xs font-bold">{dispute.reporter.name[0]}</div>
                }
                <span className="text-sm font-semibold text-gray-800">{dispute.reporter.name}</span>
                <span className="text-xs text-gray-400">· {dispute.reporter.email}</span>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Title</p>
                <p className="font-semibold text-gray-900">{dispute.title}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Listing</p>
                <p className="font-medium text-gray-800 truncate">{dispute.booking.listing.title}</p>
                <p className="text-xs text-gray-400">{dispute.booking.listing.location}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Reason</p>
                <p className="font-medium text-gray-800">{REASON_LABELS[dispute.reason]}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Filed</p>
                <p className="font-medium text-gray-800">{fmtDate(dispute.createdAt)}</p>
              </div>
            </div>

            {/* Original description */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 leading-relaxed">{dispute.description}</p>
            </div>

            {/* Admin controls */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Update Status</p>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as DisputeStatus)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4a26]/20 focus:border-[#ff4a26]">
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Resolution Note (optional)</label>
                <textarea value={resolution} onChange={e => setResolution(e.target.value)} rows={3}
                  placeholder="Add a resolution note…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#ff4a26]/20 focus:border-[#ff4a26]" />
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 border-t border-gray-100 flex gap-2 justify-end bg-white">
            <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}
              className="bg-[#ff4a26] hover:bg-[#e03e1e] text-white rounded-xl">
              {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* ── Right column: Thread ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-gray-100">
            <p className="text-lg font-bold text-gray-900">Dispute Thread</p>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {full
              ? <DisputeThread dispute={full} currentUserId="admin" />
              : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-[#ff4a26] rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm">Loading thread…</p>
                  </div>
                </div>
              )
            }
          </div>
        </div>

      </div>
    </DialogContent>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

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

  function handleDelete() {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => { toast.success('Dispute deleted.'); setDeleteTarget(null) },
      onError: (e) => toast.error(e.message),
    })
  }

  const totalPages = data?.meta.totalPages ?? 1

  // Status summary counts (across current page for simplicity)
  const statusCounts = STATUS_OPTIONS.map(s => ({
    status: s,
    count: data?.data.filter(d => d.status === s).length ?? 0,
    cfg: STATUS_CONFIG[s],
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
        <p className="text-gray-400 text-sm mt-0.5">{data?.meta.total ?? 0} total disputes</p>
      </div>

      {/* Status strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statusCounts.map(({ status, count, cfg }) => (
          <button key={status}
            onClick={() => { setStatusFilter(statusFilter === status ? '' : status); setPage(1) }}
            className={`rounded-xl border p-4 text-left transition-all ${statusFilter === status ? `${cfg.className} shadow-sm` : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">{cfg.label}</p>
            <p className="text-2xl font-extrabold text-gray-900">{count}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
              <input type="text" placeholder="Search disputes, reporters, listings…"
                value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4a26]/20 focus:border-[#ff4a26] focus:bg-white transition-all" />
            </div>
            <div className="relative">
              <HiOutlineFunnel className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none" />
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as DisputeStatus | ''); setPage(1) }}
                className="pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4a26]/20 focus:border-[#ff4a26] appearance-none cursor-pointer">
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
              </select>
            </div>
            <select value={reasonFilter} onChange={e => { setReasonFilter(e.target.value as DisputeReason | ''); setPage(1) }}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4a26]/20 focus:border-[#ff4a26] appearance-none cursor-pointer">
              <option value="">All Reasons</option>
              {REASON_OPTIONS.map(r => <option key={r} value={r}>{REASON_LABELS[r]}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="pb-0 px-6 pt-5">
          <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
            <div className="w-1 h-5 bg-[#ff4a26] rounded-full" /> Disputes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100 bg-gray-50/60">
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider pl-6">#</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Reporter</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Title</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Reason</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Listing</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Messages</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Filed</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i} className="border-gray-100">
                      {Array.from({ length: 9 }).map((__, j) => (
                        <TableCell key={j}><div className="h-4 bg-gray-100 rounded animate-pulse w-full max-w-[100px]" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                  : filtered.length === 0
                    ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-16 text-gray-400">
                          <HiOutlineShieldExclamation className="text-4xl mx-auto mb-2 opacity-30" /> No disputes found
                        </TableCell>
                      </TableRow>
                    )
                    : filtered.map((d, idx) => {
                      const cfg = STATUS_CONFIG[d.status]
                      return (
                        <TableRow key={d.id} className="border-gray-100 hover:bg-gray-50/60 transition-colors">
                          <TableCell className="pl-6 text-gray-400 text-sm font-medium">
                            {String((page - 1) * 10 + idx + 1).padStart(2, '0')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {d.reporter.avatar
                                ? <img src={d.reporter.avatar} alt={d.reporter.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                                : <div className="w-8 h-8 rounded-full bg-[#ff4a26]/10 text-[#ff4a26] flex items-center justify-center font-bold text-xs shrink-0">{d.reporter.name[0]}</div>
                              }
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{d.reporter.name}</p>
                                <p className="text-xs text-gray-400">{d.reporter.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell><p className="text-sm font-semibold text-gray-900 max-w-[180px] truncate">{d.title}</p></TableCell>
                          <TableCell>
                            <span className="text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                              {REASON_LABELS[d.reason]}
                            </span>
                          </TableCell>
                          <TableCell><p className="text-sm text-gray-600 max-w-[140px] truncate">{d.booking.listing.title}</p></TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
                              {cfg.label}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">—</TableCell>
                          <TableCell className="text-sm text-gray-400">{fmtDate(d.createdAt)}</TableCell>
                          <TableCell className="pr-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => setSelectedDispute(d)}
                                className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 bg-[#ff4a26]/10 text-[#ff4a26] hover:bg-[#ff4a26]/20 rounded-lg text-xs font-semibold transition-colors">
                                Review
                              </button>
                              <button onClick={() => setDeleteTarget(d)}
                                className="cursor-pointer w-7 h-7 flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors">
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
                Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, data.meta.total)} of {data.meta.total}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                  <HiChevronLeft className="text-sm" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                  <button key={i + 1} onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${page === i + 1 ? 'bg-[#ff4a26] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
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
          <AdminDisputeDetailModal dispute={selectedDispute} onClose={() => setSelectedDispute(null)} />
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Delete Dispute?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">This will permanently remove the dispute and all its messages.</p>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleDelete} disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl">
              {deleteMutation.isPending ? 'Deleting…' : 'Delete Dispute'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
