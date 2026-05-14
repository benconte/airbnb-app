import { Link } from 'react-router-dom'
import {
  HiOutlineHome,
  HiOutlineCalendarDays,
  HiOutlineCurrencyDollar,
  HiOutlineArrowTrendingUp,
  HiOutlineClipboardDocumentList,
  HiOutlinePlusCircle,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
} from 'react-icons/hi2'
import { useHostAnalytics } from './hooks/useHostData'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@headlessui/react'
import type { BookingStatus } from './types/host'
import { useAuth } from '../auth/hooks/useAuth'
// import { useHostAnalytics } from '../hooks/useHostData'
// import { useAuth } from '../../auth/hooks/useAuth'
// import { Button } from '../../../shared/ui/button'
// import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card'
// import type { BookingStatus } from '../types/host'

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function statusConfig(status: BookingStatus) {
  const configs = {
    CONFIRMED: { label: 'Confirmed', variant: 'default' as const, icon: HiOutlineCheckCircle, className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    PENDING: { label: 'Pending', variant: 'secondary' as const, icon: HiOutlineClock, className: 'bg-amber-100 text-amber-700 border-amber-200' },
    CANCELLED: { label: 'Cancelled', variant: 'destructive' as const, icon: HiOutlineXCircle, className: 'bg-red-100 text-red-700 border-red-200' },
  }
  return configs[status]
}

// ── Sparkline SVG ─────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data, 1)
  const w = 80
  const h = 30
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - (v / max) * h
    return `${x},${y}`
  })
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-80">
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Main area chart ───────────────────────────────────────────────────────────

