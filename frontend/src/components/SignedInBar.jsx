// Top bar for the signed-in portals: who you are, and a way out.
// Kept separate from any layout so the role pages can drop it in without
// clashing with the layouts each teammate is building.

import { useAuth } from '../context/AuthContext'

export default function SignedInBar() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <header className="signed-in-bar">
      <div className="signed-in-bar__brand">
        <span aria-hidden="true">❄</span> AirCon Care
      </div>

      <div className="signed-in-bar__user">
        <span className="signed-in-bar__name">{user.username}</span>
        <span className="signed-in-bar__role">{user.accountType}</span>
        <button type="button" className="btn btn-sm btn-outline-light" onClick={logout}>
          Sign out
        </button>
      </div>
    </header>
  )
}
