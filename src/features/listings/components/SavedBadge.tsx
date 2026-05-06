type SavedBadgeProps = {
  count: number
}

export function SavedBadge({ count }: SavedBadgeProps) {
  return (
    <span className="saved-badge">
      {count} {count === 1 ? 'saved' : 'saved'}
    </span>
  )
}
