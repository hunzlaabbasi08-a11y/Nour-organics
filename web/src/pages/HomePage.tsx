import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Nav } from '../components/Nav'
import { Hero } from '../components/Hero'
import { Story } from '../components/Story'
import { FeaturedCollection } from '../components/Products'
import { BrandPromise } from '../components/BrandPromise'
import { Footer } from '../components/Footer'
import { CartDrawer } from '../components/CartDrawer'
import { useReveal } from '../hooks/useReveal'
import { api } from '../lib/api'
import { enrichProduct, products as fallback, type Product } from '../data/products'
import { brand } from '../data/products'

function HomeInvite() {
  const ref = useReveal<HTMLElement>()

  return (
    <section ref={ref} className="section home-invite reveal">
      <div className="home-invite__inner">
        <p className="eyebrow">Ready when you are</p>
        <h2 className="section__title">
          Begin your <em>nourishing</em> ritual
        </h2>
        <p className="section__lede">
          Order online, message us on Instagram, or call — every jar is crafted
          with the same care.
        </p>
        <div className="hero__actions">
          <Link className="btn btn--gold" to="/products">
            Shop Collection
          </Link>
          <a className="btn btn--ghost" href={brand.phoneHref}>
            Call {brand.phone}
          </a>
        </div>
      </div>
    </section>
  )
}

export function HomePage() {
  const [products, setProducts] = useState<Product[] | null>(null)

  useEffect(() => {
    api
      .products()
      .then((rows) => setProducts(rows.map(enrichProduct)))
      .catch(() => setProducts(fallback))
  }, [])

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Story compact />
        <FeaturedCollection products={products || fallback} />
        <BrandPromise />
        <HomeInvite />
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
