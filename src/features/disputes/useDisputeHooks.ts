import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { Dispute, DisputeMessage } from './types'

// ── My disputes (guest / host) ────────────────────────────────────────────────
export function useMyDisputes(page = 1, limit = 10) {
  return useQuery<{ data: Dispute[]; meta: { page: number; totalPages: number; total: number } }>({
    queryKey: ['my-disputes', page],
    queryFn: () => api.get(`/api/v1/disputes/me?page=${page}&limit=${limit}`),
    placeholderData: (prev) => prev,
  })
}

// ── Single dispute detail ────────────────────────────────────────────────────
export function useDisputeDetail(id: string) {
  return useQuery<Dispute>({
    queryKey: ['dispute', id],
    queryFn: () => api.get(`/api/v1/disputes/${id}`),
    enabled: !!id,
  })
}

// ── Messages in a dispute ─────────────────────────────────────────────────────
export function useDisputeMessages(disputeId: string) {
  return useQuery<{ data: DisputeMessage[]; disputeId: string }>({
    queryKey: ['dispute-messages', disputeId],
    queryFn: () => api.get(`/api/v1/disputes/${disputeId}/messages`),
    enabled: !!disputeId,
    refetchInterval: 10_000, // poll every 10s for new messages
  })
}

// ── Send a message (text + optional images via FormData) ──────────────────────
export function useSendDisputeMessage(disputeId: string) {
  const qc = useQueryClient()
  return useMutation<DisputeMessage, Error, FormData>({
    mutationFn: (form) => api.post(`/api/v1/disputes/${disputeId}/messages`, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dispute-messages', disputeId] })
      qc.invalidateQueries({ queryKey: ['dispute', disputeId] })
    },
  })
}

// ── Escalate dispute ──────────────────────────────────────────────────────────
export function useEscalateDispute() {
  const qc = useQueryClient()
  return useMutation<Dispute, Error, string>({
    mutationFn: (id) => api.patch(`/api/v1/disputes/${id}/escalate`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-disputes'] })
      qc.invalidateQueries({ queryKey: ['dispute'] })
    },
  })
}

// ── Create dispute ────────────────────────────────────────────────────────────
export function useCreateDispute() {
  const qc = useQueryClient()
  return useMutation<Dispute, Error, { title: string; description: string; reason: string; bookingId: string }>({
    mutationFn: (data) => api.post('/api/v1/disputes', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-disputes'] })
    },
  })
}
