// Centred card shared by the login and register screens.

import { Link } from 'react-router-dom'

export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <Link to="/" className="auth-card__back">
          <span aria-hidden="true">←</span> Back to home
        </Link>

        <div className="auth-card__brand">
          <span className="auth-card__logo" aria-hidden="true">❄</span>
          <span className="auth-card__brand-name">AirCon Care</span>
        </div>

        <h1 className="auth-card__title">{title}</h1>
        {subtitle && <p className="auth-card__subtitle">{subtitle}</p>}

        {children}

        {footer && <div className="auth-card__footer">{footer}</div>}
      </div>
    </div>
  )
}
