const AMENITIES = [
  {
    label: 'Security cameras', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
    )
  },
  {
    label: 'Garden', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22V12M12 12C12 7 7 3 2 3c0 5 4 9 10 9zM12 12c0-5 5-9 10-9-1 5-5 9-10 9" /></svg>
    )
  },
  {
    label: 'Jacuzzi', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12h20M2 16h20M6 8c0-2 2-4 4-4s4 2 4 4M14 8c0-2 2-4 4-4" /><rect x="2" y="16" width="20" height="5" rx="1" /></svg>
    )
  },
  {
    label: 'Television', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
    )
  },
  {
    label: 'Gym (100m²)', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 4v16M18 4v16M2 9h4M18 9h4M2 15h4M18 15h4M6 12h12" /></svg>
    )
  },
  {
    label: 'Heater', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2v6M8 4l4 4 4-4M5 13a7 7 0 0 0 14 0" /><path d="M12 19v3M9 22h6" /></svg>
    )
  },
  {
    label: 'Wi-fi', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1" fill="currentColor" /></svg>
    )
  },
  {
    label: 'Shared Pool', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M2 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM14 5l5 5" /><path d="M14 5h5v5" /></svg>
    )
  },
  {
    label: 'Furnished', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2" /><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1H6v-1a2 2 0 0 0-4 0z" /><path d="M4 18v2M20 18v2" /></svg>
    )
  },
  {
    label: 'Covered Parking', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M2 7l10-5 10 5" /><path d="M9 21v-6h6v6" /></svg>
    )
  },
  {
    label: 'Kitchen Appliances', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="8" height="18" rx="1" /><rect x="14" y="3" width="8" height="10" rx="1" /><rect x="14" y="16" width="8" height="5" rx="1" /><path d="M6 7h0M6 11h0" strokeLinecap="round" strokeWidth="2.5" /></svg>
    )
  },
]

export function AmenitiesSection() {
  return (
    <section>
      <h2 className="text-2xl font-extrabold text-gray-900 mb-5">
        Amenities <span className="text-[#ff4a26] font-[caveat] font-extrabold">Available</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
        {AMENITIES.map((a) => (
          <div key={a.label} className="flex items-center gap-3 text-gray-700">
            <span className="text-gray-500 shrink-0">{a.icon}</span>
            <span className="text-sm font-medium">{a.label}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 mt-8" />
    </section>
  )
}
