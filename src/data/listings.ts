import type { Listing } from '../features/listings/types'

const seedListings: Omit<Listing, 'id' | 'reviews'>[] = [
  {
    title: 'Ocean Glass Villa',
    location: 'Diani Beach, Kenya',
    description:
      'A stunning all-glass villa perched above a pristine white-sand beach, offering unobstructed ocean panoramas and a private infinity pool.',
    price: 420,
    rating: 4.97,
    superhost: true,
    available: true,
    availableFrom: '2026-06-12',
    img: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400&h=260&fit=crop',
    category: 'beach',
  },
  {
    title: 'Cloudline Cabin',
    location: 'Nanyuki, Kenya',
    description:
      'A cosy cedar cabin sitting at 7,000 ft on the slopes of Mt. Kenya, surrounded by indigenous forest and clear starlit skies.',
    price: 190,
    rating: 4.84,
    superhost: false,
    available: true,
    availableFrom: '2026-05-20',
    img: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=400&h=260&fit=crop',
    category: 'mountain',
  },
  {
    title: 'Minimal City Loft',
    location: 'Westlands, Nairobi',
    description:
      'A sleek, architect-designed loft in the heart of Nairobi\'s creative district — walking distance to galleries, rooftop bars, and gourmet dining.',
    price: 145,
    rating: 4.71,
    superhost: true,
    available: false,
    availableFrom: '2026-07-04',
    img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=260&fit=crop',
    category: 'city',
  },
  {
    title: 'Sunset Farm Retreat',
    location: 'Limuru, Kenya',
    description:
      'Escape to a working tea farm with sweeping valley views, bonfires under African skies, and farm-to-table breakfasts every morning.',
    price: 230,
    rating: 4.9,
    superhost: false,
    available: true,
    availableFrom: '2026-05-28',
    img: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=400&h=260&fit=crop',
    category: 'countryside',
  },
  {
    title: 'Harbor Design Apartment',
    location: 'Mombasa, Kenya',
    description:
      'A chic waterfront apartment overlooking the Old Port, blending Swahili coastal architecture with contemporary interiors and a rooftop terrace.',
    price: 310,
    rating: 4.76,
    superhost: true,
    available: true,
    availableFrom: '2026-06-01',
    img: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=260&fit=crop',
    category: 'city',
  },
]

export const listings: Listing[] = Array.from({ length: 50 }, (_, index) => {
  const base = seedListings[index % seedListings.length]
  return {
    ...base,
    id: index + 1,
    reviews: 2000 + (index * 37) % 1500,
    rating: Number(Math.min(4.99, base.rating - (index % 4) * 0.04).toFixed(2)),
    price: base.price + (index % 6) * 12,
    available: index % 7 !== 0 ? base.available : !base.available,
  }
})
