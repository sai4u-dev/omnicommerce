import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, initialized } = useAuth()
  const location = useLocation()
  if (loading || !initialized) {
    return <div className="loading-screen"><div className="spinner" /> <p>Verifying session...</p></div>
  }
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading, initialized } = useAuth()
  if (loading || !initialized) return <div className="loading-screen"><div className="spinner" /><p>Checking session...</p></div>
  if (isAuthenticated) return <Navigate to="/home" replace />
  return children
}
