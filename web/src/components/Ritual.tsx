import { useReveal } from '../hooks/useReveal'

const steps = [
  {
    num: '01',
    title: 'Scoop',
    body: 'Two to three tablespoons daily — morning or evening — with a clean, dry spoon.',
  },
  {
    num: '02',
    title: 'Savour',
    body: 'Enjoy on its own, stirred into warm milk, or as a nourishing bite between meals.',
  },
  {
    num: '03',
    title: 'Store',
    body: 'Keep sealed in a cool, dry place. Freshness is part of the ritual.',
  },
]

export function Ritual() {
  const headRef = useReveal<HTMLDivElement>()
  const gridRef = useReveal<HTMLUListElement>()

  return (
    <section className="section ritual" id="ritual">
      <div ref={headRef} className="section__head reveal">
        <p className="eyebrow">Daily Ritual</p>
        <h2 className="section__title">
          How to <em>enjoy</em>
        </h2>
        <p className="section__lede">
          Simple enough for every day. Rich enough to feel like a ceremony.
        </p>
      </div>

      <ul ref={gridRef} className="ritual__grid reveal reveal-delay-1">
        {steps.map((step) => (
          <li key={step.num} className="ritual__item">
            <p className="ritual__num">{step.num}</p>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
