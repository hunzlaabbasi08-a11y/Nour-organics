import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { query } from '../db/pool.js'
import { requireAdmin, signAdminToken } from '../middleware/auth.js'

export const adminRouter = Router()

adminRouter.post('/login', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(4),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid credentials format' })
    return
  }

  const rows = await query<
    { id: number; email: string; name: string; password_hash: string }[]
  >(`SELECT id, email, name, password_hash FROM admins WHERE email = $1 LIMIT 1`, [
    parsed.data.email,
  ])

  const admin = rows[0]
  if (!admin || !(await bcrypt.compare(parsed.data.password, admin.password_hash))) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  const token = signAdminToken({ id: admin.id, email: admin.email, name: admin.name })
  res.json({
    token,
    admin: { id: admin.id, email: admin.email, name: admin.name },
  })
})

adminRouter.get('/me', requireAdmin, async (req, res) => {
  const admin = (req as typeof req & { admin: { id: number; email: string; name: string } }).admin
  res.json({ admin })
})

adminRouter.get('/stats', requireAdmin, async (_req, res) => {
  const [orders] = await query<{ count: number; revenue: number | null }[]>(
    `SELECT COUNT(*)::int AS count, COALESCE(SUM(total), 0)::float AS revenue
     FROM orders WHERE status != 'cancelled'`,
  )
  const [pending] = await query<{ count: number }[]>(
    `SELECT COUNT(*)::int AS count FROM orders WHERE status = 'pending'`,
  )
  const [products] = await query<{ count: number }[]>(
    `SELECT COUNT(*)::int AS count FROM products WHERE active = TRUE`,
  )

  res.json({
    orders: Number(orders?.count || 0),
    revenue: Number(orders?.revenue || 0),
    pending: Number(pending?.count || 0),
    products: Number(products?.count || 0),
  })
})
