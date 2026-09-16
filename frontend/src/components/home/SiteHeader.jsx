// Header for the public homepage. What it offers on the right depends on
// whether anyone is signed in, so a returning customer is not asked to log in
// again.

import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { homePathFor } from '../../constants/accountTypes'

export default function SiteHeader() {
  const { isAuthenticated, user } = useAuth()

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="site-header__brand">
          <span className="site-header__mark" aria-hidden="true">❄</span>
          AirCon Care
        </Link>

        <nav className="site-header__nav" aria-label="Main">
          <a href="#services" className="site-header__link">Services</a>
          <a href="#how-it-works" className="site-header__link">How it works</a>
          <a href="#loyalty" className="site-header__link">Loyalty</a>
        </nav>

        <div className="site-header__actions">
          {isAuthenticated ? (
            <Link to={homePathFor(user.accountType)} className="btn btn-primary btn-sm">
              Go to my dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-link btn-sm site-header__signin">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
