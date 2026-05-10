import { useRef, useState, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import type { FeaturedListing } from '../types'
import { HomeListingCard } from './HomeListingCard'

type Props = {
  title: string
  listings: FeaturedListing[]
  hasSeeAll?: boolean
  subtitle?: string
}

export function SectionCarousel({ title, listings, hasSeeAll, subtitle }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [listings])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
      setTimeout(checkScroll, 300)
    }
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-[26px] font-semibold text-gray-900 tracking-tight">{title}</h2>
            <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-gray-200">
              <FaChevronRight className="w-3 h-3 text-gray-600" />
            </button>
          </div>
          {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center transition-all cursor-pointer ${
              !canScrollLeft ? 'opacity-30 cursor-not-allowed' : 'hover:shadow-md hover:scale-105'
            }`}
          >
            <FaChevronLeft className="w-3 h-3 text-gray-600" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center transition-all cursor-pointer ${
              !canScrollRight ? 'opacity-30 cursor-not-allowed' : 'hover:shadow-md hover:scale-105'
            }`}
          >
            <FaChevronRight className="w-3 h-3 text-gray-600" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {listings.map((listing) => (
          <div key={listing.id} className="snap-start">
            <HomeListingCard listing={listing} />
          </div>
        ))}
        {hasSeeAll && (
          <div className="snap-start">
            <HomeListingCard listing={listings[0]} isSeeAll />
          </div>
        )}
      </div>
    </section>
  )
}
