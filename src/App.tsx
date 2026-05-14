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
const MyListingsPage = lazy(() =>
  import('./features/host/pages/MyListingsPage').then((module) => ({
    default: module.MyListingsPage,
  })),
)
const HostBookingsPage = lazy(() =>
  import('./features/host/pages/HostBookingsPage').then((module) => ({
    default: module.HostBookingsPage,
  })),
)
const AnalyticsPage = lazy(() =>
  import('./features/host/pages/AnalyticsPage').then((module) => ({
    default: module.AnalyticsPage,
  })),
)
const CreateListingPage = lazy(() =>
  import('./features/host/pages/CreateListingPage').then((module) => ({
    default: module.CreateListingPage,
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

// Admin pages
const AdminDashboardPage = lazy(() =>
  import('./features/admin/pages/AdminDashboardPage').then((module) => ({
    default: module.AdminDashboardPage,
  })),
)
const AdminUsersPage = lazy(() =>
  import('./features/admin/pages/AdminUsersPage').then((module) => ({
    default: module.AdminUsersPage,
  })),
)
const AdminListingsPage = lazy(() =>
  import('./features/admin/pages/AdminListingsPage').then((module) => ({
    default: module.AdminListingsPage,
  })),
)
const AdminBookingsPage = lazy(() =>
  import('./features/admin/pages/AdminBookingsPage').then((module) => ({
    default: module.AdminBookingsPage,
  })),
)
const AdminDisputesPage = lazy(() =>
  import('./features/admin/pages/AdminDisputesPage').then((module) => ({
    default: module.AdminDisputesPage,
  })),
)
const AdminAnalyticsPage = lazy(() =>
  import('./features/admin/pages/AdminAnalyticsPage').then((module) => ({
    default: module.AdminAnalyticsPage,
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
            <Route
              path="/dashboard/my-listings"
              element={
                <ProtectedRoute requiredRole="HOST">
                  <MyListingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/bookings"
              element={
                <ProtectedRoute requiredRole="HOST">
                  <HostBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/analytics"
              element={
                <ProtectedRoute requiredRole="HOST">
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/create-listing"
              element={
                <ProtectedRoute requiredRole="HOST">
                  <CreateListingPage />
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
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/listings"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminListingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/disputes"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminDisputesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminAnalyticsPage />
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
