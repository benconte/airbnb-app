import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import {
  HiOutlineSquares2X2,
  HiOutlineUsers,
  HiOutlineShieldExclamation,
  HiOutlineChartBarSquare,
  HiOutlineBuildingStorefront,
  HiOutlineCalendarDays,
  HiOutlineUser,
  HiOutlineCog6Tooth,
  HiArrowRightOnRectangle,
  HiBars3,
  HiOutlineMagnifyingGlass,
} from 'react-icons/hi2'
import { useAuth } from '../../../features/auth/hooks/useAuth'

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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
    navigate('/')
  }

  const handleToggleSidebar = () => {
    if (window.innerWidth >= 768) {
      setIsCollapsed(!isCollapsed)
    } else {
      setSidebarOpen(!sidebarOpen)
    }
  }

  const initials = user?.name?.charAt(0).toUpperCase() ?? '?'

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 py-3 rounded-xl transition-all duration-200 ${isActive
      ? 'bg-gradient-to-r from-[#ff4a26]/20 to-transparent text-[#ff4a26] font-semibold border-l-4 border-[#ff4a26]'
      : 'text-gray-600 hover:bg-gray-50 hover:text-[#ff4a26] border-l-4 border-transparent'
    } ${isCollapsed ? 'justify-center px-0' : 'px-4'}`

  const topNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-[#ff4a26]' : 'text-gray-600 hover:text-[#ff4a26]'
    }`

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed */}
      <aside className={`bg-white border-r border-gray-100 flex flex-col fixed top-0 left-0 h-screen overflow-y-auto overflow-x-hidden custom-scrollbar z-40 transition-all duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'w-20' : 'w-64'}`}>
        {/* Logo */}
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center px-0' : ''}`}>
          <Link to="/" className="flex items-center no-underline shrink-0">
            <div className="flex flex-col gap-0.5 items-center md:items-start">
              <div className="flex items-baseline leading-none">
                <span className={`font-extrabold text-gray-900 tracking-tight transition-all ${isCollapsed ? 'text-sm' : 'text-[1.55rem]'}`}>
                  {isCollapsed ? 'A' : 'Airbnb'}
                </span>
                {!isCollapsed && (
                  <span
                    className="text-[2rem] font-extrabold italic text-[#ff4a26] leading-none"
                    style={{ fontFamily: "'Caveat', 'Dancing Script', cursive" }}
                  >
                    Clone
                  </span>
                )}
              </div>
              {!isCollapsed && <span className="text-[0.78rem] text-gray-400 leading-none">Admin Portal</span>}
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className={`flex-1 pb-6 space-y-6 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          {/* Main Menu */}
          <div>
            {!isCollapsed && <h3 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Portal</h3>}
            <div className="space-y-1">
              <NavLink to="/admin" end className={navLinkClass}>
                <HiOutlineSquares2X2 className="text-xl shrink-0" />
                {!isCollapsed && <span>Dashboard</span>}
              </NavLink>
              <NavLink to="/admin/users" className={navLinkClass}>
                <HiOutlineUsers className="text-xl shrink-0" />
                {!isCollapsed && <span>User Management</span>}
              </NavLink>
              <NavLink to="/admin/listings" className={navLinkClass}>
                <HiOutlineBuildingStorefront className="text-xl shrink-0" />
                {!isCollapsed && <span>Listings</span>}
              </NavLink>
              <NavLink to="/admin/bookings" className={navLinkClass}>
                <HiOutlineCalendarDays className="text-xl shrink-0" />
                {!isCollapsed && <span>Bookings</span>}
              </NavLink>
              <NavLink to="/admin/disputes" className={navLinkClass}>
                <HiOutlineShieldExclamation className="text-xl shrink-0" />
                {!isCollapsed && <span>Disputes</span>}
              </NavLink>
              <NavLink to="/admin/analytics" className={navLinkClass}>
                <HiOutlineChartBarSquare className="text-xl shrink-0" />
                {!isCollapsed && <span>Analytics</span>}
              </NavLink>
            </div>
          </div>

          {/* Account */}
          <div>
            {!isCollapsed && <h3 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Account</h3>}
            <div className="space-y-1">
              <NavLink to="/profile" className={navLinkClass}>
                <HiOutlineUser className="text-xl shrink-0" />
                {!isCollapsed && <span>My Profile</span>}
              </NavLink>
              <NavLink to="/settings" className={navLinkClass}>
                <HiOutlineCog6Tooth className="text-xl shrink-0" />
                {!isCollapsed && <span>Settings</span>}
              </NavLink>
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 py-3 rounded-xl transition-all duration-200 text-gray-600 hover:bg-red-50 hover:text-red-500 border-l-4 border-transparent cursor-pointer ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
              >
                <HiArrowRightOnRectangle className="text-xl shrink-0" />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area - margin left to account for fixed sidebar */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        {/* Topbar */}
        <header className="h-[88px] bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 z-20 sticky top-0 transition-all duration-300">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={handleToggleSidebar}
              className="w-10 h-10 rounded-full bg-[#ff4a26] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#ff4a26]/20 cursor-pointer"
            >
              <HiBars3 className="text-xl" />
            </button>

            {/* Search */}
            <div className="relative max-w-md w-full hidden sm:block">
              <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Search admin portal (Ctrl+/)"
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4a26]/20 focus:border-[#ff4a26] focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Top Links */}
          <div className="hidden lg:flex items-center gap-6 mx-8">
            <NavLink to="/" className={topNavLinkClass}>Go to Site</NavLink>
            <NavLink to="/admin" end className={topNavLinkClass}>Dashboard</NavLink>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 shrink-0 relative" ref={menuRef}>
            {/* User Profile */}
            <div 
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-3 pl-2 border-l border-gray-100 ml-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-full bg-[#ff4a26] text-white flex items-center justify-center font-bold text-sm shadow-md">
                {initials}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-gray-900 leading-tight">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>

            {/* Profile Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 top-[120%] mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-gray-100 mb-2">
                  <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#ff4a26] transition-colors">
                  <HiOutlineUser className="text-lg" />
                  My Profile
                </Link>
                <Link to="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#ff4a26] transition-colors">
                  <HiOutlineCog6Tooth className="text-lg" />
                  Account Settings
                </Link>
                
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <HiArrowRightOnRectangle className="text-lg" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-6 lg:p-8 bg-gradient-to-br from-[#fcfcfc] to-[#fff5f3]/30">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
