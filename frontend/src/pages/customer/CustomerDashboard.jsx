// Landing page for a customer: what is coming up, and the shortcuts they use
// most.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LoadingBlock from '../../components/customer/LoadingBlock'
import BookingStatusBadge from '../../components/customer/BookingStatusBadge'
import StatCard from '../../components/customer/StatCard'
import EmptyState from '../../components/customer/EmptyState'
import { useAuth } from '../../context/AuthContext'
import { useCustomer } from '../../context/CustomerContext'
import * as customerApi from '../../api/customerApi'
import {
  ACTIVE_STATUSES,
  BOOKING_STATUS,
  formatBookingDate,
  formatTimeSlot,
} from '../../constants/booking'

export default function CustomerDashboard() {
  const { user } = useAuth()
  const { customer, isLoading: isLoadingCustomer } = useCustomer()

  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!customer) return

    let cancelled = false

    customerApi
      .getMyBookings({ customer_ID: customer.customer_ID })
      .then((data) => {
        // The request may land after the user has moved to another page.
        if (!cancelled) setBookings(data.bookings)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [customer])

  if (isLoadingCustomer || isLoading) return <LoadingBlock label="Loading your dashboard…" />

  const upcoming = bookings
    .filter((booking) => ACTIVE_STATUSES.includes(booking.status))
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))

  const completedCount = bookings.filter(
    (booking) => booking.status === BOOKING_STATUS.COMPLETED,
  ).length

  const nextBooking = upcoming[0]

  return (
    <>
      <header className="page-head">
        <h1 className="page-head__title">Hello, {customer?.customer_name || user.username}</h1>
        <p className="page-head__subtitle">Here is where your servicing stands.</p>
      </header>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="stat-grid">
        <StatCard label="Upcoming visits" value={upcoming.length} />
        <StatCard label="Services completed" value={completedCount} />
        <StatCard
          label="Loyalty points"
          value={customer?.loyaltyPoints ?? 0}
          hint={<Link to="/customer/loyalty">Redeem them</Link>}
        />
        <StatCard label="Units registered" value={customer?.customer_aircons ?? 0} />
      </div>

      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">Next visit</h2>
          <Link to="/customer/bookings" className="btn btn-sm btn-outline-secondary">
            See all bookings
          </Link>
        </div>

        {nextBooking ? (
          <div className="next-visit">
            <div>
              <p className="next-visit__service">{nextBooking.service_name}</p>
              <p className="next-visit__when">
                {formatBookingDate(nextBooking.date)} at {formatTimeSlot(nextBooking.time)}
              </p>
              <p className="next-visit__where">{nextBooking.location}</p>
              <p className="next-visit__tech">
                {nextBooking.technician_name
                  ? `Technician: ${nextBooking.technician_name}`
                  : 'A technician has not been assigned yet.'}
              </p>
            </div>
            <BookingStatusBadge status={nextBooking.status} />
          </div>
        ) : (
          <EmptyState
            title="Nothing booked"
            message="You have no visits coming up."
            action={
              <Link to="/customer/book" className="btn btn-primary btn-sm">
                Book a service
              </Link>
            }
          />
        )}
      </section>
    </>
  )
}
