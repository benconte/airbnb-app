import NProgress from 'nprogress'
import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { LoginPage } from './features/auth'
import { ListingsPage } from './features/listings'
import { NotFound } from './shared/components/NotFound'
import { Navbar } from './shared/components/Navbar'
import { ProtectedRoute } from './shared/components/ProtectedRoute'
import { Spinner } from './shared/components/Spinner'

const ListingDetail = lazy(() =>
  import('./features/listings/pages/ListingDetail').then((module) => ({
    default: module.ListingDetail,
  })),
)
const DashboardPage = lazy(() =>
  import('./features/auth/pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
)

export function App() {
  const location = useLocation()

  useEffect(() => {
    NProgress.start()
    const timer = window.setTimeout(() => NProgress.done(), 100)
    return () => window.clearTimeout(timer)
  }, [location.pathname])

  return (
    <>
      <Navbar />
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<ListingsPage />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  )
}
