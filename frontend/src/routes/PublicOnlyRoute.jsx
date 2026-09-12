// Keeps a signed-in user off the login and register screens, sending them to
// their own home page instead.

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { homePathFor } from '../constants/accountTypes'

export default function PublicOnlyRoute() {
  const { isAuthenticated, isRestoring, user } = useAuth()

  if (isRestoring) return null

  if (isAuthenticated) {
    return <Navigate to={homePathFor(user.accountType)} replace />
  }

  return <Outlet />
}
