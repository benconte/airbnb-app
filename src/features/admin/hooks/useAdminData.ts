import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import type {
  AdminStats,
  AdminUser,
  AdminListing,
  AdminBooking,
  AdminDispute,
  PaginatedResponse,
  CreateDisputeData,
} from '../types/admin'

// ── Admin Stats ───────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get<AdminStats>('/api/v1/admin/stats'),
    staleTime: 1000 * 60 * 2, // 2 min
  })
}

// ── Users ─────────────────────────────────────────────────────────────────────

export function useAdminUsers(page = 1, limit = 10, role?: string) {
  return useQuery<PaginatedResponse<AdminUser>>({
    queryKey: ['admin', 'users', page, limit, role],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (role) params.set('role', role)
      return api.get<PaginatedResponse<AdminUser>>(`/api/v1/users?${params}`)
    },
    staleTime: 1000 * 30,
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.delete<void>(`/api/v1/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation<AdminUser, Error, { id: string; data: Partial<AdminUser> }>({
    mutationFn: ({ id, data }) => api.put<AdminUser>(`/api/v1/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

// ── Listings ──────────────────────────────────────────────────────────────────

export function useAdminListings(page = 1, limit = 10, type?: string) {
  return useQuery<PaginatedResponse<AdminListing>>({
    queryKey: ['admin', 'listings', page, limit, type],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (type) params.set('type', type)
      return api.get<PaginatedResponse<AdminListing>>(`/api/v1/listings?${params}`)
    },
    staleTime: 1000 * 30,
  })
}

export function useAdminDeleteListing() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.delete<void>(`/api/v1/listings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

// ── Bookings ──────────────────────────────────────────────────────────────────

export function useAdminBookings(page = 1, limit = 10, status?: string) {
  return useQuery<PaginatedResponse<AdminBooking>>({
    queryKey: ['admin', 'bookings', page, limit, status],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (status) params.set('status', status)
      return api.get<PaginatedResponse<AdminBooking>>(`/api/v1/bookings?${params}`)
    },
    staleTime: 1000 * 30,
  })
}

export function useAdminUpdateBookingStatus() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, { id: string; status: string }>({
    mutationFn: ({ id, status }) => api.patch<void>(`/api/v1/bookings/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

// ── Disputes ──────────────────────────────────────────────────────────────────

export function useAdminDisputes(page = 1, limit = 10, status?: string, reason?: string) {
  return useQuery<PaginatedResponse<AdminDispute>>({
    queryKey: ['admin', 'disputes', page, limit, status, reason],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (status) params.set('status', status)
      if (reason) params.set('reason', reason)
      return api.get<PaginatedResponse<AdminDispute>>(`/api/v1/disputes?${params}`)
    },
    staleTime: 1000 * 30,
  })
}

export function useUpdateDisputeStatus() {
  const queryClient = useQueryClient()
  return useMutation<AdminDispute, Error, { id: string; status: string; resolution?: string }>({
    mutationFn: ({ id, status, resolution }) =>
      api.patch<AdminDispute>(`/api/v1/disputes/${id}/status`, { status, resolution }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'disputes'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

export function useDeleteDispute() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.delete<void>(`/api/v1/disputes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'disputes'] })
    },
  })
}

export function useCreateDispute() {
  const queryClient = useQueryClient()
  return useMutation<AdminDispute, Error, CreateDisputeData>({
    mutationFn: (data) => api.post<AdminDispute>('/api/v1/disputes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'disputes'] })
    },
  })
}
