import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import { pool } from './pool.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function migrate() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required. Use your Neon PostgreSQL connection string.')
  }

  const schemaPath = path.resolve(__dirname, '../../sql/schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf8')
  await pool.query(schema)

  const email = process.env.ADMIN_EMAIL || 'admin@nourorganics.com'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const name = process.env.ADMIN_NAME || 'Nour Admin'
  const hash = await bcrypt.hash(password, 10)

  await pool.query(
    `INSERT INTO admins (email, password_hash, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       name = EXCLUDED.name`,
    [email, hash, name],
  )

  console.log('Database schema ready')
  console.log(`Admin ready: ${email}`)
}
