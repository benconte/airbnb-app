import { cn } from '@/lib/utils'

type SortBy = 'latest' | 'price-low' | 'price-high' | 'rating'

type ListingFiltersSidebarProps = {
  minPrice: number
  maxPrice: number
  selectedCategories: string[]
  sortBy: SortBy
  onMinPriceChange: (value: number) => void
  onMaxPriceChange: (value: number) => void
  onToggleCategory: (category: string) => void
  onSortByChange: (value: SortBy) => void
  onApplyFilters: () => void
  onClearFilters: () => void
}

const categoryCount: Record<string, number> = {
  APARTMENT: 62,
  HOUSE: 31,
  VILLA: 43,
  CABIN: 21,
}

export function ListingFiltersSidebar({
  minPrice,
  maxPrice,
  selectedCategories,
  sortBy,
  onMinPriceChange,
  onMaxPriceChange,
  onToggleCategory,
  onSortByChange,
  onApplyFilters,
  onClearFilters,
}: ListingFiltersSidebarProps) {
  const categories: string[] = ['APARTMENT', 'HOUSE', 'VILLA', 'CABIN']

  const minPct = ((minPrice - 50) / (5000 - 50)) * 100
  const maxPct = ((maxPrice - 50) / (5000 - 50)) * 100

  return (
    <aside className="sticky top-24 self-start max-h-[calc(100vh-116px)] overflow-y-auto pr-4 shadow-[5px_0_5px_-5px_rgba(164,164,164,0.378)]">

      {/* Price filter */}
      <section className="border-b border-gray-200 pb-4 pt-3.5">
        <h2 className="text-[1.6rem] font-semibold m-0 mb-1.5">Price Filter</h2>
        <p className="text-gray-600 text-[0.95rem] m-0 mb-3">Select min and max price range</p>

        <div className="flex gap-2 mb-2">
          <span className="text-xs rounded-md bg-gray-900 text-white px-2 py-1">${minPrice}</span>
          <span className="text-xs rounded-md bg-gray-900 text-white px-2 py-1">${maxPrice}</span>
          <span className="text-xs rounded-md bg-zinc-200 text-zinc-800 px-2 py-1">$5 000</span>
        </div>

        {/* Custom range slider */}
        <div className="relative h-[22px] flex items-center">
          {/* Track */}
          <div className="absolute w-full h-1 bg-gray-200 rounded-sm" />
          {/* Filled progress */}
          <div
            className="absolute h-1 bg-[#ff4a26] rounded-sm"
            style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
          />
          {/* Min handle */}
          <input
            type="range"
            min={50}
            max={5000}
            value={minPrice}
            onChange={(e) => onMinPriceChange(Number(e.target.value))}
            className="absolute left-0 top-0 w-full h-[22px] bg-transparent appearance-none outline-none pointer-events-none
              [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:size-[18px] [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-[#ff4a26] [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-sm
              [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:-mt-1.5
              [&::-webkit-slider-runnable-track]:bg-transparent
              [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-[18px]
              [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#ff4a26]
              [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white
              [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-track]:bg-transparent"
          />
          {/* Max handle */}
          <input
            type="range"
            min={50}
            max={5000}
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(Number(e.target.value))}
            className="absolute left-0 top-0 w-full h-[22px] bg-transparent appearance-none outline-none pointer-events-none
              [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:size-[18px] [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-[#ff4a26] [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-sm
              [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:-mt-1.5
              [&::-webkit-slider-runnable-track]:bg-transparent
              [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-[18px]
              [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#ff4a26]
              [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white
              [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-track]:bg-transparent"
          />
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-gray-200 pb-4 pt-3.5">
        <h2 className="text-[1.6rem] font-semibold m-0 mb-1.5">Categories</h2>
        <p className="text-gray-600 text-[0.95rem] m-0 mb-3">Filter by category</p>

        <ul className="list-none m-0 p-0 grid gap-2">
          {categories.map((category) => {
            const selected = selectedCategories.includes(category)
            return (
              <li key={category}>
                <button
                  type="button"
                  onClick={() => onToggleCategory(category)}
                  className="cursor-pointer flex items-center gap-2.5 w-full border-none bg-transparent text-left text-gray-900 py-0.5"
                >
                  <span
                    className={cn(
                      'size-5 rounded-md border flex-shrink-0',
                      selected
                        ? 'bg-[#ff4a26] border-[#ff4a26] shadow-[inset_0_0_0_2px_white]'
                        : 'bg-slate-50 border-slate-300',
                    )}
                  />
                  <span className="text-sm">
                    {category[0].toUpperCase() + category.slice(1).toLowerCase()}
                  </span>
                  <span className="text-sm text-gray-400 ml-auto">({categoryCount[category]})</span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Sort order */}
      <section className="border-b border-gray-200 pb-4 pt-3.5">
        <h2 className="text-[1.6rem] font-semibold m-0 mb-1.5">Order by</h2>
        <p className="text-gray-600 text-[0.95rem] m-0 mb-3">
          Duis a leo sit amet odio volutpat auctor ut a lorem.
        </p>
        <select
          className="w-full h-[46px] rounded-[10px] border border-slate-300 bg-white px-3 text-sm"
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as SortBy)}
        >
          <option value="latest">Latest</option>
          <option value="price-low">Price: Low to high</option>
          <option value="price-high">Price: High to low</option>
          <option value="rating">Highest rated</option>
        </select>
      </section>

      {/* Actions */}
      <div className="pt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={onApplyFilters}
          className="cursor-pointer w-full h-[42px] rounded-[10px] font-semibold border-none bg-[#ff4a26] text-white hover:bg-[#e03a18] transition-colors"
        >
          Apply filters
        </button>
        <button
          type="button"
          onClick={onClearFilters}
          className="cursor-pointer w-full h-[42px] rounded-[10px] font-semibold border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 transition-colors"
        >
          Clear filters
        </button>
      </div>
    </aside>
  )
}
