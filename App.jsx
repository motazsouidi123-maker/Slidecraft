
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
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

function CinematicIntro({ onDone }) {
  const [progress, setProgress] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const start = Date.now()
    const duration = 8500

    const timer = window.setInterval(() => {
      const elapsed = Date.now() - start
      const value = Math.min(100, (elapsed / duration) * 100)

      setProgress(value)

      if (value >= 100) {
        window.clearInterval(timer)
        setLeaving(true)
        window.setTimeout(onDone, 1100)
      }
    }, 40)

    return () => window.clearInterval(timer)
  }, [onDone])

  return (
    <div className={`presora-cinema ${leaving ? 'cinema-leaving' : ''}`}>
      <style>{`
        .presora-cinema {
          position: fixed;
          inset: 0;
          z-index: 999999;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #030405;
          color: #fff;
          isolation: isolate;
          font-family: inherit;
        }

        .presora-cinema::before {
          content: "";
          position: absolute;
          inset: -35%;
          z-index: -2;
          background:
            radial-gradient(ellipse at 50% 45%, rgba(210,220,235,.17), transparent 35%),
            radial-gradient(ellipse at 15% 75%, rgba(145,160,180,.10), transparent 38%),
            radial-gradient(ellipse at 85% 18%, rgba(220,225,235,.09), transparent 34%);
          animation: cinema-atmosphere 8s ease-in-out infinite alternate;
        }

        .presora-cinema::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 5;
          pointer-events: none;
          background: radial-gradient(ellipse, transparent 35%, rgba(0,0,0,.75) 100%);
        }

        .cinema-grid {
          position: absolute;
          inset: -50%;
          z-index: -1;
          opacity: .12;
          background-image:
            linear-gradient(rgba(210,220,235,.13) 1px, transparent 1px),
            linear-gradient(90deg, rgba(210,220,235,.13) 1px, transparent 1px);
          background-size: 75px 75px;
          transform: perspective(600px) rotateX(58deg) scale(1.8);
          animation: cinema-grid-move 12s linear infinite;
        }

        .cinema-light {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: linear-gradient(
            115deg,
            transparent 25%,
            rgba(225,235,250,.10) 48%,
            transparent 70%
          );
          transform: translateX(-120%);
          animation: silver-sweep 5s ease-in-out infinite;
        }

        .cinema-content {
          position: relative;
          z-index: 3;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1100px;
          overflow: hidden;
        }

        .cinema-word {
          position: absolute;
          margin: 0;
          white-space: nowrap;
          text-align: center;
          font-size: clamp(3.8rem, 14vw, 12rem);
          line-height: .9;
          letter-spacing: -.075em;
          font-weight: 950;
          background: linear-gradient(
            180deg,
            #ffffff 4%,
            #d8dce2 42%,
            #858c96 75%,
            #f4f5f7 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          filter: drop-shadow(0 10px 45px rgba(210,225,245,.15));
          opacity: 0;
          transform: translateZ(-1000px) scale(.2);
          animation: cinema-word-arrive 1.65s cubic-bezier(.12,.75,.18,1) both;
        }

        .cinema-word.one {
          animation-delay: .25s;
        }

        .cinema-word.two {
          animation-delay: 1.8s;
        }

        .cinema-word.three {
          animation-delay: 3.35s;
        }

        .cinema-word.four {
          animation-delay: 4.9s;
          font-size: clamp(3.2rem, 11vw, 9rem);
        }

        .cinema-brand {
          position: absolute;
          text-align: center;
          opacity: 0;
          animation: cinema-brand-enter 1.7s cubic-bezier(.16,1,.3,1) forwards;
          animation-delay: 6.25s;
        }

        .cinema-brand h1 {
          margin: 0;
          font-size: clamp(3.5rem, 12vw, 9rem);
          line-height: 1;
          letter-spacing: .12em;
          font-weight: 950;
          color: #f5f6f8;
          text-shadow:
            0 0 25px rgba(230,235,245,.24),
            0 0 90px rgba(190,205,225,.16);
        }

        .cinema-brand-line {
          width: 0;
          height: 1px;
          margin: 25px auto 0;
          background: linear-gradient(90deg, transparent, #f4f5f7, transparent);
          animation: cinema-line 1s ease forwards;
          animation-delay: 7.1s;
        }

        .cinema-credit {
          position: absolute;
          z-index: 8;
          bottom: 105px;
          left: 0;
          right: 0;
          text-align: center;
          color: rgba(235,239,245,.75);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: .38em;
          opacity: 0;
          animation: cinema-credit-enter 1s ease forwards;
          animation-delay: 7.15s;
        }

        .cinema-loading {
          position: absolute;
          z-index: 8;
          bottom: 35px;
          left: 50%;
          width: min(260px, 65vw);
          transform: translateX(-50%);
          opacity: 0;
          animation: cinema-loading-enter .7s ease forwards;
          animation-delay: .5s;
        }

        .cinema-loading-top {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          color: rgba(225,230,240,.65);
          font-size: 9px;
          letter-spacing: .2em;
        }

        .cinema-progress-track {
          width: 100%;
          height: 2px;
          background: rgba(255,255,255,.12);
          overflow: hidden;
        }

        .cinema-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #858d99, #fff);
          box-shadow: 0 0 15px rgba(230,240,255,.55);
          transition: width .08s linear;
        }

        .cinema-leaving {
          animation: cinema-exit 1.1s cubic-bezier(.7,0,.2,1) forwards;
          pointer-events: none;
        }

        @keyframes cinema-word-arrive {
          0% {
            opacity: 0;
            transform: translateZ(-1000px) scale(.2);
            filter: blur(18px);
          }
          20% {
            opacity: 1;
            filter: blur(0);
          }
          75% {
            opacity: 1;
            transform: translateZ(100px) scale(1.15);
          }
          100% {
            opacity: 0;
            transform: translateZ(900px) scale(2.5);
            filter: blur(12px);
          }
        }

        @keyframes cinema-brand-enter {
          0% {
            opacity: 0;
            transform: scale(.65) translateY(25px);
            filter: blur(15px);
          }
          65% {
            opacity: 1;
            filter: blur(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0);
          }
        }

        @keyframes cinema-line {
          to { width: min(260px, 60vw); }
        }

        @keyframes cinema-credit-enter {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes cinema-loading-enter {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes cinema-atmosphere {
          from { transform: rotate(0deg) scale(1); }
          to { transform: rotate(12deg) scale(1.15); }
        }

        @keyframes cinema-grid-move {
          from { background-position: 0 0; }
          to { background-position: 0 150px; }
        }

        @keyframes silver-sweep {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }

        @keyframes cinema-exit {
          to {
            opacity: 0;
            transform: scale(1.04);
            filter: blur(12px);
            visibility: hidden;
          }
        }

        @media (max-width: 600px) {
          .cinema-credit {
            bottom: 95px;
            font-size: 8px;
            letter-spacing: .25em;
          }

          .cinema-word {
            letter-spacing: -.06em;
          }

          .cinema-brand h1 {
            letter-spacing: .08em;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cinema-word,
          .cinema-brand,
          .cinema-brand-line,
          .cinema-credit,
          .cinema-light,
          .cinema-grid {
            animation-duration: .01ms !important;
            animation-delay: 0ms !important;
          }
        }
      `}</style>

      <div className="cinema-grid" />
      <div className="cinema-light" />

      <div className="cinema-content">
        <div className="cinema-word one">IMAGINE</div>
        <div className="cinema-word two">CREATE</div>
        <div className="cinema-word three">TRANSFORM</div>
        <div className="cinema-word four">YOUR WORLD</div>

        <div className="cinema-brand">
          <h1>PRESORA</h1>
          <div className="cinema-brand-line" />
        </div>
      </div>

      <div className="cinema-credit">
        CREATED BY MOTAZ SOUIDI
      </div>

      <div className="cinema-loading">
        <div className="cinema-loading-top">
          <span>LOADING EXPERIENCE</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="cinema-progress-track">
          <div
            className="cinema-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true)

  const handleIntroDone = useCallback(() => {
    setShowIntro(false)
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
        </Route>

        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showIntro && <CinematicIntro onDone={handleIntroDone} />}
    </>
  )
}
