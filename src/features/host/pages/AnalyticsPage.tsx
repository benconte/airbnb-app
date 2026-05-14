import {
  HiOutlineCurrencyDollar,
  HiOutlineCalendarDays,
  HiOutlineHome,
  HiOutlineArrowTrendingUp,
  HiOutlineCheckCircle,
} from 'react-icons/hi2'
import { useHostAnalytics } from '../hooks/useHostData'
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card'
import type { MonthlyDataPoint } from '../types/host'

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────

function BarChart({ data, valueKey, color, label }: {
  data: MonthlyDataPoint[]
  valueKey: 'earnings' | 'bookings'
  color: string
  label: string
}) {
  const values = data.map(d => d[valueKey])
  const max = Math.max(...values, 1)
  const H = 160

  return (
    <div className="w-full">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{label}</p>
      <div className="flex items-end gap-1 h-[160px]">
        {data.map((d, i) => {
          const val = d[valueKey]
          const height = (val / max) * H
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="relative flex flex-col justify-end" style={{ height: H }}>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {valueKey === 'earnings' ? fmtCurrency(val) : `${val} bookings`}
                </div>
                <div
                  className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80"
                  style={{ height: Math.max(height, 4), backgroundColor: color }}
                />
              </div>
              <span className="text-[9px] text-gray-400 font-medium">{d.month}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Donut Chart ───────────────────────────────────────────────────────────────

function DonutChart({ confirmed, pending, cancelled }: { confirmed: number; pending: number; cancelled: number }) {
  const total = confirmed + pending + cancelled || 1
  const segments = [
    { value: confirmed, color: '#10b981', label: 'Confirmed' },
    { value: pending, color: '#f59e0b', label: 'Pending' },
    { value: cancelled, color: '#ef4444', label: 'Cancelled' },
  ]

  let cumulative = 0
  const R = 60
  const CX = 80
  const CY = 80

  function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
    const s = polarToCartesian(cx, cy, r, start)
    const e = polarToCartesian(cx, cy, r, end)
    const large = end - start > 180 ? 1 : 0
    return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`
  }

  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {segments.map((seg, i) => {
          const startAngle = (cumulative / total) * 360
          const sweep = (seg.value / total) * 360
          cumulative += seg.value
          if (sweep === 0) return null
          return (
            <path
              key={i}
              d={arcPath(CX, CY, R, startAngle, startAngle + sweep)}
              fill={seg.color}
              opacity="0.9"
            />
          )
        })}
        {/* Center hole */}
        <circle cx={CX} cy={CY} r={38} fill="white" />
        <text x={CX} y={CY - 6} textAnchor="middle" className="font-extrabold" fontSize="18" fill="#111827" fontWeight="800">
          {total}
        </text>
        <text x={CX} y={CY + 12} textAnchor="middle" fontSize="10" fill="#9ca3af">
          total
        </text>
      </svg>
      <div className="space-y-3 flex-1">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-sm text-gray-600 font-medium">{seg.label}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-gray-900">{seg.value}</span>
              <span className="text-xs text-gray-400 ml-1">({Math.round((seg.value / total) * 100)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function AnalyticsPage() {
  const { data: analytics, isLoading } = useHostAnalytics()

  const totalBookings = analytics?.totalBookings ?? 0
  const confirmedRate = totalBookings > 0
    ? Math.round(((analytics?.confirmedBookings ?? 0) / totalBookings) * 100)
    : 0

  const kpis = [
    {
      title: 'All-Time Revenue',
      value: fmtCurrency(analytics?.allTimeEarnings ?? 0),
      icon: HiOutlineCurrencyDollar,
      bg: 'bg-[#ff4a26]/10',
      color: 'text-[#ff4a26]',
      trend: null,
    },
    {
      title: 'This Month',
      value: fmtCurrency(analytics?.monthlyEarnings ?? 0),
      icon: HiOutlineArrowTrendingUp,
      bg: 'bg-emerald-100',
      color: 'text-emerald-600',
      trend: null,
    },
    {
      title: 'Total Bookings',
      value: String(analytics?.totalBookings ?? 0),
      icon: HiOutlineCalendarDays,
      bg: 'bg-indigo-100',
      color: 'text-indigo-600',
      trend: null,
    },
    {
      title: 'Active Listings',
      value: String(analytics?.totalListings ?? 0),
      icon: HiOutlineHome,
      bg: 'bg-amber-100',
      color: 'text-amber-600',
      trend: null,
    },
    {
      title: 'Confirmation Rate',
      value: `${confirmedRate}%`,
      icon: HiOutlineCheckCircle,
      bg: 'bg-purple-100',
      color: 'text-purple-600',
      trend: null,
    },
  ]

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pb-10">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track your earnings and booking performance</p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <Card key={i} className="border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.bg} ${kpi.color} mb-3`}>
                  <Icon className="text-xl" />
                </div>
                <p className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider mb-1">{kpi.title}</p>
                {isLoading ? (
                  <div className="h-7 w-20 bg-gray-100 rounded animate-pulse" />
                ) : (
                  <p className="text-xl font-extrabold text-gray-900">{kpi.value}</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Earnings Bar Chart */}
        <Card className="lg:col-span-2 border border-gray-100 shadow-sm rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-[#ff4a26] rounded-full" />
              <CardTitle className="text-base font-bold text-gray-900">Monthly Earnings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
            ) : (
              <BarChart
                data={analytics?.monthlyData ?? []}
                valueKey="earnings"
                color="#ff4a26"
                label="Earnings (USD)"
              />
            )}
          </CardContent>
        </Card>

        {/* Booking Status Donut */}
        <Card className="border border-gray-100 shadow-sm rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-indigo-500 rounded-full" />
              <CardTitle className="text-base font-bold text-gray-900">Booking Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-40 bg-gray-50 rounded-xl animate-pulse" />
            ) : (
              <DonutChart
                confirmed={analytics?.confirmedBookings ?? 0}
                pending={analytics?.pendingBookings ?? 0}
                cancelled={analytics?.cancelledBookings ?? 0}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bookings Bar Chart */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-indigo-500 rounded-full" />
            <CardTitle className="text-base font-bold text-gray-900">Monthly Bookings</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
          ) : (
            <BarChart
              data={analytics?.monthlyData ?? []}
              valueKey="bookings"
              color="#6366f1"
              label="Bookings count"
            />
          )}
        </CardContent>
      </Card>

      {/* ── Per-month table ── */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-amber-400 rounded-full" />
            <CardTitle className="text-base font-bold text-gray-900">Monthly Breakdown</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Month</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Bookings</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Earnings</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Avg / Booking</th>
                  </tr>
                </thead>
                <tbody>
                  {(analytics?.monthlyData ?? []).map((row, i) => {
                    const avg = row.bookings > 0 ? row.earnings / row.bookings : 0
                    const isCurrentMonth = i === new Date().getMonth()
                    return (
                      <tr
                        key={i}
                        className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${isCurrentMonth ? 'bg-[#ff4a26]/5' : ''}`}
                      >
                        <td className="px-6 py-3 font-medium text-gray-900">
                          {row.month}
                          {isCurrentMonth && (
                            <span className="ml-2 text-[10px] bg-[#ff4a26] text-white px-1.5 py-0.5 rounded-full font-semibold">Now</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right font-semibold text-gray-900">{row.bookings}</td>
                        <td className="px-6 py-3 text-right font-bold text-gray-900">{fmtCurrency(row.earnings)}</td>
                        <td className="px-6 py-3 text-right text-gray-600">{fmtCurrency(avg)}</td>
                      </tr>
                    )
                  })}
                  {/* Totals row */}
                  <tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
                    <td className="px-6 py-3 text-gray-900">Total (YTD)</td>
                    <td className="px-6 py-3 text-right text-gray-900">{analytics?.totalBookings ?? 0}</td>
                    <td className="px-6 py-3 text-right text-[#ff4a26]">{fmtCurrency(analytics?.allTimeEarnings ?? 0)}</td>
                    <td className="px-6 py-3 text-right text-gray-600">
                      {fmtCurrency(
                        analytics && analytics.totalBookings > 0
                          ? analytics.allTimeEarnings / analytics.totalBookings
                          : 0
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
