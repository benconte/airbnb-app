import { useState } from 'react'
import {
  HiOutlineChartBarSquare,
  HiOutlineCurrencyDollar,
  HiOutlineCalendarDays,
  HiOutlineUsers,
  HiOutlineBuildingStorefront,
} from 'react-icons/hi2'
import { useAdminStats } from '../hooks/useAdminData'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

// ── Revenue/Bookings Chart ────────────────────────────────────────────────────

type ChartMode = 'revenue' | 'bookings'

function AdminChart({ data, mode }: { data: { month: string; revenue: number; bookings: number }[]; mode: ChartMode }) {
  if (!data || data.length === 0) return null
  const values = data.map(d => mode === 'revenue' ? d.revenue : d.bookings)
  const maxVal = Math.max(...values, 1)
  const W = 900
  const H = 220

  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - (values[i] / maxVal) * (H - 30) - 15
    return { x, y, ...d }
  })

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${W} ${H} L 0 ${H} Z`

  const color = mode === 'revenue' ? '#ff4a26' : '#6366f1'

  return (
    <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`adminChartGrad${mode}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#adminChartGrad${mode})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill={color} stroke="white" strokeWidth="2" />
          <text x={p.x} y={H + 22} textAnchor="middle" fill="#9ca3af" fontSize="10">
            {p.month}
          </text>
          {/* Value tooltip on hover (using title) */}
        </g>
      ))}
    </svg>
  )
}

// ── Donut Chart (Booking Status) ──────────────────────────────────────────────

