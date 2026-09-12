import { BOOKING_STATUS_VARIANT } from '../../constants/booking'

export default function BookingStatusBadge({ status }) {
  const variant = BOOKING_STATUS_VARIANT[status] || 'secondary'
  return <span className={`badge text-bg-${variant}`}>{status}</span>
}
