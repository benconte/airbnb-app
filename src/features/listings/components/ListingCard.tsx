import clsx from 'clsx'
import { format } from 'date-fns'
import numeral from 'numeral'
import { memo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaHeart, FaMapMarkerAlt, FaRegHeart, FaStar } from 'react-icons/fa'
import { IoCallOutline } from 'react-icons/io5'
import type { Listing } from '../types'
import styles from './ListingCard.module.css'

type ListingCardProps = {
  listing: Listing
  saved: boolean
  onToggleSave: () => void
}

function ListingCardComponent({ listing, saved, onToggleSave }: ListingCardProps) {
  // Map backend types safely with fallbacks
  const price = listing.pricePerNight
  const rating = listing.rating ?? 0
  const isLuxury = price > 300
  const isSuperhost = rating >= 4.8 // Mocking superhost via rating
  const imageUrl = listing.photos?.[0]?.url || 'https://images.unsplash.com/photo-1560347876-aeef00ee58a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(styles.card, {
        [styles.cardSaved]: saved,
        [styles.cardLuxury]: isLuxury,
        [styles.cardSuperhost]: isSuperhost,
      })}
    >
      <div className={styles.mediaWrap}>
        <img className={styles.media} src={imageUrl} alt={listing.title} />
        <p className={styles.priceFloating}>{numeral(price).format('$0')}</p>
        {isSuperhost && <span className={styles.superhost}>Superhost</span>}
        {isLuxury && <span className={styles.luxury}>Luxury</span>}
      </div>

      <div className={styles.content}>
        <div className={styles.metaRow}>
          <p className={styles.rating}>
            <FaStar />
            ({numeral(rating).format('0.0')}) {numeral(listing.reviews || 0).format('0,0')}{' '}
            reviews
          </p>
          <p className={styles.category}>{listing.type}</p>
        </div>

        <Link to={`/listing/${listing.id}`} className={styles.titleLink}>
          <h3 className={styles.title}>{listing.title}</h3>
        </Link>

        <p className={styles.description}>{listing.description || 'No description available'}</p>

        <p className={styles.availability}>
          Available from {format(new Date(), 'MMM dd, yyyy')}
        </p>

        <div className={styles.footer}>
          <p className={styles.location}>
            <IoCallOutline />
            {listing.location}
          </p>
          <button type="button" className={styles.directions}>
            <FaMapMarkerAlt />
            Directions
          </button>
          <button
            type="button"
            className={styles.saveButton}
            onClick={onToggleSave}
            aria-label={saved ? 'Remove from saved listings' : 'Save listing'}
          >
            {saved ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>
      </div>
    </motion.article>
  )
}

export const ListingCard = memo(ListingCardComponent)
