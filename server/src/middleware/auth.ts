import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET || 'nour-organics-dev-secret'

export type AuthPayload = { id: number; email: string; name: string }

export function signAdminToken(payload: AuthPayload) {
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  try {
    const token = header.slice(7)
    const decoded = jwt.verify(token, secret) as AuthPayload
    ;(req as Request & { admin: AuthPayload }).admin = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
