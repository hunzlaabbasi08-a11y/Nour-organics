import { Router } from 'express'
import multer from 'multer'
import { query } from '../db/pool.js'
import { requireAdmin } from '../middleware/auth.js'

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_BYTES = 5 * 1024 * 1024

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      cb(new Error('Only JPG, PNG, WebP, or GIF images are allowed'))
      return
    }
    cb(null, true)
  },
})

export const uploadsRouter = Router()

uploadsRouter.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) {
    res.status(404).json({ error: 'Image not found' })
    return
  }

  const rows = await query<{ mime_type: string; data: Buffer }[]>(
    `SELECT mime_type, data FROM uploads WHERE id = $1 LIMIT 1`,
    [id],
  )
  const file = rows[0]
  if (!file) {
    res.status(404).json({ error: 'Image not found' })
    return
  }

  res.setHeader('Content-Type', file.mime_type)
  res.setHeader('Cache-Control', 'public, max-age=86400')
  res.send(file.data)
})

uploadsRouter.post('/', requireAdmin, (req, res, next) => {
  upload.single('image')(req, res, (err: unknown) => {
    if (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      const tooLarge = typeof err === 'object' && err && 'code' in err && err.code === 'LIMIT_FILE_SIZE'
      res.status(400).json({ error: tooLarge ? 'Image must be 5MB or smaller' : message })
      return
    }
    next()
  })
}, async (req, res) => {
  const file = req.file
  if (!file?.buffer?.length) {
    res.status(400).json({ error: 'Choose an image to upload' })
    return
  }

  const filename = file.originalname.replace(/[^\w.\-]+/g, '_').slice(0, 180) || 'image'
  const rows = await query<{ id: number }[]>(
    `INSERT INTO uploads (filename, mime_type, data)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [filename, file.mimetype, file.buffer],
  )

  const id = rows[0]?.id
  if (!id) {
    res.status(500).json({ error: 'Could not save image' })
    return
  }

  res.status(201).json({
    id,
    url: `/api/uploads/${id}`,
    filename,
  })
})
