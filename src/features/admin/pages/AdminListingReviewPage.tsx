import { useState } from 'react'
import { toast } from 'sonner'
import {
    HiOutlineClipboardDocumentCheck,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineClock,
    HiOutlineBuildingStorefront,
    HiOutlineMapPin,
    HiOutlineCurrencyDollar,
    HiOutlineUser,
    HiOutlineCalendarDays,
    HiChevronLeft,
    HiChevronRight,
    HiOutlineEnvelope,
    HiOutlineChartBarSquare,
    HiOutlineArrowsPointingOut,
    HiOutlinePhoto,
} from 'react-icons/hi2'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/shared/ui/dialog'
import { Textarea } from '@/shared/ui/textarea'
import { Skeleton } from '@/shared/ui/skeleton'
import { Separator } from '@/shared/ui/separator'
import { api } from '@/lib/api'
import type { ListingPricing } from '@/features/guest/listings/types'
import { Badge } from '@/shared/ui/badge'

// ── Types ─────────────────────────────────────────────────────────────────────
interface PendingListing {
    id: string
    title: string
    description: string
    location: string
    pricePerNight: number
    type: 'APARTMENT' | 'HOUSE' | 'VILLA' | 'CABIN'
    amenities: string[]
    guests: number
    isApproved: boolean
    createdAt: string

    photos: {
        url: string
    }[]

    host: {
        id: string
        name: string
        email: string
        avatar?: string
    }

    pricings?: ListingPricing[]

    _count: {
        bookings: number
        reviews: number
    }
}

interface PendingResponse {
    data: PendingListing[]
    meta: {
        page: number
        limit: number
        total: number
        totalPages: number
        stats: { pending: number; approved: number; total: number }
    }
}

// ── API hooks ─────────────────────────────────────────────────────────────────

function usePendingListings(page: number) {
    return useQuery<PendingResponse>({
        queryKey: ['admin', 'pending-listings', page],
        queryFn: () =>
            api.get(`/api/v1/listings/admin/pending?page=${page}&limit=12`),
    })
}

function useApproveListing() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) =>
            api.patch(`/api/v1/listings/admin/${id}/approve`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'pending-listings'] }),
    })
}

function useRejectListing() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            api.patch(`/api/v1/listings/admin/${id}/reject`, { reason }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'pending-listings'] }),
    })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const typeStyles: Record<string, string> = {
    APARTMENT: 'bg-blue-50 text-blue-600 border-blue-200',
    HOUSE: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    VILLA: 'bg-purple-50 text-purple-600 border-purple-200',
    CABIN: 'bg-amber-50 text-amber-600 border-amber-200',
}

function fmtCurrency(n: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(n)
}

