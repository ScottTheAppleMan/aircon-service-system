// Lists the dummy accounts while the app runs on mock data. It renders nothing
// once VITE_USE_MOCK_AUTH=false, so it disappears by itself when the real
// database is connected.

import { isUsingMockAuth } from '../../api/authApi'
import { MOCK_CREDENTIALS } from '../../api/mockAuthApi'

export default function DemoCredentials({ onPick, disabled = false }) {
  if (!isUsingMockAuth) return null

  return (
    <div className="auth-demo">
      <p className="auth-demo__heading">
        Demo accounts <span className="auth-demo__tag">no database yet</span>
      </p>

      <div className="auth-demo__list">
        {MOCK_CREDENTIALS.map((account) => (
          <button
            key={account.username}
            type="button"
            className="auth-demo__button"
            onClick={() => onPick(account)}
            disabled={disabled}
          >
            <span className="auth-demo__role">{account.accountType}</span>
            <span className="auth-demo__username">{account.username}</span>
          </button>
        ))}
      </div>

      <p className="auth-demo__hint">Every demo account uses the password password123</p>
    </div>
  )
}
