import { Link } from 'react-router-dom'
import { brand } from '../data/products'
import { useReveal } from '../hooks/useReveal'

export function Story({ compact = false }: { compact?: boolean }) {
  const mediaRef = useReveal<HTMLDivElement>()
  const copyRef = useReveal<HTMLDivElement>()

  return (
    <section className={`story${compact ? ' story--compact' : ''}`} id="story">
      <div ref={mediaRef} className="story__media reveal">
        <img
          src="/images/story-ingredients.jpg"
          alt="Premium nuts, seeds, and desi ghee arranged for Nour Organics"
        />
      </div>

      <div ref={copyRef} className="story__copy reveal reveal-delay-1">
        <p className="eyebrow">About Nour</p>
        <h2 className="section__title">
          Food that <em>nourishes</em> tomorrow.
        </h2>
        <p className="section__lede">
          {brand.motto}. We honour traditional South Asian panjeeri — elevated
          with premium ingredients, transparent sourcing, and a finish worthy of
          the Nour name.
        </p>

        <ul className="story__points">
          <li>
            <strong>Handpicked ingredients</strong>
            Almonds, walnuts, pistachios, cashews, seeds, and pure desi ghee —
            chosen for flavour and vitality.
          </li>
          <li>
            <strong>Small-batch craft</strong>
            Slow, careful preparation so every spoonful carries warmth,
            richness, and lasting energy.
          </li>
          <li>
            <strong>Nothing artificial</strong>
            No preservatives, no added colours — only what nature and tradition
            intended.
          </li>
        </ul>

        {compact ? (
          <div className="story__actions">
            <Link className="btn btn--gold" to="/about">
              Read Our Story
            </Link>
            <Link className="btn btn--ghost" to="/products">
              Shop Collection
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  )
}
