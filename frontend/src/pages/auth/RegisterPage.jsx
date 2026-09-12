// Customer sign-up. Admin and Technician accounts are not created here — an
// admin makes those through /api/admin/users, which matches the register
// controller: it always writes accountType 'Customer'.

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthCard from '../../components/auth/AuthCard'
import FormField from '../../components/auth/FormField'
import { useAuth } from '../../context/AuthContext'

const MIN_PASSWORD_LENGTH = 8

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: '',
    customer_name: '',
    customer_address: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(name) {
    return (value) => setForm((current) => ({ ...current, [name]: value }))
  }

  // VARCHAR(100) limits come from the CREATE TABLE statements for
  // user3.topUser and user3.newCustomer, so the database can never reject
  // something the form accepted.
  function validate() {
    const errors = {}

    if (!form.username.trim()) errors.username = 'Choose a username.'
    else if (form.username.trim().length > 100) errors.username = 'Use 100 characters or fewer.'

    if (!form.customer_name.trim()) errors.customer_name = 'Enter your full name.'
    else if (form.customer_name.trim().length > 100) {
      errors.customer_name = 'Use 100 characters or fewer.'
    }

    if (form.customer_address.trim().length > 100) {
      errors.customer_address = 'Use 100 characters or fewer.'
    }

    if (!form.password) errors.password = 'Choose a password.'
    else if (form.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`
    }

    if (form.confirmPassword !== form.password) {
      errors.confirmPassword = 'Both passwords must match.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    if (!validate()) return

    setIsSubmitting(true)
    try {
      await register({
        username: form.username.trim(),
        password: form.password,
        customer_name: form.customer_name.trim(),
        customer_address: form.customer_address.trim(),
      })

      // Registering returns no token, so the new customer signs in as normal.
      navigate('/login', {
        replace: true,
        state: { notice: 'Account created. Please sign in.' },
      })
    } catch (error) {
      setFormError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Book and track air conditioning servicing"
      footer={
        <>
          Already registered? <Link to="/login">Sign in</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className="alert alert-danger py-2" role="alert">
            {formError}
          </div>
        )}

        <FormField
          id="customer_name"
          label="Full name"
          value={form.customer_name}
          onChange={updateField('customer_name')}
          error={fieldErrors.customer_name}
          autoComplete="name"
          disabled={isSubmitting}
          required
        />

        <FormField
          id="username"
          label="Username"
          value={form.username}
          onChange={updateField('username')}
          error={fieldErrors.username}
          autoComplete="username"
          disabled={isSubmitting}
          required
        />

        <FormField
          id="customer_address"
          label="Service address"
          value={form.customer_address}
          onChange={updateField('customer_address')}
          error={fieldErrors.customer_address}
          autoComplete="street-address"
          placeholder="Where your air conditioners are installed"
          disabled={isSubmitting}
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          value={form.password}
          onChange={updateField('password')}
          error={fieldErrors.password}
          autoComplete="new-password"
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
          disabled={isSubmitting}
          required
        />

        <FormField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          value={form.confirmPassword}
          onChange={updateField('confirmPassword')}
          error={fieldErrors.confirmPassword}
          autoComplete="new-password"
          disabled={isSubmitting}
          required
        />

        <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthCard>
  )
}
