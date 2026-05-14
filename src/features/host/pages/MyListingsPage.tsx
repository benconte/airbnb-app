import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  HiOutlinePlusCircle,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineHome,
  HiOutlineStar,
  HiOutlineCalendarDays,
  HiOutlinePhoto,
  HiChevronLeft,
  HiChevronRight,
  HiXMark,
} from 'react-icons/hi2'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useHostListings, useDeleteListing, useUpdateListing, useUploadListingPhoto, useDeleteListingPhoto } from '../hooks/useHostData'
import { Button } from '../../../shared/ui/button'
import { Input } from '../../../shared/ui/input'
import { Label } from '../../../shared/ui/label'
import { Textarea } from '../../../shared/ui/textarea'
import { Badge } from '../../../shared/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../shared/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../shared/ui/dialog'
import type { HostListing } from '../types/host'

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function typeLabel(type: string) {
  return type.charAt(0) + type.slice(1).toLowerCase()
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    APARTMENT: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    HOUSE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    VILLA: 'bg-purple-100 text-purple-700 border-purple-200',
    CABIN: 'bg-amber-100 text-amber-700 border-amber-200',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[type] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
      {typeLabel(type)}
    </span>
  )
}

// ── Edit modal ────────────────────────────────────────────────────────────────

const editListingSchema = z.object({
  title: z.string().min(10, 'At least 10 characters required'),
  description: z.string().min(30, 'At least 30 characters required'),
  pricePerNight: z.number().min(1, 'Min price is $1'),
  guests: z.number().min(1, 'Min 1 guest'),
  location: z.string().min(1, 'Location is required'),
})

type EditListingForm = z.infer<typeof editListingSchema>

