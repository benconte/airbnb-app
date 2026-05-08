export interface Listing {
  id: number
  title: string
  location: string
  description: string
  price: number
  rating: number
  reviews: number
  superhost: boolean
  available: boolean
  availableFrom: string
  images: string[]
  category: 'beach' | 'mountain' | 'city' | 'countryside'
}
