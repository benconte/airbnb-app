import { FaStar } from 'react-icons/fa'
import type { FeaturedListing } from '../types'
import { Link } from 'react-router-dom'
import { useFavorites } from '../../listings/hooks/useFavorites'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1560347876-aeef00ee58a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'

type Props = {
  listing: FeaturedListing
  isSeeAll?: boolean
}

export function HomeListingCard({ listing, isSeeAll }: Props) {
  const { toggle, isSaved } = useFavorites()

  if (isSeeAll) {
    return (
      <Link to="/listings">
        <div className="flex-none w-[260px] h-full flex items-center justify-center cursor-pointer border border-gray-200 rounded-2xl hover:shadow-lg transition-shadow bg-white relative">
          <div className="flex flex-col items-center">
            <div className="flex -space-x-4 mb-4">
              <img
                src="https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=400&q=80"
                alt="img1"
                className="w-16 h-16 rounded-lg border-2 border-white object-cover transform -rotate-12 translate-y-2 z-10 shadow-sm"
              />
              <img
                src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=400&q=80"
                alt="img2"
                className="w-20 h-20 rounded-lg border-2 border-white object-cover z-20 shadow-md"
              />
              <img
                src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=400&q=80"
                alt="img3"
                className="w-16 h-16 rounded-lg border-2 border-white object-cover transform rotate-12 translate-y-2 z-10 shadow-sm"
              />
            </div>
            <span className="font-semibold text-gray-800 text-lg">See all</span>
          </div>
        </div>
      </Link>
    )
  }

  const imageUrl = listing.photos?.[0]?.url ?? FALLBACK_IMAGE
  const rating = listing.rating
  const saved = isSaved(listing.id)

  return (
    <Link to={`/listing/${listing.id}`}>
      <div className="flex-none w-[260px] cursor-pointer group flex flex-col gap-3">
        <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {listing.guestFavorite && (
            <div className="absolute top-3 left-3 bg-white px-2.5 py-1 rounded-full shadow-md z-10">
              <span className="text-xs font-semibold text-gray-900">Guest favorite</span>
            </div>
          )}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggle(listing.id, listing.title)
            }}
            className="absolute top-3 right-3 text-white/80 hover:scale-110 transition-transform drop-shadow-md z-10 p-1 cursor-pointer"
            aria-label={saved ? "Remove from saved listings" : "Save"}
          >
            <svg
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              role="presentation"
              focusable="false"
              style={{
                display: 'block',
                fill: saved ? '#ff4a26' : 'rgba(0, 0, 0, 0.5)',
                height: 24,
                width: 24,
                stroke: saved ? '#fff' : 'currentColor',
                strokeWidth: 2,
                overflow: 'visible',
              }}
            >
              <path d="m16 28c7-4.733 14-10 14-17 0-1.792-.683-3.583-2.05-4.95-1.367-1.366-3.158-2.05-4.95-2.05-1.791 0-3.583.684-4.949 2.05l-2.051 2.051-2.05-2.051c-1.367-1.366-3.158-2.05-4.95-2.05-1.791 0-3.583.684-4.949 2.05-1.367 1.367-2.051 3.158-2.051 4.95 0 7 7 12.267 14 17z" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-0.5 px-0.5">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-gray-900 truncate pr-2">{listing.title}</h3>
            {rating !== null && (
              <div className="flex items-center gap-1 shrink-0 mt-0.5">
                <FaStar className="w-3 h-3" />
                <span className="text-sm text-gray-800">{rating.toFixed(2)}</span>
              </div>
            )}
          </div>
          <p className="text-[15px] text-gray-500">
            ${listing.pricePerNight.toFixed(0)}
            <span className="text-gray-400"> / night</span>
          </p>
        </div>
      </div>
    </Link>
  )
}
