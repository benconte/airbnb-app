import { format } from 'date-fns'
import numeral from 'numeral'
import { memo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaHeart, FaMapMarkerAlt, FaRegHeart, FaStar } from 'react-icons/fa'
import { IoCallOutline } from 'react-icons/io5'
import type { Listing } from '../types'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/lib/utils'

type ListingCardProps = {
  listing: Listing
  saved: boolean
  onToggleSave: () => void
}

function ListingCardComponent({ listing, saved, onToggleSave }: ListingCardProps) {
  const price = listing.pricePerNight
  const rating = listing.rating ?? 0
  const isLuxury = price > 300
  const isSuperhost = rating >= 4.8
  const imageUrl =
    listing.photos?.[0]?.url ||
    'https://images.unsplash.com/photo-1560347876-aeef00ee58a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'grid grid-cols-[230px_1fr] gap-3 p-2.5 rounded-2xl border bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.08)]',
        saved ? 'border-[#fd8a7c]' : 'border-[#ece6e4]',
        isLuxury && 'shadow-[0_10px_24px_rgba(192,132,252,0.18)]',
        isSuperhost && 'border-[#f7d776]',
        'max-[780px]:grid-cols-1',
      )}
    >
      {/* Image column */}
      <div className="relative">
        <img
          className="w-full min-h-[170px] rounded-xl object-cover"
          src={imageUrl}
          alt={listing.title}
        />
        <p className="absolute top-2 left-2 m-0 rounded-md px-2 py-1 bg-gray-900/65 backdrop-blur-sm text-white text-xs font-bold">
          {numeral(price).format('$0')}
        </p>
        {isSuperhost && (
          <span className="absolute top-9 left-2 rounded-full px-2 py-0.5 text-[0.68rem] font-bold bg-gray-900/65 backdrop-blur-sm text-white">
            Superhost
          </span>
        )}
        {isLuxury && (
          <span className="absolute top-[62px] left-2 rounded-full px-2 py-0.5 text-[0.68rem] font-bold bg-gray-900/65 backdrop-blur-sm text-white">
            Luxury
          </span>
        )}
      </div>

      {/* Content column */}
      <div className="grid gap-2 content-start">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[#ff4a26] text-sm m-0">
            <FaStar />
            ({numeral(rating).format('0.0')}) {numeral(listing.reviews || 0).format('0,0')} reviews
          </p>
          <Badge variant="secondary" className="capitalize text-[0.78rem]">
            {listing.type.toLowerCase()}
          </Badge>
        </div>

        <Link to={`/listing/${listing.id}`} className="no-underline">
          <h3 className="m-0 text-gray-900 font-semibold">{listing.title}</h3>
        </Link>

        <p className="m-0 text-gray-500 text-sm leading-relaxed line-clamp-3">
          {listing.description || 'No description available'}
        </p>

        <p className="m-0 text-gray-500 text-[0.82rem]">
          Available from {format(new Date(), 'MMM dd, yyyy')}
        </p>

        <div className="flex items-center gap-2.5">
          <p className="m-0 flex items-center gap-1.5 text-gray-700 text-sm">
            <IoCallOutline />
            {listing.location}
          </p>
          <button
            type="button"
            className="cursor-pointer inline-flex items-center gap-1 h-8 rounded-full border border-gray-300 bg-white px-2.5 text-gray-900 text-xs hover:bg-gray-50 transition-colors"
          >
            <FaMapMarkerAlt />
            Directions
          </button>
          <button
            type="button"
            className="cursor-pointer ml-auto size-9 border border-gray-200 rounded-full grid place-items-center bg-white text-rose-600 text-base hover:bg-rose-50 transition-colors"
            onClick={onToggleSave}
            aria-label={saved ? 'Remove from saved listings' : 'Save listing'}
          >
            {saved ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>
      </div>
    </motion.article>
  )
}

export const ListingCard = memo(ListingCardComponent)
