// Wraps routes that require a signed-in user, and optionally a specific role.
//
//   <Route element={<ProtectedRoute allow={[ACCOUNT_TYPES.ADMIN]} />}>
//     <Route path="/admin" element={<AdminPage />} />
//   </Route>
//
// This is a convenience for the UI, not a security boundary. Only the backend
// can actually protect data — it must check the JWT on every request.

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ allow }) {
  const { isAuthenticated, isRestoring, user } = useAuth()
  const location = useLocation()

  if (isRestoring) return null

  if (!isAuthenticated) {
    // Remember where they were headed so login can send them back there.
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allow && !allow.includes(user.accountType)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
