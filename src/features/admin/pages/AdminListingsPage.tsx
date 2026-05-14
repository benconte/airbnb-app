import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  HiOutlineBuildingStorefront,
  HiOutlineMagnifyingGlass,
  HiOutlineTrash,
  HiOutlineStar,
  HiOutlineMapPin,
  HiOutlineCurrencyDollar,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineFunnel,
  HiMiniArrowTopRightOnSquare,
} from 'react-icons/hi2'
import { useAdminListings, useAdminDeleteListing } from '../hooks/useAdminData'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/dialog'
import type { AdminListing, ListingType } from '../types/admin'

const LISTING_TYPES: ListingType[] = ['APARTMENT', 'HOUSE', 'VILLA', 'CABIN']

const typeStyles: Record<ListingType, string> = {
  APARTMENT: 'bg-blue-50 text-blue-600 border-blue-200',
  HOUSE: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  VILLA: 'bg-purple-50 text-purple-600 border-purple-200',
  CABIN: 'bg-amber-50 text-amber-600 border-amber-200',
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

// ── Listing Card ──────────────────────────────────────────────────────────────

function ListingCard({ listing, onDelete }: { listing: AdminListing; onDelete: () => void }) {
  const photo = listing.photos?.[0]?.url
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
      {/* Image */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {photo ? (
          <img src={photo} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HiOutlineBuildingStorefront className="text-5xl text-gray-200" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeStyles[listing.type]}`}>
            {listing.type}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <Link
            to={`/listing/${listing.id}`}
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center text-gray-600 hover:text-[#ff4a26] transition-colors shadow-sm"
          >
            <HiMiniArrowTopRightOnSquare className="text-sm" />
          </Link>
          <button
            onClick={onDelete}
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors shadow-sm"
          >
            <HiOutlineTrash className="text-sm" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-bold text-gray-900 line-clamp-1 flex-1">{listing.title}</h3>
          {listing.rating && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500 shrink-0">
              <HiOutlineStar className="text-sm fill-amber-400" /> {listing.rating.toFixed(1)}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
          <HiOutlineMapPin className="shrink-0" /> {listing.location}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[#ff4a26] flex items-center gap-0.5">
            <HiOutlineCurrencyDollar className="text-sm" />
            {fmtCurrency(listing.pricePerNight)}<span className="text-gray-400 font-normal text-xs">/night</span>
          </span>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {listing._count?.bookings ?? 0} bookings
          </div>
        </div>
        {listing.host && (
          <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
            Host: <span className="font-medium text-gray-600">{listing.host.name}</span>
          </p>
        )}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function AdminListingsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<ListingType | ''>('')
  const [deleteTarget, setDeleteTarget] = useState<AdminListing | null>(null)

  const { data, isLoading } = useAdminListings(page, 12, typeFilter || undefined)
  const deleteMutation = useAdminDeleteListing()

  const filtered = data?.data.filter(l =>
    search === '' ||
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.location.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(`Listing "${deleteTarget.title}" removed.`)
        setDeleteTarget(null)
      },
      onError: (err) => toast.error(err.message),
    })
  }

  const totalPages = data?.meta.totalPages ?? 1

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pb-10">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <HiOutlineBuildingStorefront className="text-base" />
          <span>Listings Management</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">All Listings</h1>
            <p className="text-gray-400 text-sm mt-0.5">{data?.meta.total ?? 0} properties on the platform</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
              <input
                type="text"
                placeholder="Search by title or location…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4a26]/20 focus:border-[#ff4a26] focus:bg-white transition-all"
              />
            </div>
            <div className="relative">
              <HiOutlineFunnel className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none" />
              <select
                value={typeFilter}
                onChange={e => { setTypeFilter(e.target.value as ListingType | ''); setPage(1) }}
                className="pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4a26]/20 focus:border-[#ff4a26] appearance-none cursor-pointer"
              >
                <option value="">All Types</option>
                {LISTING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {LISTING_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => { setTypeFilter(typeFilter === t ? '' : t); setPage(1) }}
            className={`rounded-xl border px-4 py-3 text-left transition-all ${typeFilter === t ? `${typeStyles[t]} shadow-sm` : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{t}</p>
            <p className="text-lg font-extrabold">
              {data?.data.filter(l => l.type === t).length ?? '—'}
            </p>
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
              <div className="h-44 bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-1/3 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <HiOutlineBuildingStorefront className="text-6xl mb-3 opacity-30" />
          <p className="font-semibold">No listings found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(listing => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onDelete={() => setDeleteTarget(listing)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Page {page} of {totalPages}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Remove Listing?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Are you sure you want to permanently remove <strong>{deleteTarget?.title}</strong>?
            This will delete all associated bookings and photos. This action cannot be undone.
          </p>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="rounded-xl">Cancel</Button>
            <Button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
            >
              {deleteMutation.isPending ? 'Removing…' : 'Remove Listing'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
