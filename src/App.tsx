import NProgress from 'nprogress'
import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { LoginPage } from './features/auth'
import { RegisterPage } from './features/auth/pages/RegisterPage'
import { ForgotPasswordPage } from './features/auth/pages/ForgotPage'
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage'
import { ProfilePage } from './features/auth/pages/ProfilePage'
import { ListingsPage } from './features/listings'
import { HomePage } from './features/home'
import { NotFound } from './shared/components/NotFound'
import { Layout } from './shared/components/Layout'
import { ProtectedRoute } from './shared/components/ProtectedRoute'
import { Spinner } from './shared/components/Spinner'

const ListingDetail = lazy(() =>
  import('./features/listings/pages/ListingDetail').then((module) => ({
    default: module.ListingDetail,
  })),
)
const DashboardPage = lazy(() =>
  import('./features/dashboard/DashboardPage').then((module) => ({
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
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="HOST">
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  {/* Placeholder — Phase 8 */}
                  <div className="p-12 text-center text-gray-500">
                    <p className="text-2xl font-bold">Admin Portal</p>
                    <p className="mt-2 text-sm">Coming in Phase 8</p>
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
    </>
  )
}
