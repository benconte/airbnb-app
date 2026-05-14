import { Link } from 'react-router-dom'
import {
  HiOutlineUsers,
  HiOutlineBuildingStorefront,
  HiOutlineCalendarDays,
  HiOutlineCurrencyDollar,
  HiOutlineShieldExclamation,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiMiniArrowTopRightOnSquare,
} from 'react-icons/hi2'
import { useAdminStats } from '../hooks/useAdminData'
import { useAuth } from '../../auth/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import type { BookingStatus } from '../types/admin'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0
  }).format(n)
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function bookingStatusConfig(status: BookingStatus) {
  const configs = {
    CONFIRMED: { label: 'Confirmed', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    PENDING: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200' },
    CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-700 border-red-200' },
  }
  return configs[status]
}

// ── Area Chart ────────────────────────────────────────────────────────────────

function RevenueChart({ data }: { data: { month: string; revenue: number; bookings: number }[] }) {
  if (!data || data.length === 0) return null
  const maxR = Math.max(...data.map(d => d.revenue), 1)
  const W = 900
  const H = 180

  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - (d.revenue / maxR) * (H - 20) - 10
    return { x, y, ...d }
  })

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${W} ${H} L 0 ${H} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff4a26" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ff4a26" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#adminRevGrad)" />
      <path d={linePath} fill="none" stroke="#ff4a26" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="#ff4a26" stroke="white" strokeWidth="1.5" />
          <text x={p.x} y={H + 20} textAnchor="middle" fill="#9ca3af" fontSize="10">
            {p.month}
          </text>
        </g>
      ))}
    </svg>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 rounded-xl bg-gray-100" />
        <div className="w-16 h-4 bg-gray-100 rounded" />
      </div>
      <div className="w-12 h-3 bg-gray-100 rounded" />
      <div className="w-24 h-7 bg-gray-100 rounded" />
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function AdminDashboardPage() {
  const { user } = useAuth()
  const { data: stats, isLoading } = useAdminStats()

  const confirmedCount = stats?.bookingsByStatus.find(b => b.status === 'CONFIRMED')?._count.status ?? 0
  const pendingCount = stats?.bookingsByStatus.find(b => b.status === 'PENDING')?._count.status ?? 0
  const cancelledCount = stats?.bookingsByStatus.find(b => b.status === 'CANCELLED')?._count.status ?? 0
  const openDisputes = stats?.disputesByStatus.find(d => d.status === 'OPEN')?._count.status ?? 0
  const underReviewDisputes = stats?.disputesByStatus.find(d => d.status === 'UNDER_REVIEW')?._count.status ?? 0

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: HiOutlineUsers,
      color: '#6366f1',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      to: '/admin/users',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Total Listings',
      value: stats?.totalListings ?? 0,
      icon: HiOutlineBuildingStorefront,
      color: '#ff4a26',
      bgColor: 'bg-red-50',
      textColor: 'text-[#ff4a26]',
      to: '/admin/listings',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Total Bookings',
      value: stats?.totalBookings ?? 0,
      icon: HiOutlineCalendarDays,
      color: '#10b981',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      to: '/admin/bookings',
      trend: '+5%',
      trendUp: true,
    },
    {
      title: 'Total Revenue',
      value: fmtCurrency(stats?.totalRevenue ?? 0),
      icon: HiOutlineCurrencyDollar,
      color: '#f59e0b',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      to: '/admin/analytics',
      trend: '+18.4k this month',
      trendUp: true,
    },
  ]

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pb-10">

      {/* Welcome Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#ff4a26] via-[#ff6040] to-[#ff8c6e] p-8 text-white overflow-hidden shadow-xl">
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Admin Portal — {user?.name?.split(' ')[0] ?? 'Admin'} 🛡️
          </h1>
          <p className="text-white/80 text-sm mb-5 max-w-lg">
            Platform overview at a glance. Monitor users, bookings, listings and disputes in real-time.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 bg-white text-[#ff4a26] hover:bg-white/90 font-bold rounded-full shadow-md px-4 py-2 text-sm transition-all"
            >
              <HiOutlineUsers className="text-lg" /> Manage Users
            </Link>
            <Link
              to="/admin/disputes"
              className="inline-flex items-center gap-2 border border-white/40 text-white hover:bg-white/10 rounded-full backdrop-blur-sm px-4 py-2 text-sm transition-all"
            >
              <HiOutlineShieldExclamation className="text-lg" /> View Disputes
              {(openDisputes + underReviewDisputes) > 0 && (
                <span className="bg-white text-[#ff4a26] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {openDisputes + underReviewDisputes}
                </span>
              )}
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 right-20 w-48 h-48 bg-yellow-300/20 rounded-full blur-2xl" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((s, i) => {
            const Icon = s.icon
            const TrendIcon = s.trendUp ? HiOutlineArrowTrendingUp : HiOutlineArrowTrendingDown
            return (
              <Link
                key={i}
                to={s.to}
                className="group block"
              >
                <Card className="border border-gray-100 shadow-sm hover:shadow-lg transition-all rounded-2xl overflow-hidden hover:-translate-y-0.5 cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.bgColor} ${s.textColor}`}>
                        <Icon className="text-xl" />
                      </div>
                      <span className={`text-xs font-semibold flex items-center gap-1 ${s.trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
                        <TrendIcon className="text-sm" />
                        {s.trend}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{s.title}</p>
                    <h3 className="text-2xl font-extrabold text-gray-900">{s.value}</h3>
                    <p className={`text-xs mt-2 flex items-center gap-1 ${s.textColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      View details <HiMiniArrowTopRightOnSquare className="text-sm" />
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })
        }
      </div>

      {/* Booking Status + Disputes overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Booking Status */}
        <div className="md:col-span-3 grid grid-cols-3 gap-4">
          {[
            { label: 'Confirmed', count: confirmedCount, icon: HiOutlineCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
            { label: 'Pending', count: pendingCount, icon: HiOutlineClock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
            { label: 'Cancelled', count: cancelledCount, icon: HiOutlineXCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className={`flex flex-col gap-2 p-5 rounded-2xl border ${item.border} ${item.bg}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm ${item.color}`}>
                  <Icon className="text-xl" />
                </div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{item.label}</p>
                {isLoading
                  ? <div className="h-7 w-12 bg-gray-200 rounded animate-pulse" />
                  : <p className="text-2xl font-extrabold text-gray-900">{item.count}</p>
                }
              </div>
            )
          })}
        </div>

        {/* Disputes Quick View */}
        <div className="md:col-span-2">
          <Card className="border border-gray-100 shadow-sm rounded-2xl h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-[#ff4a26] rounded-full" />
                  <CardTitle className="text-base font-bold text-gray-900">Disputes</CardTitle>
                </div>
                <Link to="/admin/disputes" className="text-xs text-[#ff4a26] hover:underline font-semibold">
                  View All →
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {[
                { label: 'Open', count: openDisputes, color: 'text-orange-600 bg-orange-50' },
                { label: 'Under Review', count: underReviewDisputes, color: 'text-blue-600 bg-blue-50' },
                { label: 'Resolved', count: stats?.disputesByStatus.find(d => d.status === 'RESOLVED')?._count.status ?? 0, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Dismissed', count: stats?.disputesByStatus.find(d => d.status === 'DISMISSED')?._count.status ?? 0, color: 'text-gray-600 bg-gray-50' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  {isLoading
                    ? <div className="w-8 h-4 bg-gray-100 rounded animate-pulse" />
                    : <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.color}`}>{item.count}</span>
                  }
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Revenue Chart */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-[#ff4a26] rounded-full" />
              <CardTitle className="text-lg font-bold text-gray-900">Revenue — Last 12 Months</CardTitle>
            </div>
            <Link to="/admin/analytics" className="text-xs text-[#ff4a26] hover:underline font-semibold">
              Full Analytics →
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="h-52 w-full bg-gray-50 rounded-xl animate-pulse" />
          ) : (
            <div className="h-52 w-full">
              <RevenueChart data={stats?.monthlyData ?? []} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Bookings + Recent Users side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <Card className="lg:col-span-2 border border-gray-100 shadow-sm rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-[#ff4a26] rounded-full" />
                <CardTitle className="text-base font-bold text-gray-900">Recent Bookings</CardTitle>
              </div>
              <Link to="/admin/bookings" className="text-xs text-[#ff4a26] hover:underline font-semibold">
                View All →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !stats?.recentBookings.length ? (
              <p className="text-sm text-gray-400 py-8 text-center">No bookings yet</p>
            ) : (
              <div className="space-y-2">
                {stats.recentBookings.slice(0, 8).map((b) => {
                  const cfg = bookingStatusConfig(b.status)
                  return (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        {b.guest.avatar ? (
                          <img src={b.guest.avatar} alt={b.guest.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#ff4a26]/10 text-[#ff4a26] flex items-center justify-center font-bold text-sm shrink-0">
                            {b.guest.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{b.guest.name}</p>
                          <p className="text-xs text-gray-400">{b.listing.title} · {fmtDate(b.checkIn)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-bold text-gray-900">{fmtCurrency(b.totalPrice)}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="border border-gray-100 shadow-sm rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-[#ff4a26] rounded-full" />
                <CardTitle className="text-base font-bold text-gray-900">New Users</CardTitle>
              </div>
              <Link to="/admin/users" className="text-xs text-[#ff4a26] hover:underline font-semibold">
                View All →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
              ))
              : stats?.recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  {u.avatar ? (
                    <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <Badge variant="outline" className={`text-xs shrink-0 ${
                    u.role === 'ADMIN' ? 'border-[#ff4a26]/40 text-[#ff4a26]' :
                      u.role === 'HOST' ? 'border-indigo-300 text-indigo-600' :
                        'border-gray-200 text-gray-500'
                  }`}>
                    {u.role}
                  </Badge>
                </div>
              ))
            }
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Manage Users', to: '/admin/users', icon: HiOutlineUsers, color: 'from-indigo-500 to-indigo-400' },
          { label: 'Listings', to: '/admin/listings', icon: HiOutlineBuildingStorefront, color: 'from-[#ff4a26] to-[#ff7e67]' },
          { label: 'Disputes', to: '/admin/disputes', icon: HiOutlineShieldExclamation, color: 'from-orange-500 to-orange-400' },
          { label: 'Analytics', to: '/admin/analytics', icon: HiOutlineArrowTrendingUp, color: 'from-emerald-500 to-emerald-400' },
        ].map((action, i) => {
          const Icon = action.icon
          return (
            <Link
              key={i}
              to={action.to}
              className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-gradient-to-br ${action.color} text-white shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all`}
            >
              <Icon className="text-2xl" />
              <span className="text-sm font-bold">{action.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
