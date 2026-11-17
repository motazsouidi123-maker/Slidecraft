import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

/* ------------------------------------------------------------------
   PORTFOLIO DATA
   أضف هنا أعمالًا حقيقية فقط (بإذن أصحابها). القوائم فارغة عمدًا.
   TRANSFORMATIONS: { id, title, before, after, beforeAlt, afterAlt }
   GALLERY_ITEMS:   { id, title, category, image, alt, description }
   "before" و"after" و"image" هي روابط صور حقيقية.
------------------------------------------------------------------- */
export const TRANSFORMATIONS = []
export const GALLERY_ITEMS = []

/* ---------- Basic components ---------- */
export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="PRESORA home">
      <span className="logo-mark">P</span>
      <span className="logo-text">PRESORA</span>
    </Link>
  )
}

export function Button({ to, href, variant = 'primary', children, ...rest }) {
  const cls = `btn btn-${variant}`
  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    )
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  )
}

export function Card({ children, className = '' }) {
  return <div className={`card ${className}`.trim()}>{children}</div>
}

export function Section({ id, eyebrow, title, intro, children }) {
  return (
    <section id={id} className="section">
      <div className="container">
        {(eyebrow || title || intro) && (
          <div className="section-head">
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            {title && <h2 className="section-title">{title}</h2>}
            {intro && <p className="section-intro">{intro}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}

export function Field({ label, hint, error, className = '', children }) {
  return (
    <label className={`field ${className}`.trim()}>
      <span className="field-label">{label}</span>
      {children}
      {error ? (
        <span className="field-error" role="alert">
          {error}
        </span>
      ) : (
        hint && <span className="field-hint">{hint}</span>
      )}
    </label>
  )
}

export function EmptyState({ children }) {
  return (
    <div className="empty-state">
      <p>{children}</p>
    </div>
  )
}

/* ---------- Stepper (Order journey) ---------- */
export function Stepper({ steps, current }) {
  return (
    <ol className="stepper" aria-label="Order progress">
      {steps.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : ''
        return (
          <li
            key={label}
            className={`step ${state}`.trim()}
            aria-current={i === current ? 'step' : undefined}
          >
            <span className="step-dot">{i + 1}</span>
            <span className="step-label">{label}</span>
          </li>
        )
      })}
    </ol>
  )
}

/* ---------- Transformation Room (before / after) ---------- */
export function TransformationRoom({ items = TRANSFORMATIONS }) {
  const [index, setIndex] = useState(0)
  const [view, setView] = useState('after')

  if (!items.length) {
    return (
      <EmptyState>
        Real before and after examples will appear here once our portfolio is published.
      </EmptyState>
    )
  }

  const item = items[Math.min(index, items.length - 1)]
  const isBefore = view === 'before'
  const src = isBefore ? item.before : item.after
  const alt = isBefore ? item.beforeAlt || `${item.title} before` : item.afterAlt || `${item.title} after`

  return (
    <div className="compare">
      {items.length > 1 && (
        <div className="filters" role="group" aria-label="Choose an example">
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              className={i === index ? 'active' : ''}
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
            >
              {it.title}
            </button>
          ))}
        </div>
      )}

      <div className="compare-frame">
        <img
          className="compare-img"
          src={src}
          alt={alt}
          width="1280"
          height="720"
          loading="lazy"
          decoding="async"
        />
        <span className="compare-badge">{isBefore ? 'Before' : 'After'}</span>
      </div>

      <div className="compare-toggle" role="group" aria-label="Before or after">
        <button
          type="button"
          className={isBefore ? 'active' : ''}
          aria-pressed={isBefore}
          onClick={() => setView('before')}
        >
          Before
        </button>
        <button
          type="button"
          className={!isBefore ? 'active' : ''}
          aria-pressed={!isBefore}
          onClick={() => setView('after')}
        >
          After
        </button>
      </div>
    </div>
  )
}

/* ---------- Presentation Gallery ---------- */
export function GalleryGrid({ items = GALLERY_ITEMS }) {
  const [filter, setFilter] = useState('All')
  const categories = useMemo(() => ['All', ...new Set(items.map((i) => i.category).filter(Boolean))], [items])

  if (!items.length) {
    return <EmptyState>Our portfolio is being prepared. Real projects will be published here soon.</EmptyState>
  }

  const visible = filter === 'All' ? items : items.filter((i) => i.category === filter)

  return (
    <div>
      {categories.length > 2 && (
        <div className="filters" role="group" aria-label="Filter by category">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={filter === c ? 'active' : ''}
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-3">
        {visible.map((item) => (
          <article className="card gallery-card" key={item.id}>
            <div className="gallery-thumb">
              <img
                src={item.image}
                alt={item.alt || item.title}
                width="800"
                height="600"
                loading="lazy"
                decoding="async"
              />
            </div>
            {item.category && <span className="gallery-tag">{item.category}</span>}
            <h3>{item.title}</h3>
            {item.description && <p>{item.description}</p>}
          </article>
        ))}
      </div>
    </div>
  )
}

/* ---------- Welcome intro (Ice White, shown before the site) ----------
   المدة الإجمالية 5 ثوانٍ بما فيها الـ Fade Out:
   الخروج يبدأ عند 4.5 ثانية ويستغرق 0.5 ثانية.
   تأكد أن FADE_OUT_MS يطابق مدة الانتقال المستخدمة في index.css.
------------------------------------------------------------------- */
const INTRO_TOTAL_MS = 5000
const FADE_OUT_MS = 500
const REDUCED_SHOW_MS = 900
const REDUCED_FADE_MS = 80

export function Intro({ onDone }) {
  const [leaving, setLeaving] = useState(false)
  const timers = useRef([])
  const finished = useRef(false)
  const leavingRef = useRef(false)
  const reduceRef = useRef(false)

  function finish() {
    if (finished.current) return
    finished.current = true
    document.body.classList.remove('intro-lock')
    onDone()
  }

  function leave() {
    if (leavingRef.current) return
    leavingRef.current = true
    timers.current.forEach(clearTimeout)
    timers.current = []
    setLeaving(true)
    timers.current.push(setTimeout(finish, reduceRef.current ? REDUCED_FADE_MS : FADE_OUT_MS))
  }

  useEffect(() => {
    document.body.classList.add('intro-lock')
    try {
      reduceRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch (e) {
      reduceRef.current = false
    }
    const showMs = reduceRef.current ? REDUCED_SHOW_MS : INTRO_TOTAL_MS - FADE_OUT_MS
    timers.current.push(setTimeout(leave, showMs))
    return () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
      document.body.classList.remove('intro-lock')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className={`intro ${leaving ? 'leaving' : ''}`.trim()}
      style={{ transitionDuration: `${FADE_OUT_MS}ms` }}
      role="dialog"
      aria-label="Welcome to PRESORA"
    >
      <div className="intro-inner">
        <div className="intro-glow" aria-hidden="true" />
        <div className="intro-logo">
          <span className="intro-mark">P</span>
          <span className="intro-word">PRESORA</span>
        </div>
        <div className="intro-line" aria-hidden="true" />
        <p className="intro-tagline">WE TURN IDEAS INTO IMPACT.</p>
        <div className="intro-sign">
          <span className="intro-by">Created by</span>
          <span className="intro-name">MOTAZ SOUIDI</span>
        </div>
      </div>
      <button type="button" className="intro-skip" onClick={leave}>
        Skip
      </button>
    </div>
  )
}
