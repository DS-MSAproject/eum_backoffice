import { Navigate } from 'react-router-dom'
import useAdminAuth from './useAdminAuth'
import Spinner from '@/shared/components/Spinner'

export default function AdminProtectedRoute({ children }) {
  const { isLoggedIn, isLoading } = useAdminAuth()
  if (isLoading) return <Spinner fullscreen />
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return children
}
