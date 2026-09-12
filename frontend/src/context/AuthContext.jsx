// Holds the signed-in user for the whole app.
//
// Anything that needs to know who is logged in calls useAuth() rather than
// reading localStorage, so there is one place to change when the real backend
// and its JWT arrive.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/authApi'

const TOKEN_KEY = 'aircon_care_token'
const USER_KEY = 'aircon_care_user'

const AuthContext = createContext(null)

// Restores the session on a page refresh. Anything unreadable is discarded
// rather than thrown, so a bad entry cannot lock someone out of the app.
function readStoredUser() {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const user = localStorage.getItem(USER_KEY)
    if (!token || !user) return null
    return JSON.parse(user)
  } catch {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)
  const [isRestoring, setIsRestoring] = useState(true)

  // readStoredUser already ran synchronously; this only releases the guard in
  // ProtectedRoute so it never redirects before the session is known.
  useEffect(() => {
    setIsRestoring(false)
  }, [])

  const login = useCallback(async ({ username, password }) => {
    const data = await authApi.login({ username, password })

    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    setUser(data.user)

    return data.user
  }, [])

  const register = useCallback(async (details) => {
    // The backend returns no token here, so the user still has to log in.
    return authApi.register(details)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isRestoring,
      login,
      register,
      logout,
    }),
    [user, isRestoring, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>.')
  }
  return context
}
