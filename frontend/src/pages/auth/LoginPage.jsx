// The homepage of the app: every visitor starts here (item 1 on the task list).
// On success the user is sent to whichever portal matches their accountType.

import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthCard from '../../components/auth/AuthCard'
import DemoCredentials from '../../components/auth/DemoCredentials'
import FormField from '../../components/auth/FormField'
import { useAuth } from '../../context/AuthContext'
import { homePathFor } from '../../constants/accountTypes'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Set by RegisterPage after a successful sign-up.
  const notice = location.state?.notice

  // Checked in the browser so an empty form never costs a round trip. The
  // backend validates the same rules again.
  function validate() {
    const errors = {}
    if (!username.trim()) errors.username = 'Enter your username.'
    if (!password) errors.password = 'Enter your password.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    if (!validate()) return

    setIsSubmitting(true)
    try {
      const user = await login({ username: username.trim(), password })

      // Send them back to the page that bounced them here, if there was one.
      const redirectTo = location.state?.from?.pathname || homePathFor(user.accountType)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setFormError(error.message)
      setPassword('')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleDemoPick(account) {
    setUsername(account.username)
    setPassword(account.password)
    setFieldErrors({})
    setFormError('')
  }

  return (
    <AuthCard
      title="Sign in"
      subtitle="Air Conditioning Maintenance Service System"
      footer={
        <>
          New customer? <Link to="/register">Create an account</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {notice && !formError && (
          <div className="alert alert-success py-2" role="status">
            {notice}
          </div>
        )}

        {formError && (
          <div className="alert alert-danger py-2" role="alert">
            {formError}
          </div>
        )}

        <FormField
          id="username"
          label="Username"
          value={username}
          onChange={setUsername}
          error={fieldErrors.username}
          autoComplete="username"
          placeholder="e.g. customer"
          disabled={isSubmitting}
          required
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
          autoComplete="current-password"
          disabled={isSubmitting}
          required
        />

        <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <DemoCredentials onPick={handleDemoPick} disabled={isSubmitting} />
    </AuthCard>
  )
}
