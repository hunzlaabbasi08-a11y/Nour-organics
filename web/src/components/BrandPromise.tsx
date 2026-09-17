import { useReveal } from '../hooks/useReveal'

const promises = [
  {
    title: '100% Natural',
    body: 'Whole ingredients you can recognise — nothing synthetic, nothing hidden.',
  },
  {
    title: 'Pure Desi Ghee',
    body: 'Traditional clarified butter for richness, digestibility, and deep flavour.',
  },
  {
    title: 'No Preservatives',
    body: 'Crafted to be enjoyed fresh, with care in every sealed jar.',
  },
  {
    title: 'Premium Quality',
    body: 'A luxury standard for everyday nourishment — for you and your family.',
  },
]

export function BrandPromise() {
  const headRef = useReveal<HTMLDivElement>()
  const rowRef = useReveal<HTMLUListElement>()

  return (
    <section className="section promise" id="promise">
      <div ref={headRef} className="section__head reveal">
        <p className="eyebrow">The Nour Promise</p>
        <h2 className="section__title">
          Purity you can <em>taste</em>
        </h2>
      </div>

      <ul ref={rowRef} className="promise__row reveal reveal-delay-1">
        {promises.map((item) => (
          <li key={item.title} className="promise__item">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
