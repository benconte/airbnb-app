interface MenuItem {
  name: string
  tags: string[]
  price: number
  badge?: 'New' | 'Recommended'
}

const MENU_ITEMS: MenuItem[] = [
  { name: 'Deluxe King Room', tags: ['Sea View', 'King Bed', 'Ensuite'], price: 10.5 },
  { name: 'Garden Suite', tags: ['Garden View', 'Twin Beds', 'Balcony'], price: 14.5, badge: 'New' },
  { name: 'Executive Penthouse', tags: ['Panoramic View', 'Butler Service', 'Private Pool'], price: 18.5, badge: 'Recommended' },
  { name: 'Standard Double Room', tags: ['City View', 'Double Bed', 'Breakfast Included'], price: 15.9 },
  { name: 'Family Bungalow', tags: ['Garden', 'Two Bedrooms', 'Kids Play Area'], price: 16.4 },
  { name: 'Honeymoon Villa', tags: ['Ocean View', 'Jacuzzi', 'Private Terrace'], price: 22.0 },
]

function PriceRow({ item }: { item: MenuItem }) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0 gap-4">
      <div className="flex flex-col gap-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-snug">{item.name}</p>
        <p className="text-xs text-gray-400">{item.tags.join(' / ')}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {item.badge && (
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded ${item.badge === 'New'
                ? 'bg-[#ff4a26] text-white'
                : 'bg-[#fff4f2] text-[#ff4a26] border border-[#ffd0c5]'
              }`}
          >
            {item.badge}
          </span>
        )}
        <span className="text-sm font-bold text-gray-900">${item.price.toFixed(1)}</span>
      </div>
    </div>
  )
}

export function PricingSection() {
  return (
    <section>
      <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Pricing</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
        {MENU_ITEMS.map((item) => (
          <PriceRow key={item.name} item={item} />
        ))}
      </div>
    </section>
  )
}
