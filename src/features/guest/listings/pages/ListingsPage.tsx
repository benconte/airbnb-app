import { cn } from '@/lib/utils'
import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Spinner } from '../../../../shared/components/Spinner'
import { useStore } from '../../../../store/useStore'
import { ListingFiltersSidebar } from '../components/ListingFiltersSidebar'
import { ListingCard } from '../components/ListingCard'
import { SearchBar } from '../components/SearchBar'
import { useFavorites } from '../hooks/useFavorites'
import { useListings } from '../hooks/useListings'

type SortBy = 'latest' | 'price-low' | 'price-high' | 'rating'

type AppliedFilters = {
  minPrice: number
  maxPrice: number
  categories: string[]
  sortBy: SortBy
}

export function ListingsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const { meta, isLoading: hookLoading } = useListings(currentPage)
  const {
    state: { listings, loading },
    dispatch,
  } = useStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const favorites = useFavorites()

  const [savedOnly, setSavedOnly] = useState(false)
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

  const filteredListings = useMemo(() => {
    const priceAndCategoryFiltered = listings.filter((listing) => {
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
  }, [appliedFilters, favorites, listings, savedOnly])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [appliedFilters, searchParams, savedOnly])

  const totalPages = meta?.totalPages ?? 1
  const displayedListings = filteredListings

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
    dispatch({ type: 'RESET' })
    setSearchParams(new URLSearchParams(), { replace: true })
    setAppliedFilters({ minPrice: 50, maxPrice: 5000, categories: [], sortBy: 'latest' })
  }

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
                onClick={clearFilters}
              >
                Clear All
              </button>
            </section>

            <p className="m-0 mb-4 text-slate-500 text-[0.9rem]">
              All {(meta?.total ?? filteredListings.length).toLocaleString()} listings found
            </p>

            {(loading || hookLoading) ? (
              <div className="grid place-items-center h-full">
                <Spinner />
              </div>
            ) : filteredListings.length === 0 ? (
              <p className="py-10 px-4 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500 bg-white">
                No listings match your current search and filters.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {displayedListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    saved={favorites.isSaved(listing.id)}
                    onToggleSave={() => favorites.toggle(listing.id, listing.title)}
                  />
                ))}

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8 mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPage(p => Math.max(1, p - 1))
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      disabled={currentPage === 1}
                      className="cursor-pointer size-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-900 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            type="button"
                            onClick={() => {
                              setCurrentPage(page)
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                            className={cn(
                              "cursor-pointer size-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                              currentPage === page
                                ? "bg-gray-900 text-white"
                                : "hover:bg-gray-100 bg-white text-gray-900"
                            )}
                          >
                            {page}
                          </button>
                        )
                      }

                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-1 text-gray-400">...</span>
                      }

                      return null
                    })}

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPage(p => Math.min(totalPages, p + 1))
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      disabled={currentPage === totalPages}
                      className="cursor-pointer size-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-900 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  )
}
