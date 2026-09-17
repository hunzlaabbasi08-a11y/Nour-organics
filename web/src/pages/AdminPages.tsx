import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { api, type Product } from '../lib/api'
import { notify } from '../components/Toast'

const TOKEN_KEY = 'nour-admin-token'

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@nourorganics.com')
  const [password, setPassword] = useState('admin123')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const res = await api.adminLogin(email, password)
      localStorage.setItem(TOKEN_KEY, res.token)
      notify(`Welcome, ${res.admin.name}`)
      navigate('/admin')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  if (getAdminToken()) return <Navigate to="/admin" replace />

  return (
    <section className="admin-login">
      <form onSubmit={onSubmit}>
        <p className="eyebrow">Nour Organics</p>
        <h1>Admin Login</h1>
        <label>
          Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button className="btn btn--gold btn--block" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <Link to="/">← Back to store</Link>
      </form>
    </section>
  )
}

export function AdminLayout() {
  const token = getAdminToken()
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [name, setName] = useState('Admin')

  useEffect(() => {
    if (!token) return
    api
      .adminMe(token)
      .then((res) => {
        setName(res.admin.name)
        setReady(true)
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        navigate('/admin/login')
      })
  }, [token, navigate])

  if (!token) return <Navigate to="/admin/login" replace />
  if (!ready) return <div className="admin-shell"><p>Loading…</p></div>

  return (
    <div className="admin-shell">
      <aside className="admin-nav">
        <p className="admin-nav__brand">Nour Admin</p>
        <p className="admin-nav__user">{name}</p>
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/orders">Orders</Link>
        <Link to="/admin/products">Products</Link>
        <Link to="/">View store</Link>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem(TOKEN_KEY)
            navigate('/admin/login')
          }}
        >
          Log out
        </button>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  )
}

export function AdminDashboard() {
  const token = getAdminToken()!
  const [stats, setStats] = useState({ orders: 0, revenue: 0, pending: 0, products: 0 })

  useEffect(() => {
    api.adminStats(token).then(setStats).catch(() => notify('Could not load stats'))
  }, [token])

  return (
    <section>
      <h1>Dashboard</h1>
      <div className="admin-stats">
        <article><h3>Orders</h3><p>{stats.orders}</p></article>
        <article><h3>Pending</h3><p>{stats.pending}</p></article>
        <article><h3>Revenue</h3><p>PKR {Number(stats.revenue).toLocaleString('en-PK')}</p></article>
        <article><h3>Products</h3><p>{stats.products}</p></article>
      </div>
    </section>
  )
}

export function AdminOrdersPage() {
  const token = getAdminToken()!
  const [orders, setOrders] = useState<Record<string, unknown>[]>([])

  async function load() {
    const rows = await api.adminOrders(token)
    setOrders(rows)
  }

  useEffect(() => {
    load().catch(() => notify('Could not load orders'))
  }, [token])

  async function updateStatus(id: number, status: string) {
    await api.updateOrderStatus(token, id, status)
    notify('Order updated')
    await load()
  }

  return (
    <section>
      <h1>Orders</h1>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={String(o.id)}>
                <td>{String(o.order_number)}</td>
                <td>{String(o.customer_name)}</td>
                <td>{String(o.customer_phone)}</td>
                <td>PKR {Number(o.total).toLocaleString('en-PK')}</td>
                <td>
                  <select
                    value={String(o.status)}
                    onChange={(e) => updateStatus(Number(o.id), e.target.value)}
                  >
                    {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{new Date(String(o.created_at)).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function AdminProductsPage() {
  const token = getAdminToken()!
  const [products, setProducts] = useState<Product[]>([])
  const [editing, setEditing] = useState<Product | null>(null)

  async function load() {
    setProducts(await api.adminProducts(token))
  }

  useEffect(() => {
    load().catch(() => notify('Could not load products'))
  }, [token])

  async function save(e: FormEvent) {
    e.preventDefault()
    if (!editing) return
    await api.upsertProduct(
      token,
      {
        name: editing.name,
        tagline: editing.tagline,
        description: editing.description,
        weight: editing.weight,
        price: Number(editing.price),
        currency: editing.currency || 'PKR',
        image: editing.image,
        benefits: editing.benefits,
        badges: editing.badges,
        accent: editing.accent,
        stock: editing.stock ?? 100,
        active: editing.active !== false,
      },
      editing.id,
    )
    notify('Product saved')
    setEditing(null)
    await load()
  }

  return (
    <section>
      <h1>Products</h1>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>PKR {p.price.toLocaleString('en-PK')}</td>
                <td>{p.stock ?? 0}</td>
                <td>{p.active === false ? 'No' : 'Yes'}</td>
                <td>
                  <button type="button" className="btn btn--ghost" onClick={() => setEditing(p)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing ? (
        <form className="admin-product-form" onSubmit={save}>
          <h2>Edit {editing.name}</h2>
          <label>
            Name
            <input
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              required
            />
          </label>
          <label>
            Price
            <input
              type="number"
              value={editing.price}
              onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
              required
            />
          </label>
          <label>
            Stock
            <input
              type="number"
              value={editing.stock ?? 0}
              onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })}
              required
            />
          </label>
          <label>
            Tagline
            <input
              value={editing.tagline}
              onChange={(e) => setEditing({ ...editing, tagline: e.target.value })}
            />
          </label>
          <label>
            Description
            <textarea
              rows={4}
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            />
          </label>
          <label className="admin-check">
            <input
              type="checkbox"
              checked={editing.active !== false}
              onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
            />
            Active
          </label>
          <div className="admin-form-actions">
            <button className="btn btn--gold" type="submit">
              Save
            </button>
            <button className="btn btn--ghost" type="button" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </section>
  )
}
