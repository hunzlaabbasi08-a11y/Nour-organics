import { Router } from 'express'
import { z } from 'zod'
import { pool, query } from '../db/pool.js'
import { mapProduct, type ProductRow } from '../utils.js'
import { requireAdmin } from '../middleware/auth.js'

export const productsRouter = Router()

productsRouter.get('/', async (_req, res) => {
  const rows = await query<ProductRow[]>(
    `SELECT * FROM products
     WHERE active = TRUE
     ORDER BY
       CASE id
         WHEN 'premium-panjeeri' THEN 1
         WHEN 'energy-booster' THEN 2
         WHEN 'kids-panjeeri' THEN 3
         ELSE 4
       END,
       name`,
  )
  res.json(rows.map(mapProduct))
})

productsRouter.get('/all', requireAdmin, async (_req, res) => {
  const rows = await query<ProductRow[]>(`SELECT * FROM products ORDER BY name`)
  res.json(rows.map(mapProduct))
})

productsRouter.get('/:id', async (req, res) => {
  const rows = await query<ProductRow[]>(`SELECT * FROM products WHERE id = $1 LIMIT 1`, [
    req.params.id,
  ])
  if (!rows[0]) {
    res.status(404).json({ error: 'Product not found' })
    return
  }
  res.json(mapProduct(rows[0]))
})

const productSchema = z.object({
  id: z.string().min(2).max(64).optional(),
  name: z.string().min(2).max(180),
  tagline: z.string().max(255).default(''),
  description: z.string().min(2),
  weight: z.string().max(40).default('500 g'),
  price: z.coerce.number().positive(),
  currency: z.string().max(8).default('PKR'),
  image: z.string().min(1).default('/images/product-panjeeri.png'),
  benefits: z.array(z.string()).default([]),
  badges: z.array(z.string()).default([]),
  accent: z.string().max(32).default('gold'),
  stock: z.coerce.number().int().nonnegative().default(100),
  active: z.boolean().default(true),
})

function isUniqueViolation(err: unknown) {
  return Boolean(err && typeof err === 'object' && 'code' in err && err.code === '23505')
}

productsRouter.post('/', requireAdmin, async (req, res) => {
  const parsed = productSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const data = parsed.data
  const id =
    data.id ||
    data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') ||
    `product-${Date.now()}`

  try {
    await query(
      `INSERT INTO products
        (id, name, tagline, description, weight, price, currency, image, benefits, badges, accent, stock, active)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11, $12, $13)`,
      [
        id,
        data.name,
        data.tagline,
        data.description,
        data.weight,
        data.price,
        data.currency,
        data.image,
        JSON.stringify(data.benefits),
        JSON.stringify(data.badges),
        data.accent,
        data.stock,
        data.active,
      ],
    )
  } catch (err) {
    if (isUniqueViolation(err)) {
      res.status(409).json({ error: 'A product with this id already exists' })
      return
    }
    throw err
  }

  const rows = await query<ProductRow[]>(`SELECT * FROM products WHERE id = $1 LIMIT 1`, [id])
  res.status(201).json(mapProduct(rows[0]))
})

productsRouter.put('/:id', requireAdmin, async (req, res) => {
  const parsed = productSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }
  const data = parsed.data

  const result = await pool.query(
    `UPDATE products SET
      name = $1,
      tagline = $2,
      description = $3,
      weight = $4,
      price = $5,
      currency = $6,
      image = $7,
      benefits = $8::jsonb,
      badges = $9::jsonb,
      accent = $10,
      stock = $11,
      active = $12
     WHERE id = $13`,
    [
      data.name,
      data.tagline,
      data.description,
      data.weight,
      data.price,
      data.currency,
      data.image,
      JSON.stringify(data.benefits),
      JSON.stringify(data.badges),
      data.accent,
      data.stock,
      data.active,
      req.params.id,
    ],
  )

  if (!result.rowCount) {
    res.status(404).json({ error: 'Product not found' })
    return
  }

  const rows = await query<ProductRow[]>(`SELECT * FROM products WHERE id = $1 LIMIT 1`, [
    req.params.id,
  ])
  res.json(mapProduct(rows[0]))
})

productsRouter.patch('/:id', requireAdmin, async (req, res) => {
  const parsed = productSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const data = parsed.data
  const sets: string[] = []
  const values: unknown[] = []
  const allowed = [
    'name',
    'tagline',
    'description',
    'weight',
    'price',
    'currency',
    'image',
    'benefits',
    'badges',
    'accent',
    'stock',
    'active',
  ] as const

  for (const key of allowed) {
    if (data[key] === undefined) continue
    const json = key === 'benefits' || key === 'badges'
    values.push(json ? JSON.stringify(data[key]) : data[key])
    sets.push(json ? `${key} = $${values.length}::jsonb` : `${key} = $${values.length}`)
  }

  if (!sets.length) {
    res.status(400).json({ error: 'No fields to update' })
    return
  }

  values.push(req.params.id)
  const result = await pool.query(
    `UPDATE products SET ${sets.join(', ')} WHERE id = $${values.length}`,
    values,
  )
  if (!result.rowCount) {
    res.status(404).json({ error: 'Product not found' })
    return
  }

  const rows = await query<ProductRow[]>(`SELECT * FROM products WHERE id = $1 LIMIT 1`, [
    req.params.id,
  ])
  res.json(mapProduct(rows[0]))
})

productsRouter.delete('/:id', requireAdmin, async (req, res) => {
  const result = await pool.query(`UPDATE products SET active = FALSE WHERE id = $1`, [
    req.params.id,
  ])
  if (!result.rowCount) {
    res.status(404).json({ error: 'Product not found' })
    return
  }
  res.json({ ok: true })
})
