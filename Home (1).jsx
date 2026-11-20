import React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Button, Card, Field, Section } from './ui.jsx'
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

/* ---------- The Design Reaction ---------- */
const RX_CONTENT = {
  title: 'The Future Starts With One Idea',
  subtitle: 'Turning possibilities into meaningful progress.',
}

const RX_DIRECTIONS = [
  { id: 'minimal', label: 'Minimal', line: 'Less noise. More meaning.' },
  { id: 'bold', label: 'Bold', line: 'Make your message impossible to overlook.' },
  { id: 'editorial', label: 'Editorial', line: 'Every idea deserves its own visual story.' },
]

function useReveal() {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return undefined
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return [ref, shown]
}

function Reaction() {
  const [dir, setDir] = useState('minimal')
  const [finalRef, finalShown] = useReveal()

  const index = Math.max(
    0,
    RX_DIRECTIONS.findIndex((d) => d.id === dir)
  )
  const current = RX_DIRECTIONS[index]

  return (
    <Section id="reaction">
      <div className="showcase-head">
        <span className="eyebrow">The Design Reaction</span>
        <h2 className="showcase-title">YOUR IDEAS DESERVE TO BE SEEN DIFFERENTLY.</h2>
        <p className="section-intro">
          One slide, three directions. Choose one and watch the same message change how it feels.
        </p>
      </div>

      <div className="rx-tabs" role="tablist" aria-label="Design directions">
        {RX_DIRECTIONS.map((d, i) => (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={d.id === dir}
            className={d.id === dir ? 'active' : ''}
            onClick={() => setDir(d.id)}
          >
            <span className="rx-tab-num">{pad(i + 1)}</span>
            {d.label}
          </button>
        ))}
      </div>

      <div className="rx-frame" role="tabpanel" aria-label={`${current.label} direction`}>
        <div className="rx-bar">
          <span className="rx-bar-name">Same idea</span>
          <span className="rx-indicator" aria-hidden="true">
            {RX_DIRECTIONS.map((d) => (
              <i key={d.id} className={d.id === dir ? 'active' : ''} />
            ))}
          </span>
          <span className="rx-bar-count">
            Direction {index + 1} of {RX_DIRECTIONS.length} · {current.label}
          </span>
        </div>

        <div className="rx-stage">
          <div className={`rx-canvas rx-${dir}`}>
            <div className="rx-decor" key={`decor-${dir}`} aria-hidden="true">
              {dir === 'minimal' && <span className="rx-dot" />}
              {dir === 'bold' && (
                <>
                  <span className="rx-block" />
                  <span className="rx-bar-accent" />
                </>
              )}
              {dir === 'editorial' && (
                <>
                  <span className="rx-vrule" />
                  <span className="rx-folio">01</span>
                </>
              )}
            </div>
            <div className="rx-text fade-swap" key={`text-${dir}`}>
              <span className="rx-brand">PRESORA</span>
              <div className="rx-title">{RX_CONTENT.title}</div>
              <span className="rx-rule" />
              <p className="rx-sub">{RX_CONTENT.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rx-desc-wrap" aria-live="polite">
        <p className="rx-desc fade-swap" key={dir}>
          {current.line}
        </p>
      </div>

      <div className={`rx-final ${finalShown ? 'in' : ''}`} ref={finalRef}>
        <p className="rx-statement">Same idea. Different feeling. That's the power of design.</p>
        <Button to="/order">CREATE YOUR PRESENTATION</Button>
      </div>
    </Section>
  )
}

/* ---------- Visual Playground ---------- */
const PG_TYPES = [
  { id: 'serif', label: 'Serif' },
  { id: 'sans', label: 'Sans' },
  { id: 'caps', label: 'Caps' },
  { id: 'mixed', label: 'Mixed' },
]

const PG_ALIGNS = [
  { id: 'left', label: 'Left' },
  { id: 'center', label: 'Center' },
  { id: 'right', label: 'Right' },
]

const PG_WEIGHTS = [
  { id: 400, label: 'Regular' },
  { id: 500, label: 'Medium' },
  { id: 600, label: 'Semibold' },
]

const PG_SIZES = [
  { id: 's', label: 'Small' },
  { id: 'm', label: 'Medium' },
  { id: 'l', label: 'Large' },
]

const PG_LAYOUTS = [
  { id: 'centered', label: 'Centered' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'asymmetric', label: 'Asymmetric' },
  { id: 'minimal', label: 'Minimal' },
]

const PG_PALETTES = [
  { id: 'midnight', label: 'Midnight', bg: '#121110', fg: '#F5F3EF', accent: '#D9BE82', muted: '#BDBAB5' },
  { id: 'silver', label: 'Pearl', bg: '#F5F3EF', fg: '#121110', accent: '#B38B3B', muted: '#5A4632' },
  { id: 'steel', label: 'Walnut', bg: '#5A4632', fg: '#F5F3EF', accent: '#D9BE82', muted: '#BDBAB5' },
  { id: 'neon', label: 'Gold', bg: '#B38B3B', fg: '#121110', accent: '#F5F3EF', muted: '#3A2F27' },
]

const PG_BACKGROUNDS = [
  { id: 'plain', label: 'Plain' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'grid', label: 'Grid' },
  { id: 'frame', label: 'Frame' },
]

const PG_SHAPES = [
  { id: 'none', label: 'None' },
  { id: 'line', label: 'Line' },
  { id: 'ring', label: 'Ring' },
  { id: 'bars', label: 'Bars' },
]

const PG_PRESETS = [
  {
    id: 'minimal',
    label: 'Minimal',
    note: 'Less, but better.',
    cfg: { type: 'sans', align: 'left', weight: 400, size: 'm', layout: 'minimal', palette: 'silver', bg: 'plain', shape: 'line' },
  },
  {
    id: 'editorial',
    label: 'Editorial',
    note: 'A story told in type.',
    cfg: { type: 'serif', align: 'left', weight: 500, size: 'l', layout: 'editorial', palette: 'midnight', bg: 'frame', shape: 'line' },
  },
  {
    id: 'corporate',
    label: 'Corporate',
    note: 'Clarity is a design decision.',
    cfg: { type: 'mixed', align: 'left', weight: 600, size: 'm', layout: 'asymmetric', palette: 'steel', bg: 'grid', shape: 'bars' },
  },
  {
    id: 'bold',
    label: 'Bold',
    note: 'Confidence, made visible.',
    cfg: { type: 'caps', align: 'center', weight: 600, size: 'l', layout: 'centered', palette: 'neon', bg: 'gradient', shape: 'ring' },
  },
]

const PG_LABS = [
  { id: 'directions', label: 'Directions', line: 'Four starting points. Each one is a different point of view.' },
  { id: 'typography', label: 'Typography', line: 'Every detail has a purpose.' },
  { id: 'composition', label: 'Composition', line: 'One idea. Different perspectives.' },
  { id: 'color', label: 'Color', line: 'Good design makes ideas feel different.' },
  { id: 'elements', label: 'Elements', line: 'Small marks. A big difference.' },
]

const PG_DEFAULT_TITLE = 'Design is an experience'

function Choice({ label, value, options, onChange }) {
  return (
    <div className="pg-group">
      <span className="pg-label">{label}</span>
      <div className="pg-options" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            className={o.id === value ? 'active' : ''}
            aria-pressed={o.id === value}
            onClick={() => onChange(o.id)}
          >
            {o.bg && (
              <i className="pg-swatch" style={{ background: o.bg }} aria-hidden="true">
                <b style={{ background: o.accent }} />
              </i>
            )}
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function Playground() {
  const [cfg, setCfg] = useState(PG_PRESETS[1].cfg)
  const [presetId, setPresetId] = useState(PG_PRESETS[1].id)
  const [lab, setLab] = useState('directions')
  const [headline, setHeadline] = useState('')

  const preset = PG_PRESETS.find((p) => p.id === presetId)
  const pal = PG_PALETTES.find((p) => p.id === cfg.palette) || PG_PALETTES[0]
  const activeLab = PG_LABS.find((l) => l.id === lab) || PG_LABS[0]
  const title = headline.trim() || PG_DEFAULT_TITLE
  const sub = preset ? preset.note : 'Your direction. Our craft.'

  function applyPreset(p) {
    setCfg(p.cfg)
    setPresetId(p.id)
  }

  function update(key, value) {
    setCfg((c) => ({ ...c, [key]: value }))
    setPresetId(null)
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)].id
  }

  function surprise() {
    setCfg({
      type: pick(PG_TYPES),
      align: pick(PG_ALIGNS),
      weight: pick(PG_WEIGHTS),
      size: pick(PG_SIZES),
      layout: pick(PG_LAYOUTS),
      palette: pick(PG_PALETTES),
      bg: pick(PG_BACKGROUNDS),
      shape: pick(PG_SHAPES),
    })
    setPresetId(null)
  }

  function reset() {
    applyPreset(PG_PRESETS[1])
    setHeadline('')
  }

  const canvasStyle = {
    '--pg-bg': pal.bg,
    '--pg-fg': pal.fg,
    '--pg-accent': pal.accent,
    '--pg-muted': pal.muted,
    '--pg-weight': cfg.weight,
  }

  function renderPanel() {
    switch (lab) {
      case 'typography':
        return (
          <>
            <Choice label="Typeface" value={cfg.type} options={PG_TYPES} onChange={(v) => update('type', v)} />
            <Choice label="Alignment" value={cfg.align} options={PG_ALIGNS} onChange={(v) => update('align', v)} />
            <Choice label="Weight" value={cfg.weight} options={PG_WEIGHTS} onChange={(v) => update('weight', v)} />
            <Choice label="Size" value={cfg.size} options={PG_SIZES} onChange={(v) => update('size', v)} />
            <Field label="Your headline" hint="Try your own words.">
              <input
                value={headline}
                maxLength={48}
                placeholder={PG_DEFAULT_TITLE}
                onChange={(e) => setHeadline(e.target.value)}
              />
            </Field>
          </>
        )
      case 'composition':
        return (
          <Choice label="Layout" value={cfg.layout} options={PG_LAYOUTS} onChange={(v) => update('layout', v)} />
        )
      case 'color':
        return (
          <Choice label="Palette" value={cfg.palette} options={PG_PALETTES} onChange={(v) => update('palette', v)} />
        )
      case 'elements':
        return (
          <>
            <Choice label="Background" value={cfg.bg} options={PG_BACKGROUNDS} onChange={(v) => update('bg', v)} />
            <Choice label="Shape" value={cfg.shape} options={PG_SHAPES} onChange={(v) => update('shape', v)} />
          </>
        )
      default:
        return (
          <div className="pg-presets">
            {PG_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={p.id === presetId ? 'active' : ''}
                aria-pressed={p.id === presetId}
                onClick={() => applyPreset(p)}
              >
                <strong>{p.label}</strong>
                <span>{p.note}</span>
              </button>
            ))}
          </div>
        )
    }
  }

  return (
    <Section
      id="playground"
      eyebrow="Visual Playground"
      title="Design isn't just something you see. It's something you experience."
      intro="Experiment with type, composition and color. Every change happens live on the canvas."
    >
      <div className="pg">
        <div className="pg-stage-col">
          <div
            className={`pg-canvas pg-type-${cfg.type} pg-align-${cfg.align} pg-size-${cfg.size} pg-layout-${cfg.layout}`}
            style={canvasStyle}
            role="group"
            aria-label="Live design canvas"
          >
            <div className={`pg-bg pg-bg-${cfg.bg}`} key={`bg-${cfg.bg}`} aria-hidden="true" />
            {cfg.shape !== 'none' && (
              <div className={`pg-shape pg-shape-${cfg.shape}`} key={`shape-${cfg.shape}`} aria-hidden="true">
                {cfg.shape === 'bars' && (
                  <>
                    <i />
                    <i />
                    <i />
                  </>
                )}
              </div>
            )}
            <div className="pg-content fade-swap" key={`${cfg.layout}-${cfg.type}`}>
              <span className="pg-kicker">PRESORA · VISUAL PLAYGROUND</span>
              <div className="pg-title">{title}</div>
              <p className="pg-sub">{sub}</p>
            </div>
          </div>
          <div className="pg-caption">
            <span>Direction: {preset ? preset.label : 'Custom'}</span>
            <span>{pal.label} palette</span>
          </div>
        </div>

        <div className="pg-panel">
          <div className="pg-tabs" role="tablist" aria-label="Playground labs">
            {PG_LABS.map((l) => (
              <button
                key={l.id}
                type="button"
                role="tab"
                aria-selected={l.id === lab}
                className={l.id === lab ? 'active' : ''}
                onClick={() => setLab(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <p className="pg-line">{activeLab.line}</p>
          <div className="pg-controls" role="tabpanel">
            {renderPanel()}
          </div>
          <div className="pg-actions">
            <Button variant="ghost" onClick={surprise}>
              Surprise me
            </Button>
            <Button variant="ghost" onClick={reset}>
              Reset
            </Button>
          </div>
        </div>
      </div>
    </Section>
  )
}

const HEADLINE = [['WE', 'TURN', 'IDEAS'], ['INTO', 'IMPACT.']]

/* Pointer + scroll driven parallax for the 3D hero (no extra dependencies) */
function useHeroMotion(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0
    const tick = () => {
      cx += (tx - cx) * 0.08
      cy += (ty - cy) * 0.08
      el.style.setProperty('--mx', cx.toFixed(3))
      el.style.setProperty('--my', cy.toFixed(3))
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(tick) : 0
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick) }
    const move = (e) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1
      ty = (e.clientY / window.innerHeight) * 2 - 1
      kick()
    }
    const scroll = () => el.style.setProperty('--p', Math.min(1, window.scrollY / el.offsetHeight).toFixed(3))
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('scroll', scroll, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('scroll', scroll)
      cancelAnimationFrame(raf)
    }
  }, [ref])
}

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5.2" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
  </svg>
)

