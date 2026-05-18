// ── Admin Types ────────────────────────────────────────────────────────────────

export type AdminRole = 'ADMIN' | 'SUPER_ADMIN' | 'HOST' | 'GUEST'
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'
export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED'
export type DisputeReason =
  | 'PROPERTY_CONDITION'
  | 'PAYMENT_ISSUE'
  | 'HOST_BEHAVIOUR'
  | 'GUEST_BEHAVIOUR'
  | 'CANCELLATION_POLICY'
  | 'OTHER'
export type ListingType = 'APARTMENT' | 'HOUSE' | 'VILLA' | 'CABIN'

export interface AdminUser {
  id: string
  name: string
  email: string
  username: string
  phone: string
  role: AdminRole
  avatar: string | null
  bio: string | null
  createdAt: string
  updatedAt: string
  isBlocked: boolean
  _count?: { listings: number }
}

export interface AdminListing {
  id: string
  title: string
  description: string
  location: string
  pricePerNight: number
  guests: number
  type: ListingType
  amenities: string[]
  rating: number | null
  createdAt: string
  updatedAt?: string
  hostId: string
  host?: { name: string; avatar: string | null }
  photos?: { id?: string; url: string }[]
  _count?: { bookings: number; reviews: number }
}

export interface AdminBooking {
  id: string
  checkIn: string
  checkOut: string
  totalPrice: number
  status: BookingStatus
  createdAt: string
  guestId: string
  listingId: string
  guests: number
  guest: { id: string; name: string; email: string; avatar: string | null }
  listing: { id: string; title: string; location: string }
}

export interface AdminDispute {
  id: string
  title: string
  description: string
  reason: DisputeReason
  status: DisputeStatus
  resolution: string | null
  createdAt: string
  updatedAt: string
  reporterId: string
  bookingId: string
  reporter: { id: string; name: string; email: string; avatar: string | null }
  booking: {
    id: string
    checkIn: string
    checkOut: string
    totalPrice: number
    status: BookingStatus
    listing: { id: string; title: string; location: string }
    guest: { id: string; name: string; email: string }
  }
}

export interface AdminStats {
  totalUsers: number
  totalListings: number
  totalBookings: number
  totalRevenue: number
  bookingsByStatus: { status: BookingStatus; _count: { status: number } }[]
  disputesByStatus: { status: DisputeStatus; _count: { status: number } }[]
  recentBookings: AdminBooking[]
  recentUsers: Pick<AdminUser, 'id' | 'name' | 'email' | 'role' | 'avatar' | 'createdAt'>[]
  monthlyData: { month: string; year: number; revenue: number; bookings: number }[]
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

export interface CreateDisputeData {
  title: string
  description: string
  reason: DisputeReason
  bookingId: string
}
