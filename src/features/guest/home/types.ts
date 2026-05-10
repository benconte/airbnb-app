export interface FeaturedListing {
  id: string
  title: string
  location: string
  pricePerNight: number
  rating: number | null
  photos: { url: string }[]
  guestFavorite: boolean
}

export interface FeaturedSection {
  title: string
  subtitle?: string
  listings: FeaturedListing[]
}

export interface FeaturedResponse {
  sections: FeaturedSection[]
}
