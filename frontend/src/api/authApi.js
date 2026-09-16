// Talks to backend/src/routes/authRoutes.js.
//
// VITE_USE_MOCK_AUTH=true routes every call to mockAuthApi instead, so the
// login screen is usable before the Azure SQL database is connected. The two
// modules return identical shapes, so switching modes changes nothing above.

import { request } from './client'
import * as mockAuthApi from './mockAuthApi'

// Defaults to mock so `npm run dev` works with no backend and no .env file.
const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH !== 'false'

export const isUsingMockAuth = USE_MOCK

// POST /api/auth/login -> { success, message, token, user }
export function login({ username, password }) {
  if (USE_MOCK) return mockAuthApi.login({ username, password })

  return request('/api/auth/login', {
    method: 'POST',
    auth: false,
    body: { username, password },
  })
}

// POST /api/auth/register -> { success, message, user_ID, customer_ID }
// Registers a Customer only; Admin and Technician accounts are created by an
// admin through /api/admin/users.
export function register({ username, password, customer_name, customer_address }) {
  if (USE_MOCK) {
    return mockAuthApi.register({ username, password, customer_name, customer_address })
  }

  return request('/api/auth/register', {
    method: 'POST',
    auth: false,
    body: { username, password, customer_name, customer_address },
  })
}
