import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../cart/CartContext'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Products', end: false },
  { to: '/about', label: 'Our Story', end: false },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { count, openCart } = useCart()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className={`nav${scrolled || open ? ' is-scrolled' : ''}`}>
      <Link className="nav__brand" to="/" onClick={() => setOpen(false)}>
        <img className="nav__logo" src="/images/logo-nav.png?v=10" alt="" />
        <span className="nav__wordmark">Nour</span>
      </Link>

      <button
        className="nav__toggle"
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
      </button>

      <nav className={`nav__links${open ? ' is-open' : ''}`} aria-label="Primary">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) => (isActive ? 'is-active' : undefined)}
          >
            {link.label}
          </NavLink>
        ))}
        <button
          type="button"
          className="nav__cta"
          onClick={() => {
            setOpen(false)
            openCart()
          }}
        >
          Cart{count > 0 ? ` (${count})` : ''}
        </button>
      </nav>
    </header>
  )
}
