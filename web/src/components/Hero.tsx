import { Link } from 'react-router-dom'
import { brand } from '../data/products'

export function Hero() {
  return (
    <section className="hero" id="top" aria-label="Nour Organics">
      <div className="hero__media" aria-hidden="true">
        <img src="/images/hero-panjeeri.jpg" alt="" fetchPriority="high" />
        <div className="hero__veil" />
      </div>

      <div className="hero__content">
        <h1 className="hero__brand">Nour Organics</h1>
        <p className="hero__rule">{brand.tagline}</p>
        <p className="hero__headline">
          Heritage nourishment, refined for modern living.
        </p>
        <div className="hero__actions">
          <Link className="btn btn--gold" to="/products">
            Explore Collection
          </Link>
          <Link className="btn btn--ghost" to="/about">
            Our Craft
          </Link>
        </div>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span>Scroll</span>
        <div className="hero__scroll-line" />
      </div>
    </section>
  )
}
