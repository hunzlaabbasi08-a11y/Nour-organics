import { Link } from 'react-router-dom'
import { useCart } from '../cart/CartContext'

function money(n: number) {
  return `PKR ${n.toLocaleString('en-PK')}`
}

export function CartDrawer() {
  const { items, isOpen, closeCart, subtotal, setQuantity, removeItem, count } = useCart()

  return (
    <>
      <div
        className={`cart-backdrop${isOpen ? ' is-open' : ''}`}
        onClick={closeCart}
        aria-hidden={!isOpen}
      />
      <aside className={`cart-drawer${isOpen ? ' is-open' : ''}`} aria-hidden={!isOpen}>
        <header className="cart-drawer__head">
          <h2>Your Cart ({count})</h2>
          <button type="button" className="cart-drawer__close" onClick={closeCart} aria-label="Close cart">
            ×
          </button>
        </header>

        {items.length === 0 ? (
          <div className="cart-drawer__empty">
            <p>Your cart is empty.</p>
            <button type="button" className="btn btn--gold" onClick={closeCart}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <ul className="cart-drawer__list">
              {items.map((item) => (
                <li key={item.productId} className="cart-drawer__item">
                  <img src={item.image} alt="" />
                  <div>
                    <h3>{item.name}</h3>
                    <p>{money(item.price)}</p>
                    <div className="cart-drawer__qty">
                      <button type="button" onClick={() => setQuantity(item.productId, item.quantity - 1)}>
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => setQuantity(item.productId, item.quantity + 1)}>
                        +
                      </button>
                      <button
                        type="button"
                        className="cart-drawer__remove"
                        onClick={() => removeItem(item.productId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <footer className="cart-drawer__foot">
              <div className="cart-drawer__subtotal">
                <span>Subtotal</span>
                <strong>{money(subtotal)}</strong>
              </div>
              <Link className="btn btn--gold btn--block" to="/checkout" onClick={closeCart}>
                Checkout
              </Link>
            </footer>
          </>
        )}
      </aside>
    </>
  )
}
