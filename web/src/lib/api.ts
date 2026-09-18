export type Product = {
  id: string
  name: string
  tagline: string
  description: string
  weight: string
  price: number
  currency: string
  image: string
  benefits: string[]
  badges: string[]
  accent: string
  stock?: number
  active?: boolean
}

export type CartItem = {
  productId: string
  name: string
  price: number
  image: string
  quantity: number
}

export type OrderPayload = {
  customerName: string
  customerPhone: string
  customerEmail?: string
  customerAddress: string
  city?: string
  notes?: string
  items: { productId: string; quantity: number }[]
}

const API = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = (data as { error?: unknown; message?: unknown }).error
    const message =
      typeof err === 'string'
        ? err
        : typeof (data as { message?: unknown }).message === 'string'
          ? ((data as { message: string }).message)
          : 'Request failed'
    throw new Error(message)
  }
  return data as T
}

export const api = {
  products: () => request<Product[]>('/products'),
  createOrder: (payload: OrderPayload) =>
    request<{ id: number; orderNumber: string; total: number }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  adminLogin: (email: string, password: string) =>
    request<{ token: string; admin: { id: number; email: string; name: string } }>(
      '/admin/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
    ),
  adminMe: (token: string) =>
    request<{ admin: { id: number; email: string; name: string } }>('/admin/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  adminStats: (token: string) =>
    request<{ orders: number; revenue: number; pending: number; products: number }>(
      '/admin/stats',
      { headers: { Authorization: `Bearer ${token}` } },
    ),
  adminOrders: (token: string) =>
    request<Record<string, unknown>[]>('/orders', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  adminOrder: (token: string, id: number | string) =>
    request<Record<string, unknown>>(`/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  updateOrderStatus: (token: string, id: number | string, status: string) =>
    request(`/orders/${id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    }),
  adminProducts: (token: string) =>
    request<Product[]>('/products/all', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  upsertProduct: (token: string, product: Partial<Product> & { name: string }, id?: string) =>
    request<Product>(id ? `/products/${id}` : '/products', {
      method: id ? 'PUT' : 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(product),
    }),
  patchProduct: (token: string, id: string, patch: Partial<Product>) =>
    request<Product>(`/products/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(patch),
    }),
  deactivateProduct: (token: string, id: string) =>
    request(`/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),
  uploadImage: async (token: string, file: File) => {
    const body = new FormData()
    body.append('image', file)
    const res = await fetch(`${API}/uploads`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const err = (data as { error?: unknown }).error
      throw new Error(typeof err === 'string' ? err : 'Upload failed')
    }
    return data as { id: number; url: string; filename: string }
  },
}

export const brand = {
  name: 'Nour Organics',
  tagline: 'Pure • Natural • Nourishing',
  phone: '0327 2012783',
  phoneHref: 'tel:+923272012783',
  instagram: '@nour.organics',
  instagramUrl: 'https://instagram.com/nour.organics',
  facebook: 'Nour Organics',
  motto: 'Good Food, Better Tomorrow',
}