const IconWhatsApp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z" />
    <path d="M9.2 8.6c-.3.5-.3 1.300.2 2.300.9 1.800 2.500 3.200 4.300 3.900.9.300 1.600.1 2-.5l.2-.6-1.800-1-.9.900c-.9-.4-1.800-1.200-2.300-2.200l.8-.9-1-1.800-.6.200c-.4.1-.7.300-.9-.3Z" fill="currentColor" stroke="none" />
  </svg>
)

const CONNECT = [
  { id: 'instagram', name: 'Instagram', handle: '@i3._.x2', href: 'https://www.instagram.com/i3._.x2/', Icon: IconInstagram },
  { id: 'whatsapp', name: 'WhatsApp', handle: '+213 673 088 320', href: 'https://wa.me/213673088320', Icon: IconWhatsApp },
]

function Connect() {
  return (
    <Section
      id="connect"
      eyebrow="Social"
      title="Connect With Us"
      intro="Message us directly, follow our latest work, or send your brief in seconds."
    >
      <div className="connect-grid">
        {CONNECT.map(({ id, name, handle, href, Icon }) => (
          <a
            key={id}
            className="connect-card"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${name}: ${handle} (opens in a new tab)`}
          >
            <span className="connect-icon">
              <Icon />
            </span>
            <span className="connect-body">
              <strong>{name}</strong>
              <span>{handle}</span>
            </span>
            <span className="connect-go" aria-hidden="true">&#8599;</span>
          </a>
        ))}
      </div>
    </Section>
  )
}

function Hero() {
  const ref = useRef(null)
  useHeroMotion(ref)
  const ticker = [...SERVICES.map((s) => s.title), 'Slide Design']

  return (
    <>
      <section className="hero" ref={ref}>
        <div className="hero-glow" aria-hidden="true" />
        <div className="container hero-head">
          <span className="eyebrow">Presentation design agency</span>
          <h1 className="hero-title" aria-label="We turn ideas into impact.">
            {(() => {
              let n = 0
              return HEADLINE.map((line, li) => (
                <span className="hl" key={li} aria-hidden="true">
                  {line.map((w) => (
                    <span className={`hw ${w === 'IMPACT.' ? 'hw-gold' : ''}`} key={w}>
                      {[...w].map((ch, ci) => (
                        <span className="hc" style={{ '--i': n++ }} key={ci}>{ch}</span>
                      ))}
                    </span>
                  ))}
                </span>
              ))
            })()}
          </h1>
          <span className="hero-rule" aria-hidden="true" />
        </div>
        <div className="container hero-inner">
          <div className="hero-copy">
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
          <div className="hero-visual">
            <div className="hero-stage" aria-hidden="true">
              <div className="deck">
                <div className="deck-card dc-3">
                  <Slide slide={CATEGORIES[3].slides[0]} index={0} total={4} label="Pitch Deck" />
                </div>
                <div className="deck-card dc-2">
                  <Slide slide={CATEGORIES[0].slides[2]} index={2} total={4} label="Business" />
                </div>
                <div className="deck-card dc-1">
                  <Slide slide={PRO_SLIDE} index={0} total={1} label="Quarterly results" />
                </div>
              </div>
              <span className="orb orb-a" />
              <span className="orb orb-b" />
            </div>
            <div className="hero-panel">
              <div className="panel-label">Simple pricing</div>
              <div className="panel-price">500 DZD</div>
              <p className="panel-note">for every 5 slides, rounded up to the next group of 5.</p>
            </div>
          </div>
        </div>
      </section>
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...ticker, ...ticker, ...ticker, ...ticker].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>
    </>
  )
}

export default function Home() {
  return (
    <>
      <Hero />

      <Connect />

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

      <Reaction />

      <Playground />

      <Section eyebrow="Process" title="How it works" className="section-beige">
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

// END OF FILE Home.jsx
