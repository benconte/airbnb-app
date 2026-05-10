import { cn } from '@/lib/utils'
import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { List, type RowComponentProps } from 'react-window'
import { Spinner } from '../../../../shared/components/Spinner'
import { useStore } from '../../../../store/useStore'
import { ListingFiltersSidebar } from '../components/ListingFiltersSidebar'
import { ListingCard } from '../components/ListingCard'
import { SavedListings } from '../components/SavedListings'
import { SearchBar } from '../components/SearchBar'
import { useFavorites } from '../hooks/useFavorites'
import { useListings } from '../hooks/useListings'
import type { Listing } from '../types'
import useIsMobile from '../hooks/useIsMobile'

const ROW_HEIGHT = 212
const ROW_GAP = 12

type RowRendererProps = {
  listings: Listing[]
  isSaved: (id: string) => boolean
  onToggleSave: (id: string, title: string) => void
}

function RowRenderer({ index, style, listings, isSaved, onToggleSave }: RowComponentProps<RowRendererProps>) {
  const listing = listings[index]
  return (
    <div style={style}>
      <div className="pb-3">
        <ListingCard
          listing={listing}
          saved={isSaved(listing.id)}
          onToggleSave={() => onToggleSave(listing.id, listing.title)}
        />
      </div>
    </div>
  )
}

type SortBy = 'latest' | 'price-low' | 'price-high' | 'rating'

type AppliedFilters = {
  minPrice: number
  maxPrice: number
  categories: string[]
  sortBy: SortBy
}

