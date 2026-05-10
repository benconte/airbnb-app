import { Link } from 'react-router-dom'
import { FaHeart } from 'react-icons/fa'

type SavedBadgeProps = {
  count: number
}

export function SavedBadge({ count }: SavedBadgeProps) {
  return (
    <Link
      to="/wishlists"
      className="cursor-pointer relative inline-flex items-center justify-center text-gray-900 text-[1.3rem] no-underline bg-transparent border-none h-auto p-0"
    >
      <FaHeart />
      <span className="absolute -top-1.5 -right-2.5 bg-[#ff4a26] text-white text-[0.65rem] font-bold h-[18px] min-w-[18px] rounded-[9px] flex items-center justify-center px-1">
        {count}
      </span>
    </Link>
  )
}
