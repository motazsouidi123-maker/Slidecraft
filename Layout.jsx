import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
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

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <Logo />
          <button
            type="button"
            className="nav-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            {open ? 'Close' : 'Menu'}
          </button>
          <nav className={`nav-links ${open ? 'open' : ''}`}>
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

      <main>
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
                    <a href={`https://wa.me/${WA}`} target="_blank" rel="noreferrer">
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
            © {new Date().getFullYear()} PRESORA. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  )
}
