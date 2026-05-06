import { TopNavbar } from '../../features/listings/components/TopNavbar'
import { useFavorites } from '../../features/listings/hooks/useFavorites'

export function Navbar() {
  const favorites = useFavorites()

  return (
    <header className="shared-nav-wrap">
      <TopNavbar savedCount={favorites.count} />
    </header>
  )
}
