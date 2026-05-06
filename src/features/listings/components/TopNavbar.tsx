import { SavedBadge } from './SavedBadge'

type TopNavbarProps = {
  savedCount: number
}

export function TopNavbar({ savedCount }: TopNavbarProps) {
  return (
    <nav className="top-navbar">
      <div className="top-navbar__brand">
        <div className="top-navbar__logo">A</div>
        <div>
          <p className="top-navbar__title">airbnb clone</p>
          <p className="top-navbar__subtitle">Modern stay discovery</p>
        </div>
      </div>

      <div className="top-navbar__links">
        <button className="top-navbar__link top-navbar__link--active" type="button">
          Listings
        </button>
        <button className="top-navbar__link" type="button">
          Wishlists
        </button>
        <button className="top-navbar__link" type="button">
          Trips
        </button>
      </div>

      <div className="top-navbar__actions">
        <SavedBadge count={savedCount} />
        <button className="top-navbar__link" type="button">
          Become a host
        </button>
      </div>
    </nav>
  )
}
