// Shown when a signed-in user opens a page their role cannot see — for example
// a Customer trying to reach the admin portal.

import { Link } from 'react-router-dom'
import AuthCard from '../../components/auth/AuthCard'
import { useAuth } from '../../context/AuthContext'
import { homePathFor } from '../../constants/accountTypes'

export default function UnauthorizedPage() {
  const { user, logout } = useAuth()

  return (
    <AuthCard
      title="No access"
      subtitle={
        user
          ? `A ${user.accountType} account cannot open that page.`
          : 'You need to sign in to open that page.'
      }
    >
      <div className="d-grid gap-2">
        {user && (
          <Link to={homePathFor(user.accountType)} className="btn btn-primary">
            Back to my dashboard
          </Link>
        )}
        <button type="button" className="btn btn-outline-secondary" onClick={logout}>
          Sign out
        </button>
      </div>
    </AuthCard>
  )
}
