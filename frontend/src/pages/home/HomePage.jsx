// The public homepage — what someone sees before they have an account.
//
// The service list is the same data the booking form uses, so prices shown
// here can never drift from prices charged at booking.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../../components/home/SiteHeader'
import * as customerApi from '../../api/customerApi'
import { formatMoney, REDEMPTION_TIERS, CURRENCY } from '../../constants/loyalty'

const STEPS = [
  {
    number: '01',
    title: 'Tell us what you need',
    body: 'Pick a service, a date and a time that suits you. Takes under a minute.',
  },
  {
    number: '02',
    title: 'We assign a technician',
    body: 'A qualified technician is matched to your job and your booking is confirmed.',
  },
  {
    number: '03',
    title: 'Track it end to end',
    body: 'See the status, the technician assigned, and the service report afterwards.',
  },
]

export default function HomePage() {
  const [services, setServices] = useState([])

  useEffect(() => {
    let cancelled = false

    customerApi
      .getServices()
      .then((data) => {
        if (!cancelled) setServices(data.services)
      })
      // The homepage still reads fine without prices, so a failure here is not
      // worth an error banner.
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  const topTier = REDEMPTION_TIERS[REDEMPTION_TIERS.length - 1]

  return (
    <div className="home">
      <SiteHeader />

      <main>
        <section className="hero">
          <div className="hero__inner">
            <p className="hero__eyebrow">Air conditioning servicing, Singapore</p>

            <h1 className="hero__title">
              Cool rooms,<br />booked in a minute.
            </h1>

            <p className="hero__lead">
              Servicing, chemical wash, repairs and installation — booked online,
              tracked to completion, and rewarded every time.
            </p>

            <div className="hero__actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Book your first service
              </Link>
              <Link to="/login" className="btn btn-outline-secondary btn-lg">
                Sign in
              </Link>
            </div>

            <dl className="hero__stats">
              <div className="hero__stat">
                <dt>Same-week</dt>
                <dd>appointment slots</dd>
              </div>
              <div className="hero__stat">
                <dt className="tabular">1 pt</dt>
                <dd>per {CURRENCY}1 spent</dd>
              </div>
              <div className="hero__stat">
                <dt>Reports</dt>
                <dd>after every visit</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="section" id="services">
          <div className="section__inner">
            <header className="section__head">
              <h2 className="section__title">What we service</h2>
              <p className="section__lead">
                Transparent pricing. Parts used on the day are charged separately.
              </p>
            </header>

            <div className="service-list">
              {services.map((service) => (
                <article key={service.service_id} className="service-tile">
                  <h3 className="service-tile__name">{service.service_name}</h3>
                  <p className="service-tile__price tabular">
                    {formatMoney(service.price)}
                  </p>
                  <p className="service-tile__body">{service.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--sunken" id="how-it-works">
          <div className="section__inner">
            <header className="section__head">
              <h2 className="section__title">How it works</h2>
            </header>

            <ol className="step-list">
              {STEPS.map((step) => (
                <li key={step.number} className="step">
                  <span className="step__number tabular">{step.number}</span>
                  <h3 className="step__title">{step.title}</h3>
                  <p className="step__body">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section" id="loyalty">
          <div className="section__inner">
            <div className="loyalty-promo">
              <div className="loyalty-promo__copy">
                <h2 className="section__title">Every service earns points</h2>
                <p className="section__lead">
                  Earn 1 point for every {CURRENCY}1 spent, credited once the job is
                  complete. Save them up — the bigger rewards are worth more per
                  point.
                </p>

                <Link to="/register" className="btn btn-primary">
                  Start earning
                </Link>
              </div>

              <ul className="loyalty-promo__tiers">
                {REDEMPTION_TIERS.map((tier) => (
                  <li key={tier.id} className="loyalty-promo__tier">
                    <span className="loyalty-promo__points tabular">
                      {tier.points} pts
                    </span>
                    <span className="loyalty-promo__reward tabular">
                      {formatMoney(tier.discount)} off
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="cta">
          <div className="cta__inner">
            <h2 className="cta__title">Ready when you are</h2>
            <p className="cta__lead">
              Create an account and book your first service — up to{' '}
              <span className="tabular">{formatMoney(topTier.discount)}</span> back
              once you are a regular.
            </p>
            <Link to="/register" className="btn btn-lg cta__button">
              Create an account
            </Link>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <span className="site-footer__brand">
            <span aria-hidden="true">❄</span> AirCon Care
          </span>
          <span className="site-footer__note">
            Air Conditioning Maintenance Service System
          </span>
        </div>
      </footer>
    </div>
  )
}