function EditListingModal({
  listing,
  onClose,
}: {
  listing: HostListing
  onClose: () => void
}) {
  const updateMutation = useUpdateListing()
  const uploadMutation = useUploadListingPhoto()
  const deletePhotoMutation = useDeleteListingPhoto()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditListingForm>({
    resolver: zodResolver(editListingSchema),
    defaultValues: {
      title: listing.title,
      description: listing.description,
      pricePerNight: listing.pricePerNight,
      guests: listing.guests,
      location: listing.location,
    },
  })

  const onSubmit = (data: EditListingForm) => {
    updateMutation.mutate({ id: listing.id, data }, {
      onSuccess: () => {
        toast.success('Listing updated successfully')
        onClose()
      },
      onError: (err) => {
        toast.error(err.message ?? 'Failed to update listing')
      }
    })
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadMutation.mutate({ id: listing.id, file }, {
      onSuccess: () => toast.success('Photo uploaded'),
      onError: (err) => toast.error(err.message ?? 'Failed to upload photo')
    })
  }

  const handlePhotoDelete = (photoId: string) => {
    deletePhotoMutation.mutate({ id: listing.id, photoId }, {
      onSuccess: () => toast.success('Photo deleted'),
      onError: (err) => toast.error(err.message ?? 'Failed to delete photo')
    })
  }

  return (
    <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-lg font-bold">Edit Listing</DialogTitle>
        <DialogDescription className="text-sm text-gray-500">
          Update your listing details and photos below.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-4 space-y-6">
        {/* Photos Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Photos</h3>
          <div className="flex flex-wrap gap-4 mb-4">
            {listing.photos.map(photo => (
              <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-gray-200">
                <img src={photo.url} alt="" className="w-24 h-24 object-cover" />
                <button
                  onClick={() => handlePhotoDelete(photo.id)}
                  disabled={deletePhotoMutation.isPending}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:opacity-50"
                  title="Delete photo"
                >
                  <HiXMark className="w-4 h-4" />
                </button>
              </div>
            ))}
            <label className={`w-24 h-24 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 hover:border-[#ff4a26] hover:bg-[#ff4a26]/5 cursor-pointer transition-colors ${uploadMutation.isPending ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploadMutation.isPending ? (
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              ) : (
                <>
                  <HiOutlinePhoto className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-[10px] text-gray-500 font-medium">Add Photo</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </>
              )}
            </label>
          </div>
        </div>

        {/* Edit Form */}
        <form id="edit-listing-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm font-semibold text-gray-700 mb-1.5 block">Title</Label>
            <Input id="title" className="h-11 rounded-xl" {...register('title')} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-semibold text-gray-700 mb-1.5 block">Description</Label>
            <Textarea id="description" rows={4} className="rounded-xl resize-none" {...register('description')} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <Label htmlFor="location" className="text-sm font-semibold text-gray-700 mb-1.5 block">Location</Label>
            <Input id="location" className="h-11 rounded-xl" {...register('location')} />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pricePerNight" className="text-sm font-semibold text-gray-700 mb-1.5 block">Price / Night (USD)</Label>
              <Input id="pricePerNight" type="number" min={1} step="0.01" className="h-11 rounded-xl" {...register('pricePerNight', { valueAsNumber: true })} />
              {errors.pricePerNight && <p className="text-red-500 text-xs mt-1">{errors.pricePerNight.message}</p>}
            </div>
            <div>
              <Label htmlFor="guests" className="text-sm font-semibold text-gray-700 mb-1.5 block">Max Guests</Label>
              <Input id="guests" type="number" min={1} className="h-11 rounded-xl" {...register('guests', { valueAsNumber: true })} />
              {errors.guests && <p className="text-red-500 text-xs mt-1">{errors.guests.message}</p>}
            </div>
          </div>

          <div className="pt-4 flex gap-3 justify-end border-t border-gray-100">
            <Button type="button" variant="outline" className="rounded-full" onClick={onClose} disabled={isSubmitting || updateMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-full bg-[#ff4a26] hover:bg-[#e03e20] text-white" disabled={isSubmitting || updateMutation.isPending}>
              {isSubmitting || updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </DialogContent>
  )
}

// ── Delete confirm modal ──────────────────────────────────────────────────────

function DeleteConfirmModal({
  listing,
  onConfirm,
  onClose,
  isPending,
}: {
  listing: HostListing
  onConfirm: () => void
  onClose: () => void
  isPending: boolean
}) {
  return (
    <DialogContent className="sm:max-w-md rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-lg font-bold text-red-600">Delete Listing</DialogTitle>
        <DialogDescription className="text-sm text-gray-500">
          This action cannot be undone. This will permanently delete:
        </DialogDescription>
      </DialogHeader>
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
        {listing.photos[0] ? (
          <img src={listing.photos[0].url} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center shrink-0">
            <HiOutlinePhoto className="text-gray-400 text-2xl" />
          </div>
        )}
        <div>
          <p className="font-bold text-gray-900 text-sm">{listing.title}</p>
          <p className="text-xs text-gray-500">{listing.location}</p>
        </div>
      </div>
      <div className="flex gap-3 mt-2">
        <Button variant="outline" className="flex-1 rounded-full" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          className="flex-1 rounded-full bg-red-600 hover:bg-red-700 text-white"
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? 'Deleting…' : 'Delete Listing'}
        </Button>
      </div>
    </DialogContent>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function MyListingsPage() {
  const [page, setPage] = useState(1)
  const [editListingId, setEditListingId] = useState<string | null>(null)
  const [deleteListing, setDeleteListing] = useState<HostListing | null>(null)

  const { data, isLoading, isError } = useHostListings(page, 10)
  const deleteMutation = useDeleteListing()

  const listings = data?.data ?? []
  const meta = data?.meta
  console.log(listings)

  const activeEditListing = listings.find(l => l.id === editListingId) || null

  const handleDelete = () => {
    if (!deleteListing) return
    deleteMutation.mutate(deleteListing.id, {
      onSuccess: () => {
        toast.success('Listing deleted successfully')
        setDeleteListing(null)
      },
      onError: (err) => {
        toast.error(err.message ?? 'Failed to delete listing')
      },
    })
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pb-10">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Listings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {meta ? `${meta.total} listing${meta.total !== 1 ? 's' : ''}` : 'Manage your properties'}
          </p>
        </div>
        <Button asChild className="bg-[#ff4a26] hover:bg-[#e03e20] text-white rounded-full shadow-md shadow-[#ff4a26]/20">
          <Link to="/dashboard/create-listing">
            <HiOutlinePlusCircle className="mr-2 text-lg" /> Add Listing
          </Link>
        </Button>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-gray-400">
            <p className="font-medium">Failed to load listings</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <HiOutlineHome className="text-6xl mx-auto mb-4 text-gray-200" />
            <p className="text-gray-500 font-semibold text-lg">No listings yet</p>
            <p className="text-gray-400 text-sm mb-6 mt-1">Start earning by adding your first property</p>
            <Button asChild className="bg-[#ff4a26] hover:bg-[#e03e20] text-white rounded-full">
              <Link to="/dashboard/create-listing">
                <HiOutlinePlusCircle className="mr-2" /> Create Your First Listing
              </Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80">
                <TableHead className="pl-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Property</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Type</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Price / night</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Guests</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Rating</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Bookings</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Reviews</TableHead>
                <TableHead className="pr-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.id} className="hover:bg-gray-50/60 transition-colors">
                  {/* Property */}
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      {listing.photos[0] ? (
                        <img
                          src={listing.photos[0].url}
                          alt={listing.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                          <HiOutlinePhoto className="text-gray-400 text-xl" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link
                          to={`/listing/${listing.id}`}
                          className="font-semibold text-gray-900 text-sm hover:text-[#ff4a26] transition-colors block truncate max-w-[200px]"
                        >
                          {listing.title}
                        </Link>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{listing.location}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Type */}
                  <TableCell><TypeBadge type={listing.type} /></TableCell>

                  {/* Price */}
                  <TableCell>
                    <span className="font-bold text-gray-900 text-sm">{fmtCurrency(listing.pricePerNight)}</span>
                  </TableCell>

                  {/* Guests */}
                  <TableCell>
                    <span className="text-sm text-gray-600">{listing.guests} guests</span>
                  </TableCell>

                  {/* Rating */}
                  <TableCell>
                    {listing.rating != null ? (
                      <div className="flex items-center gap-1">
                        <HiOutlineStar className="text-amber-400 text-sm" />
                        <span className="text-sm font-semibold text-gray-900">{listing.rating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No rating</span>
                    )}
                  </TableCell>

                  {/* Bookings */}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <HiOutlineCalendarDays className="text-[#ff4a26] text-sm" />
                      <span className="text-sm font-semibold text-gray-900">{listing._count.bookings}</span>
                    </div>
                  </TableCell>

                  {/* Reviews */}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <HiOutlineStar className="text-indigo-400 text-sm" />
                      <span className="text-sm font-semibold text-gray-900">{listing._count.reviews}</span>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg h-8 w-8 p-0"
                        onClick={() => setEditListingId(listing.id)}
                        title="Edit"
                      >
                        <HiOutlinePencilSquare className="text-base" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg h-8 w-8 p-0"
                        onClick={() => setDeleteListing(listing)}
                        title="Delete"
                      >
                        <HiOutlineTrash className="text-base" />
                      </Button>
                    </div>
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
            Page {meta.page} of {meta.totalPages} · {meta.total} listings
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

      {/* ── Modals ── */}
      <Dialog open={!!editListingId} onOpenChange={(open) => { if (!open) setEditListingId(null) }}>
        {activeEditListing && <EditListingModal listing={activeEditListing} onClose={() => setEditListingId(null)} />}
      </Dialog>

      <Dialog open={!!deleteListing} onOpenChange={(open) => { if (!open) setDeleteListing(null) }}>
        {deleteListing && (
          <DeleteConfirmModal
            listing={deleteListing}
            onConfirm={handleDelete}
            onClose={() => setDeleteListing(null)}
            isPending={deleteMutation.isPending}
          />
        )}
      </Dialog>
    </div>
  )
}
