export interface HomeListing {
  id: string
  title: string
  priceText: string
  rating: number
  img: string
  guestFavorite?: boolean
}

export const barcelonaListings: HomeListing[] = [
  {
    id: '1',
    title: 'Apartment in Eixample',
    priceText: '$741 for 2 nights',
    rating: 4.85,
    img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80',
    guestFavorite: true,
  },
  {
    id: '2',
    title: 'Apartment in Hostafrancs',
    priceText: '$322 for 2 nights',
    rating: 4.86,
    img: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=400&h=260&fit=crop',
    guestFavorite: true,
  },
  {
    id: '3',
    title: 'Loft in la Sagrada Familia',
    priceText: '$743 for 2 nights',
    rating: 4.95,
    img: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=400&q=80',
    guestFavorite: true,
  },
  {
    id: '4',
    title: 'Room in Eixample',
    priceText: '$254 for 2 nights',
    rating: 4.81,
    img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80',
    guestFavorite: false,
  },
  {
    id: '5',
    title: 'Apartment in Eixample',
    priceText: '$864 for 2 nights',
    rating: 4.82,
    img: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=400&q=80',
    guestFavorite: true,
  },
  {
    id: '6',
    title: 'Apartment in Eixample',
    priceText: '$542 for 2 nights',
    rating: 4.87,
    img: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=400&q=80',
    guestFavorite: true,
  },
]

export const nairobiListings: HomeListing[] = [
  {
    id: 'n1',
    title: 'Apartment in Nairobi',
    priceText: '$63 for 2 nights',
    rating: 5.0,
    img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80',
    guestFavorite: true,
  },
  {
    id: 'n2',
    title: 'Apartment in Kilimani Estate',
    priceText: '$121 for 2 nights',
    rating: 4.97,
    img: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=80',
    guestFavorite: true,
  },
  {
    id: 'n3',
    title: 'Apartment in Nairobi',
    priceText: '$71 for 2 nights',
    rating: 5.0,
    img: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=400&h=260&fit=crop',
    guestFavorite: true,
  },
  {
    id: 'n4',
    title: 'Apartment in Lavington Estate',
    priceText: '$103 for 2 nights',
    rating: 4.97,
    img: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=400&q=80',
    guestFavorite: true,
  },
  {
    id: 'n5',
    title: 'Apartment in Nairobi',
    priceText: '$58 for 2 nights',
    rating: 4.99,
    img: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=400&q=80',
    guestFavorite: true,
  },
  {
    id: 'n6',
    title: 'Condo in Kilimani',
    priceText: '$147 for 2 nights',
    rating: 4.99,
    img: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=400&q=80',
    guestFavorite: true,
  },
  {
    id: 'n7',
    title: 'Apartment in Kilimani',
    priceText: '$102 for 2 nights',
    rating: 5.0,
    img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80',
    guestFavorite: true,
  },
]

export const londonListings: HomeListing[] = [
  {
    id: 'l1',
    title: 'Hotel in Central London',
    priceText: '$210 for 2 nights',
    rating: 4.92,
    img: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=400&h=260&fit=crop',
    guestFavorite: true,
  },
  {
    id: 'l2',
    title: 'Boutique Hotel in Soho',
    priceText: '$340 for 2 nights',
    rating: 4.88,
    img: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=400&h=260&fit=crop',
    guestFavorite: true,
  },
  {
    id: 'l3',
    title: 'Luxury Suite in Mayfair',
    priceText: '$520 for 2 nights',
    rating: 4.96,
    img: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=400&q=80',
    guestFavorite: true,
  },
  {
    id: 'l4',
    title: 'Cozy Room in Camden',
    priceText: '$150 for 2 nights',
    rating: 4.75,
    img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80',
    guestFavorite: false,
  },
  {
    id: 'l5',
    title: 'Modern Apartment in Canary Wharf',
    priceText: '$280 for 2 nights',
    rating: 4.89,
    img: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=260&fit=crop',
    guestFavorite: true,
  },
]
