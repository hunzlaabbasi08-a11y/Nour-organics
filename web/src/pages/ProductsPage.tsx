import { useEffect, useState } from 'react'
import { Nav } from '../components/Nav'
import { Products } from '../components/Products'
import { Footer } from '../components/Footer'
import { CartDrawer } from '../components/CartDrawer'
import { Contact } from '../components/Contact'
import { api } from '../lib/api'
import { enrichProduct, products as fallback, type Product } from '../data/products'
import { brand } from '../data/products'

export function ProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .products()
      .then((rows) => setProducts(rows.map(enrichProduct)))
      .catch(() => {
        setError('Could not load live prices. Showing catalog.')
        setProducts(fallback)
      })
  }, [])

  useEffect(() => {
    if (!products) return
    const hash = window.location.hash.slice(1)
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [products])

  const preview = products || fallback

  return (
    <>
      <Nav />
      <main>
        <header className="page-hero page-hero--products" aria-label="Nour Organics products">
          <div className="page-hero__media" aria-hidden="true">
            <img src="/images/products-hero.jpg" alt="" fetchPriority="high" />
            <div className="page-hero__glow" />
          </div>
          <div className="page-hero__veil page-hero__veil--rich" />

          <div className="page-hero__content page-hero__content--products">
            <p className="hero__rule">{brand.tagline}</p>
            <h1 className="page-hero__brand">Nour Organics</h1>
            <p className="page-hero__title page-hero__title--sub">The Collection</p>
            <p className="page-hero__lede">
              Three signature blends — each crafted for purity, vitality, and the
              quiet luxury of real ingredients.
            </p>
            <div className="hero__actions">
              <a className="btn btn--gold" href="#collection">
                Browse Blends
              </a>
              <a className="btn btn--ghost" href="tel:+923272012783">
                Call to Order
              </a>
            </div>
          </div>
        </header>
        {error ? <p className="api-banner">{error}</p> : null}
        <Products products={preview} loading={!products} />
        <Contact />
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
