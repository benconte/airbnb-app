import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FaPlus } from 'react-icons/fa'
import {
  HiOutlineUser,
  HiOutlineCog6Tooth,
  HiArrowRightOnRectangle,
  HiOutlineShieldCheck,
  HiOutlineChartBarSquare,
} from 'react-icons/hi2'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { SavedBadge } from '../../features/guest/listings/components/SavedBadge'

type TopNavbarProps = {
  savedCount: number
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'relative text-[0.95rem] font-medium py-1.5 transition-colors duration-200',
    'after:absolute after:left-0 after:bottom-0 after:h-[2px] after:rounded-full after:transition-all after:duration-200',
    isActive
      ? 'text-[#ff4a26] after:w-full after:bg-[#ff4a26]'
      : 'text-gray-800 hover:text-[#ff4a26] after:w-0 hover:after:w-full after:bg-[#ff4a26]',
  ].join(' ')

export function TopNavbar({ savedCount }: TopNavbarProps) {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const role = user?.role?.toUpperCase()
  const isHost = role === 'HOST'
  const isAdmin = role === 'ADMIN'
  const isGuest = role === 'GUEST' || (!isHost && !isAdmin)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  // First letter of name for avatar fallback
  const initials = user?.name?.charAt(0).toUpperCase() ?? '?'

  return (
    <nav className="flex items-center justify-between gap-6 bg-white/86 backdrop-blur-md border border-slate-200/30 rounded-2xl px-5 py-3 shadow-sm">
      {/* Brand */}
      <Link to="/" className="flex items-center no-underline shrink-0">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-baseline leading-none">
            <span className="text-[1.55rem] font-extrabold text-gray-900 tracking-tight">Airbnb</span>
            <span
              className="text-[2rem] font-extrabold italic text-[#ff4a26] leading-none"
              style={{ fontFamily: "'Caveat', 'Dancing Script', cursive" }}
            >
              Clone
            </span>
          </div>
          <span className="text-[0.78rem] text-gray-400 leading-none">Modern stay discovery</span>
        </div>
      </Link>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-8">
        <NavLink to="/" end className={navLinkClass}>
          Home
        </NavLink>
        <NavLink to="/listings" className={navLinkClass}>
          Explore
        </NavLink>

        {/* Wishlists / Trips only for authenticated users */}
        {isAuthenticated && (
          <>
            <NavLink to="/wishlists" className={navLinkClass}>
              Wishlists
            </NavLink>
            <NavLink to="/trips" className={navLinkClass}>
              Trips
            </NavLink>
          </>
        )}

        {/* Host-only: Dashboard */}
        {isHost && (
          <NavLink to="/dashboard" className={navLinkClass}>
            Dashboard
          </NavLink>
        )}

        {/* Admin-only: Admin portal */}
        {isAdmin && (
          <NavLink to="/admin" className={navLinkClass}>
            Admin
          </NavLink>
        )}
      </div>

      {/* Right-side actions */}
      <div className="flex items-center gap-4 shrink-0">
        <SavedBadge count={savedCount} />

        {/* Host: Add Listing CTA */}
        {isAuthenticated && isHost && (
          <Link
            to="/dashboard/create-listing"
            className="inline-flex items-center gap-2 bg-[#ff4a26] hover:bg-[#e03d1e] text-white text-[0.88rem] font-semibold px-4 py-2 rounded-full transition-colors duration-200 no-underline cursor-pointer"
          >
            <span className="flex items-center justify-center w-4 h-4 rounded-full border border-white/70 text-[0.6rem]">
              <FaPlus />
            </span>
            Add Listing
          </Link>
        )}

        {/* Unauthenticated: Login / Sign up */}
        {!isAuthenticated && (
          <div className="flex items-center gap-2">
            <Link
              to="/register?role=HOST"
              className="hidden sm:block text-sm font-medium text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-full transition-colors no-underline"
            >
              Become a host
            </Link>
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 hover:text-[#ff4a26] transition-colors no-underline"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center bg-[#ff4a26] hover:bg-[#e03d1e] text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors duration-200 no-underline cursor-pointer"
            >
              Sign up
            </Link>
          </div>
        )}

        {/* Authenticated: User avatar / dropdown */}
        {isAuthenticated && user && (
          <div className="relative" ref={menuRef}>
            <button
              id="user-menu-btn"
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="true"
              aria-expanded={menuOpen}
              className="flex items-center gap-2 border border-gray-200 rounded-full pl-2 pr-3 py-1.5 hover:shadow-md transition-shadow duration-200 bg-white cursor-pointer"
            >
              {/* Avatar circle */}
              <span className="w-7 h-7 rounded-full bg-[#ff4a26] text-white text-xs font-bold flex items-center justify-center shrink-0">
                {initials}
              </span>
              <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate hidden sm:block">
                {user.name}
              </span>
              {/* Role badge */}
              <span
                className={[
                  'hidden sm:inline text-[0.65rem] font-semibold px-1.5 py-0.5 rounded-full',
                  isAdmin
                    ? 'bg-purple-100 text-purple-700'
                    : isHost
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700',
                ].join(' ')}
              >
                {isAdmin ? 'Admin' : isHost ? 'Host' : 'Guest'}
              </span>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div
                id="user-dropdown"
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                {/* User info header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>

                <div className="py-1">
                  <DropdownLink to="/profile" icon={<HiOutlineUser />} label="Profile" onClick={() => setMenuOpen(false)} />

                  {isGuest && (
                    <DropdownLink
                      to="/wishlists"
                      icon={<HiOutlineChartBarSquare />}
                      label="My Wishlists"
                      onClick={() => setMenuOpen(false)}
                    />
                  )}

                  {isHost && (
                    <DropdownLink
                      to="/dashboard"
                      icon={<HiOutlineChartBarSquare />}
                      label="Host Dashboard"
                      onClick={() => setMenuOpen(false)}
                    />
                  )}

                  {isAdmin && (
                    <DropdownLink
                      to="/admin"
                      icon={<HiOutlineShieldCheck />}
                      label="Admin Portal"
                      onClick={() => setMenuOpen(false)}
                    />
                  )}

                  <DropdownLink
                    to="/settings"
                    icon={<HiOutlineCog6Tooth />}
                    label="Settings"
                    onClick={() => setMenuOpen(false)}
                  />
                </div>

                <div className="pt-1 border-t border-gray-100">
                  <button
                    id="logout-btn"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
                  >
                    <HiArrowRightOnRectangle className="text-base" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

// Helper dropdown link item
function DropdownLink({
  to,
  icon,
  label,
  onClick,
}: {
  to: string
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 no-underline cursor-pointer"
    >
      <span className="text-base text-gray-400">{icon}</span>
      {label}
    </Link>
  )
}
