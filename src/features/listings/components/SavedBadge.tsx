import { Link } from 'react-router-dom'
import { FaHeart } from 'react-icons/fa'

type SavedBadgeProps = {
  count: number
}

export function SavedBadge({ count }: SavedBadgeProps) {
  return (
    <Link to="/wishlists" className="saved-badge">
      <FaHeart />
      <span className="saved-badge__count">{count}</span>
    </Link>
  )
}
