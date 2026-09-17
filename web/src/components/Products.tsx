import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../data/products'
import { useReveal } from '../hooks/useReveal'
import { useCart } from '../cart/CartContext'

type GalleryTab = 'product' | 'benefits' | 'ingredients'

const tabs: { id: GalleryTab; label: string }[] = [
  { id: 'product', label: 'Product' },
  { id: 'benefits', label: 'Key Benefits' },
  { id: 'ingredients', label: 'Ingredients' },
]

function formatPrice(amount: number) {
  return amount.toLocaleString('en-PK')
}

function ProductShowcase({ product, index }: { product: Product; index: number }) {
  const ref = useReveal<HTMLElement>()
  const { addItem } = useCart()
  const [tab, setTab] = useState<GalleryTab>('product')

  return (
    <article
      ref={ref}
      className={`showcase reveal reveal-delay-${(index % 3) + 1}${
        product.accent === 'warm' ? ' showcase--warm' : ''
      }`}
      id={product.id}
    >
      <div className="showcase__gallery">
        <div className="showcase__frame">
          {tabs.map((t) => (
            <img
              key={t.id}
              className={`showcase__image${tab === t.id ? ' is-active' : ''}`}
              src={product.gallery[t.id]}
              alt={`${product.name} — ${t.label}`}
              loading={index === 0 && t.id === 'product' ? 'eager' : 'lazy'}
            />
          ))}
        </div>

        <div className="showcase__tabs" role="tablist" aria-label={`${product.name} views`}>
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`showcase__tab${tab === t.id ? ' is-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="showcase__thumbs">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`showcase__thumb${tab === t.id ? ' is-active' : ''}`}
              onClick={() => setTab(t.id)}
              aria-label={`Show ${t.label}`}
            >
              <img src={product.gallery[t.id]} alt="" />
            </button>
          ))}
        </div>
      </div>

      <div className="showcase__body">
        <p className="eyebrow">
          {String(index + 1).padStart(2, '0')} — Signature Blend
        </p>
        <h2 className="showcase__name">{product.name}</h2>
        <p className="showcase__tagline">{product.tagline}</p>
        <p className="showcase__desc">{product.description}</p>

        <ul className="product__badges">
          {product.badges.map((badge) => (
            <li key={badge}>{badge}</li>
          ))}
        </ul>

        <div className="showcase__panel">
          <h3>Key Benefits</h3>
          <ul className="product__benefits">
            {product.benefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
        </div>

        {product.ingredientsList.length > 0 ? (
          <div className="showcase__panel">
            <h3>Ingredients</h3>
            <ul className="showcase__ingredients">
              {product.ingredientsList.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {product.howTo ? (
          <p className="showcase__howto">
            <strong>How to enjoy</strong>
            {product.howTo}
          </p>
        ) : null}

        <div className="product__meta">
          <p className="product__price">
            <span>{product.currency}</span>
            {formatPrice(product.price)}
          </p>
          <p className="product__weight">Net weight {product.weight}</p>
        </div>

        <div className="product__actions">
          <button
            className="btn btn--gold"
            type="button"
            aria-label={`Add ${product.name} to cart`}
            onClick={() => addItem(product)}
          >
            Add to Cart
          </button>
          <a className="btn btn--ghost" href="tel:+923272012783">
            Call to Order
          </a>
        </div>
      </div>
    </article>
  )
}

export function Products({
  products,
  loading = false,
}: {
  products: Product[]
  loading?: boolean
}) {
  const headRef = useReveal<HTMLDivElement>()

  return (
    <section className="section products" id="collection">
      <div ref={headRef} className="section__head reveal">
        <p className="eyebrow">The Collection</p>
        <h2 className="section__title">
          Three blends. <em>One standard of purity.</em>
        </h2>
        <p className="section__lede">
          Explore each jar through its product story, key benefits, and
          ingredient craft — then add your favourites to cart.
        </p>
      </div>

      {loading ? (
        <p className="products__loading">Loading collection…</p>
      ) : (
        <div className="showcase-list">
          {products.map((product, index) => (
            <ProductShowcase key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </section>
  )
}

function FeaturedCard({ product, index }: { product: Product; index: number }) {
  const ref = useReveal<HTMLElement>()
  const { addItem } = useCart()

  return (
    <article
      ref={ref}
      className={`featured__card reveal reveal-delay-${(index % 3) + 1}`}
    >
      <Link to={`/products#${product.id}`} className="featured__media">
        <img src={product.gallery.product} alt={product.name} loading="lazy" />
      </Link>
      <div className="featured__copy">
        <p className="eyebrow">{String(index + 1).padStart(2, '0')}</p>
        <h3>
          <Link to={`/products#${product.id}`}>{product.name}</Link>
        </h3>
        <p>{product.tagline}</p>
        <p className="featured__price">
          {product.currency} {formatPrice(product.price)}
        </p>
        <div className="featured__actions">
          <button
            type="button"
            className="btn btn--gold"
            onClick={() => addItem(product)}
          >
            Add to Cart
          </button>
          <Link className="btn btn--ghost" to={`/products#${product.id}`}>
            View Details
          </Link>
        </div>
      </div>
    </article>
  )
}

export function FeaturedCollection({ products }: { products: Product[] }) {
  const headRef = useReveal<HTMLDivElement>()

  return (
    <section className="section featured" id="featured">
      <div ref={headRef} className="section__head reveal">
        <p className="eyebrow">Signature Collection</p>
        <h2 className="section__title">
          Crafted for <em>every generation</em>
        </h2>
        <p className="section__lede">
          Premium dry fruit panjeeri, everyday energy, and kids nutrition —
          each blend small-batch and pure.
        </p>
      </div>

      <div className="featured__grid">
        {products.map((product, index) => (
          <FeaturedCard key={product.id} product={product} index={index} />
        ))}
      </div>

      <div className="featured__cta">
        <Link className="btn btn--gold" to="/products">
          Explore Full Collection
        </Link>
      </div>
    </section>
  )
}
