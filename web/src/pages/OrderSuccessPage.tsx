import { Link, useLocation, useParams } from 'react-router-dom'
import { Nav } from '../components/Nav'
import { Footer } from '../components/Footer'
import { CartDrawer } from '../components/CartDrawer'

export function OrderSuccessPage() {
  const { orderNumber } = useParams()
  const location = useLocation() as { state?: { total?: number } }
  const total = location.state?.total

  return (
    <>
      <Nav />
      <section className="page">
        <div className="page__inner page__center">
          <p className="eyebrow">Thank you</p>
          <h1>Order received</h1>
          <p className="page__lede">
            Your order <strong>{orderNumber}</strong> is pending confirmation.
            {typeof total === 'number'
              ? ` Total: PKR ${total.toLocaleString('en-PK')}.`
              : ''}{' '}
            We will call you shortly.
          </p>
          <Link className="btn btn--gold" to="/">
            Back to Home
          </Link>
        </div>
      </section>
      <Footer />
      <CartDrawer />
    </>
  )
}
