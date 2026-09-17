import 'dotenv/config'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { pool } from './pool.js'

const products = [
  {
    id: 'premium-panjeeri',
    name: 'Premium Dry Fruit Panjeeri',
    tagline: "Nature's finest in every bite",
    description:
      'A luxurious blend of handpicked nuts, seeds, and pure desi ghee — crafted for energy, strength, and everyday well-being.',
    weight: '500 g',
    price: 2500,
    currency: 'PKR',
    image: '/images/product-panjeeri.png',
    benefits: [
      'Sustained energy',
      'Heart health',
      'Brain function',
      'Bone strength',
      'Immunity support',
    ],
    badges: ['100% Organic', 'No Preservatives', 'Pure Desi Ghee'],
    accent: 'gold',
    stock: 100,
  },
  {
    id: 'energy-booster',
    name: 'Energy Booster',
    tagline: 'Traditional goodness for lasting energy',
    description:
      'A rich traditional blend of semolina, nuts, seeds, and desi ghee — made to keep you active, focused, and strong.',
    weight: '500 g',
    price: 2200,
    currency: 'PKR',
    image: '/images/product-energy.png',
    benefits: [
      'Sustained energy',
      'Supports immunity',
      'Improves brain function',
      'Heart health',
      'Keeps you active & strong',
    ],
    badges: ['No Added Sugar', 'Preservative Free', '100% Natural'],
    accent: 'olive',
    stock: 100,
  },
  {
    id: 'kids-panjeeri',
    name: 'Kids Panjeeri',
    tagline: 'Natural nutrition for stronger, smarter, happier kids',
    description:
      'A wholesome blend of premium ingredients that provide natural energy, support growth, and boost immunity — made with love for ages 3–12.',
    weight: '500 g',
    price: 1800,
    currency: 'PKR',
    image: '/images/product-kids.png',
    benefits: [
      'Natural energy for active kids',
      'Supports immunity & growth',
      'Brain development',
      'Easy to digest',
      '100% natural',
    ],
    badges: ['No Artificial Colors', 'Pure Desi Ghee', 'Made with Love'],
    accent: 'warm',
    stock: 100,
  },
]

type SeedOptions = { overwrite?: boolean }

export async function seedProducts(options: SeedOptions = {}) {
  const conflict = options.overwrite
    ? `ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        tagline = EXCLUDED.tagline,
        description = EXCLUDED.description,
        weight = EXCLUDED.weight,
        price = EXCLUDED.price,
        currency = EXCLUDED.currency,
        image = EXCLUDED.image,
        benefits = EXCLUDED.benefits,
        badges = EXCLUDED.badges,
        accent = EXCLUDED.accent`
    : `ON CONFLICT (id) DO NOTHING`

  for (const p of products) {
    await pool.query(
      `INSERT INTO products
        (id, name, tagline, description, weight, price, currency, image, benefits, badges, accent, stock, active)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11, $12, TRUE)
       ${conflict}`,
      [
        p.id,
        p.name,
        p.tagline,
        p.description,
        p.weight,
        p.price,
        p.currency,
        p.image,
        JSON.stringify(p.benefits),
        JSON.stringify(p.badges),
        p.accent,
        p.stock,
      ],
    )
  }

  console.log(`Seeded ${products.length} products`)
}

const isCli =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isCli) {
  seedProducts({ overwrite: true })
    .then(() => pool.end())
    .catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err)
      console.error('Seed failed:', message)
      process.exit(1)
    })
}
