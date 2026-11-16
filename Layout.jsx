import { useEffect, useState } from 'react'
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { EMAIL, waLink } from '../lib/config.js'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/services', label: 'Services' },
  { to: '/order', label: 'Order' },
  { to: '/contact', label: 'Contact' },
]
const linkClass = ({ isActive }) =>
  `text-sm transition-colors ${isActive ? 'text-gold' : 'text-mist hover:text-snow'}`

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [pathname])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-ink border-b border-line">
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl tracking-[0.18em] text-snow">PRESORA</Link>
          <nav className="hidden md:flex items-center gap-8" aria-label="Main">
            {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>{l.label}</NavLink>)}
          </nav>
          <Link to="/order" className="hidden md:inline-block btn btn-gold !py-2 !px-5">Start an order</Link>
          <button className="md:hidden text-snow p-2 -mr-2" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menu">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
              {open ? <path d="M4 4l14 14M18 4L4 18" /> : <path d="M3 6h16M3 11h16M3 16h16" />}
            </svg>
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.nav className="md:hidden border-t border-line bg-ink" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} aria-label="Mobile">
              <div className="px-5 py-4 flex flex-col gap-4">
                {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>{l.label}</NavLink>)}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-10 flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
          <div>
            <p className="font-display text-xl tracking-[0.18em]">PRESORA</p>
            <p className="text-sm text-bronze mt-1">We turn ideas into impact.</p>
          </div>
          <div className="flex gap-6 text-sm text-mist">
            {waLink() && <a href={waLink()} target="_blank" rel="noreferrer" className="hover:text-gold transition-colors">WhatsApp</a>}
            {EMAIL && <a href={`mailto:${EMAIL}`} className="hover:text-gold transition-colors">Email</a>}
            <Link to="/admin" className="hover:text-gold transition-colors">Admin</Link>
          </div>
          <p className="text-xs text-bronze">Made by M.S.</p>
        </div>
      </footer>
    </div>
  )
}
