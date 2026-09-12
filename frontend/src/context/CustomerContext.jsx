// Loads the signed-in customer's row from user3.newCustomer once for the whole
// portal, so every page can read customer_ID and the loyalty balance without
// fetching it again.
//
// This exists because logging in does not tell the frontend its customer_ID.
// authController returns { user_ID, username, accountType }, but bookings are
// keyed on customer_ID, so it has to be looked up separately.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as customerApi from '../api/customerApi'

const CustomerContext = createContext(null)

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await customerApi.getCustomerProfile()
      setCustomer(data.customer)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Called after anything that changes the stored balance, so the sidebar and
  // dashboard do not keep showing a stale number.
  const setLoyaltyPoints = useCallback((loyaltyPoints) => {
    setCustomer((current) => (current ? { ...current, loyaltyPoints } : current))
  }, [])

  const value = useMemo(
    () => ({ customer, isLoading, error, reload: load, setLoyaltyPoints }),
    [customer, isLoading, error, load, setLoyaltyPoints],
  )

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>
}

export function useCustomer() {
  const context = useContext(CustomerContext)
  if (!context) {
    throw new Error('useCustomer must be used inside a <CustomerProvider>.')
  }
  return context
}
