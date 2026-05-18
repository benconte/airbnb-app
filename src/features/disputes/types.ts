// Shared dispute types (used by guest, host, and admin features)

export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED'
export type DisputeReason =
  | 'PROPERTY_CONDITION'
  | 'PAYMENT_ISSUE'
  | 'HOST_BEHAVIOUR'
  | 'GUEST_BEHAVIOUR'
  | 'CANCELLATION_POLICY'
  | 'OTHER'

export interface DisputeSender {
  id: string
  name: string
  email: string
  avatar: string | null
  role: string
}

export interface DisputeMessage {
  id: string
  body: string | null
  imageUrls: string[]
  createdAt: string
  sender: DisputeSender
}

export interface Dispute {
  id: string
  title: string
  description: string
  reason: DisputeReason
  status: DisputeStatus
  resolution: string | null
  againstRole: string
  createdAt: string
  updatedAt: string
  reporterId: string
  bookingId: string
  reporter: DisputeSender
  booking: {
    id: string
    checkIn?: string
    checkOut?: string
    listing: { id: string; title: string; location: string }
    guest: { id: string; name: string; email: string; avatar?: string | null }
  }
  messages?: DisputeMessage[]
}

export const STATUS_CONFIG: Record<DisputeStatus, {
  label: string
  className: string
  dot: string
}> = {
  OPEN:         { label: 'Open',         className: 'bg-amber-50 text-amber-600 border-amber-200',    dot: '#F59E0B' },
  UNDER_REVIEW: { label: 'Under Review', className: 'bg-blue-50 text-blue-600 border-blue-200',       dot: '#3B82F6' },
  RESOLVED:     { label: 'Resolved',     className: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: '#10B981' },
  DISMISSED:    { label: 'Dismissed',    className: 'bg-gray-50 text-gray-500 border-gray-200',       dot: '#9CA3AF' },
}

export const REASON_LABELS: Record<DisputeReason, string> = {
  PROPERTY_CONDITION: 'Property Condition',
  PAYMENT_ISSUE: 'Payment Issue',
  HOST_BEHAVIOUR: 'Host Behaviour',
  GUEST_BEHAVIOUR: 'Guest Behaviour',
  CANCELLATION_POLICY: 'Cancellation Policy',
  OTHER: 'Other',
}
