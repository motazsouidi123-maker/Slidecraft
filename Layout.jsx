import React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Logo } from './ui.jsx'
import { WA, MAIL } from './supabase.js'

gsap.registerPlugin(ScrollTrigger)

const LINKS = [
  ['/', 'Home'],
  ['/services', 'Services'],
  ['/order', 'Order'],
  ['/contact', 'Contact'],
]

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Layout() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const cursor = useRef(null)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  // Scroll-triggered entrances for every page (GSAP ScrollTrigger)
  useEffect(() => {
    if (reduced()) return undefined
    const ctx = gsap.context(() => {
      const els = gsap.utils.toArray(
        'main .section-heading, main .showcase-head, main .grid > *, main .versus > *, main .stats > *, main .viewer, main .rx-frame, main .pg, main .price-table, main form, main .login-wrap'
      )
      els.forEach((el) =>
        gsap.from(el, {
          y: 64,
          opacity: 0,
          duration: 1.15,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        })
      )
    })
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 250)
    return () => {
      window.clearTimeout(t)
      ctx.revert()
    }
  }, [pathname])

  // Cursor follower + magnetic buttons (fine pointers only)
  useEffect(() => {
    if (reduced() || !window.matchMedia('(pointer: fine)').matches) return undefined
    const el = cursor.current
    const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' })
    const move = (e) => {
      xTo(e.clientX)
      yTo(e.clientY)
      el.classList.add('on')
      el.classList.toggle('hot', !!e.target.closest?.('a,button,input,select,textarea,.card,.tile,.feat'))
      const b = e.target.closest?.('.btn')
      if (b) {
        const r = b.getBoundingClientRect()
        gsap.to(b, {
          x: (e.clientX - r.left - r.width / 2) * 0.22,
          y: (e.clientY - r.top - r.height / 2) * 0.32,
          duration: 0.4,
          ease: 'power3.out',
        })
      }
    }
    const out = (e) => {
      const b = e.target.closest?.('.btn')
      if (b && !b.contains(e.relatedTarget)) gsap.to(b, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.45)' })
    }
    const leave = () => el.classList.remove('on')
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerout', out)
    document.documentElement.addEventListener('mouseleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerout', out)
      document.documentElement.removeEventListener('mouseleave', leave)
    }
  }, [])

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
          color: #F5F3EF;
          text-shadow: 0 0 16px rgba(217,190,130,.7);
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

      <div className="cursor" ref={cursor} aria-hidden="true">
        <i />
      </div>

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
              <p style={{ marginTop: 14, maxWidth: 320, fontSize: 14 }}>WE TURN IDEAS INTO IMPACT.</p>
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
              <h4>Community</h4>
              <ul>
                <li>
                  <a href={WA ? `https://wa.me/${WA}` : 'https://wa.me/213673088320'} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/i3._.x2/" target="_blank" rel="noopener noreferrer">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4>Contact</h4>
              <ul>
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
            <span>© {new Date().getFullYear()} PRESORA. All rights reserved.</span>

            <span className="presora-signature">
              Created by <b>Motaz Souidi</b>
            </span>
          </div>
        </div>
      </footer>
    </>
  )
}
