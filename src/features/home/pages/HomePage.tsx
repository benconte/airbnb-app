import { useHomeListings } from '../hooks/useHomeListings'
import { SectionCarousel } from '../components/SectionCarousel'

export function HomePage() {
  const { sections, isLoading, error } = useHomeListings({ sections: 3, perSection: 8 })

  if (isLoading) {
    return (
      <main className="max-w-[1280px] mx-auto px-6 py-8">
        {[1, 2, 3].map((i) => (
          <section key={i} className="mb-12">
            {/* Section title skeleton */}
            <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-6" />
            {/* Card skeletons */}
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex-none w-[260px]">
                  <div className="aspect-4/3 bg-gray-200 rounded-2xl animate-pulse mb-3" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    )
  }

  if (error) {
    return (
      <main className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-2xl font-semibold text-gray-700 mb-2">
            Couldn't load featured listings
          </p>
          <p className="text-gray-400 text-sm">
            {error instanceof Error ? error.message : 'Something went wrong. Please try again.'}
          </p>
        </div>
      </main>
    )
  }

  if (sections.length === 0) {
    return (
      <main className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-2xl font-semibold text-gray-700 mb-2">No listings yet</p>
          <p className="text-gray-400 text-sm">Check back soon — new places are being added!</p>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-[1280px] mx-auto px-6 py-8">
      {sections.map((section, i) => (
        <SectionCarousel
          key={section.title}
          title={section.title}
          subtitle={section.subtitle}
          listings={section.listings}
          hasSeeAll={i === 0}
        />
      ))}
    </main>
  )
}
