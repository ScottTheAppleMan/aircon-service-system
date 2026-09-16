// Top bar for the signed-in portals: who you are, and a way out.
// Kept separate from any layout so the role pages can drop it in without
// clashing with the layouts each teammate is building.

import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignedInBar() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <header className="signed-in-bar">
      <Link to="/" className="signed-in-bar__brand">
        <span aria-hidden="true">❄</span> AirCon Care
      </Link>

      <div className="signed-in-bar__user">
        {/* The person's name reads better than their login handle, and stops
            a username like "customer" sitting next to a "Customer" role pill
            and looking like the same thing twice. Falls back to the username
            until the backend returns a name. */}
        <span className="signed-in-bar__name">{user.name || user.username}</span>
        <span className="signed-in-bar__role">{user.accountType}</span>
        <button type="button" className="btn btn-sm btn-outline-light" onClick={logout}>
          Sign out
        </button>
      </div>
    </header>
  )
}
