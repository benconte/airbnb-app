import { Navigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { useEffect, type PropsWithChildren } from 'react'
import { toast } from 'sonner'

type ProtectedRouteProps = PropsWithChildren<{
  /** Allowed roles for this route */
  requiredRole?: string[]
}>

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()

  const userRole = user?.role?.toUpperCase()

  const hasAccess =
    isAuthenticated &&
    (!requiredRole ||
      requiredRole.some(
        (role) => role.toUpperCase() === userRole,
      ))

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to access this page')
      return
    }

    if (requiredRole && !hasAccess) {
      const formattedRoles = requiredRole
        .map((role) => role.toLowerCase())
        .join(' or ')

      toast.error(
        `This page is restricted to ${formattedRoles} users`,
      )
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
