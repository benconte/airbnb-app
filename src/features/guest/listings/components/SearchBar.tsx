import debounce from 'lodash/debounce'
import { useEffect, useRef, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HiMagnifyingGlass } from 'react-icons/hi2'
import { useStore } from '../../../../store/useStore'

export function SearchBar() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const { state: { loading, listings } } = useStore() // Get loading state just for UI spinner

  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState(initialSearch)
  const [isFocused, setIsFocused] = useState(false)

  // Sync input if URL changes externally (e.g., clicking clear all)
  useEffect(() => {
    setQuery(searchParams.get('search') || '')
  }, [searchParams])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const commitSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchParams(prev => {
          const next = new URLSearchParams(prev)
          if (value.trim()) {
            next.set('search', value.trim())
          } else {
            next.delete('search')
          }
          return next
        }, { replace: true })
      }, 300),
    [setSearchParams],
  )

  useEffect(() => {
    return () => {
      commitSearch.cancel()
    }
  }, [commitSearch])

  return (
    <label className="grid gap-1.5 w-full">
      <span className="text-[0.8rem] text-slate-500 font-medium">Find stays</span>
      <div
        className={[
          'relative flex items-center w-full h-11 rounded-xl border bg-white transition-colors duration-200',
          isFocused ? 'border-[#ff4a26] ring-2 ring-[#ff4a26]/20' : 'border-[#dbe3f0]',
        ].join(' ')}
      >
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
          placeholder="Search by title or location..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            commitSearch(e.target.value)
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full h-full bg-transparent pl-9 pr-10 text-[0.95rem] text-gray-800 placeholder:text-slate-400 outline-none rounded-xl"
        />

        <div className="absolute right-3 flex items-center">
          {loading ? (
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
