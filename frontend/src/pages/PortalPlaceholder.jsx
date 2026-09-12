// Temporary landing page for each role, so login has somewhere real to send
// people and the guards can be tested. Whoever owns the portal replaces the
// route in App.jsx with their own page — nothing here needs to be kept.

import SignedInBar from '../components/SignedInBar'
import { useAuth } from '../context/AuthContext'

export default function PortalPlaceholder({ title, owner, upcoming = [] }) {
  const { user } = useAuth()

  return (
    <>
      <SignedInBar />

      <main className="container py-4">
        <h1 className="h3">{title}</h1>
        <p className="text-muted">
          Signed in as <strong>{user.username}</strong> (user_ID {user.user_ID}) with the{' '}
          <strong>{user.accountType}</strong> role.
        </p>

        <div className="alert alert-info">
          Placeholder screen — this portal is {owner}&apos;s to build. Login, role routing and
          the route guards are already working, so the pages can be dropped straight in.
        </div>

        {upcoming.length > 0 && (
          <>
            <h2 className="h6 text-uppercase text-muted mt-4">Planned for this portal</h2>
            <ul>
              {upcoming.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        )}
      </main>
    </>
  )
}
