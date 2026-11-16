import { Button, Card, Section } from './ui.jsx'
import { SERVICES } from './Services.jsx'

const STEPS = [
  {
    n: '01',
    title: 'Send your brief',
    text: 'Tell us your topic, number of slides, language and deadline, and attach any files you have.',
  },
  {
    n: '02',
    title: 'We design',
    text: 'We turn your content into a clean, professional presentation that fits your audience.',
  },
  {
    n: '03',
    title: 'Receive on WhatsApp',
    text: 'The finished presentation is delivered to you directly through WhatsApp.',
  },
]

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <span className="eyebrow">Presentation design agency</span>
            <h1 className="hero-title">WE TURN IDEAS INTO IMPACT.</h1>
            <p className="hero-text">
              PRESORA designs clear, elegant and professional presentations for students,
              universities and businesses.
            </p>
            <div className="hero-actions">
              <Button to="/order">Order a presentation</Button>
              <Button to="/services" variant="ghost">
                View services
              </Button>
            </div>
          </div>
          <div className="hero-panel">
            <div className="panel-label">Simple pricing</div>
            <div className="panel-price">500 DZD</div>
            <p className="panel-note">for every 5 slides, rounded up to the next group of 5.</p>
          </div>
        </div>
      </section>

      <Section
        eyebrow="Services"
        title="What we design"
        intro="Every presentation is built around your content and your audience."
      >
        <div className="grid grid-2">
          {SERVICES.map((s) => (
            <Card key={s.id}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </Card>
          ))}
        </div>
        <div style={{ marginTop: 28 }}>
          <Button to="/services" variant="ghost">
            See details and prices
          </Button>
        </div>
      </Section>

      <Section eyebrow="Process" title="How it works">
        <div className="grid grid-3">
          {STEPS.map((s) => (
            <Card key={s.n}>
              <div className="step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <div className="cta-band">
          <h2>Ready to start?</h2>
          <p>Send your order in a few minutes and we will take it from there.</p>
          <Button to="/order">Order now</Button>
        </div>
      </Section>
    </>
  )
}
