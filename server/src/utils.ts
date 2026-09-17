function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback
  if (typeof value === 'object') return value as T
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T
    } catch {
      return fallback
    }
  }
  return fallback
}

export type ProductRow = {
  id: string
  name: string
  tagline: string
  description: string
  weight: string
  price: number | string
  currency: string
  image: string
  benefits: unknown
  badges: unknown
  accent: string
  stock: number
  active: boolean | number
}

export function mapProduct(row: ProductRow) {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    weight: row.weight,
    price: Number(row.price),
    currency: row.currency,
    image: row.image,
    benefits: parseJsonField<string[]>(row.benefits, []),
    badges: parseJsonField<string[]>(row.badges, []),
    accent: row.accent,
    stock: row.stock,
    active: Boolean(row.active),
  }
}

export function makeOrderNumber() {
  const now = new Date()
  const stamp = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `NO-${stamp}-${rand}`
}
