import NProgress from 'nprogress'
import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { LoginPage } from './features/auth'
import { RegisterPage } from './features/auth/pages/RegisterPage'
import { ForgotPasswordPage } from './features/auth/pages/ForgotPage'
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage'
import { ProfilePage } from './features/auth/pages/ProfilePage'
import { ListingsPage } from './features/guest/listings'
import { HomePage } from './features/guest/home'
import { NotFound } from './shared/components/NotFound'
import { Layout } from './shared/components/Layout'
import { ProtectedRoute } from './shared/components/ProtectedRoute'
import { Spinner } from './shared/components/Spinner'
import { HostLayout } from './features/host/components/HostLayout'
import { AdminLayout } from './features/admin/components/AdminLayout'
import { Toaster } from './shared/ui/sonner'

const ListingDetail = lazy(() =>
  import('./features/guest/listings/pages/ListingDetail').then((module) => ({
    default: module.ListingDetail,
  })),
)
const DashboardPage = lazy(() =>
  import('./features/host/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
)
const WishlistPage = lazy(() =>
  import('./features/guest/wishlists/pages/WishlistPage').then((module) => ({
    default: module.WishlistPage,
  })),
)
const BookingsPage = lazy(() =>
  import('./features/guest/pages/BookingsPage').then((module) => ({
    default: module.BookingsPage,
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
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/listing/:id" element={<ListingDetail />} />

            {/* Authenticated routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlists"
              element={
                <ProtectedRoute>
                  <WishlistPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips"
              element={
                <ProtectedRoute>
                  <BookingsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Host Dashboard Routes */}
          <Route element={<HostLayout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="HOST">
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route element={<AdminLayout />}>
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  {/* Placeholder — Phase 8 */}
                  <div className="p-12 text-center text-gray-500 flex-1">
                    <p className="text-2xl font-bold">Admin Portal</p>
                  </div>
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Public auth pages (no layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot" element={<ForgotPasswordPage />} />
          <Route path="/reset/:token" element={<ResetPasswordPage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster />
    </>
  )
}
