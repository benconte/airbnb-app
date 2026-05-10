import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import { useStore } from '../../../store/useStore'
import type { ListingsResponse } from '../types'

export function useListings() {
  const { dispatch } = useStore()

  const { data, isLoading, error } = useQuery<ListingsResponse>({
    queryKey: ['listings'],
    queryFn: () => api.get('/api/v1/listings'),
  })

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: isLoading })
    if (data?.data) {
      dispatch({ type: 'SET_LISTINGS', payload: data.data })
    }
  }, [data, isLoading, dispatch])

  return { listings: data?.data || [], isLoading, error }
}