export function ListingsPage() {
  useListings()
  const {
    state: { listings, loading, filter },
    dispatch,
  } = useStore()
  const favorites = useFavorites()
  const isMobile = useIsMobile()

  const FULL_ROW_HEIGHT = isMobile ? 420 : ROW_HEIGHT + ROW_GAP
  const [savedOnly, setSavedOnly] = useState(false)
  const [showSavedPanel, setShowSavedPanel] = useState(false)
  const [minPrice, setMinPrice] = useState(50)
  const [maxPrice, setMaxPrice] = useState(5000)
  const [sortBy, setSortBy] = useState<SortBy>('latest')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({
    minPrice: 50,
    maxPrice: 5000,
    categories: [],
    sortBy: 'latest',
  })

  const listRef = useRef<{
    element: HTMLDivElement
    scrollToRow: (config: { align?: 'center' | 'auto' | 'end' | 'smart' | 'start'; behavior?: 'auto' | 'instant' | 'smooth'; index: number }) => void
  }>(null)
  const listContainerRef = useRef<HTMLDivElement>(null)

  const filteredListings = useMemo(() => {
    const normalizedQuery = filter.trim().toLowerCase()

    const queryFiltered = listings.filter((listing) => {
      if (!normalizedQuery) return true
      return (
        listing.title.toLowerCase().includes(normalizedQuery) ||
        listing.location.toLowerCase().includes(normalizedQuery)
      )
    })

    const priceAndCategoryFiltered = queryFiltered.filter((listing) => {
      const inPriceRange =
        listing.pricePerNight >= appliedFilters.minPrice &&
        listing.pricePerNight <= appliedFilters.maxPrice
      const inCategory =
        appliedFilters.categories.length === 0 ||
        appliedFilters.categories.includes(listing.type)
      return inPriceRange && inCategory
    })

    const sorted = [...priceAndCategoryFiltered]

    if (appliedFilters.sortBy === 'price-low') sorted.sort((a, b) => a.pricePerNight - b.pricePerNight)
    if (appliedFilters.sortBy === 'price-high') sorted.sort((a, b) => b.pricePerNight - a.pricePerNight)
    if (appliedFilters.sortBy === 'rating') sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))

    return savedOnly ? sorted.filter((listing) => favorites.isSaved(listing.id)) : sorted
  }, [appliedFilters, favorites, filter, listings, savedOnly])

  // Sync window scroll → react-window scroll offset
  const handleWindowScroll = useCallback(() => {
    if (!listContainerRef.current || !listRef.current) return
    const { top } = listContainerRef.current.getBoundingClientRect()
    const scrolledPastTop = Math.max(0, -top)
    listRef.current.element.scrollTop = scrolledPastTop
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleWindowScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleWindowScroll)
  }, [handleWindowScroll])

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  const applyFilters = () => {
    setAppliedFilters({
      minPrice: Math.min(minPrice, maxPrice),
      maxPrice: Math.max(minPrice, maxPrice),
      categories: selectedCategories,
      sortBy,
    })
  }

  const clearFilters = () => {
    setMinPrice(50)
    setMaxPrice(5000)
    setSelectedCategories([])
    setSortBy('latest')
    dispatch({ type: 'SET_FILTER', payload: '' })
    setAppliedFilters({ minPrice: 50, maxPrice: 5000, categories: [], sortBy: 'latest' })
  }

  const rowProps = useMemo(
    () => ({
      listings: filteredListings,
      isSaved: favorites.isSaved,
      onToggleSave: favorites.toggle,
    }),
    [favorites, filteredListings],
  )

  const listHeight = filteredListings.length * FULL_ROW_HEIGHT

  return (
    <div className="bg-[#f9f5f4] min-h-svh">
      <main className="max-w-[1240px] mx-auto text-gray-800 px-5 pt-6 pb-10">
        <section className="grid grid-cols-[280px_1fr] gap-[18px] max-[960px]:grid-cols-1">
          <ListingFiltersSidebar
            minPrice={minPrice}
            maxPrice={maxPrice}
            selectedCategories={selectedCategories}
            sortBy={sortBy}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            onToggleCategory={toggleCategory}
            onSortByChange={setSortBy}
            onApplyFilters={applyFilters}
            onClearFilters={clearFilters}
          />

          <section className="min-w-0">
            {/* Header row */}
            <section className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-3 items-end mb-3.5 max-[960px]:grid-cols-1">
              <SearchBar />
              <button
                type="button"
                className={cn(
                  'cursor-pointer h-11 rounded-xl border font-bold px-4 transition-colors',
                  savedOnly
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-white border-[#dbe3f0] text-slate-700 hover:bg-gray-50',
                )}
                onClick={() => setSavedOnly((prev) => !prev)}
              >
                {savedOnly ? 'Show All' : 'Saved Only'}
              </button>
              {/* <button
                type="button"
                className="cursor-pointer h-11 rounded-xl border border-[#dbe3f0] bg-white text-slate-700 font-bold px-4 hover:bg-gray-50 transition-colors"
                onClick={() => setShowSavedPanel((prev) => !prev)}
              >
                Saved panel
              </button> */}
              <button
                type="button"
                className="cursor-pointer h-11 rounded-xl border border-[#dbe3f0] bg-white text-slate-700 font-bold px-4 hover:bg-gray-50 transition-colors"
                onClick={() => dispatch({ type: 'RESET' })}
              >
                Clear All
              </button>
            </section>

            <p className="m-0 mb-4 text-slate-500 text-[0.9rem]">
              All {filteredListings.length.toLocaleString()} listings found
            </p>

            {loading ? (
              <div className="grid place-items-center h-full">
                <Spinner />
              </div>
            ) : filteredListings.length === 0 ? (
              <p className="py-10 px-4 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500 bg-white">
                No listings match your current search and filters.
              </p>
            ) : isMobile ? (
              <div className="flex flex-col gap-3">
                {filteredListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    saved={favorites.isSaved(listing.id)}
                    onToggleSave={() => favorites.toggle(listing.id, listing.title)}
                  />
                ))}
              </div>
            ) : (
              <div ref={listContainerRef} style={{ height: listHeight }}>
                <div className="sticky top-[76px] h-screen overflow-hidden pointer-events-auto">
                  <List
                    listRef={listRef}
                    style={{ height: '100vh', overflow: 'hidden' }}
                    rowCount={filteredListings.length}
                    rowHeight={FULL_ROW_HEIGHT}
                    rowComponent={RowRenderer}
                    rowProps={rowProps}
                  />
                </div>
              </div>
            )}
          </section>
        </section>
      </main>

      <SavedListings open={showSavedPanel} />
    </div>
  )
}
