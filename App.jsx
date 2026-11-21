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

const BOOT_LINES = [
  'PRESORA/OS  BOOT SEQUENCE  v1.0',
  '> loading typography ............ OK',
  '> calibrating palette ........... OK',
  '> rendering ideas ............... OK',
]

function CinematicIntro({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 4600)
    const onKey = (e) => {
      if (e.key === 'Escape') onDone()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
    }
  }, [onDone])

  return (
    <div className="presora-cinematic" role="status" aria-label="PRESORA">
      <style>{`
        .presora-cinematic {
          position: fixed;
          inset: 0;
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          overflow: hidden;
          background:
            radial-gradient(ellipse at 50% 38%, rgba(179,139,59,.24) 0%, transparent 58%),
            radial-gradient(rgba(236,229,212,.07) 1px, transparent 1.2px) 0 0 / 24px 24px,
            #0B0A09;
          color: #ECE5D4;
          animation: cinematic-exit 1s ease 3.7s forwards;
        }

        .presora-cinematic::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(0deg, rgba(0,0,0,.4) 0, rgba(0,0,0,.4) 1px, transparent 1px, transparent 3px);
        }

        .presora-cinematic::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 2px;
          pointer-events: none;
          background: linear-gradient(90deg, transparent, #F2C36B, transparent);
          box-shadow: 0 0 30px 8px rgba(242,195,107,.4);
          animation: boot-scan 2.4s cubic-bezier(.22,1,.36,1) .2s both;
        }

        .boot-log {
          position: absolute;
          top: clamp(20px, 5vh, 44px);
          left: clamp(18px, 4vw, 48px);
          font: 500 clamp(10px, 1.6vw, 12.5px)/1.9 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace;
          letter-spacing: .06em;
          color: #B5AFA2;
        }

        .boot-log .bl {
          display: block;
          overflow: hidden;
          white-space: nowrap;
          width: calc(var(--n) * 1ch);
          max-width: 90vw;
        }

        .boot-log .bl:first-child { color: #F2C36B; }

        .cinematic-content {
          position: relative;
          text-align: center;
          animation: cinematic-enter 1.4s cubic-bezier(.22,1,.36,1) .5s both;
        }

        .cinematic-mark {
          width: 70px;
          height: 70px;
          border: 1px solid #E2C98F;
          display: grid;
          place-items: center;
          margin: 0 auto 26px;
          font: 800 34px 'JetBrains Mono', ui-monospace, monospace;
          color: #F2C36B;
          text-shadow: 0 0 18px rgba(242,195,107,.8);
          background: linear-gradient(145deg, #2A2118, #0B0A09);
          box-shadow: inset 0 0 16px rgba(242,195,107,.25), 0 0 40px rgba(179,139,59,.5), 5px 5px 0 #B38B3B;
          animation: mark-enter 1.3s ease .5s both;
        }

        .cinematic-title {
          font: 700 clamp(35px, 8vw, 72px) 'Space Grotesk', 'Instrument Sans', system-ui, sans-serif;
          letter-spacing: .22em;
          margin: 0 0 20px;
          text-shadow: 0 0 40px rgba(242,195,107,.3);
        }

        .cinematic-rule {
          width: 0;
          height: 1px;
          margin: 0 auto 22px;
          background: linear-gradient(90deg, transparent, #F2C36B, transparent);
          animation: rule-grow 1.4s ease 1s forwards;
        }

        .cinematic-tagline {
          color: #B5AFA2;
          font: 500 clamp(10px, 2vw, 13px) 'JetBrains Mono', ui-monospace, monospace;
          letter-spacing: .3em;
          animation: cinematic-enter 1.2s ease 1.3s both;
        }

        .cinematic-tagline::after {
          content: '';
          display: inline-block;
          width: .6em;
          height: 1.1em;
          margin-left: .6em;
          vertical-align: text-bottom;
          background: #F2C36B;
          box-shadow: 0 0 10px #F2C36B;
          animation: boot-blink 1s steps(2) infinite;
        }

        .cinematic-bar {
          position: absolute;
          left: 50%;
          bottom: 92px;
          width: min(260px, 60vw);
          height: 4px;
          transform: translateX(-50%);
          border: 1px solid rgba(236,229,212,.28);
        }

        .cinematic-bar::after {
          content: '';
          display: block;
          height: 100%;
          background: #F2C36B;
          box-shadow: 0 0 12px #F2C36B;
          transform-origin: left;
          animation: boot-progress 3.3s steps(22) .4s both;
        }

        .cinematic-author {
          position: absolute;
          bottom: 42px;
          color: rgba(181,175,162,.75);
          font: 500 10px 'JetBrains Mono', ui-monospace, monospace;
          letter-spacing: .25em;
          animation: cinematic-enter 1s ease 1.4s both;
        }

        .cinematic-skip {
          position: absolute;
          top: clamp(18px, 4.5vh, 40px);
          right: clamp(18px, 4vw, 48px);
          z-index: 2;
          background: transparent;
          border: 1px solid rgba(236,229,212,.28);
          color: #B5AFA2;
          padding: 9px 14px;
          font: 500 10.5px 'JetBrains Mono', ui-monospace, monospace;
          letter-spacing: .16em;
          text-transform: uppercase;
          cursor: pointer;
          transition: color .3s, border-color .3s;
        }

        .cinematic-skip:hover { color: #F2C36B; border-color: #F2C36B; }

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

        @keyframes boot-scan {
          from { transform: translateY(-4vh); opacity: 1; }
          to { transform: translateY(104vh); opacity: 0; }
        }

        @keyframes boot-progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        @keyframes boot-type {
          from { width: 0; }
        }

        @keyframes boot-blink {
          50% { opacity: 0; }
        }

        @keyframes cinematic-exit {
          to {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
          }
        }

        @media (prefers-reduced-motion: no-preference) {
          .boot-log .bl {
            animation: boot-type .7s steps(30) calc(.25s + var(--i) * .6s) both;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .presora-cinematic,
          .presora-cinematic::after,
          .cinematic-content,
          .cinematic-mark,
          .cinematic-tagline,
          .cinematic-tagline::after,
          .cinematic-bar::after,
          .cinematic-author,
          .cinematic-rule {
            animation-duration: .01ms !important;
            animation-delay: 0ms !important;
          }
          .cinematic-rule { width: min(220px, 55vw); }
        }
      `}</style>

      <div className="boot-log" aria-hidden="true">
        {BOOT_LINES.map((line, i) => (
          <span className="bl" key={line} style={{ '--n': line.length, '--i': i }}>
            {line}
          </span>
        ))}
      </div>

      <button type="button" className="cinematic-skip" onClick={onDone}>
        Skip [Esc]
      </button>

      <div className="cinematic-content">
        <div className="cinematic-mark">P</div>
        <h1 className="cinematic-title">PRESORA</h1>
        <div className="cinematic-rule" />
        <div className="cinematic-tagline">
          YOUR VISION. YOUR WORLD.
        </div>
      </div>

      <div className="cinematic-bar" aria-hidden="true" />

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
