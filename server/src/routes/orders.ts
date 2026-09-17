import { Router } from 'express'
import { z } from 'zod'
import { pool, query } from '../db/pool.js'
import { makeOrderNumber, mapProduct, type ProductRow } from '../utils.js'
import { requireAdmin } from '../middleware/auth.js'

export const ordersRouter = Router()

const orderSchema = z.object({
  customerName: z.string().min(2).max(160),
  customerPhone: z.string().min(7).max(40),
  customerEmail: z.string().email().optional().or(z.literal('')),
  customerAddress: z.string().min(5),
  city: z.string().max(100).default(''),
  notes: z.string().max(1000).optional().or(z.literal('')),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive().max(50),
      }),
    )
    .min(1),
})

ordersRouter.post('/', async (req, res) => {
  const parsed = orderSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const data = parsed.data
  const ids = data.items.map((i) => i.productId)
  const productRows = await query<ProductRow[]>(
    `SELECT * FROM products WHERE active = TRUE AND id = ANY($1::text[])`,
    [ids],
  )
  const products = productRows.map(mapProduct)
  const byId = new Map(products.map((p) => [p.id, p]))

  const lines: {
    productId: string
    productName: string
    unitPrice: number
    quantity: number
    lineTotal: number
  }[] = []

  for (const item of data.items) {
    const product = byId.get(item.productId)
    if (!product) {
      res.status(400).json({ error: `Unknown product: ${item.productId}` })
      return
    }
    if (product.stock < item.quantity) {
      res.status(400).json({ error: `Insufficient stock for ${product.name}` })
      return
    }
    lines.push({
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      quantity: item.quantity,
      lineTotal: product.price * item.quantity,
    })
  }

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0)
  const total = subtotal
  const orderNumber = makeOrderNumber()

  const conn = await pool.connect()
  try {
    await conn.query('BEGIN')

    const orderResult = await conn.query<{ id: number }>(
      `INSERT INTO orders
        (order_number, customer_name, customer_phone, customer_email, customer_address, city, notes, status, subtotal, total)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9)
       RETURNING id`,
      [
        orderNumber,
        data.customerName,
        data.customerPhone,
        data.customerEmail || null,
        data.customerAddress,
        data.city || '',
        data.notes || null,
        subtotal,
        total,
      ],
    )

    const orderId = orderResult.rows[0].id

    for (const line of lines) {
      await conn.query(
        `INSERT INTO order_items
          (order_id, product_id, product_name, unit_price, quantity, line_total)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, line.productId, line.productName, line.unitPrice, line.quantity, line.lineTotal],
      )
      await conn.query(`UPDATE products SET stock = stock - $1 WHERE id = $2`, [
        line.quantity,
        line.productId,
      ])
    }

    await conn.query('COMMIT')
    res.status(201).json({
      id: orderId,
      orderNumber,
      total,
      status: 'pending',
    })
  } catch (err) {
    await conn.query('ROLLBACK')
    throw err
  } finally {
    conn.release()
  }
})

ordersRouter.get('/', requireAdmin, async (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status : null
  const rows = status
    ? await query(`SELECT * FROM orders WHERE status = $1::order_status ORDER BY created_at DESC`, [
        status,
      ])
    : await query(`SELECT * FROM orders ORDER BY created_at DESC`)

  res.json(rows)
})

ordersRouter.get('/:id', requireAdmin, async (req, res) => {
  const orders = await query<Record<string, unknown>[]>(
    `SELECT * FROM orders WHERE id = $1 LIMIT 1`,
    [req.params.id],
  )
  if (!orders[0]) {
    res.status(404).json({ error: 'Order not found' })
    return
  }
  const items = await query(`SELECT * FROM order_items WHERE order_id = $1`, [req.params.id])
  res.json({ ...orders[0], items })
})

ordersRouter.patch('/:id/status', requireAdmin, async (req, res) => {
  const statusSchema = z.object({
    status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
  })
  const parsed = statusSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid status' })
    return
  }

  await query(`UPDATE orders SET status = $1::order_status WHERE id = $2`, [
    parsed.data.status,
    req.params.id,
  ])
  res.json({ ok: true })
})
