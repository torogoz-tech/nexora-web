import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import SessionStatus from './SessionStatus'
export default function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()
  if (status === 'checking' || status === 'unavailable')
    return <SessionStatus />
  if (status !== 'authenticated')
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    )
  return <Outlet />
}
