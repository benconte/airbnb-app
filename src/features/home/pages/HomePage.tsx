import { barcelonaListings, londonListings, nairobiListings } from '../data'
import { SectionCarousel } from '../components/SectionCarousel'

export function HomePage() {
  return (
    <main className="max-w-[1280px] mx-auto px-6 py-8">
      <SectionCarousel
        title="Places to stay in Barcelona"
        listings={barcelonaListings}
        hasSeeAll
      />
      <SectionCarousel
        title="Popular homes in Nairobi"
        listings={nairobiListings}
      />
      <SectionCarousel
        title="Featured hotels in London"
        subtitle="A collection of independent and handpicked hotels"
        listings={londonListings}
      />
    </main>
  )
}
