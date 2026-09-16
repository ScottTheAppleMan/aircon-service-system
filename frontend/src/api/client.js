// Thin fetch wrapper shared by every API module.
//
// The backend (backend/src/server.js) answers on http://localhost:5000 and
// replies with { success, ... } on success or { success: false, message } on
// failure, so that shape is what this client normalises.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Reads the JWT that AuthContext stored, so callers never pass it by hand.
function authHeader() {
  const token = localStorage.getItem('aircon_care_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function request(path, { method = 'GET', body, auth = true } = {}) {
  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? authHeader() : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    // fetch only rejects when the request never reached the server.
    throw new ApiError('Cannot reach the server. Is the backend running?', 0)
  }

  let payload = null
  try {
    payload = await response.json()
  } catch {
    // A 500 from Express can be an HTML error page rather than JSON.
    payload = null
  }

  if (!response.ok || (payload && payload.success === false)) {
    const message =
      payload?.message || payload?.error || `Request failed (${response.status})`
    throw new ApiError(message, response.status)
  }

  return payload
}
