import toast from 'react-hot-toast'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { useEffect, type PropsWithChildren } from 'react'

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to access this page')
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
