import { HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown, HiOutlineCurrencyDollar } from 'react-icons/hi2'
import { useAuth } from '../auth/hooks/useAuth'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pb-10">
      {/* Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#ff4a26] to-[#ff7e67] p-8 text-white overflow-hidden shadow-lg border border-[#ff4a26]/20">
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center font-bold text-xl backdrop-blur-sm border border-white/30">
              Ps
            </div>
            <h2 className="text-2xl font-bold">Airbnb Premium</h2>
          </div>
          <p className="text-white/90 mb-6 leading-relaxed text-sm w-3/4">
            It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
          </p>
          <button className="bg-white text-[#ff4a26] px-6 py-2.5 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 border border-transparent">
            Start free trial
          </button>
        </div>

        {/* Abstract shapes for banner */}
        <div className="absolute top-0 right-0 w-1/2 h-full hidden md:block">
          <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-40 -translate-y-1/2 w-[200px] h-[200px] bg-yellow-300/20 rounded-full blur-2xl"></div>

          {/* Placeholder for character illustration */}
          <div className="absolute bottom-0 right-10 w-64 h-64 bg-gradient-to-t from-white/20 to-transparent rounded-t-full border border-white/10 flex items-end justify-center">
            <div className="w-32 h-48 bg-white/10 rounded-t-full backdrop-blur-sm border border-white/20 flex flex-col items-center justify-end pb-4">
              <div className="w-16 h-16 bg-[#ff4a26]/30 rounded-full mb-2"></div>
              <div className="w-24 h-8 bg-white/20 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Times Bookmarked', value: '2:45', chart: 'line', color: 'text-red-500' },
          { title: 'Progress', value: '70%', chart: 'pie', color: 'text-[#ff4a26]' },
          { title: 'Revenue', value: '$100', chart: 'coins', color: 'text-red-500' },
          { title: 'Time Spent', value: '2:45', chart: 'line', color: 'text-red-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 border border-gray-100 ${stat.color}`}>
              {stat.chart === 'line' && <HiOutlineArrowTrendingUp className="text-2xl" />}
              {stat.chart === 'pie' && <div className="w-6 h-6 rounded-full border-[4px] border-current border-t-transparent border-l-transparent rotate-45"></div>}
              {stat.chart === 'coins' && <HiOutlineCurrencyDollar className="text-2xl" />}
            </div>
          </div>
        ))}
      </div>

      {/* Stats Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <HiOutlineArrowTrendingUp />
          </div>
          <p className="text-gray-500 text-sm font-medium mb-2">Total Income</p>
          <div className="flex items-baseline gap-1 mb-2">
            <h2 className="text-3xl font-extrabold text-gray-900">$5,899</h2>
            <span className="text-xs text-gray-400 font-semibold">(USD)</span>
          </div>
          <p className="text-xs font-semibold">
            <span className="text-green-500">20.9%</span> <span className="text-gray-400">+18.4k this week</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <HiOutlineArrowTrendingUp />
          </div>
          <p className="text-gray-500 text-sm font-medium mb-2">Visitors</p>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">780,192</h2>
          <p className="text-xs font-semibold">
            <span className="text-green-500">20%</span> <span className="text-gray-400">+3.5k this week</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <HiOutlineArrowTrendingDown />
          </div>
          <p className="text-gray-500 text-sm font-medium mb-2">Total Orders</p>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">796,542</h2>
          <p className="text-xs font-semibold">
            <span className="text-red-500">9.01%</span> <span className="text-gray-400">decrease compared to last week</span>
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-[#ff4a26] rounded-full"></div>
            <h3 className="text-lg font-bold text-gray-900">Statistics</h3>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </button>
        </div>

        {/* Mock Area Chart */}
        <div className="h-64 w-full relative flex items-end justify-between px-2 pt-10">
          {/* Chart Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pt-10 pb-2 z-0">
            <div className="border-b border-gray-100 w-full h-0"></div>
            <div className="border-b border-gray-100 w-full h-0"></div>
            <div className="border-b border-gray-100 w-full h-0"></div>
            <div className="border-b border-gray-100 w-full h-0"></div>
          </div>

          {/* SVG Area Chart */}
          <svg className="absolute inset-0 w-full h-full z-10" preserveAspectRatio="none" viewBox="0 0 1000 300">
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff4a26" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ff4a26" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <path
              d="M0,300 L0,280 Q50,260 100,280 T200,290 T300,250 T400,270 T500,220 T600,120 T700,260 T800,280 T900,250 T1000,290 L1000,300 Z"
              fill="url(#gradient)"
            />
            <path
              d="M0,280 Q50,260 100,280 T200,290 T300,250 T400,270 T500,220 T600,120 T700,260 T800,280 T900,250 T1000,290"
              fill="none"
              stroke="#ff4a26"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