function DonutChart({ data }: { data: { label: string; count: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0)
  if (total === 0) return <div className="text-center py-8 text-gray-300 text-sm">No data</div>

  let cumulative = 0
  const radius = 60
  const cx = 75
  const cy = 75
  const strokeWidth = 20

  const segments = data.map(d => {
    const pct = d.count / total
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2
    const endAngle = (cumulative + pct) * 2 * Math.PI - Math.PI / 2
    cumulative += pct

    const x1 = cx + radius * Math.cos(startAngle)
    const y1 = cy + radius * Math.sin(startAngle)
    const x2 = cx + radius * Math.cos(endAngle)
    const y2 = cy + radius * Math.sin(endAngle)

    const largeArc = pct > 0.5 ? 1 : 0

    return {
      d: `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      color: d.color,
      label: d.label,
      count: d.count,
      pct: Math.round(pct * 100),
    }
  })

  return (
    <div className="flex items-center gap-6">
      <svg width="150" height="150" viewBox="0 0 150 150" className="shrink-0">
        {segments.map((s, i) => (
          <path
            key={i}
            d={s.d}
            fill="none"
            stroke={s.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="20" fontWeight="bold" fill="#111827">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#9ca3af">total</text>
      </svg>
      <div className="space-y-2 flex-1">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-sm text-gray-600">{s.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">{s.count}</span>
              <span className="text-xs text-gray-400">{s.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Horizontal Bar Chart (Monthly comparison) ─────────────────────────────────

function HorizontalBars({ data }: { data: { month: string; revenue: number; bookings: number }[] }) {
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1)
  return (
    <div className="space-y-3">
      {data.slice(-6).map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-gray-400 w-8 shrink-0 text-right">{d.month}</span>
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-[#ff4a26] to-[#ff8c6e] rounded-full transition-all duration-700"
                style={{ width: `${(d.revenue / maxRevenue) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-700 shrink-0 w-20 text-right">{fmtCurrency(d.revenue)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function AdminAnalyticsPage() {
  const { data: stats, isLoading } = useAdminStats()
  const [chartMode, setChartMode] = useState<ChartMode>('revenue')

  const bookingDonut = [
    { label: 'Confirmed', count: stats?.bookingsByStatus.find(b => b.status === 'CONFIRMED')?._count.status ?? 0, color: '#10b981' },
    { label: 'Pending', count: stats?.bookingsByStatus.find(b => b.status === 'PENDING')?._count.status ?? 0, color: '#f59e0b' },
    { label: 'Cancelled', count: stats?.bookingsByStatus.find(b => b.status === 'CANCELLED')?._count.status ?? 0, color: '#f87171' },
  ]

  const disputeDonut = [
    { label: 'Open', count: stats?.disputesByStatus.find(d => d.status === 'OPEN')?._count.status ?? 0, color: '#f97316' },
    { label: 'Under Review', count: stats?.disputesByStatus.find(d => d.status === 'UNDER_REVIEW')?._count.status ?? 0, color: '#6366f1' },
    { label: 'Resolved', count: stats?.disputesByStatus.find(d => d.status === 'RESOLVED')?._count.status ?? 0, color: '#10b981' },
    { label: 'Dismissed', count: stats?.disputesByStatus.find(d => d.status === 'DISMISSED')?._count.status ?? 0, color: '#d1d5db' },
  ]

  const kpis = [
    {
      label: 'Total Revenue',
      value: fmtCurrency(stats?.totalRevenue ?? 0),
      icon: HiOutlineCurrencyDollar,
      color: 'text-[#ff4a26]',
      bg: 'bg-red-50',
    },
    {
      label: 'Total Bookings',
      value: stats?.totalBookings ?? 0,
      icon: HiOutlineCalendarDays,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Registered Users',
      value: stats?.totalUsers ?? 0,
      icon: HiOutlineUsers,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Active Listings',
      value: stats?.totalListings ?? 0,
      icon: HiOutlineBuildingStorefront,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ]

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pb-10">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <HiOutlineChartBarSquare className="text-base" />
          <span>Analytics & Reporting</span>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Platform Analytics</h1>
        <p className="text-gray-400 text-sm mt-0.5">Full-platform metrics and performance breakdown</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => {
          const Icon = k.icon
          return (
            <Card key={i} className="border border-gray-100 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${k.bg} ${k.color}`}>
                  <Icon className="text-xl" />
                </div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{k.label}</p>
                {isLoading ? (
                  <div className="h-7 w-20 bg-gray-100 rounded animate-pulse" />
                ) : (
                  <h3 className="text-2xl font-extrabold text-gray-900">{k.value}</h3>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Chart */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-[#ff4a26] rounded-full" />
              <CardTitle className="text-lg font-bold text-gray-900">
                {chartMode === 'revenue' ? 'Revenue' : 'Bookings'} — Last 12 Months
              </CardTitle>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {(['revenue', 'bookings'] as ChartMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setChartMode(m)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${chartMode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="h-64 w-full bg-gray-50 rounded-xl animate-pulse" />
          ) : (
            <div className="h-64 w-full">
              <AdminChart data={stats?.monthlyData ?? []} mode={chartMode} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Donut Charts + Bar Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Booking status donut */}
        <Card className="border border-gray-100 shadow-sm rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-[#ff4a26] rounded-full" />
              <CardTitle className="text-base font-bold text-gray-900">Booking Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="h-32 bg-gray-50 rounded-xl animate-pulse" />
            ) : (
              <DonutChart data={bookingDonut} />
            )}
          </CardContent>
        </Card>

        {/* Dispute status donut */}
        <Card className="border border-gray-100 shadow-sm rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-orange-400 rounded-full" />
              <CardTitle className="text-base font-bold text-gray-900">Dispute Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="h-32 bg-gray-50 rounded-xl animate-pulse" />
            ) : (
              <DonutChart data={disputeDonut} />
            )}
          </CardContent>
        </Card>

        {/* Monthly revenue bars */}
        <Card className="border border-gray-100 shadow-sm rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-emerald-400 rounded-full" />
              <CardTitle className="text-base font-bold text-gray-900">Revenue by Month</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="h-32 bg-gray-50 rounded-xl animate-pulse" />
            ) : (
              <HorizontalBars data={stats?.monthlyData ?? []} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue summary table */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-[#ff4a26] rounded-full" />
            <CardTitle className="text-base font-bold text-gray-900">Monthly Breakdown</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Month</th>
                  <th className="text-right py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Revenue</th>
                  <th className="text-right py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Bookings</th>
                  <th className="text-right py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Avg/Booking</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {Array.from({ length: 4 }).map((__, j) => (
                        <td key={j} className="py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse w-20 ml-auto" />
                        </td>
                      ))}
                    </tr>
                  ))
                  : (stats?.monthlyData ?? []).slice().reverse().map((d, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 font-medium text-gray-900">{d.month} {d.year}</td>
                      <td className="py-3 text-right font-bold text-[#ff4a26]">{fmtCurrency(d.revenue)}</td>
                      <td className="py-3 text-right text-gray-600">{d.bookings}</td>
                      <td className="py-3 text-right text-gray-500">
                        {d.bookings > 0 ? fmtCurrency(d.revenue / d.bookings) : '—'}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
