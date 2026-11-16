import { Link } from 'react-router-dom'

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
    <button className={cls} {...rest}>
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

export function Field({ label, hint, className = '', children }) {
  return (
    <label className={`field ${className}`.trim()}>
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  )
}
