import toast from 'react-hot-toast'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { useEffect, type PropsWithChildren } from 'react'

type ProtectedRouteProps = PropsWithChildren<{
  /** If provided, only users with this role (case-insensitive) can access the route */
  requiredRole?: string
}>

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()

  const hasAccess =
    isAuthenticated &&
    (!requiredRole || user?.role?.toUpperCase() === requiredRole.toUpperCase())

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to access this page')
    } else if (requiredRole && !hasAccess) {
      toast.error(`This page is restricted to ${requiredRole.toLowerCase()}s`)
    }
  }, [isAuthenticated, hasAccess, requiredRole])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!hasAccess) {
    return <Navigate to="/" replace />
  }

  return children
}
