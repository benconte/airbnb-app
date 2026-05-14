export type PricingBadge = 'NEW' | 'RECOMMENDED' | 'POPULAR' | 'BEST_VALUE'

export interface ListingPricing {
  id: string
  name: string
  description?: string | null
  tags: string[]
  price: number
  badge?: PricingBadge | null
  sortOrder: number
  isActive: boolean
  listingId: string
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  user: {
    name: string
    avatar?: string | null
  }
}

export interface ReviewsResponse {
  data: Review[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface Listing {
  id: string
  title: string
  location: string
  description?: string
  pricePerNight: number
  rating: number | null
  reviews: number
  guests: number
  type: string
  amenities?: string[]
  host?: {
    name: string
    avatar?: string | null
    email?: string
  }
  photos?: {
    url: string
  }[]
  pricings?: ListingPricing[]
  createdAt?: string
}

export interface ListingsResponse {
  data: Listing[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

