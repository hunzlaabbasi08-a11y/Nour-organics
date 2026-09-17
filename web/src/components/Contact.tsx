import { brand } from '../data/products'
import { useReveal } from '../hooks/useReveal'

export function Contact() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <section className="section contact" id="contact">
      <div ref={ref} className="contact__inner reveal">
        <p className="eyebrow">Orders & Inquiries</p>
        <h2 className="section__title">
          Ready to <em>nourish</em>?
        </h2>
        <p className="section__lede">
          Order online from the cart, message us on Instagram, or call — we&apos;ll
          take care of you personally either way.
        </p>
        <a className="contact__phone" href={brand.phoneHref}>
          {brand.phone}
        </a>
        <div className="contact__social">
          <a href={brand.instagramUrl} target="_blank" rel="noreferrer">
            Instagram {brand.instagram}
          </a>
          <span aria-hidden="true">·</span>
          <span>Facebook · {brand.facebook}</span>
        </div>
        <a className="btn btn--gold" href={brand.phoneHref} style={{ marginTop: '0.75rem' }}>
          Call to Order
        </a>
      </div>
    </section>
  )
}
