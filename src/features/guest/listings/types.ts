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
