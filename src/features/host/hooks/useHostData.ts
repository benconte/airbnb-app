import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import type {
  HostAnalytics,
  HostBooking,
  HostListing,
  PaginatedResponse,
  CreateListingData,
} from '../types/host'
import type { ListingPricing } from '../../guest/listings/types'

// ── Analytics ─────────────────────────────────────────────────────────────────

export function useHostAnalytics() {
  return useQuery<HostAnalytics>({
    queryKey: ['host', 'analytics'],
    queryFn: () => api.get<HostAnalytics>('/api/v1/host/analytics'),
    staleTime: 1000 * 60 * 2, // 2 min
  })
}

// ── Listings ──────────────────────────────────────────────────────────────────

export function useHostListings(page = 1, limit = 20) {
  return useQuery<PaginatedResponse<HostListing>>({
    queryKey: ['host', 'listings', page, limit],
    queryFn: () =>
      api.get<PaginatedResponse<HostListing>>(
        `/api/v1/host/listings?page=${page}&limit=${limit}`,
      ),
    staleTime: 1000 * 30,
  })
}

export function useCreateListing() {
  const queryClient = useQueryClient()
  return useMutation<HostListing, Error, CreateListingData>({
    mutationFn: (data) => api.post<HostListing>('/api/v1/listings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host', 'listings'] })
      queryClient.invalidateQueries({ queryKey: ['host', 'analytics'] })
    },
  })
}

export function useUpdateListing() {
  const queryClient = useQueryClient()
  return useMutation<HostListing, Error, { id: string; data: Partial<CreateListingData> }>({
    mutationFn: ({ id, data }) => api.put<HostListing>(`/api/v1/listings/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host', 'listings'] })
      queryClient.invalidateQueries({ queryKey: ['host', 'analytics'] })
    },
  })
}

export function useDeleteListing() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.delete<void>(`/api/v1/listings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host', 'listings'] })
      queryClient.invalidateQueries({ queryKey: ['host', 'analytics'] })
    },
  })
}

export function useUploadListingPhoto() {
  const queryClient = useQueryClient()
  return useMutation<{ photos: { id: string; url: string }[] }, Error, { id: string; file: File }>({
    mutationFn: async ({ id, file }) => {
      const formData = new FormData()
      formData.append('photos', file)
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/listings/${id}/photos`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to upload photo')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host', 'listings'] })
    },
  })
}

export function useDeleteListingPhoto() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, { id: string; photoId: string }>({
    mutationFn: ({ id, photoId }) => api.delete<void>(`/api/v1/listings/${id}/photos/${photoId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host', 'listings'] })
    },
  })
}

// ── Bookings ──────────────────────────────────────────────────────────────────

export function useHostBookings(page = 1, limit = 20, status?: string) {
  return useQuery<PaginatedResponse<HostBooking>>({
    queryKey: ['host', 'bookings', page, limit, status],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (status) params.set('status', status)
      return api.get<PaginatedResponse<HostBooking>>(`/api/v1/host/bookings?${params}`)
    },
    staleTime: 1000 * 30,
  })
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, { id: string; status: string }>({
    mutationFn: ({ id, status }) =>
      api.patch<void>(`/api/v1/bookings/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host', 'bookings'] })
      queryClient.invalidateQueries({ queryKey: ['host', 'analytics'] })
    },
  })
}

// ── Listing Pricing Tiers ─────────────────────────────────────────────────────

export function useListingPricings(listingId: string) {
  return useQuery<ListingPricing[]>({
    queryKey: ['listing-pricings', listingId],
    queryFn: () => api.get<ListingPricing[]>(`/api/v1/listings/${listingId}/pricings`),
    enabled: !!listingId,
    staleTime: 1000 * 60,
  })
}

export interface CreatePricingData {
  name: string
  description?: string
  tags: string[]
  price: number
  badge?: string
  sortOrder?: number
}

export function useCreateListingPricing(listingId: string) {
  const queryClient = useQueryClient()
  return useMutation<ListingPricing, Error, CreatePricingData>({
    mutationFn: (data) =>
      api.post<ListingPricing>(`/api/v1/listings/${listingId}/pricings`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing-pricings', listingId] })
    },
  })
}

export function useUpdateListingPricing(listingId: string) {
  const queryClient = useQueryClient()
  return useMutation<ListingPricing, Error, { pricingId: string; data: Partial<CreatePricingData> }>({
    mutationFn: ({ pricingId, data }) =>
      api.patch<ListingPricing>(`/api/v1/listings/${listingId}/pricings/${pricingId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing-pricings', listingId] })
    },
  })
}

export function useDeleteListingPricing(listingId: string) {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (pricingId) =>
      api.delete<void>(`/api/v1/listings/${listingId}/pricings/${pricingId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing-pricings', listingId] })
    },
  })
}
