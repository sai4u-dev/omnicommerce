import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, initialized } = useAuth()
  if (loading || !initialized) {
    return <div className="loading-screen"><div className="spinner" /> <p>Loading...</p></div>
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading, initialized } = useAuth()
  if (loading || !initialized) return <div className="loading-screen"><div className="spinner" /></div>
  if (isAuthenticated) return <Navigate to="/home" replace />
  return children
}
