// Frame around every customer page: the top bar, the side navigation and
// whichever page the route picked.

import { NavLink, Outlet } from 'react-router-dom'
import SignedInBar from '../components/SignedInBar'
import { CustomerProvider, useCustomer } from '../context/CustomerContext'

const NAV_ITEMS = [
  { to: '/customer', label: 'Dashboard', end: true },
  { to: '/customer/book', label: 'Book a service' },
  { to: '/customer/bookings', label: 'My bookings' },
  { to: '/customer/loyalty', label: 'Loyalty points' },
]

function PointsBadge() {
  const { customer, isLoading } = useCustomer()
  if (isLoading || !customer) return null

  return (
    <div className="portal-nav__points">
      <span className="portal-nav__points-value">{customer.loyaltyPoints}</span>
      <span className="portal-nav__points-label">points</span>
    </div>
  )
}

export default function CustomerLayout() {
  return (
    <CustomerProvider>
      <SignedInBar />

      <div className="portal">
        <nav className="portal-nav" aria-label="Customer pages">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `portal-nav__link${isActive ? ' portal-nav__link--active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}

          <PointsBadge />
        </nav>

        <main className="portal-main">
          <Outlet />
        </main>
      </div>
    </CustomerProvider>
  )
}
