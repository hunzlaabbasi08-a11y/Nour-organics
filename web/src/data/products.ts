export type Product = {
  id: string
  name: string
  tagline: string
  description: string
  weight: string
  price: number
  currency: string
  image: string
  benefits: string[]
  badges: string[]
  accent: 'gold' | 'olive' | 'warm'
  gallery: {
    product: string
    benefits: string
    ingredients: string
  }
  ingredientsList: string[]
  howTo?: string
}

export const products: Product[] = [
  {
    id: 'premium-panjeeri',
    name: 'Premium Dry Fruit Panjeeri',
    tagline: "Nature's finest in every bite",
    description:
      'A luxurious blend of handpicked nuts, seeds, and pure desi ghee — crafted for energy, strength, and everyday well-being. An indulgent blend of premium nuts and traditional goodness.',
    weight: '500 g',
    price: 2500,
    currency: 'PKR',
    image: '/images/panjeeri-product.png',
    benefits: [
      'Provides sustained energy',
      'Supports heart health',
      'Boosts immunity',
      'Improves brain function',
      'Strengthens bones & muscles',
      'Rich in natural nutrients',
    ],
    badges: ['100% Organic', 'No Preservatives', 'Pure Desi Ghee'],
    accent: 'gold',
    gallery: {
      product: '/images/panjeeri-product.png',
      benefits: '/images/panjeeri-benefits.png',
      ingredients: '/images/panjeeri-ingredients.png',
    },
    ingredientsList: [
      'Badam (Almonds)',
      'Akhrot (Walnuts)',
      'Kaju (Cashews)',
      'Pista (Pistachios)',
      'Chilgoza (Pine Nuts)',
      'Makhana (Fox Nuts)',
      'Coconut (Dry Coconut)',
      'Char Magaz (Melon Seeds)',
      'Khaskhas (Poppy Seeds)',
      'Desi Ghee',
    ],
  },
  {
    id: 'energy-booster',
    name: 'Energy Booster',
    tagline: 'Traditional goodness for lasting energy',
    description:
      'A rich traditional blend of semolina, nuts, seeds, and desi ghee — crafted to give you lasting energy, strength and vitality the natural way.',
    weight: '500 g',
    price: 2200,
    currency: 'PKR',
    image: '/images/energy-product.png',
    benefits: [
      'Provides sustained energy',
      'Supports immunity',
      'Improves brain function',
      'Good for heart health',
      'Keeps you active & strong',
    ],
    badges: ['No Added Sugar', 'Preservative Free', '100% Natural'],
    accent: 'olive',
    gallery: {
      product: '/images/energy-product.png',
      benefits: '/images/energy-benefits.png',
      ingredients: '/images/energy-ingredients.png',
    },
    ingredientsList: [
      'Sooji (Semolina)',
      'Desi Ghee',
      'Badam (Almonds)',
      'Akhrot (Walnuts)',
      'Kaju (Cashews)',
      'Pista (Pistachios)',
      'Coconut',
      'Kishmish (Raisins)',
      'Khaskhas (Poppy Seeds)',
      'Char Magaz',
      'Pumpkin Seeds',
      'Melon Seeds',
    ],
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
    image: '/images/kids-product.png',
    benefits: [
      'Natural energy for active kids',
      'Supports immunity & overall growth',
      'Improves brain development',
      'Easy to digest & 100% natural',
    ],
    badges: ['No Artificial Colors', 'Pure Desi Ghee', 'Ages 3–12'],
    accent: 'warm',
    gallery: {
      product: '/images/kids-product.png',
      benefits: '/images/kids-benefits.png',
      ingredients: '/images/kids-ingredients.png',
    },
    ingredientsList: [
      'Sooji (Semolina)',
      'Badam (Almonds)',
      'Pista (Pistachios)',
      'Nariyal (Coconut)',
      'Makhana (Fox Nuts)',
      'Kaju (Cashews)',
      'Desi Ghee',
    ],
    howTo:
      '2–3 tbsp daily with warm milk, or as recommended by a healthcare professional.',
  },
]

export const brand = {
  name: 'Nour Organics',
  tagline: 'Pure • Natural • Nourishing',
  phone: '0327 2012783',
  phoneHref: 'tel:+923272012783',
  instagram: '@nour.organics',
  instagramUrl: 'https://instagram.com/nour.organics',
  facebook: 'Nour Organics',
  motto: 'Good Food, Better Tomorrow',
}

/** Merge API product pricing/stock with local gallery & ingredient content. */
export function enrichProduct(
  apiProduct: {
    id: string
    name: string
    tagline: string
    description: string
    weight: string
    price: number
    currency: string
    image: string
    benefits: string[]
    badges: string[]
    accent: string
  },
): Product {
  const local = products.find((p) => p.id === apiProduct.id)
  if (!local) {
    return {
      ...apiProduct,
      accent: (apiProduct.accent as Product['accent']) || 'gold',
      gallery: {
        product: apiProduct.image,
        benefits: apiProduct.image,
        ingredients: apiProduct.image,
      },
      ingredientsList: [],
    }
  }
  return {
    ...local,
    name: apiProduct.name || local.name,
    tagline: apiProduct.tagline || local.tagline,
    description: local.description || apiProduct.description,
    weight: apiProduct.weight || local.weight,
    price: apiProduct.price ?? local.price,
    currency: apiProduct.currency || local.currency,
    benefits: local.benefits,
    badges: local.badges,
  }
}
