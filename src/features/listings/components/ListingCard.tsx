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
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(styles.card, {
        [styles.cardSaved]: saved,
        [styles.cardLuxury]: listing.price > 300,
        [styles.cardBooked]: !listing.available,
        [styles.cardSuperhost]: listing.superhost,
      })}
    >
      <div className={styles.mediaWrap}>
        <img className={styles.media} src={listing.img} alt={listing.title} />
        <p className={styles.priceFloating}>{numeral(listing.price).format('$0')}</p>
        {listing.superhost && <span className={styles.superhost}>Superhost</span>}
        {listing.price > 300 && <span className={styles.luxury}>Luxury</span>}
      </div>

      <div className={styles.content}>
        <div className={styles.metaRow}>
          <p className={styles.rating}>
            <FaStar />
            ({numeral(listing.rating).format('0.0')}) {numeral(listing.reviews).format('0,0')}{' '}
            reviews
          </p>
          <p className={styles.category}>{listing.category}</p>
        </div>

        <Link to={`/listings/${listing.id}`} className={styles.titleLink}>
          <h3 className={styles.title}>{listing.title}</h3>
        </Link>

        <p className={styles.description}>{listing.description}</p>

        <p className={styles.availability}>
          {listing.available ? 'Available' : 'Booked'} from{' '}
          {format(new Date(listing.availableFrom), 'MMM dd, yyyy')}
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
