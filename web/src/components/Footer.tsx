import { Link } from 'react-router-dom'
import { brand } from '../data/products'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__brand">
        <img src="/images/logo-nav.png?v=10" alt="" />
        <span>Nour Organics</span>
      </div>

      <nav className="footer__links" aria-label="Footer">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/about">Our Story</Link>
        <a href={brand.instagramUrl} target="_blank" rel="noreferrer">
          Instagram
        </a>
      </nav>

      <p className="footer__note">
        © {year} · {brand.tagline}
      </p>
    </footer>
  )
}
