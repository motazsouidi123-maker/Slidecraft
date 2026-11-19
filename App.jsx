import { useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Layout from './Layout.jsx'
import Home from './Home.jsx'
import Services from './Services.jsx'
import Order from './Order.jsx'
import Contact from './Contact.jsx'
import Admin from './Admin.jsx'
import CinematicIntro, { hasSeenIntro, REPLAY_EVENT } from './CinematicIntro.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function App() {
  const { pathname } = useLocation()

  // Shown once per session. Never auto-shown on the admin login route.
  const [showIntro, setShowIntro] = useState(
    () => !hasSeenIntro() && !pathname.startsWith('/admin')
  )
  const handleIntroDone = useCallback(() => setShowIntro(false), [])

  // "Replay intro" link in the footer dispatches this event.
  useEffect(() => {
    const replay = () => setShowIntro(true)
    window.addEventListener(REPLAY_EVENT, replay)
    return () => window.removeEventListener(REPLAY_EVENT, replay)
  }, [])

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/order" element={<Order />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      {showIntro && <CinematicIntro onDone={handleIntroDone} />}
    </>
  )
}
