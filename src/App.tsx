import NProgress from 'nprogress'
import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { LoginPage } from './features/auth'
import { ListingsPage } from './features/listings'
import { HomePage } from './features/home'
import { NotFound } from './shared/components/NotFound'
import { Layout } from './shared/components/Layout'
import { ProtectedRoute } from './shared/components/ProtectedRoute'
import { Spinner } from './shared/components/Spinner'
import { RegisterPage } from './features/auth/pages/RegisterPage'
import { ForgotPasswordPage } from './features/auth/pages/ForgotPage'

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
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot" element={<ForgotPasswordPage />} />
          <Route path="/register" element={<RegisterPage />} />
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
