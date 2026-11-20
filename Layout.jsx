
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Logo } from './ui.jsx'
import { WA, MAIL } from './supabase.js'

const LINKS = [
  ['/', 'Home'],
  ['/services', 'Services'],
  ['/order', 'Order'],
  ['/contact', 'Contact'],
]

export default function Layout() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  // Scroll-triggered reveals (skipped entirely when reduced motion is requested)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return undefined
    const els = [...document.querySelectorAll('main .section-heading, main .showcase-head, main .grid > *, main .versus > *, main .stats > *, main .cta-band, main .viewer, main .rx-frame, main .pg')]
    els.forEach((el, i) => {
      el.setAttribute('data-reveal', '')
      el.style.setProperty('--i', String(i % 4))
    })
    document.documentElement.classList.add('fx')
    const io = new IntersectionObserver(
      (list) => list.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute('data-in', ''); io.unobserve(e.target) } }),
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => {
      io.disconnect()
      els.forEach((el) => { el.removeAttribute('data-reveal'); el.removeAttribute('data-in') })
    }
  }, [pathname])

  function spotlight(e) {
    const c = e.target.closest?.('.card')
    if (!c) return
    const r = c.getBoundingClientRect()
    c.style.setProperty('--cx', e.clientX - r.left + 'px')
    c.style.setProperty('--cy', e.clientY - r.top + 'px')
  }

  return (
    <>
      <style>{`
        .presora-signature {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          animation: signature-reveal 1.2s cubic-bezier(.22,1,.36,1) both;
        }

        .presora-signature b {
          color: var(--berry-soft);
          font-weight: 700;
          letter-spacing: .04em;
          transition: color .3s ease, text-shadow .3s ease;
        }

        .presora-signature:hover b {
          color: #ECDFD2;
          text-shadow: 0 0 16px rgba(186,136,162,.7);
        }

        @keyframes signature-reveal {
          from {
            opacity: 0;
            transform: translateY(12px);
            filter: blur(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .presora-signature {
            animation: none;
          }
        }
      `}</style>

      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container header-inner">
          <Logo />

          <button
            type="button"
            className="nav-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-nav"
          >
            {open ? 'Close' : 'Menu'}
          </button>

          <nav id="site-nav" className={`nav-links ${open ? 'open' : ''}`}>
            {LINKS.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={close}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main onPointerMove={spotlight}>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <Logo />
              <p style={{ marginTop: 14, maxWidth: 320, fontSize: 14 }}>
                WE TURN IDEAS INTO IMPACT.
              </p>
            </div>

            <div>
              <h4>Pages</h4>
              <ul>
                {LINKS.map(([to, label]) => (
                  <li key={to}>
                    <Link to={to}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4>Contact</h4>
              <ul>
                {WA && (
                  <li>
                    <a
                      href={`https://wa.me/${WA}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      WhatsApp
                    </a>
                  </li>
                )}

                {MAIL && (
                  <li>
                    <a href={`mailto:${MAIL}`}>{MAIL}</a>
                  </li>
                )}

                <li>
                  <Link to="/admin">Admin</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-note">
            <span>
              © {new Date().getFullYear()} PRESORA. All rights reserved.
            </span>

            <span className="presora-signature">
              Created by <b>Motaz Souidi</b>
            </span>
          </div>
        </div>
      </footer>
    </>
  )
}
