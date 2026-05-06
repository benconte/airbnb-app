import dayjs from 'dayjs'
import numeral from 'numeral'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../../store/useStore'

export function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    state: { listings },
  } = useStore()

  const listing = listings.find((item) => item.id === Number(id))

  if (!listing) {
    return (
      <main className="page-container page-pad">
        <p>Listing not found.</p>
      </main>
    )
  }

  return (
    <main className="page-container page-pad">
      <section className="detail-card">
        <button className="filter-toggle" type="button" onClick={() => navigate(-1)}>
          Back
        </button>
        <img src={listing.img} alt={listing.title} className="detail-image" />
        <h1>{listing.title}</h1>
        <p>{listing.location}</p>
        <p>{numeral(listing.price).format('$0')}</p>
        <p>
          ({numeral(listing.rating).format('0.0')}) {numeral(listing.reviews).format('0,0')} reviews
        </p>
        {listing.superhost && <p>Superhost</p>}
        <p>{listing.available ? 'Available' : 'Booked'}</p>
        <p>From {dayjs(listing.availableFrom).format('MMM D, YYYY')}</p>
      </section>
    </main>
  )
}
