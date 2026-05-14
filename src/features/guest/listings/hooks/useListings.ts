import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { api } from '../../../../lib/api'
import { useStore } from '../../../../store/useStore'
import type { ListingsResponse } from '../types'

const PAGE_SIZE = 12

export function useListings(page = 1) {
  const { dispatch } = useStore()
  const [searchParams] = useSearchParams()
  
  const search = searchParams.get('search') || ''
  const guests = searchParams.get('guests') || ''

  const isSearch = search || guests

  const { data, isLoading, error } = useQuery<ListingsResponse>({
    queryKey: ['listings', page, search, guests],
    queryFn: () => {
      const endpoint = isSearch ? '/api/v1/listings/search' : '/api/v1/listings'
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', PAGE_SIZE.toString())
      if (search) params.set('search', search)
      if (guests) params.set('guests', guests)
      
      return api.get(`${endpoint}?${params.toString()}`)
    },
    placeholderData: (prev) => prev,
  })

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: isLoading })
    if (data?.data) {
      dispatch({ type: 'SET_LISTINGS', payload: data.data })
    }
  }, [data, isLoading, dispatch])

  return {
    listings: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
  }
}
