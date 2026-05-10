import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import type { FeaturedResponse } from '../types'

interface UseHomeListingsOptions {
  sections?: number
  perSection?: number
}

export function useHomeListings({ sections = 3, perSection = 8 }: UseHomeListingsOptions = {}) {
  const params = new URLSearchParams({
    sections: String(sections),
    perSection: String(perSection),
  })

  const { data, isLoading, error } = useQuery<FeaturedResponse>({
    queryKey: ['home-listings', sections, perSection],
    queryFn: () => api.get<FeaturedResponse>(`/api/v1/listings/featured?${params}`),
    staleTime: 2 * 60 * 1000, // 2 min — matches server cache TTL
  })

  return {
    sections: data?.sections ?? [],
    isLoading,
    error,
  }
}
