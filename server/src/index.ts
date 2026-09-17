import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import { productsRouter } from './routes/products.js'
import { ordersRouter } from './routes/orders.js'
import { adminRouter } from './routes/admin.js'
import { migrate } from './db/migrate.js'
import { seedProducts } from './db/seed.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const port = Number(process.env.PORT || 3001)
const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required in production')
  }
  if (!process.env.JWT_SECRET || /change-me|dev-secret/i.test(process.env.JWT_SECRET)) {
    throw new Error('Set a strong JWT_SECRET in production')
  }
}

app.set('trust proxy', 1)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
  }),
)
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'nour-organics-api' })
})

app.use('/api/products', productsRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/admin', adminRouter)
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

const webDist = path.resolve(__dirname, '../../web/dist')
const webIndex = path.join(webDist, 'index.html')
if (fs.existsSync(webIndex)) {
  app.use(express.static(webDist))
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next()
      return
    }
    if (req.path.startsWith('/api')) {
      next()
      return
    }
    res.sendFile(webIndex, (err) => {
      if (err) next(err)
    })
  })
}

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

async function start() {
  await migrate()
  await seedProducts()
  app.listen(port, '0.0.0.0', () => {
    console.log(`Nour Organics listening on port ${port}`)
  })
}

start().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err)
  console.error('Failed to start:', message)
  process.exit(1)
})
