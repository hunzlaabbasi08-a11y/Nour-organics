import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

function sslConfig() {
  const url = process.env.DATABASE_URL || ''
  const local = /localhost|127\.0\.0\.1/i.test(url)
  if (!url || local || process.env.PGSSLMODE === 'disable') return undefined
  return { rejectUnauthorized: false }
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.warn('DATABASE_URL is not set. Copy server/.env.example to server/.env and paste your Neon connection string.')
}

export const pool = new Pool({
  connectionString,
  ssl: sslConfig(),
  max: Number(process.env.DB_POOL_MAX || 5),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 30_000,
  keepAlive: true,
})

export async function query<T = unknown>(sql: string, params?: unknown[]) {
  const result = await pool.query(sql, params)
  return result.rows as T
}
