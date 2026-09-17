import { Nav } from '../components/Nav'
import { Story } from '../components/Story'
import { Ritual } from '../components/Ritual'
import { BrandPromise } from '../components/BrandPromise'
import { Contact } from '../components/Contact'
import { Footer } from '../components/Footer'
import { CartDrawer } from '../components/CartDrawer'
import { brand } from '../data/products'
import { Link } from 'react-router-dom'

export function AboutPage() {
  return (
    <>
      <Nav />
      <main>
        <header className="page-hero page-hero--about">
          <div className="page-hero__media" aria-hidden="true">
            <img src="/images/story-hero.jpg" alt="" fetchPriority="high" />
          </div>
          <div className="page-hero__veil" />
          <div className="page-hero__content">
            <p className="eyebrow">Our Craft</p>
            <h1 className="page-hero__title">The Nour Story</h1>
            <p className="page-hero__lede">
              {brand.motto}. Traditional South Asian panjeeri, refined with
              premium ingredients and a finish worthy of the Nour name.
            </p>
            <div className="hero__actions">
              <Link className="btn btn--gold" to="/products">
                Shop Collection
              </Link>
              <a className="btn btn--ghost" href="#story">
                Read On
              </a>
            </div>
          </div>
        </header>
        <Story />
        <Ritual />
        <BrandPromise />
        <Contact />
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
