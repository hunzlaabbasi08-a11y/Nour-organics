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

type ProductDraft = {
  id: string
  name: string
  tagline: string
  description: string
  weight: string
  price: number
  stock: number
  image: string
  benefitsText: string
  badgesText: string
  accent: string
  active: boolean
  isNew: boolean
}

const CATALOG_IMAGES = [
  '/images/product-panjeeri.png',
  '/images/product-energy.png',
  '/images/product-kids.png',
  '/images/panjeeri-product.png',
  '/images/energy-product.png',
  '/images/kids-product.png',
]

function splitList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function toDraft(product?: Product): ProductDraft {
  if (!product) {
    return {
      id: '',
      name: '',
      tagline: '',
      description: '',
      weight: '500 g',
      price: 0,
      stock: 100,
      image: '/images/product-panjeeri.png',
      benefitsText: '',
      badgesText: '',
      accent: 'gold',
      active: true,
      isNew: true,
    }
  }
  return {
    id: product.id,
    name: product.name,
    tagline: product.tagline,
    description: product.description,
    weight: product.weight,
    price: product.price,
    stock: product.stock ?? 100,
    image: product.image,
    benefitsText: (product.benefits || []).join(', '),
    badgesText: (product.badges || []).join(', '),
    accent: product.accent || 'gold',
    active: product.active !== false,
    isNew: false,
  }
}

