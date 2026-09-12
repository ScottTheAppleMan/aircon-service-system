// Loyalty points: the balance, where it came from, and what it can be
// exchanged for.
//
// The scheme itself lives in constants/loyalty.js so the rules can be argued
// about in one place rather than scattered through this page.

import { useCallback, useEffect, useState } from 'react'
import EmptyState from '../../components/customer/EmptyState'
import LoadingBlock from '../../components/customer/LoadingBlock'
import { useCustomer } from '../../context/CustomerContext'
import * as customerApi from '../../api/customerApi'
import { formatBookingDate } from '../../constants/booking'
import {
  POINTS_PER_CURRENCY_UNIT,
  REDEMPTION_TIERS,
  CURRENCY,
  formatMoney,
} from '../../constants/loyalty'

export default function LoyaltyPoints() {
  const { customer, isLoading: isLoadingCustomer, setLoyaltyPoints } = useCustomer()

  const [loyalty, setLoyalty] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [redeemingTierId, setRedeemingTierId] = useState(null)

  const load = useCallback(async () => {
    if (!customer) return

    try {
      const data = await customerApi.getLoyalty({ customer_ID: customer.customer_ID })
      setLoyalty(data)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [customer])

  useEffect(() => {
    load()
  }, [load])

  async function handleRedeem(tier) {
    const confirmed = window.confirm(
      `Exchange ${tier.points} points for ${tier.label}?`,
    )
    if (!confirmed) return

    setRedeemingTierId(tier.id)
    setError('')
    setNotice('')
    try {
      const data = await customerApi.redeemPoints({
        customer_ID: customer.customer_ID,
        tier,
      })

      // Keep the sidebar badge and the dashboard in step with the new balance.
      setLoyaltyPoints(data.loyaltyPoints)
      setNotice(`Done. Use code ${data.voucher.code} on your next booking.`)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setRedeemingTierId(null)
    }
  }

  if (isLoadingCustomer || isLoading) return <LoadingBlock label="Loading your points…" />

  const balance = customer?.loyaltyPoints ?? 0
  const nextTier = REDEMPTION_TIERS.find((tier) => tier.points > balance)

  return (
    <>
      <header className="page-head">
        <h1 className="page-head__title">Loyalty points</h1>
        <p className="page-head__subtitle">
          Earn {POINTS_PER_CURRENCY_UNIT} point for every {CURRENCY} 1 spent on a completed
          service.
        </p>
      </header>

      {notice && (
        <div className="alert alert-success" role="status">
          {notice}
        </div>
      )}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <section className="points-hero">
        <div>
          <p className="points-hero__label">Your balance</p>
          <p className="points-hero__value">{balance}</p>
        </div>

        {nextTier && (
          <p className="points-hero__next">
            {nextTier.points - balance} more points until {nextTier.label.toLowerCase()}
          </p>
        )}
      </section>

      <section className="panel">
        <h2 className="panel__title">Redeem</h2>
        <p className="text-muted small">
          Saving up is worth more — the larger rewards give more back per point.
        </p>

        <div className="tier-grid">
          {REDEMPTION_TIERS.map((tier) => {
            const affordable = balance >= tier.points

            return (
              <div
                key={tier.id}
                className={`tier${affordable ? '' : ' tier--locked'}`}
              >
                <p className="tier__points">{tier.points} pts</p>
                <p className="tier__reward">{formatMoney(tier.discount)} off</p>
                <p className="tier__rate">
                  {(tier.discount / tier.points).toFixed(3)} {CURRENCY} per point
                </p>

                <button
                  type="button"
                  className={`btn btn-sm w-100 ${affordable ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => handleRedeem(tier)}
                  disabled={!affordable || redeemingTierId !== null}
                >
                  {redeemingTierId === tier.id
                    ? 'Redeeming…'
                    : affordable
                      ? 'Redeem'
                      : `Need ${tier.points - balance} more`}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      <section className="panel">
        <h2 className="panel__title">Your vouchers</h2>

        {loyalty?.vouchers?.length ? (
          <ul className="voucher-list">
            {loyalty.vouchers.map((voucher) => (
              <li key={voucher.voucher_ID} className="voucher">
                <div>
                  <p className="voucher__code">{voucher.code}</p>
                  <p className="voucher__meta">
                    Redeemed {formatBookingDate(voucher.redeemedOn)} for {voucher.pointsSpent} pts
                  </p>
                </div>
                <span className={`badge text-bg-${voucher.isUsed ? 'secondary' : 'success'}`}>
                  {voucher.isUsed ? 'Used' : `${formatMoney(voucher.discount)} off`}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No vouchers yet"
            message="Redeem some points and they will appear here."
          />
        )}
      </section>

      <section className="panel">
        <h2 className="panel__title">How you earned them</h2>

        {loyalty?.history?.length ? (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">Service</th>
                  <th scope="col">Date</th>
                  <th scope="col">Spent</th>
                  <th scope="col" className="text-end">Points</th>
                </tr>
              </thead>
              <tbody>
                {loyalty.history.map((entry) => (
                  <tr key={entry.booking_ID}>
                    <td>{entry.service_name}</td>
                    <td>{formatBookingDate(entry.date)}</td>
                    <td>{formatMoney(entry.amount)}</td>
                    <td className="text-end text-success fw-semibold">+{entry.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Nothing earned yet"
            message="Points are added once a booking is marked completed."
          />
        )}
      </section>
    </>
  )
}
