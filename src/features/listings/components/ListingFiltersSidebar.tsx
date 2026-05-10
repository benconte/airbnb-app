import clsx from 'clsx'
import type { Listing } from '../types'

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

  return (
    <aside className="listing-sidebar">
      <section className="listing-sidebar__block">
        <h2 className="listing-sidebar__title">Price Filter</h2>
        <p className="listing-sidebar__description">Select min and max price range</p>

        <div className="listing-sidebar__price-tags">
          <span className="listing-sidebar__price-tag listing-sidebar__price-tag--active">
            ${minPrice}
          </span>
          <span className="listing-sidebar__price-tag listing-sidebar__price-tag--active">
            ${maxPrice}
          </span>
          <span className="listing-sidebar__price-tag">$5 000</span>
        </div>

        <div className="listing-sidebar__range-wrap">
          <div className="listing-sidebar__range-track" />
          <div
            className="listing-sidebar__range-progress"
            style={{
              left: `${((minPrice - 50) / (5000 - 50)) * 100}%`,
              right: `${100 - ((maxPrice - 50) / (5000 - 50)) * 100}%`,
            }}
          />
          <input
            type="range"
            min={50}
            max={5000}
            value={minPrice}
            className="listing-sidebar__range"
            onChange={(event) => onMinPriceChange(Number(event.target.value))}
          />
          <input
            type="range"
            min={50}
            max={5000}
            value={maxPrice}
            className="listing-sidebar__range"
            onChange={(event) => onMaxPriceChange(Number(event.target.value))}
          />
        </div>
      </section>

      <section className="listing-sidebar__block">
        <h2 className="listing-sidebar__title">Categories</h2>
        <p className="listing-sidebar__description">
          Filter by category
        </p>

        <ul className="listing-sidebar__categories">
          {categories.map((category) => (
            <li key={category}>
              <button
                type="button"
                className={clsx('listing-sidebar__category', {
                  'listing-sidebar__category--selected': selectedCategories.includes(category),
                })}
                onClick={() => onToggleCategory(category)}
              >
                <span className="listing-sidebar__checkbox" />
                <span className="listing-sidebar__label">
                  {category[0].toUpperCase() + category.slice(1)}
                </span>
                <span className="listing-sidebar__count">({categoryCount[category]})</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="listing-sidebar__block">
        <h2 className="listing-sidebar__title">Order by</h2>
        <p className="listing-sidebar__description">
          Duis a leo sit amet odio volutpat auctor ut a lorem.
        </p>

        <select
          className="listing-sidebar__select"
          value={sortBy}
          onChange={(event) => onSortByChange(event.target.value as SortBy)}
        >
          <option value="latest">Latest</option>
          <option value="price-low">Price: Low to high</option>
          <option value="price-high">Price: High to low</option>
          <option value="rating">Highest rated</option>
        </select>
      </section>

      <div className="listing-sidebar__actions">
        <button type="button" className="listing-sidebar__apply" onClick={onApplyFilters}>
          Apply filters
        </button>
        <button type="button" className="listing-sidebar__clear" onClick={onClearFilters}>
          Clear filters
        </button>
      </div>
    </aside>
  )
}