function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
    icon: Icon,
    label,
    value,
    color,
    sub,
}: {
    icon: React.ElementType
    label: string
    value: number | string
    color: string
    sub?: string
}) {
    return (
        <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                        <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</p>
                        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
                    </div>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                        <Icon className="text-xl" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function ListingReviewCard({
    listing,
    onApprove,
    onReject,
    onExpand,
}: {
    listing: PendingListing
    onApprove: () => void
    onReject: () => void
    onExpand: () => void
}) {
    const photo = listing.photos?.[0]?.url

    return (
        <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all group p-0">
            {/* Photo */}
            <div className="relative h-44 bg-gray-100 overflow-hidden">
                {photo ? (
                    <img
                        src={photo}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <HiOutlineBuildingStorefront className="text-5xl text-gray-200" />
                    </div>
                )}
                {/* Type badge */}
                <div className="absolute top-3 left-3">
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeStyles[listing.type] ?? ''}`}
                    >
                        {listing.type}
                    </span>
                </div>
                {/* Top right actions */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                    <Button
                        onClick={onExpand}
                        variant='outline'
                        size='sm'
                        className="cursor-pointer rounded-full px-2"
                    >
                        <HiOutlineArrowsPointingOut className="text-sm" />
                        View
                    </Button>

                    <Badge className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                        <HiOutlineClock className="text-xs" /> Pending
                    </Badge>
                </div>
            </div>

            {/* Body */}
            <CardContent className="p-4 space-y-3">
                <div>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{listing.title}</h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <HiOutlineMapPin className="shrink-0" /> {listing.location}
                    </p>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{listing.description}</p>

                {/* Amenities */}
                {listing.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {listing.amenities.slice(0, 4).map((a) => (
                            <span
                                key={a}
                                className="px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100 text-xs text-gray-500"
                            >
                                {a}
                            </span>
                        ))}
                        {listing.amenities.length > 4 && (
                            <span className="px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100 text-xs text-gray-400">
                                +{listing.amenities.length - 4}
                            </span>
                        )}
                    </div>
                )}

                <Separator className="my-2!" />

                {/* Price + guests */}
                <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#ff4a26] flex items-center gap-0.5 text-sm">
                        <HiOutlineCurrencyDollar />
                        {fmtCurrency(listing.pricePerNight)}
                        <span className="text-gray-400 font-normal text-xs">/night</span>
                    </span>
                    <span className="text-gray-400">{listing.guests} guests max</span>
                </div>

                {/* Host info */}
                <div className="flex items-center gap-2 pt-1">
                    {listing.host.avatar ? (
                        <img
                            src={listing.host.avatar}
                            alt={listing.host.name}
                            className="w-6 h-6 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                            <HiOutlineUser className="text-xs text-gray-400" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{listing.host.name}</p>
                        <p className="text-xs text-gray-400 truncate flex items-center gap-0.5">
                            <HiOutlineEnvelope className="shrink-0 text-xs" /> {listing.host.email}
                        </p>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
                        <HiOutlineCalendarDays className="text-xs" />
                        {timeAgo(listing.createdAt)}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                    <Button
                        onClick={onApprove}
                        className="flex-1 h-9 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold gap-1.5 shadow-sm"
                    >
                        <HiOutlineCheckCircle className="text-base" /> Approve
                    </Button>
                    <Button
                        onClick={onReject}
                        variant="outline"
                        className="cursor-pointer flex-1 h-9 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl text-xs font-semibold gap-1.5"
                    >
                        <HiOutlineXCircle className="text-base" /> Reject
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
    return (
        <Card className="border border-gray-100 rounded-2xl overflow-hidden">
            <Skeleton className="h-44 rounded-none" />
            <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </CardContent>
        </Card>
    )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function AdminListingReviewPage() {
    const [page, setPage] = useState(1)
    const [rejectTarget, setRejectTarget] = useState<PendingListing | null>(null)
    const [rejectReason, setRejectReason] = useState('')
    const [approveTarget, setApproveTarget] = useState<PendingListing | null>(null)
    const [detailsTarget, setDetailsTarget] = useState<PendingListing | null>(null)

    const { data, isLoading } = usePendingListings(page)
    const approveMutation = useApproveListing()
    const rejectMutation = useRejectListing()

    console.log(data)

    const stats = data?.meta.stats
    const totalPages = data?.meta.totalPages ?? 1

    const handleApprove = () => {
        if (!approveTarget) return
        approveMutation.mutate(approveTarget.id, {
            onSuccess: () => {
                toast.success(`"${approveTarget.title}" approved! Host has been notified.`)
                setApproveTarget(null)
            },
            onError: (err: Error) => toast.error(err.message),
        })
    }

    const handleReject = () => {
        if (!rejectTarget || !rejectReason.trim()) return
        rejectMutation.mutate(
            { id: rejectTarget.id, reason: rejectReason.trim() },
            {
                onSuccess: () => {
                    toast.success(`"${rejectTarget.title}" rejected. Host has been notified via email.`)
                    setRejectTarget(null)
                    setRejectReason('')
                },
                onError: (err: Error) => toast.error(err.message),
            }
        )
    }

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto w-full pb-10">

            {/* ── Header ── */}
            <div>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <HiOutlineClipboardDocumentCheck className="text-base" />
                    <span>Listings / Review Queue</span>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Listing Review</h1>
                        <p className="text-gray-400 text-sm mt-0.5">
                            Approve or reject new listing submissions before they go live
                        </p>
                    </div>
                    {stats && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm font-semibold">
                            <HiOutlineClock className="text-base" />
                            {stats.pending} listing{stats.pending !== 1 ? 's' : ''} awaiting review
                        </div>
                    )}
                </div>
            </div>

            {/* ── Analytics Strip ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCard
                    icon={HiOutlineChartBarSquare}
                    label="Total Submissions"
                    value={isLoading ? '—' : stats?.total ?? 0}
                    color="bg-gray-100 text-gray-600"
                    sub="All time"
                />
                <StatCard
                    icon={HiOutlineClock}
                    label="Pending Review"
                    value={isLoading ? '—' : stats?.pending ?? 0}
                    color="bg-amber-100 text-amber-600"
                    sub="Need attention"
                />
                <StatCard
                    icon={HiOutlineCheckCircle}
                    label="Approved"
                    value={isLoading ? '—' : stats?.approved ?? 0}
                    color="bg-emerald-100 text-emerald-600"
                    sub="Live on platform"
                />
            </div>

            {/* ── Approval rate bar ── */}
            {stats && stats.total > 0 && (
                <Card className="border border-gray-100 shadow-sm rounded-2xl">
                    <CardHeader className="pb-2 pt-4 px-5">
                        <CardTitle className="text-sm font-bold text-gray-700">Approval Rate</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                                    style={{ width: `${Math.round((stats.approved / stats.total) * 100)}%` }}
                                />
                            </div>
                            <span className="text-sm font-bold text-gray-700 shrink-0">
                                {Math.round((stats.approved / stats.total) * 100)}%
                            </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                                {stats.approved} approved
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                                {stats.pending} pending
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── Listing Grid ── */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : !data?.data.length ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <HiOutlineCheckCircle className="text-6xl mb-3 opacity-30 text-emerald-400" />
                    <p className="font-semibold text-gray-600">All caught up!</p>
                    <p className="text-sm mt-1">No listings are pending review right now.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {data.data.map((listing) => (
                        <ListingReviewCard
                            key={listing.id}
                            listing={listing}
                            onApprove={() => setApproveTarget(listing)}
                            onReject={() => {
                                setRejectTarget(listing)
                                setRejectReason('')
                            }}
                            onExpand={() => setDetailsTarget(listing)}
                        />
                    ))}
                </div>
            )}

            {/* ── Pagination ── */}
            {data && data.meta.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <HiChevronLeft className="text-sm" />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setPage(i + 1)}
                                className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${page === i + 1
                                    ? 'bg-[#ff4a26] text-white'
                                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <HiChevronRight className="text-sm" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Approve Confirmation Dialog ── */}
            <Dialog open={!!approveTarget} onOpenChange={() => setApproveTarget(null)}>
                <DialogContent className="rounded-2xl max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900">Approve Listing?</DialogTitle>
                        <DialogDescription className="text-sm text-gray-500">
                            This will make the listing live on the platform. The host will be notified via email.
                        </DialogDescription>
                    </DialogHeader>

                    {approveTarget && (
                        <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                            {approveTarget.photos?.[0]?.url ? (
                                <img
                                    src={approveTarget.photos[0].url}
                                    alt=""
                                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                    <HiOutlineBuildingStorefront className="text-gray-300 text-2xl" />
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-bold text-gray-800">{approveTarget.title}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <HiOutlineMapPin className="shrink-0" /> {approveTarget.location}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Host: <span className="font-medium">{approveTarget.host.name}</span>
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 mt-2">
                        <Button variant="outline" onClick={() => setApproveTarget(null)} className="cursor-pointer rounded-xl">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApprove}
                            disabled={approveMutation.isPending}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-2"
                        >
                            <HiOutlineCheckCircle className="text-base" />
                            {approveMutation.isPending ? 'Approving…' : 'Yes, Approve'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Reject Dialog ── */}
            <Dialog
                open={!!rejectTarget}
                onOpenChange={() => { setRejectTarget(null); setRejectReason('') }}
            >
                <DialogContent className="rounded-2xl max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900">Reject Listing</DialogTitle>
                        <DialogDescription className="text-sm text-gray-500">
                            Provide a clear reason so the host knows what to fix. This will be sent to them by email.
                        </DialogDescription>
                    </DialogHeader>

                    {rejectTarget && (
                        <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                            {rejectTarget.photos?.[0]?.url ? (
                                <img
                                    src={rejectTarget.photos[0].url}
                                    alt=""
                                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                    <HiOutlineBuildingStorefront className="text-gray-300 text-2xl" />
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-bold text-gray-800">{rejectTarget.title}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <HiOutlineMapPin className="shrink-0" /> {rejectTarget.location}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                    <HiOutlineEnvelope className="shrink-0" /> {rejectTarget.host.email}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                            Rejection Reason <span className="text-red-400">*</span>
                        </label>
                        <Textarea
                            placeholder="e.g. Photos do not meet quality standards. Please upload clear, high-resolution images of each room."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="rounded-xl resize-none text-sm min-h-[100px] focus:ring-[#ff4a26]/20 focus:border-[#ff4a26]"
                        />
                        <p className="text-xs text-gray-400">
                            This message will be included in the email sent to the host.
                        </p>
                    </div>

                    <DialogFooter className="gap-2 mt-2">
                        <Button
                            variant="outline"
                            onClick={() => { setRejectTarget(null); setRejectReason('') }}
                            className="rounded-xl cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReject}
                            disabled={rejectMutation.isPending || !rejectReason.trim()}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-xl gap-2"
                        >
                            <HiOutlineXCircle className="text-base" />
                            {rejectMutation.isPending ? 'Rejecting…' : 'Reject & Notify Host'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* ── Listing Details Dialog ── */}
            <Dialog
                open={!!detailsTarget}
                onOpenChange={() => setDetailsTarget(null)}
            >
                {/* <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto rounded-3xl p-0 bg-white"> */}
                <DialogContent className="max-w-5xl! w-[95vw] max-h-[90vh] overflow-y-auto rounded-3xl p-0">
                    {detailsTarget && (
                        <div className='w-full'>
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h2 className="text-2xl font-extrabold text-gray-900">
                                                {detailsTarget.title}
                                            </h2>

                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${typeStyles[detailsTarget.type]}`}
                                            >
                                                {detailsTarget.type}
                                            </span>
                                        </div>

                                        <p className="text-gray-500 mt-1 flex items-center gap-1">
                                            <HiOutlineMapPin />
                                            {detailsTarget.location}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-3xl font-extrabold text-[#ff4a26]">
                                            {fmtCurrency(detailsTarget.pricePerNight)}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            per night
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-8">

                                {/* Images */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <HiOutlinePhoto className="text-lg text-gray-500" />
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Photos
                                        </h3>
                                    </div>

                                    {detailsTarget.photos?.length ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {detailsTarget.photos.map((photo, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => window.open(photo.url, '_blank')}
                                                    className="group cursor-pointer relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
                                                >
                                                    <img
                                                        src={photo.url}
                                                        alt={`${detailsTarget.title}-${idx}`}
                                                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />

                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center text-gray-400">
                                            No photos uploaded
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Description
                                    </h3>

                                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                                        <p className="text-sm leading-7 text-gray-600 whitespace-pre-wrap">
                                            {detailsTarget.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Main info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                                    <div className="rounded-2xl border border-gray-100 p-5">
                                        <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">
                                            Guests
                                        </p>

                                        <p className="text-2xl font-bold text-gray-900">
                                            {detailsTarget.guests}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-gray-100 p-5">
                                        <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">
                                            Reviews
                                        </p>

                                        <p className="text-2xl font-bold text-gray-900">
                                            {detailsTarget._count.reviews}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-gray-100 p-5">
                                        <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">
                                            Bookings
                                        </p>

                                        <p className="text-2xl font-bold text-gray-900">
                                            {detailsTarget._count.bookings}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-gray-100 p-5">
                                        <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">
                                            Submitted
                                        </p>

                                        <p className="text-sm font-semibold text-gray-900">
                                            {new Date(detailsTarget.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Amenities */}
                                <div className="space-y-3">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Amenities
                                    </h3>

                                    <div className="flex flex-wrap gap-2">
                                        {detailsTarget.amenities?.length ? (
                                            detailsTarget.amenities.map((amenity) => (
                                                <span
                                                    key={amenity}
                                                    className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700"
                                                >
                                                    {amenity}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-400">
                                                No amenities provided
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Pricing plans */}
                                {detailsTarget.pricings?.length ? (
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Pricing Packages
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {detailsTarget.pricings.map((pricing) => (
                                                <div
                                                    key={pricing.id}
                                                    className="rounded-2xl border border-gray-200 p-5"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <h4 className="font-bold text-gray-900">
                                                                {pricing.name}
                                                            </h4>

                                                            {pricing.description && (
                                                                <p className="text-sm text-gray-500 mt-1">
                                                                    {pricing.description}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {pricing.badge && (
                                                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-[#ff4a26]/10 text-[#ff4a26]">
                                                                {pricing.badge.replace('_', ' ')}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="mt-4">
                                                        <p className="text-3xl font-extrabold text-gray-900">
                                                            {fmtCurrency(pricing.price)}
                                                        </p>
                                                    </div>

                                                    {!!pricing.tags?.length && (
                                                        <div className="flex flex-wrap gap-2 mt-4">
                                                            {pricing.tags.map((tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="px-2 py-1 rounded-lg bg-gray-100 text-xs text-gray-600"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}

                                {/* Host */}
                                <div className="space-y-3">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Host Information
                                    </h3>

                                    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 p-5">
                                        {detailsTarget.host.avatar ? (
                                            <img
                                                src={detailsTarget.host.avatar}
                                                alt={detailsTarget.host.name}
                                                className="w-16 h-16 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                                <HiOutlineUser className="text-2xl text-gray-400" />
                                            </div>
                                        )}

                                        <div>
                                            <p className="text-lg font-bold text-gray-900">
                                                {detailsTarget.host.name}
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                {detailsTarget.host.email}
                                            </p>

                                            <p className="text-xs text-gray-400 mt-1">
                                                Host ID: {detailsTarget.host.id}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer actions */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                    <Button
                                        variant="outline"
                                        className="cursor-pointer rounded-xl"
                                        onClick={() => setDetailsTarget(null)}
                                    >
                                        Close
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="cursor-pointer rounded-xl border-red-200 text-red-500 hover:bg-red-50"
                                        onClick={() => {
                                            setDetailsTarget(null)
                                            setRejectTarget(detailsTarget)
                                        }}
                                    >
                                        Reject
                                    </Button>

                                    <Button
                                        className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
                                        onClick={() => {
                                            setDetailsTarget(null)
                                            setApproveTarget(detailsTarget)
                                        }}
                                    >
                                        Approve Listing
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div >
    )
}