export function AdminProductsPage() {
  const token = getAdminToken()!
  const [products, setProducts] = useState<Product[]>([])
  const [draft, setDraft] = useState<ProductDraft | null>(null)
  const [busy, setBusy] = useState(false)

  async function load() {
    setProducts(await api.adminProducts(token))
  }

  useEffect(() => {
    load().catch(() => notify('Could not load products'))
  }, [token])

  async function save(e: FormEvent) {
    e.preventDefault()
    if (!draft) return
    if (!draft.name.trim() || draft.price <= 0 || draft.description.trim().length < 2) {
      notify('Name, description, and a price above 0 are required')
      return
    }

    setBusy(true)
    try {
      const payload = {
        id: draft.id.trim() || undefined,
        name: draft.name.trim(),
        tagline: draft.tagline.trim(),
        description: draft.description.trim(),
        weight: draft.weight.trim() || '500 g',
        price: Number(draft.price),
        currency: 'PKR',
        image: draft.image.trim() || '/images/product-panjeeri.png',
        benefits: splitList(draft.benefitsText),
        badges: splitList(draft.badgesText),
        accent: draft.accent || 'gold',
        stock: Number(draft.stock) || 0,
        active: draft.active,
      }
      await api.upsertProduct(token, payload, draft.isNew ? undefined : draft.id)
      notify(draft.isNew ? 'Product added' : 'Product updated')
      setDraft(null)
      await load()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not save product')
    } finally {
      setBusy(false)
    }
  }

  async function patch(id: string, data: Partial<Product>, message: string) {
    try {
      await api.patchProduct(token, id, data)
      notify(message)
      await load()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not update product')
    }
  }

  return (
    <section>
      <div className="admin-toolbar">
        <h1>Products</h1>
        <button type="button" className="btn btn--gold" onClick={() => setDraft(toDraft())}>
          Add product
        </button>
      </div>
      <p className="admin-hint">
        Price, stock, and visibility save to the database and show on the store immediately.
      </p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price (PKR)</th>
              <th>Stock</th>
              <th>Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5}>No products yet. Add one to start the catalog.</td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>
                    <input
                      className="admin-inline-input"
                      type="number"
                      min={1}
                      step={1}
                      key={`${p.id}-price-${p.price}`}
                      defaultValue={p.price}
                      aria-label={`Price for ${p.name}`}
                      onBlur={(e) => {
                        const next = Number(e.target.value)
                        if (!next || next === p.price) return
                        void patch(p.id, { price: next }, 'Price updated')
                      }}
                    />
                  </td>
                  <td>
                    <input
                      className="admin-inline-input"
                      type="number"
                      min={0}
                      step={1}
                      key={`${p.id}-stock-${p.stock ?? 0}`}
                      defaultValue={p.stock ?? 0}
                      aria-label={`Stock for ${p.name}`}
                      onBlur={(e) => {
                        const next = Number(e.target.value)
                        if (Number.isNaN(next) || next === (p.stock ?? 0)) return
                        void patch(p.id, { stock: next }, 'Stock updated')
                      }}
                    />
                  </td>
                  <td>{p.active === false ? 'Hidden' : 'Live'}</td>
                  <td className="admin-row-actions">
                    <button type="button" className="btn btn--ghost" onClick={() => setDraft(toDraft(p))}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={() =>
                        patch(
                          p.id,
                          { active: p.active === false },
                          p.active === false ? 'Product is live' : 'Product hidden from store',
                        )
                      }
                    >
                      {p.active === false ? 'Show' : 'Hide'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {draft ? (
        <form className="admin-product-form" onSubmit={save}>
          <h2>{draft.isNew ? 'Add product' : `Edit ${draft.name}`}</h2>
          {draft.isNew ? (
            <label>
              Product id (optional)
              <input
                value={draft.id}
                placeholder="auto-from-name"
                onChange={(e) => setDraft({ ...draft, id: e.target.value })}
              />
            </label>
          ) : (
            <p className="admin-hint">ID: {draft.id}</p>
          )}
          <label>
            Name
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              required
            />
          </label>
          <div className="admin-form-grid">
            <label>
              Price (PKR)
              <input
                type="number"
                min={1}
                step={1}
                value={draft.price || ''}
                onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                required
              />
            </label>
            <label>
              Stock
              <input
                type="number"
                min={0}
                step={1}
                value={draft.stock}
                onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })}
                required
              />
            </label>
            <label>
              Weight
              <input
                value={draft.weight}
                onChange={(e) => setDraft({ ...draft, weight: e.target.value })}
              />
            </label>
            <label>
              Accent
              <select
                value={draft.accent}
                onChange={(e) => setDraft({ ...draft, accent: e.target.value })}
              >
                <option value="gold">Gold</option>
                <option value="olive">Olive</option>
                <option value="warm">Warm</option>
              </select>
            </label>
          </div>
          <label>
            Tagline
            <input
              value={draft.tagline}
              onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
            />
          </label>
          <label>
            Description
            <textarea
              rows={4}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              required
            />
          </label>
          <label>
            Image
            <select
              value={CATALOG_IMAGES.includes(draft.image) ? draft.image : '__custom'}
              onChange={(e) => {
                if (e.target.value === '__custom') return
                setDraft({ ...draft, image: e.target.value })
              }}
            >
              {CATALOG_IMAGES.map((src) => (
                <option key={src} value={src}>
                  {src.replace('/images/', '')}
                </option>
              ))}
              <option value="__custom">Custom URL</option>
            </select>
          </label>
          <label>
            Image URL
            <input
              value={draft.image}
              onChange={(e) => setDraft({ ...draft, image: e.target.value })}
              required
            />
          </label>
          {draft.image ? (
            <img className="admin-image-preview" src={draft.image} alt="" />
          ) : null}
          <label>
            Benefits (comma separated)
            <input
              value={draft.benefitsText}
              onChange={(e) => setDraft({ ...draft, benefitsText: e.target.value })}
            />
          </label>
          <label>
            Badges (comma separated)
            <input
              value={draft.badgesText}
              onChange={(e) => setDraft({ ...draft, badgesText: e.target.value })}
            />
          </label>
          <label className="admin-check">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
            />
            Visible on store
          </label>
          <div className="admin-form-actions">
            <button className="btn btn--gold" type="submit" disabled={busy}>
              {busy ? 'Saving…' : draft.isNew ? 'Add product' : 'Save changes'}
            </button>
            <button className="btn btn--ghost" type="button" onClick={() => setDraft(null)}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </section>
  )
}
