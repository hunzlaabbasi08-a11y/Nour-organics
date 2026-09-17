import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../cart/CartContext'
import { api } from '../lib/api'
import { notify } from '../components/Toast'
import { Nav } from '../components/Nav'
import { CartDrawer } from '../components/CartDrawer'
import { Footer } from '../components/Footer'

function money(n: number) {
  return `PKR ${n.toLocaleString('en-PK')}`
}

export function CheckoutPage() {
  const { items, subtotal, clear } = useCart()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    city: '',
    notes: '',
  })

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const order = await api.createOrder({
        ...form,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      })
      clear()
      notify(`Order ${order.orderNumber} placed`)
      navigate(`/order-success/${order.orderNumber}`, { state: { total: order.total } })
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not place order')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Nav />
      <section className="page checkout">
        <div className="page__inner checkout__grid">
          {items.length === 0 ? (
            <div>
              <h1>Checkout</h1>
              <p className="page__lede">Your cart is empty.</p>
              <Link className="btn btn--gold" to="/#collection">
                Browse Collection
              </Link>
            </div>
          ) : (
            <>
              <form className="checkout__form" onSubmit={onSubmit}>
                <h1>Checkout</h1>
                <p className="page__lede">Cash on delivery · We will confirm by phone</p>

                <label>
                  Full name
                  <input
                    required
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  />
                </label>
                <label>
                  Phone
                  <input
                    required
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                  />
                </label>
                <label>
                  Email (optional)
                  <input
                    type="email"
                    value={form.customerEmail}
                    onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                  />
                </label>
                <label>
                  City
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </label>
                <label>
                  Delivery address
                  <textarea
                    required
                    rows={3}
                    value={form.customerAddress}
                    onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
                  />
                </label>
                <label>
                  Notes (optional)
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </label>

                <button className="btn btn--gold btn--block" type="submit" disabled={busy}>
                  {busy ? 'Placing order…' : `Place Order · ${money(subtotal)}`}
                </button>
              </form>

              <aside className="checkout__summary">
                <h2>Order summary</h2>
                <ul>
                  {items.map((item) => (
                    <li key={item.productId}>
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <strong>{money(item.price * item.quantity)}</strong>
                    </li>
                  ))}
                </ul>
                <div className="checkout__total">
                  <span>Total</span>
                  <strong>{money(subtotal)}</strong>
                </div>
              </aside>
            </>
          )}
        </div>
      </section>
      <Footer />
      <CartDrawer />
    </>
  )
}
