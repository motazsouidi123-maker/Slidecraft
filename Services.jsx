import { useState } from 'react'
import { Button, Card, Field, Section } from './ui.jsx'
import { calcPrice, formatDZD } from './pricing.js'

export const SERVICES = [
  {
    id: 'business',
    title: 'Business Presentations',
    text: 'Company profiles, reports and internal decks that look consistent and professional.',
    points: ['Clear structure and hierarchy', 'Consistent layout and typography', 'Charts and tables formatted cleanly'],
  },
  {
    id: 'academic',
    title: 'Academic Presentations',
    text: 'Lectures, research and graduation defense slides that are easy to follow.',
    points: ['Readable, uncluttered slides', 'Clean presentation of figures and sources', 'Suitable for defense and class use'],
  },
  {
    id: 'pitch',
    title: 'Pitch Decks & Proposals',
    text: 'Decks that explain your idea clearly to clients, partners or investors.',
    points: ['Focused storytelling flow', 'Professional visual identity', 'Ready to present or send'],
  },
  {
    id: 'redesign',
    title: 'Slide Redesign',
    text: 'Already have slides? We rework them into a cleaner and more polished presentation.',
    points: ['Your content stays yours', 'Improved layout and spacing', 'Unified style across all slides'],
  },
]

const PRESETS = [5, 10, 15, 20, 25]

export default function Services() {
  const [slides, setSlides] = useState(10)
  const price = calcPrice(slides)
  const blocks = Math.ceil(Number(slides) / 5) || 0

  return (
    <>
      <Section
        eyebrow="Services"
        title="Presentation design services"
        intro="Choose the type of presentation you need. Pricing is the same for every service."
      >
        <div className="grid grid-2">
          {SERVICES.map((s) => (
            <Card key={s.id}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <ul className="list-clean">
                {s.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Pricing"
        title="500 DZD for every 5 slides"
        intro="The number of slides is rounded up to the next group of 5."
      >
        <div className="grid grid-2">
          <Card>
            <table className="price-table">
              <thead>
                <tr>
                  <th>Slides</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {PRESETS.map((n) => (
                  <tr key={n}>
                    <td>{n} slides</td>
                    <td>{formatDZD(calcPrice(n))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card>
            <h3>Price calculator</h3>
            <p style={{ marginBottom: 18 }}>Enter the number of slides to see your price.</p>
            <Field label="Number of slides">
              <input
                type="number"
                inputMode="numeric"
                min="1"
                value={slides}
                onChange={(e) => setSlides(e.target.value)}
              />
            </Field>
            <div className="calc-result">
              <span>
                {blocks > 0 ? `${blocks} group${blocks > 1 ? 's' : ''} of 5 slides` : 'Enter slides'}
              </span>
              <strong>{formatDZD(price)}</strong>
            </div>
            <div style={{ marginTop: 22 }}>
              <Button to={`/order?slides=${price ? slides : ''}`}>Order this presentation</Button>
            </div>
          </Card>
        </div>
      </Section>
    </>
  )
}
