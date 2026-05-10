import { TopNavbar } from './TopNavbar'
import { useFavorites } from '../../features/guest/listings/hooks/useFavorites'
import { Outlet } from 'react-router-dom'

export function Layout() {
  const favorites = useFavorites()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="shared-nav-wrap">
        <TopNavbar savedCount={favorites.count} />
      </header>
      <main className="flex-1 pt-28">
        <Outlet />
      </main>
    </div>
  )
}
