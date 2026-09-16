// Booking status values.
//
// new_jobBooking.Booking.status is a free-text VARCHAR(100), so nothing stops
// the backend writing a different spelling. createBooking currently inserts
// 'Pending'; the rest are what the admin screens will set. Agree any change
// here with whoever writes the admin status update.
export const BOOKING_STATUS = Object.freeze({
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
})

// Bootstrap badge colour per status.
export const BOOKING_STATUS_VARIANT = Object.freeze({
  [BOOKING_STATUS.PENDING]: 'warning',
  [BOOKING_STATUS.CONFIRMED]: 'info',
  [BOOKING_STATUS.IN_PROGRESS]: 'primary',
  [BOOKING_STATUS.COMPLETED]: 'success',
  [BOOKING_STATUS.CANCELLED]: 'secondary',
})

// A customer may only call off a booking nobody has started yet.
export const CANCELLABLE_STATUSES = Object.freeze([
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.CONFIRMED,
])

// Bookings still to happen, for the dashboard's "upcoming" count.
export const ACTIVE_STATUSES = Object.freeze([
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.IN_PROGRESS,
])

// Times a technician can be sent out. Booking.time is a TIME column, so these
// are stored as 24-hour 'HH:MM' and only formatted for display.
export const TIME_SLOTS = Object.freeze([
  '09:00', '10:00', '11:00', '12:00',
  '14:00', '15:00', '16:00', '17:00',
])

export function formatTimeSlot(value) {
  const [hour, minute] = value.split(':').map(Number)
  const period = hour < 12 ? 'AM' : 'PM'
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`
}

export function formatBookingDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
