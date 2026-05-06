import clsx from 'clsx'
import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { List, type RowComponentProps } from 'react-window'
import { Spinner } from '../../../shared/components/Spinner'
import { useStore } from '../../../store/useStore'
import { ListingFiltersSidebar } from '../components/ListingFiltersSidebar'
import { ListingCard } from '../components/ListingCard'
import { SavedListings } from '../components/SavedListings'
import { SearchBar } from '../components/SearchBar'
import { useFavorites } from '../hooks/useFavorites'
import { useListings } from '../hooks/useListings'
import type { Listing } from '../types'
import '../styles/ListingsPage.css'
import useIsMobile from '../hooks/useIsMobile'

const ROW_HEIGHT = 212
const ROW_GAP = 12
const FULL_ROW_HEIGHT = ROW_HEIGHT + ROW_GAP

type RowRendererProps = {
  listings: Listing[]
  isSaved: (id: number) => boolean
  onToggleSave: (id: number, title: string) => void
}

function RowRenderer({ index, style, listings, isSaved, onToggleSave }: RowComponentProps<RowRendererProps>) {
  const listing = listings[index]
  return (
    <div style={style}>
      <div className="listings-row">
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
  categories: Listing['category'][]
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
  const [minPrice, setMinPrice] = useState(500)
  const [maxPrice, setMaxPrice] = useState(3000)
  const [sortBy, setSortBy] = useState<SortBy>('latest')
  const [selectedCategories, setSelectedCategories] = useState<Listing['category'][]>([])
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
        listing.price >= appliedFilters.minPrice &&
        listing.price <= appliedFilters.maxPrice
      const inCategory =
        appliedFilters.categories.length === 0 ||
        appliedFilters.categories.includes(listing.category)
      return inPriceRange && inCategory
    })

    const sorted = [...priceAndCategoryFiltered]

    if (appliedFilters.sortBy === 'price-low') sorted.sort((a, b) => a.price - b.price)
    if (appliedFilters.sortBy === 'price-high') sorted.sort((a, b) => b.price - a.price)
    if (appliedFilters.sortBy === 'rating') sorted.sort((a, b) => b.rating - a.rating)

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

  const toggleCategory = (category: Listing['category']) => {
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

  // List height = total virtual height so the page expands naturally
  const listHeight = filteredListings.length * FULL_ROW_HEIGHT

  return (
    <div className="site-shell">
      <main className="listings-page page-container">
        <section className="listings-layout">
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

          <section className="listings-content">
            <section className="listings-header">
              <SearchBar />
              <button
                type="button"
                className={clsx('filter-toggle', { 'filter-toggle--active': savedOnly })}
                onClick={() => setSavedOnly((prev) => !prev)}
              >
                {savedOnly ? 'Show All' : 'Saved Only'}
              </button>
              <button
                type="button"
                className="filter-toggle"
                onClick={() => setShowSavedPanel((prev) => !prev)}
              >
                Saved panel
              </button>
              <button type="button" className="filter-toggle" onClick={() => dispatch({ type: 'RESET' })}>
                Clear All
              </button>
            </section>

            <p className="results-count">
              All {filteredListings.length.toLocaleString()} listings found
            </p>

            {loading ? (
              <div className='listings-content-center'>
                <Spinner />
              </div>
            ) : filteredListings.length === 0 ? (
              <p className="empty-state">No listings match your current search and filters.</p>
            ) : isMobile ? (
              <div className="listings-plain">
                {filteredListings.map((listing) => (
                  <div key={listing.id} className="listings-row">
                    <ListingCard
                      listing={listing}
                      saved={favorites.isSaved(listing.id)}
                      onToggleSave={() => favorites.toggle(listing.id, listing.title)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div ref={listContainerRef} style={{ height: listHeight }}>
                <div className="listings-list-sticky">
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
