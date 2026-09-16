// Booking form: pick a service, a date and a time, confirm the address.
// Creates a row in new_jobBooking.Booking with status 'Pending'; an admin
// assigns the technician afterwards.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoadingBlock from '../../components/customer/LoadingBlock'
import FormField from '../../components/auth/FormField'
import { useCustomer } from '../../context/CustomerContext'
import * as customerApi from '../../api/customerApi'
import { TIME_SLOTS, formatTimeSlot } from '../../constants/booking'
import { formatMoney } from '../../constants/loyalty'

// Same shape as the DATE column, and what <input type="date"> expects.
function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export default function BookService() {
  const navigate = useNavigate()
  const { customer, isLoading: isLoadingCustomer } = useCustomer()

  const [services, setServices] = useState([])
  const [isLoadingServices, setIsLoadingServices] = useState(true)

  const [serviceId, setServiceId] = useState(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')

  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    customerApi
      .getServices()
      .then((data) => {
        if (!cancelled) setServices(data.services)
      })
      .catch((err) => {
        if (!cancelled) setFormError(err.message)
      })
      .finally(() => {
        if (!cancelled) setIsLoadingServices(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // The address on file is the usual answer, so it is filled in but editable —
  // a customer may be booking for a different property.
  useEffect(() => {
    if (customer?.customer_address) setLocation(customer.customer_address)
  }, [customer])

  function validate() {
    const errors = {}

    if (!serviceId) errors.service = 'Choose a service.'
    if (!date) errors.date = 'Pick a date.'
    else if (date < todayIso()) errors.date = 'Pick a date that has not passed.'
    if (!time) errors.time = 'Pick a time.'

    if (!location.trim()) errors.location = 'Enter the service address.'
    // Booking.location is VARCHAR(100).
    else if (location.trim().length > 100) errors.location = 'Use 100 characters or fewer.'

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    if (!validate()) return

    setIsSubmitting(true)
    try {
      await customerApi.createBooking({
        customer_ID: customer.customer_ID,
        service_id: serviceId,
        date,
        time,
        location: location.trim(),
      })

      navigate('/customer/bookings', {
        replace: true,
        state: { notice: 'Booking requested. You will hear from us once a technician is assigned.' },
      })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingCustomer || isLoadingServices) return <LoadingBlock label="Loading services…" />

  const selectedService = services.find((service) => service.service_id === serviceId)

  return (
    <>
      <header className="page-head">
        <h1 className="page-head__title">Book a service</h1>
        <p className="page-head__subtitle">
          Tell us what you need and when. We assign a technician and confirm.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className="alert alert-danger" role="alert">
            {formError}
          </div>
        )}

        <section className="panel">
          <h2 className="panel__title">1. What do you need?</h2>

          {fieldErrors.service && <p className="field-error">{fieldErrors.service}</p>}

          <div className="service-grid">
            {services.map((service) => {
              const isSelected = service.service_id === serviceId

              return (
                <button
                  key={service.service_id}
                  type="button"
                  className={`service-card${isSelected ? ' service-card--selected' : ''}`}
                  onClick={() => setServiceId(service.service_id)}
                  aria-pressed={isSelected}
                  disabled={isSubmitting}
                >
                  <span className="service-card__name">{service.service_name}</span>
                  <span className="service-card__price">{formatMoney(service.price)}</span>
                  <span className="service-card__description">{service.description}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="panel">
          <h2 className="panel__title">2. When suits you?</h2>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label htmlFor="date" className="form-label auth-field__label">
                Date <span className="auth-field__required">*</span>
              </label>
              <input
                id="date"
                type="date"
                className={`form-control${fieldErrors.date ? ' is-invalid' : ''}`}
                value={date}
                min={todayIso()}
                onChange={(event) => setDate(event.target.value)}
                disabled={isSubmitting}
              />
              {fieldErrors.date && <div className="invalid-feedback">{fieldErrors.date}</div>}
            </div>
          </div>

          <fieldset className="mt-3">
            <legend className="form-label auth-field__label">
              Time slot <span className="auth-field__required">*</span>
            </legend>

            {fieldErrors.time && <p className="field-error">{fieldErrors.time}</p>}

            <div className="slot-grid">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`slot${time === slot ? ' slot--selected' : ''}`}
                  onClick={() => setTime(slot)}
                  aria-pressed={time === slot}
                  disabled={isSubmitting}
                >
                  {formatTimeSlot(slot)}
                </button>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="panel">
          <h2 className="panel__title">3. Where are we going?</h2>

          <FormField
            id="location"
            label="Service address"
            value={location}
            onChange={setLocation}
            error={fieldErrors.location}
            disabled={isSubmitting}
            required
          />
        </section>

        <div className="booking-summary">
          <div>
            <p className="booking-summary__label">Estimated total</p>
            <p className="booking-summary__value">
              {selectedService ? formatMoney(selectedService.price) : '—'}
            </p>
            <p className="booking-summary__note">
              Parts used on the day are charged separately.
            </p>
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Requesting…' : 'Request booking'}
          </button>
        </div>
      </form>
    </>
  )
}