function EarningsChart({ data }: { data: { month: string; earnings: number; bookings: number }[] }) {
  if (!data || data.length === 0) return null
  const maxE = Math.max(...data.map(d => d.earnings), 1)
  const W = 800
  const H = 180

  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - (d.earnings / maxE) * (H - 20) - 10
    return { x, y, ...d }
  })

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${W} ${H} L 0 ${H} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff4a26" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ff4a26" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#earnGrad)" />
      <path d={linePath} fill="none" stroke="#ff4a26" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="#ff4a26" />
          <text x={p.x} y={H + 20} textAnchor="middle" className="text-[10px]" fill="#9ca3af" fontSize="10">
            {p.month}
          </text>
        </g>
      ))}
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { user } = useAuth()
  const { data: analytics, isLoading } = useHostAnalytics()

  const statCards = [
    {
      title: 'Total Listings',
      value: analytics?.totalListings ?? 0,
      icon: HiOutlineHome,
      sparkData: [],
      color: '#6366f1',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
    {
      title: 'Total Bookings',
      value: analytics?.totalBookings ?? 0,
      icon: HiOutlineCalendarDays,
      sparkData: analytics?.monthlyData.map(d => d.bookings) ?? [],
      color: '#ff4a26',
      bgColor: 'bg-red-50',
      textColor: 'text-[#ff4a26]',
    },
    {
      title: 'Monthly Earnings',
      value: fmtCurrency(analytics?.monthlyEarnings ?? 0),
      icon: HiOutlineCurrencyDollar,
      sparkData: analytics?.monthlyData.map(d => d.earnings) ?? [],
      color: '#10b981',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      title: 'All-Time Revenue',
      value: fmtCurrency(analytics?.allTimeEarnings ?? 0),
      icon: HiOutlineArrowTrendingUp,
      sparkData: [],
      color: '#f59e0b',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
  ]

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pb-10">

      {/* ── Welcome Banner ── */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#ff4a26] via-[#ff6b47] to-[#ff8c6e] p-8 text-white overflow-hidden shadow-xl">
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Welcome back, {user?.name?.split(' ')[0] ?? 'Host'}! 👋
          </h1>
          <p className="text-white/80 text-sm mb-5 max-w-sm">
            Here's what's happening with your listings today. Manage your properties and track your earnings.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-white text-[#ff4a26] hover:bg-white/90 font-bold rounded-full shadow-md">
              <Link className='flex items-center p-2' to="/dashboard/create-listing">
                <HiOutlinePlusCircle className="mr-2 text-lg" /> Add New Listing
              </Link>
            </Button>
            <Button className="border-white/40 text-white cursor-pointer px-2 hover:bg-white/10 rounded-full backdrop-blur-sm">
              <Link to="/dashboard/bookings">View Bookings</Link>
            </Button>
          </div>
        </div>
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 right-20 w-40 h-40 bg-yellow-300/20 rounded-full blur-2xl" />
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon
          return (
            <Card key={i} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bgColor} ${s.textColor}`}>
                    <Icon className="text-xl" />
                  </div>
                  {s.sparkData.length > 1 && (
                    <Sparkline data={s.sparkData} color={s.color} />
                  )}
                </div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{s.title}</p>
                {isLoading ? (
                  <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
                ) : (
                  <h3 className="text-2xl font-extrabold text-gray-900">{s.value}</h3>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ── Booking Status Overview ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Confirmed', count: analytics?.confirmedBookings ?? 0, icon: HiOutlineCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { label: 'Pending', count: analytics?.pendingBookings ?? 0, icon: HiOutlineClock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
          { label: 'Cancelled', count: analytics?.cancelledBookings ?? 0, icon: HiOutlineXCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
        ].map((item, i) => {
          const Icon = item.icon
          return (
            <div key={i} className={`flex items-center gap-4 p-5 rounded-2xl border ${item.border} ${item.bg}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm ${item.color}`}>
                <Icon className="text-2xl" />
              </div>
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{item.label} Bookings</p>
                {isLoading ? (
                  <div className="h-7 w-12 bg-gray-200 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-extrabold text-gray-900">{item.count}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Earnings Chart ── */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-[#ff4a26] rounded-full" />
              <CardTitle className="text-lg font-bold text-gray-900">Earnings This Year</CardTitle>
            </div>
            <Button className="text-[#ff4a26] hover:bg-[#ff4a26]/10 text-xs">
              <Link to="/dashboard/analytics">View Full Analytics →</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="h-48 w-full bg-gray-50 rounded-xl animate-pulse" />
          ) : (
            <div className="h-48 w-full">
              <EarningsChart data={analytics?.monthlyData ?? []} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Recent Bookings ── */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-[#ff4a26] rounded-full" />
              <CardTitle className="text-lg font-bold text-gray-900">Recent Bookings</CardTitle>
            </div>
            <Button className="text-[#ff4a26] hover:bg-[#ff4a26]/10 text-xs">
              <Link to="/dashboard/bookings">View All →</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !analytics?.recentBookings?.length ? (
            <div className="text-center py-12 text-gray-400">
              <HiOutlineClipboardDocumentList className="text-5xl mx-auto mb-3 opacity-40" />
              <p className="font-medium">No bookings yet</p>
              <p className="text-sm mt-1">Bookings from guests will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.recentBookings.map((b) => {
                const cfg = statusConfig(b.status)
                const Icon = cfg.icon
                return (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#ff4a26]/10 text-[#ff4a26] flex items-center justify-center font-bold text-sm shrink-0">
                        {b.guest.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{b.guest.name}</p>
                        <p className="text-xs text-gray-500">{b.listing.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900">{fmtCurrency(b.totalPrice)}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>
                        <Icon className="text-xs" /> {cfg.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Create Listing', to: '/dashboard/create-listing', icon: HiOutlinePlusCircle, color: 'from-[#ff4a26] to-[#ff7e67]' },
          { label: 'My Listings', to: '/dashboard/my-listings', icon: HiOutlineHome, color: 'from-indigo-500 to-indigo-400' },
          { label: 'Bookings', to: '/dashboard/bookings', icon: HiOutlineCalendarDays, color: 'from-emerald-500 to-emerald-400' },
          { label: 'Analytics', to: '/dashboard/analytics', icon: HiOutlineArrowTrendingUp, color: 'from-amber-500 to-amber-400' },
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
