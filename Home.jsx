import { useState } from 'react'
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

/* ---------- Original sample content (not client projects) ---------- */
const CATEGORIES = [
  {
    id: 'business',
    label: 'Business',
    deck: 'Annual Review',
    slides: [
      {
        layout: 'cover',
        kicker: 'ANNUAL REVIEW',
        title: 'A year of steady, focused growth',
        text: 'Company overview · Sample deck',
      },
      {
        layout: 'stats',
        title: 'Highlights',
        items: [
          { value: '4', label: 'New markets' },
          { value: '12', label: 'Product releases' },
          { value: '92%', label: 'Team engagement' },
        ],
      },
      {
        layout: 'bars',
        title: 'Growth by quarter',
        bars: [
          { label: 'Q1', value: 40 },
          { label: 'Q2', value: 58 },
          { label: 'Q3', value: 72 },
          { label: 'Q4', value: 90 },
        ],
      },
      {
        layout: 'closing',
        title: 'Next: scale what works',
        text: 'Three priorities for the year ahead',
      },
    ],
  },
  {
    id: 'education',
    label: 'Education',
    deck: 'Lecture · Module 03',
    slides: [
      {
        layout: 'cover',
        kicker: 'LECTURE · MODULE 03',
        title: 'How memory shapes learning',
        text: 'Cognitive science · Sample deck',
      },
      {
        layout: 'list',
        title: 'Learning objectives',
        items: [
          { n: '01', t: 'Explain how memory is encoded' },
          { n: '02', t: 'Compare short and long-term memory' },
          { n: '03', t: 'Apply spaced practice when studying' },
        ],
      },
      {
        layout: 'list',
        title: 'Study strategy',
        items: [
          { n: '01', t: 'Space your practice over time' },
          { n: '02', t: 'Test yourself, do not just reread' },
          { n: '03', t: 'Teach the idea back in your own words' },
        ],
      },
      {
        layout: 'closing',
        title: 'Questions and discussion',
        text: 'Next session: attention and focus',
      },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    deck: 'Campaign Proposal',
    slides: [
      {
        layout: 'cover',
        kicker: 'CAMPAIGN PROPOSAL',
        title: 'Spring launch campaign',
        text: 'Marketing strategy · Sample deck',
      },
      {
        layout: 'list',
        title: 'Audience and message',
        items: [
          { n: '01', t: 'Who we speak to' },
          { n: '02', t: 'What we promise them' },
          { n: '03', t: 'Where we show up' },
        ],
      },
      {
        layout: 'bars',
        title: 'Channel mix (sample)',
        bars: [
          { label: 'Social', value: 70 },
          { label: 'Email', value: 55 },
          { label: 'Search', value: 45 },
          { label: 'Events', value: 30 },
        ],
      },
      {
        layout: 'closing',
        title: 'One idea. Every channel.',
        text: 'Campaign timeline: 8 weeks',
      },
    ],
  },
  {
    id: 'pitch',
    label: 'Pitch Deck',
    deck: 'Seed Pitch',
    slides: [
      {
        layout: 'cover',
        kicker: 'PITCH DECK',
        title: 'A smarter way to plan group trips',
        text: 'Seed pitch · Sample deck',
      },
      {
        layout: 'list',
        title: 'The problem',
        items: [
          { n: '01', t: 'Planning is scattered across chats' },
          { n: '02', t: 'Decisions take too long' },
          { n: '03', t: 'Costs stay unclear until the end' },
        ],
      },
      {
        layout: 'stats',
        title: 'Traction (sample)',
        items: [
          { value: '1.2k', label: 'Waitlist sign-ups' },
          { value: '38%', label: 'Weekly active' },
          { value: '4.6', label: 'Average rating' },
        ],
      },
      {
        layout: 'closing',
        title: 'The ask',
        text: 'Join us in building what comes next',
      },
    ],
  },
]

const PRO_SLIDE = {
  layout: 'stats',
  title: 'Steady growth, clearer costs',
  items: [
    { value: '+18%', label: 'Revenue' },
    { value: '-9%', label: 'Costs' },
    { value: '+240', label: 'New customers' },
  ],
}

const pad = (n) => String(n).padStart(2, '0')

/* ---------- Slide rendering ---------- */
function SlideBody({ slide }) {
  switch (slide.layout) {
    case 'cover':
      return (
        <div className="slide-cover">
          <span className="slide-kicker">{slide.kicker}</span>
          <div className="slide-title slide-title-xl">{slide.title}</div>
          <span className="slide-rule" />
          <p className="slide-text">{slide.text}</p>
        </div>
      )
    case 'stats':
      return (
        <div className="slide-body">
          <div className="slide-title">{slide.title}</div>
          <div className="slide-stats">
            {slide.items.map((it) => (
              <div className="slide-stat" key={it.label}>
                <strong>{it.value}</strong>
                <span>{it.label}</span>
              </div>
            ))}
          </div>
        </div>
      )
    case 'list':
      return (
        <div className="slide-body">
          <div className="slide-title">{slide.title}</div>
          <div className="slide-list">
            {slide.items.map((it) => (
              <div className="slide-row" key={it.n}>
                <span className="slide-num">{it.n}</span>
                <span>{it.t}</span>
              </div>
            ))}
          </div>
        </div>
      )
    case 'bars':
      return (
        <div className="slide-body">
          <div className="slide-title">{slide.title}</div>
          <div className="slide-bars">
            {slide.bars.map((b) => (
              <div className="slide-bar" key={b.label}>
                <div className="slide-bar-track">
                  <div className="slide-bar-fill" style={{ height: `${b.value}%` }} />
                </div>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      )
    default:
      return (
        <div className="slide-closing">
          <div className="slide-title slide-title-xl">{slide.title}</div>
          <span className="slide-rule" />
          <p className="slide-text">{slide.text}</p>
        </div>
      )
  }
}

function Slide({ slide, index, total, label }) {
  return (
    <div className="slide">
      <div className="slide-top">
        <span>PRESORA · {label}</span>
        <span>
          {pad(index + 1)} / {pad(total)}
        </span>
      </div>
      <SlideBody slide={slide} />
    </div>
  )
}

/* ---------- Interactive viewer ---------- */
function Viewer({ category }) {
  const [index, setIndex] = useState(0)
  const total = category.slides.length

  function go(n) {
    setIndex(Math.min(Math.max(n, 0), total - 1))
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(index + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(index - 1)
    }
  }

  return (
    <div
      className="viewer"
      tabIndex={0}
      onKeyDown={onKeyDown}
      role="group"
      aria-label={`${category.label} sample presentation`}
    >
      <div className="viewer-bar">
        <span className="viewer-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="viewer-name">{category.deck}</span>
        <span className="viewer-count" aria-live="polite">
          Slide {index + 1} of {total}
        </span>
      </div>

      <div className="viewer-stage">
        <div className="fade-swap" key={index}>
          <Slide slide={category.slides[index]} index={index} total={total} label={category.label} />
        </div>
      </div>

      <div className="viewer-controls">
        <Button variant="ghost" onClick={() => go(index - 1)} disabled={index === 0}>
          Previous
        </Button>
        <div className="viewer-thumbs">
          {category.slides.map((s, i) => (
            <button
              key={i}
              type="button"
              className={i === index ? 'active' : ''}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => go(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <Button variant="ghost" onClick={() => go(index + 1)} disabled={index === total - 1}>
          Next
        </Button>
      </div>
    </div>
  )
}

/* ---------- Signature Showcase ---------- */
function Showcase() {
  const [catId, setCatId] = useState(CATEGORIES[0].id)
  const category = CATEGORIES.find((c) => c.id === catId) || CATEGORIES[0]

  return (
    <Section id="showcase">
      <div className="showcase-head">
        <span className="eyebrow">Signature Showcase</span>
        <h2 className="showcase-title">DESIGN THAT MAKES AN IMPACT.</h2>
        <p className="section-intro">
          PRESORA turns raw ideas into clear, refined presentations. Explore original sample
          designs across four categories.
        </p>
      </div>

      <div className="showcase-tabs" role="tablist" aria-label="Presentation categories">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={c.id === catId}
            className={c.id === catId ? 'active' : ''}
            onClick={() => setCatId(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <Viewer key={category.id} category={category} />

      <p className="showcase-note">
        Original sample content for illustration. These are not client projects.
      </p>
    </Section>
  )
}

/* ---------- Design quality comparison ---------- */
function Versus() {
  return (
    <Section
      eyebrow="Design quality"
      title="The difference is in the details"
      intro="The same content, presented two ways."
    >
      <div className="versus">
        <figure className="versus-card">
          <div className="slide slide-plain" aria-hidden="true">
            <div className="plain-title">Quarterly Results Summary</div>
            <ul className="plain-list">
              <li>Revenue was up compared to last quarter</li>
              <li>Costs were reduced in several departments</li>
              <li>New customers joined in all regions</li>
              <li>Customer support tickets were resolved</li>
              <li>The team will continue to work hard</li>
              <li>More details are in the attached report</li>
            </ul>
          </div>
          <figcaption>
            <strong>Ordinary design</strong>
            <ul className="list-clean">
              <li>Crowded text and no hierarchy</li>
              <li>Default fonts and flat colors</li>
              <li>The key message is easy to miss</li>
            </ul>
          </figcaption>
        </figure>

        <figure className="versus-card versus-pro">
          <div aria-hidden="true">
            <Slide slide={PRO_SLIDE} index={0} total={1} label="Quarterly results" />
          </div>
          <figcaption>
            <strong>PRESORA design</strong>
            <ul className="list-clean">
              <li>One clear message per slide</li>
              <li>Strong hierarchy and consistent system</li>
              <li>Key numbers stand out instantly</li>
            </ul>
          </figcaption>
        </figure>
      </div>
    </Section>
  )
}

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

      <Showcase />

      <Versus />

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
          <h2>YOUR NEXT PRESENTATION STARTS HERE.</h2>
          <p>Send your order in a few minutes and we will take it from there.</p>
          <Button to="/order">ORDER A PRESENTATION</Button>
        </div>
      </Section>
    </>
  )
}
