import { useEffect } from 'react'
import { listings } from '../../../data/listings'
import { useStore } from '../../../store/useStore'

export function useListings() {
  const { dispatch } = useStore()

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true })
    const timer = window.setTimeout(() => {
      dispatch({ type: 'SET_LISTINGS', payload: listings })
      dispatch({ type: 'SET_LOADING', payload: false })
    }, 1500)

    return () => {
      window.clearTimeout(timer)
    }
  }, [dispatch])
}
