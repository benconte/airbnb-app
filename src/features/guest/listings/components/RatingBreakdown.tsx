import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../../lib/api'
import type { Review, ReviewsResponse } from '../types'
import { Skeleton } from '../../../../shared/ui/skeleton'
import { Button } from '../../../../shared/ui/button'
import { Textarea } from '../../../../shared/ui/textarea'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../../auth/hooks/useAuth'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../../shared/ui/dialog'
import { format } from 'date-fns'

interface Props {
  listingId: string
  rating: number
  totalReviews: number
}

function StarRating({ value, interactive = false, onChange }: {
  value: number
  interactive?: boolean
  onChange?: (v: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  const display = interactive ? (hovered || value) : value

  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={s <= Math.round(display) ? '#f0a500' : '#ddd'}
          className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
          onMouseEnter={() => interactive && setHovered(s)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange?.(s)}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const initials = review.user.name.charAt(0).toUpperCase()

  return (
    <div className="border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        {review.user.avatar ? (
          <img
            src={review.user.avatar}
            alt={review.user.name}
            className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-100"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#ff4a26]/10 text-[#ff4a26] flex items-center justify-center font-bold text-sm shrink-0">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900">{review.user.name}</p>
            <div className="flex items-center gap-1.5">
              <StarRating value={review.rating} />
              <span className="text-xs font-semibold text-gray-500">{review.rating}/5</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {format(new Date(review.createdAt), 'MMM d, yyyy')}
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
    </div>
  )
}

function ReviewSkeleton() {
  return (
    <div className="border border-gray-100 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  )
}

function AddReviewDialog({ listingId, onSuccess }: { listingId: string; onSuccess: () => void }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      api.post(`/api/v1/listings/${listingId}/reviews`, { rating, comment }),
    onSuccess: () => {
      toast.success('Review submitted!')
      setOpen(false)
      setComment('')
      setRating(5)
      onSuccess()
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to submit review')
    },
  })

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="cursor-pointer rounded-full border-[#ff4a26] text-[#ff4a26] hover:bg-[#fff4f2]">
          Write a review
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader className='cursor-pointer'>
          <DialogTitle>Leave a Review</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-5 pt-2">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Your rating</p>
            <StarRating value={rating} interactive onChange={setRating} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Your comment</p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this property..."
              rows={4}
              className="resize-none"
            />
          </div>
          <Button
            onClick={() => mutate()}
            disabled={isPending || !comment.trim()}
            className="bg-[#ff4a26] hover:bg-[#e03a18] rounded-full w-full"
          >
            {isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Build star breakdown data from real reviews
function buildBreakdown(reviews: Review[]) {
  const counts = [0, 0, 0, 0, 0]
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++
  })
  const max = Math.max(...counts, 1)
  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: counts[stars - 1],
    pct: (counts[stars - 1] / max) * 100,
  }))
}

export function RatingBreakdown({ listingId, rating, totalReviews }: Props) {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const limit = 6

  const { data, isLoading } = useQuery<ReviewsResponse>({
    queryKey: ['reviews', listingId, page],
    queryFn: () => api.get(`/api/v1/listings/${listingId}/reviews?page=${page}&limit=${limit}`),
    placeholderData: (prev) => prev,
  })

  const reviews = data?.data ?? []
  const meta = data?.meta
  const breakdown = buildBreakdown(reviews)

  const invalidateReviews = () => {
    queryClient.invalidateQueries({ queryKey: ['reviews', listingId] })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Rating summary */}
      <div className="flex flex-col sm:flex-row gap-6 border border-gray-100 rounded-2xl px-6 py-5 bg-gray-50/50">
        {/* Average score */}
        <div className="flex flex-col items-center justify-center gap-1 min-w-[100px]">
          <div className="relative flex items-center justify-center">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#ff4a26" strokeWidth="1.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="absolute text-sm font-bold text-[#ff4a26]">{rating || '–'}</span>
          </div>
          <p className="text-xs text-gray-400 text-center leading-tight">
            {totalReviews.toLocaleString()} review{totalReviews !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Star bars */}
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-700 mb-3">Rating breakdown</p>
          <div className="flex flex-col gap-2">
            {breakdown.map((row) => (
              <div key={row.stars} className="flex items-center gap-2.5">
                <span className="text-xs text-gray-500 w-4 text-right shrink-0">{row.stars}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#f0a500" className="shrink-0">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#ff4a26] transition-all duration-500"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-5 text-left shrink-0">{row.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center sm:items-start sm:pt-1">
          <AddReviewDialog listingId={listingId} onSuccess={invalidateReviews} />
        </div>
      </div>

      {/* Review cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <ReviewSkeleton key={i} />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="text-sm font-medium">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Previous
          </Button>
          <span className="text-xs text-gray-500">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  )
}
