import { Link, NavLink } from 'react-router-dom'
import { FaPlus, FaUserPlus } from 'react-icons/fa'
import { SavedBadge } from '../../features/listings/components/SavedBadge'
import '../styles/TopBar.css'

type TopNavbarProps = {
  savedCount: number
}

export function TopNavbar({ savedCount }: TopNavbarProps) {
  return (
    <nav className="top-navbar">
      <Link to="/" className="top-navbar__brand">
        <div className="top-navbar__logo-container">
          <div className="top-navbar__logo">
            <span className="logo-text-black">Airbnb</span>
            <span className="logo-text-red">Clone</span>
          </div>
          <span className="top-navbar__subtitle">Modern stay discovery</span>
        </div>
      </Link>

      <div className="top-navbar__links">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? 'top-navbar__link top-navbar__link--active' : 'top-navbar__link'
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/listings"
          className={({ isActive }) =>
            isActive ? 'top-navbar__link top-navbar__link--active' : 'top-navbar__link'
          }
        >
          Explore
        </NavLink>
        <NavLink
          to="/wishlists"
          className={({ isActive }) =>
            isActive ? 'top-navbar__link top-navbar__link--active' : 'top-navbar__link'
          }
        >
          Wishlists
        </NavLink>
        <NavLink
          to="/trips"
          className={({ isActive }) =>
            isActive ? 'top-navbar__link top-navbar__link--active' : 'top-navbar__link'
          }
        >
          Trips
        </NavLink>
      </div>

      <div className="top-navbar__actions">
        <SavedBadge count={savedCount} />
        <NavLink
          to="/login"
        >
          <button className="top-navbar__icon-btn" type="button" aria-label="Add User">
            <FaUserPlus />
          </button>
        </NavLink>
        <Link to="/add-listing" className="top-navbar__add-btn">
          <div className="top-navbar__add-icon">
            <FaPlus />
          </div>
          Add Listing
        </Link>
      </div>
    </nav>
  )
}
