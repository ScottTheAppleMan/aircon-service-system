// Every booking this customer has made, newest first, with a filter and a way
// to cancel one that has not started.

import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import BookingStatusBadge from '../../components/customer/BookingStatusBadge'
import EmptyState from '../../components/customer/EmptyState'
import LoadingBlock from '../../components/customer/LoadingBlock'
import { useCustomer } from '../../context/CustomerContext'
import * as customerApi from '../../api/customerApi'
import {
  ACTIVE_STATUSES,
  BOOKING_STATUS,
  CANCELLABLE_STATUSES,
  formatBookingDate,
  formatTimeSlot,
} from '../../constants/booking'
import { formatMoney } from '../../constants/loyalty'

const FILTERS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'all', label: 'All' },
]

function matchesFilter(booking, filter) {
  if (filter === 'upcoming') return ACTIVE_STATUSES.includes(booking.status)
  if (filter === 'completed') return booking.status === BOOKING_STATUS.COMPLETED
  if (filter === 'cancelled') return booking.status === BOOKING_STATUS.CANCELLED
  return true
}

export default function MyBookings() {
  const routerLocation = useLocation()
  const { customer, isLoading: isLoadingCustomer } = useCustomer()

  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('upcoming')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState(null)
  const [notice, setNotice] = useState(routerLocation.state?.notice || '')

  const load = useCallback(async () => {
    if (!customer) return

    setIsLoading(true)
    try {
      const data = await customerApi.getMyBookings({ customer_ID: customer.customer_ID })
      setBookings(data.bookings)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [customer])

  useEffect(() => {
    load()
  }, [load])

  async function handleCancel(booking) {
    const confirmed = window.confirm(
      `Cancel the ${booking.service_name} on ${formatBookingDate(booking.date)}?`,
    )
    if (!confirmed) return

    setCancellingId(booking.booking_ID)
    setError('')
    try {
      await customerApi.cancelBooking({ booking_ID: booking.booking_ID })
      setNotice('Booking cancelled.')
      // Re-read rather than editing in place, so the row shows whatever the
      // server actually stored.
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setCancellingId(null)
    }
  }

  if (isLoadingCustomer || isLoading) return <LoadingBlock label="Loading your bookings…" />

  const visible = bookings.filter((booking) => matchesFilter(booking, filter))

  return (
    <>
      <header className="page-head">
        <div>
          <h1 className="page-head__title">My bookings</h1>
          <p className="page-head__subtitle">Every service you have requested.</p>
        </div>
        <Link to="/customer/book" className="btn btn-primary">
          Book a service
        </Link>
      </header>

      {notice && (
        <div className="alert alert-success" role="status">
          {notice}
        </div>
      )}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="filter-tabs" role="tablist">
        {FILTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={filter === option.id}
            className={`filter-tab${filter === option.id ? ' filter-tab--active' : ''}`}
            onClick={() => setFilter(option.id)}
          >
            {option.label}
            <span className="filter-tab__count">
              {bookings.filter((booking) => matchesFilter(booking, option.id)).length}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="Nothing here"
          message="No bookings match this filter."
          action={
            <Link to="/customer/book" className="btn btn-primary btn-sm">
              Book a service
            </Link>
          }
        />
      ) : (
        <div className="panel panel--flush">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">Service</th>
                  <th scope="col">When</th>
                  <th scope="col">Technician</th>
                  <th scope="col" className="num">Price</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-end">Action</th>
                </tr>
              </thead>

              <tbody>
                {visible.map((booking) => (
                  <tr key={booking.booking_ID}>
                    <td>
                      <div className="fw-semibold">{booking.service_name}</div>
                      <div className="text-muted small">{booking.location}</div>
                    </td>
                    <td>
                      <div>{formatBookingDate(booking.date)}</div>
                      <div className="text-muted small">{formatTimeSlot(booking.time)}</div>
                    </td>
                    <td>
                      {booking.technician_name || (
                        <span className="text-muted small">Not assigned</span>
                      )}
                    </td>
                    <td className="num">{formatMoney(booking.price)}</td>
                    <td>
                      <BookingStatusBadge status={booking.status} />
                    </td>
                    <td className="text-end">
                      {CANCELLABLE_STATUSES.includes(booking.status) ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleCancel(booking)}
                          disabled={cancellingId === booking.booking_ID}
                        >
                          {cancellingId === booking.booking_ID ? 'Cancelling…' : 'Cancel'}
                        </button>
                      ) : (
                        <span
                          className="text-muted small"
                          title={`A booking that is ${booking.status.toLowerCase()} cannot be cancelled here`}
                        >
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
