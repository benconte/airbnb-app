// ── Shared host-domain types ──────────────────────────────────────────────────

export type ListingType = 'APARTMENT' | 'HOUSE' | 'VILLA' | 'CABIN'

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

export interface ListingPhoto {
  id: string
  url: string
}

export interface HostListing {
  id: string
  title: string
  description: string
  location: string
  pricePerNight: number
  guests: number
  type: ListingType
  amenities: string[]
  rating: number | null
  hostId: string
  createdAt: string
  photos: ListingPhoto[]
  _count: {
    bookings: number
    reviews: number
  }
}

export interface BookingGuest {
  id: string
  name: string
  email: string
  avatar: string | null
}

export interface BookingListing {
  id: string
  title: string
  location: string
  pricePerNight: number
}

export interface HostBooking {
  id: string
  checkIn: string
  checkOut: string
  totalPrice: number
  status: BookingStatus
  guestId: string
  listingId: string
  createdAt: string
  guest: BookingGuest
  listing: BookingListing
}

export interface MonthlyDataPoint {
  month: string
  earnings: number
  bookings: number
}

export interface RecentBooking {
  id: string
  totalPrice: number
  status: BookingStatus
  createdAt: string
  guest: { name: string; avatar: string | null }
  listing: { title: string }
}

export interface HostAnalytics {
  totalListings: number
  totalBookings: number
  confirmedBookings: number
  pendingBookings: number
  cancelledBookings: number
  monthlyEarnings: number
  allTimeEarnings: number
  monthlyData: MonthlyDataPoint[]
  recentBookings: RecentBooking[]
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ── Create listing form types ─────────────────────────────────────────────────

export interface CreateListingData {
  title: string
  description: string
  location: string
  pricePerNight: number
  guests: number
  type: ListingType
  amenities: string[]
}
