import React from 'react'

import { useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Layout from './Layout.jsx'
import Home from './Home.jsx'
import Services from './Services.jsx'
import Order from './Order.jsx'
import Contact from './Contact.jsx'
import Admin from './Admin.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function CinematicIntro({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 4600)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className="presora-cinematic">
      <style>{`
        .presora-cinematic {
          position: fixed;
          inset: 0;
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          background:
            radial-gradient(ellipse at 25% 15%, #5A4632 0%, transparent 55%),
            radial-gradient(ellipse at 80% 90%, #B38B3B 0%, transparent 50%),
            linear-gradient(160deg, #3A2F27, #121110 70%);
          color: #F5F3EF;
          animation: cinematic-exit 1s ease 3.7s forwards;
        }

        .cinematic-content {
          text-align: center;
          animation: cinematic-enter 1.4s cubic-bezier(.22,1,.36,1) both;
        }

        .cinematic-mark {
          width: 66px;
          height: 66px;
          border: 1px solid rgba(245,243,239,.6);
          display: grid;
          place-items: center;
          margin: 0 auto 24px;
          font-size: 34px;
          font-weight: 700;
          animation: mark-enter 1.3s ease both;
          box-shadow: 0 0 35px rgba(179,139,59,.55);
        }

        .cinematic-title {
          font-size: clamp(35px, 8vw, 68px);
          font-weight: 800;
          letter-spacing: .24em;
          margin: 0 0 20px;
        }

        .cinematic-rule {
          width: 0;
          height: 1px;
          margin: 0 auto 22px;
          background: linear-gradient(90deg, transparent, #B38B3B, #F5F3EF, transparent);
          animation: rule-grow 1.4s ease .5s forwards;
        }

        .cinematic-tagline {
          color: #BDBAB5;
          font-size: clamp(10px, 2vw, 13px);
          letter-spacing: .3em;
          animation: cinematic-enter 1.2s ease .8s both;
        }

        .cinematic-author {
          position: absolute;
          bottom: 42px;
          color: rgba(189,186,181,.7);
          font-size: 10px;
          letter-spacing: .25em;
          animation: cinematic-enter 1s ease 1.4s both;
        }

        @keyframes cinematic-enter {
          from { opacity: 0; transform: translateY(25px); filter: blur(8px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }

        @keyframes mark-enter {
          from { opacity: 0; transform: rotate(-45deg) scale(.6); }
          to { opacity: 1; transform: rotate(0) scale(1); }
        }

        @keyframes rule-grow {
          to { width: min(220px, 55vw); }
        }

        @keyframes cinematic-exit {
          to {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .presora-cinematic,
          .cinematic-content,
          .cinematic-mark,
          .cinematic-tagline,
          .cinematic-author,
          .cinematic-rule {
            animation-duration: .01ms !important;
            animation-delay: 0ms !important;
          }
        }
      `}</style>

      <div className="cinematic-content">
        <div className="cinematic-mark">P</div>
        <h1 className="cinematic-title">PRESORA</h1>
        <div className="cinematic-rule" />
        <div className="cinematic-tagline">
          YOUR VISION. YOUR WORLD.
        </div>
      </div>

      <div className="cinematic-author">
        CREATED BY MOTAZ SOUIDI
      </div>
    </div>
  )
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true)
  const handleIntroDone = useCallback(() => setShowIntro(false), [])

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
