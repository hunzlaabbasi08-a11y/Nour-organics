import 'dotenv/config'
import { migrate } from './migrate.js'
import { pool } from './pool.js'

migrate()
  .then(() => pool.end())
  .catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err)
    console.error('DB init failed:', message)
    console.error('Set DATABASE_URL in server/.env to your Neon connection string, then run: npm run db:init')
    process.exit(1)
  })
