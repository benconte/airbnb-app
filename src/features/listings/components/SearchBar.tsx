import debounce from 'lodash/debounce'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { HiMagnifyingGlass } from 'react-icons/hi2'
import { api } from '../../../lib/api'
import { useStore } from '../../../store/useStore'
import type { ListingsResponse } from '../types'

/**
 * SearchBar
 * - Debounces the user's input (300 ms) via lodash.debounce
 * - On every debounced change it fires a server search against
 *   GET /api/v1/listings/search?location=<query>
 * - Falls back to the global store filter for backward-compat with the
 *   sidebar price/type filters (those still live in the store).
 */
export function SearchBar() {
  const {
    state: { filter },
    dispatch,
  } = useStore()

  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState(filter ?? '')
  const [debouncedQuery, setDebouncedQuery] = useState(filter ?? '')
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Debounce: update debouncedQuery + sync with global store
  const commitSearch = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedQuery(value)
        dispatch({ type: 'SET_FILTER', payload: value })
      }, 300),
    [dispatch],
  )

  useEffect(() => {
    return () => {
      commitSearch.cancel()
    }
  }, [commitSearch])

  // Query the API whenever the debounced value changes
  const { data, isFetching } = useQuery<ListingsResponse>({
    queryKey: ['listings', 'search', debouncedQuery],
    queryFn: () =>
      api.get<ListingsResponse>(
        `/api/v1/listings/search?location=${encodeURIComponent(debouncedQuery)}&limit=50`,
      ),
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 30_000,
  })

  // Push search results into the global store so the listing grid re-renders
  useEffect(() => {
    if (data?.data) {
      dispatch({ type: 'SET_LISTINGS', payload: data.data })
    }
  }, [data, dispatch])

  return (
    <label className="grid gap-1.5 w-full">
      <span className="text-[0.8rem] text-slate-500 font-medium">Find stays</span>
      <div
        className={[
          'relative flex items-center w-full h-11 rounded-xl border bg-white transition-colors duration-200',
          isFocused ? 'border-[#ff4a26] ring-2 ring-[#ff4a26]/20' : 'border-[#dbe3f0]',
        ].join(' ')}
      >
        {/* Search icon */}
        <HiMagnifyingGlass
          className={[
            'absolute left-3 text-base transition-colors duration-200',
            isFocused ? 'text-[#ff4a26]' : 'text-slate-400',
          ].join(' ')}
        />

        <input
          id="listing-search-input"
          ref={inputRef}
          type="text"
          placeholder="Search by location..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            commitSearch(e.target.value)
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full h-full bg-transparent pl-9 pr-10 text-[0.95rem] text-gray-800 placeholder:text-slate-400 outline-none rounded-xl"
        />

        {/* Loading spinner or clear button */}
        <div className="absolute right-3 flex items-center">
          {isFetching ? (
            <span className="w-4 h-4 border-2 border-[#ff4a26]/30 border-t-[#ff4a26] rounded-full animate-spin" />
          ) : query.length > 0 ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery('')
                commitSearch('')
                commitSearch.flush()
                inputRef.current?.focus()
              }}
              className="w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-[10px] text-slate-600 transition-colors cursor-pointer"
            >
              ✕
            </button>
          ) : null}
        </div>
      </div>
    </label>
  )
}
