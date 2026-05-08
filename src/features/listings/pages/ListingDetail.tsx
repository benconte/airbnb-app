import { useMemo } from 'react'
import { getListingById } from '../../../data/listings'
import { PhotoGallery } from '../components/PhotoGallery'
import { RatingBreakdown } from '../components/RatingBreakdown'
import { BookingSidebar } from '../components/BookingSidebar'
import { AmenitiesSection } from '../components/AmenitiesSection'
import { PricingSection } from '../components/PricingSection'

function getIdFromPath(): number {
  const parts = window.location.pathname.split('/')
  const id = parseInt(parts[parts.length - 1], 10)
  return isNaN(id) ? 1 : id
}

function StarIcons({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= Math.round(rating) ? '#f0a500' : '#ddd'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  )
}

export function ListingDetail() {
  const id = useMemo(() => getIdFromPath(), [])
  const listing = getListingById(id)

  if (!listing) {
    return (
      <div className="max-w-lg mx-auto mt-24 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing not found</h2>
        <p className="text-gray-500 mb-6">No listing with ID {id} exists.</p>
        <a href="/" className="text-[#ff4a26] font-semibold hover:underline">← Back to listings</a>
      </div>
    )
  }

  const availableDate = new Date(listing.availableFrom).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className='bg-white'>
      <div className="max-w-[1200px] mx-auto px-6 py-8 pb-20">
        {/* Header */}
        <div className="flex justify-between items-start gap-6 mb-6">
          <div className="flex flex-col gap-2.5">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#ff4a26] transition-colors no-underline"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Listings
            </a>
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{listing.title}</h1>
            <div className="flex items-center flex-wrap gap-2 text-[13px]">
              <span className="bg-[#fff4f2] text-[#ff4a26] border border-[#ffd0c5] rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize">
                {listing.category}
              </span>
              <span className="text-gray-300">/</span>
              <StarIcons rating={listing.rating} />
              <span className="text-[#ff4a26] font-semibold">
                ({listing.rating}) {listing.reviews.toLocaleString()} reviews
              </span>
              <span className="text-gray-300">/</span>
              <span className="flex items-center gap-1 text-gray-500">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {listing.location}
              </span>
              <span className="text-gray-300">/</span>
              {listing.available ? (
                <span className="text-green-600 font-semibold">● Available</span>
              ) : (
                <span className="text-amber-600 font-semibold">● From {availableDate}</span>
              )}
              {listing.superhost && (
                <>
                  <span className="text-gray-300">/</span>
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                    ⭐ Superhost
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <button className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 text-xs font-semibold text-gray-700 hover:border-[#ff4a26] hover:text-[#ff4a26] transition-colors bg-transparent cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Save this listing
            </button>
            <p className="text-xs text-gray-400">46 people bookmarked this place</p>
          </div>
        </div>

        {/* Gallery */}
        <PhotoGallery images={listing.images} title={listing.title} />

        <p className="text-right text-xs text-gray-400 mt-3 mb-8">
          <strong className="text-gray-600">Published:</strong>{' '}
          {new Date(listing.availableFrom).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>

        {/* Body: main content + sticky sidebar */}
        <div className="flex gap-12 items-start">
          <main className="flex-1 min-w-0 flex flex-col gap-10">
            <section>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-4">
                About this <span className="text-[#ff4a26] font-[caveat] font-extrabold">hotel</span>
              </h2>
              <p className="text-sm text-gray-500 leading-7">{listing.description}</p>
            </section>

            <AmenitiesSection />

            <PricingSection />

            <section>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-5">
                Latest <span className="text-[#ff4a26] italic">Reviews</span>
              </h2>
              <RatingBreakdown rating={listing.rating} reviews={listing.reviews} />
            </section>
          </main>

          <div className="sticky top-6 w-[320px] shrink-0">
            <BookingSidebar
              price={listing.price}
              available={listing.available}
              availableFrom={listing.availableFrom}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
