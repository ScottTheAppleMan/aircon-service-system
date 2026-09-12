// Customer portal data access.
//
// Two of these endpoints exist on the backend today; the rest do not. Each one
// is marked below. While VITE_USE_MOCK_AUTH is not 'false' every call is served
// by mockCustomerApi instead, so the portal works in full before any of them
// are written.

import { request } from './client'
import * as mockCustomerApi from './mockCustomerApi'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH !== 'false'

export const isUsingMockData = USE_MOCK

// EXISTS — GET /api/bookings/services -> { success, services }
export function getServices() {
  if (USE_MOCK) return mockCustomerApi.getServices()
  return request('/api/bookings/services')
}

// EXISTS — POST /api/bookings -> { success, message, booking_ID }
//
// The backend ignores service_id today: createBooking only inserts
// customer_ID, date, time, location and a hardcoded 'Pending'. It is sent
// anyway because new_jobBooking.job already has an FK to payables.service, so
// the column the booking needs is coming.
export function createBooking({ customer_ID, service_id, date, time, location }) {
  if (USE_MOCK) {
    return mockCustomerApi.createBooking({ customer_ID, service_id, date, time, location })
  }

  return request('/api/bookings', {
    method: 'POST',
    body: { customer_ID, service_id, date, time, location },
  })
}

// NOT BUILT YET — needs GET /api/bookings/my?customer_ID=...
// A customer has to be able to see their own bookings; nothing returns them.
export function getMyBookings({ customer_ID }) {
  if (USE_MOCK) return mockCustomerApi.getMyBookings({ customer_ID })
  return request(`/api/bookings/my?customer_ID=${customer_ID}`)
}

// NOT BUILT YET — needs GET /api/customers/me
// Returns the row from user3.newCustomer for the signed-in user, which is the
// only way the frontend can learn its own customer_ID. See the note in
// CUSTOMER_PORTAL.md.
export function getCustomerProfile() {
  if (USE_MOCK) return mockCustomerApi.getCustomerProfile()
  return request('/api/customers/me')
}

// NOT BUILT YET — needs PUT /api/bookings/:bookingId/cancel
export function cancelBooking({ booking_ID }) {
  if (USE_MOCK) return mockCustomerApi.cancelBooking({ booking_ID })
  return request(`/api/bookings/${booking_ID}/cancel`, { method: 'PUT' })
}

// NOT BUILT YET — needs GET /api/customers/:customerId/loyalty
export function getLoyalty({ customer_ID }) {
  if (USE_MOCK) return mockCustomerApi.getLoyalty({ customer_ID })
  return request(`/api/customers/${customer_ID}/loyalty`)
}

// NOT BUILT YET — needs POST /api/customers/:customerId/loyalty/redeem
// Must subtract the points and create the voucher in one transaction, or a
// failure halfway through hands out a free voucher.
export function redeemPoints({ customer_ID, tier }) {
  if (USE_MOCK) return mockCustomerApi.redeemPoints({ customer_ID, tier })

  return request(`/api/customers/${customer_ID}/loyalty/redeem`, {
    method: 'POST',
    body: { points: tier.points, discount: tier.discount },
  })
}
