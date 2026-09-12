// Dummy customer data used until the Azure SQL database is connected.
//
// Field names copy the columns in sql_codes_Tables.txt exactly — service_id,
// booking_ID, loyaltyPoints and so on — so swapping in the real API is a
// change inside api/customerApi.js and nowhere else.

import { ApiError } from './client'
import { BOOKING_STATUS, CANCELLABLE_STATUSES } from '../constants/booking'
import { pointsEarnedFor } from '../constants/loyalty'

const NETWORK_DELAY_MS = 350

function delay() {
  return new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))
}

// payables.service
const SERVICES = [
  {
    service_id: 1,
    service_name: 'General servicing',
    description: 'Filter clean, coil wash and gas pressure check for one unit.',
    price: 80,
  },
  {
    service_id: 2,
    service_name: 'Chemical wash',
    description: 'Full strip-down chemical clean for units with heavy mould or odour.',
    price: 180,
  },
  {
    service_id: 3,
    service_name: 'Gas top-up',
    description: 'Refrigerant recharge and leak check.',
    price: 150,
  },
  {
    service_id: 4,
    service_name: 'Repair callout',
    description: 'Diagnostic visit for a unit that is not cooling or not starting.',
    price: 120,
  },
  {
    service_id: 5,
    service_name: 'New unit installation',
    description: 'Mounting, piping and commissioning of a newly purchased unit.',
    price: 350,
  },
]

// new_jobBooking.Booking, joined with the service for display.
// customer_ID 1 is the dummy customer from mockAuthApi.
let bookings = [
  {
    booking_ID: 2001,
    customer_ID: 1,
    service_id: 1,
    service_name: 'General servicing',
    price: 80,
    date: '2026-08-14',
    time: '10:00',
    location: '12 Jalan Melati, Kuala Lumpur',
    status: BOOKING_STATUS.COMPLETED,
    technician_ID: 101,
    technician_name: 'Ahmad Razali',
    isFollowup: 0,
  },
  {
    booking_ID: 2002,
    customer_ID: 1,
    service_id: 2,
    service_name: 'Chemical wash',
    price: 180,
    date: '2026-09-02',
    time: '14:00',
    location: '12 Jalan Melati, Kuala Lumpur',
    status: BOOKING_STATUS.COMPLETED,
    technician_ID: 101,
    technician_name: 'Ahmad Razali',
    isFollowup: 0,
  },
  {
    booking_ID: 2003,
    customer_ID: 1,
    service_id: 4,
    service_name: 'Repair callout',
    price: 120,
    date: '2026-09-18',
    time: '11:00',
    location: '12 Jalan Melati, Kuala Lumpur',
    status: BOOKING_STATUS.CONFIRMED,
    technician_ID: 102,
    technician_name: 'Kelvin Lee',
    isFollowup: 0,
  },
  {
    booking_ID: 2004,
    customer_ID: 1,
    service_id: 1,
    service_name: 'General servicing',
    price: 80,
    date: '2026-09-25',
    time: '09:00',
    location: '12 Jalan Melati, Kuala Lumpur',
    // technician_ID stays null until an admin assigns one, which is what
    // createBooking inserts.
    status: BOOKING_STATUS.PENDING,
    technician_ID: null,
    technician_name: null,
    isFollowup: 0,
  },
]

// user3.newCustomer
const customerProfile = {
  customer_ID: 1,
  customer_name: 'Sarah Tan',
  customer_address: '12 Jalan Melati, Kuala Lumpur',
  customer_aircons: 3,
  loyaltyPoints: 260,
  bought_packages: 0,
}

// Vouchers a customer has redeemed. No table exists for these yet — see the
// note in CUSTOMER_PORTAL.md about what the backend still needs.
let vouchers = []

let nextBookingId = 2005
let nextVoucherId = 1

export async function getServices() {
  await delay()
  return { success: true, services: SERVICES.map((service) => ({ ...service })) }
}

export async function getMyBookings({ customer_ID }) {
  await delay()

  return {
    success: true,
    bookings: bookings
      .filter((booking) => booking.customer_ID === customer_ID)
      // Soonest first, so the next visit is at the top.
      .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
      .map((booking) => ({ ...booking })),
  }
}

export async function getCustomerProfile() {
  await delay()
  return { success: true, customer: { ...customerProfile } }
}

export async function createBooking({ customer_ID, service_id, date, time, location }) {
  await delay()

  if (!customer_ID || !date || !time || !location) {
    throw new ApiError('Please provide customer_ID, date, time, and location.', 400)
  }

  const service = SERVICES.find((item) => item.service_id === Number(service_id))
  if (!service) {
    throw new ApiError('Pick a service.', 400)
  }

  const booking = {
    booking_ID: nextBookingId++,
    customer_ID,
    service_id: service.service_id,
    service_name: service.service_name,
    price: service.price,
    date,
    time,
    location,
    status: BOOKING_STATUS.PENDING,
    technician_ID: null,
    technician_name: null,
    isFollowup: 0,
  }
  bookings.push(booking)

  return {
    success: true,
    message: 'Booking created successfully!',
    booking_ID: booking.booking_ID,
  }
}

export async function cancelBooking({ booking_ID }) {
  await delay()

  const booking = bookings.find((item) => item.booking_ID === booking_ID)
  if (!booking) {
    throw new ApiError('That booking no longer exists.', 404)
  }

  // Once a technician is on the job it is too late to call it off in the app.
  if (!CANCELLABLE_STATUSES.includes(booking.status)) {
    throw new ApiError(
      `A booking that is ${booking.status.toLowerCase()} cannot be cancelled here. Please call the office.`,
      400,
    )
  }

  booking.status = BOOKING_STATUS.CANCELLED

  return { success: true, message: 'Booking cancelled.' }
}

export async function getLoyalty({ customer_ID }) {
  await delay()

  const completed = bookings.filter(
    (booking) =>
      booking.customer_ID === customer_ID && booking.status === BOOKING_STATUS.COMPLETED,
  )

  return {
    success: true,
    loyaltyPoints: customerProfile.loyaltyPoints,
    // Shown on the points page so a customer can see where the total came from.
    history: completed.map((booking) => ({
      booking_ID: booking.booking_ID,
      date: booking.date,
      service_name: booking.service_name,
      amount: booking.price,
      points: pointsEarnedFor(booking.price),
    })),
    vouchers: vouchers.map((voucher) => ({ ...voucher })),
  }
}

export async function redeemPoints({ tier }) {
  await delay()

  if (customerProfile.loyaltyPoints < tier.points) {
    throw new ApiError('You do not have enough points for that reward yet.', 400)
  }

  // CHECK (loyaltyPoints >= 0) means the database would reject a negative
  // balance, so the check above has to happen before the subtraction.
  customerProfile.loyaltyPoints -= tier.points

  const voucher = {
    voucher_ID: nextVoucherId++,
    code: `AC${String(Date.now()).slice(-6)}`,
    discount: tier.discount,
    pointsSpent: tier.points,
    redeemedOn: new Date().toISOString().slice(0, 10),
    isUsed: false,
  }
  vouchers.push(voucher)

  return {
    success: true,
    message: `Redeemed ${tier.points} points.`,
    voucher,
    loyaltyPoints: customerProfile.loyaltyPoints,
  }
}
