
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
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const duration = 8500
    const start = Date.now()

    const interval = setInterval(() => {
      const value = Math.min(100, ((Date.now() - start) / duration) * 100)
      setProgress(value)
    }, 40)

    const timer = setTimeout(onDone, duration)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [onDone])

  return (
    <div className="presora-cinema">
      <style>{`
        .presora-cinema {
          position: fixed;
          inset: 0;
          z-index: 999999;
          overflow: hidden;
          display: grid;
          place-items: center;
          background: #050a12;
          color: white;
          perspective: 900px;
          isolation: isolate;
          animation: cinema-exit 1.1s cubic-bezier(.7,0,.2,1) 7.4s forwards;
        }

        .presora-cinema::before {
          content: "";
          position: absolute;
          inset: -30%;
          z-index: -2;
          background:
            radial-gradient(ellipse at 50% 45%, rgba(65,115,165,.42), transparent 45%),
            radial-gradient(ellipse at 50% 100%, rgba(20,45,75,.6), transparent 55%);
          animation: cinema-atmosphere 8s ease-in-out infinite alternate;
        }

        .cinema-grid {
          position: absolute;
          inset: -50%;
          z-index: -1;
          opacity: .12;
          background-image:
            linear-gradient(rgba(160,200,235,.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(160,200,235,.2) 1px, transparent 1px);
          background-size: 75px 75px;
          transform: perspective(500px) rotateX(62deg) scale(1.7);
          animation: cinema-grid-move 8s linear infinite;
        }

        .cinema-camera {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          transform-style: preserve-3d;
          animation: camera-flight 8s cubic-bezier(.4,0,.2,1) both;
        }

        .cinema-word {
          position: absolute;
          width: 120%;
          text-align: center;
          white-space: nowrap;
          font-size: clamp(70px, 17vw, 210px);
          line-height: 1;
          font-weight: 950;
          letter-spacing: -.075em;
          opacity: 0;
          color: transparent;
          background: linear-gradient(180deg, #fff 5%, #c5e2ff 50%, #5684b2 100%);
          background-clip: text;
          -webkit-background-clip: text;
          text-shadow: 0 0 60px rgba(120,180,235,.18);
          transform-style: preserve-3d;
          animation: word-through-camera 2s cubic-bezier(.15,.75,.2,1) both;
        }

        .cinema-word.w1 { animation-delay: .1s; }
        .cinema-word.w2 { animation-delay: 1.45s; }
        .cinema-word.w3 { animation-delay: 2.8s; }
        .cinema-word.w4 {
          animation-delay: 4.15s;
          font-size: clamp(48px, 12vw, 145px);
          letter-spacing: -.04em;
        }

        .cinema-word.brand {
          animation: brand-arrival 2s cubic-bezier(.16,1,.3,1) 5.3s both;
          font-size: clamp(45px, 12vw, 145px);
          letter-spacing: .12em;
        }

        .cinema-tagline {
          position: absolute;
          top: 67%;
          width: 100%;
          padding: 0 15px;
          text-align: center;
          color: #c7dced;
          font-size: clamp(10px, 2vw, 14px);
          letter-spacing: .32em;
          opacity: 0;
          animation: cinema-reveal 1.1s ease 6.35s forwards;
        }

        .cinema-author {
          position: absolute;
          bottom: 112px;
          width: 100%;
          text-align: center;
          color: rgba(205,225,245,.65);
          font-size: 10px;
          letter-spacing: .28em;
          opacity: 0;
          animation: cinema-reveal 1s ease 6.8s forwards;
        }

        .cinema-loading {
          position: absolute;
          bottom: 35px;
          left: 8%;
          right: 8%;
          z-index: 5;
        }

        .cinema-loading-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          color: rgba(205,225,245,.65);
          font-size: 9px;
          letter-spacing: .2em;
        }

        .cinema-track {
          height: 2px;
          background: rgba(190,220,250,.16);
          overflow: hidden;
        }

        .cinema-progress {
          height: 100%;
          background: linear-gradient(90deg, #4779a8, #d8edff);
          box-shadow: 0 0 18px #8ccaff;
          transition: width .08s linear;
        }

        .cinema-corner {
          position: absolute;
          top: 30px;
          left: 5%;
          right: 5%;
          display: flex;
          justify-content: space-between;
          color: rgba(205,225,245,.45);
          font-size: 9px;
          letter-spacing: .25em;
        }

        .cinema-flash {
          position: absolute;
          inset: 0;
          z-index: 4;
          pointer-events: none;
          background: white;
          opacity: 0;
          animation: cinema-flash 7.5s ease both;
        }

        @keyframes word-through-camera {
          0% {
            opacity: 0;
            transform: translateZ(-1100px) scale(.12) rotateX(18deg);
            filter: blur(22px);
          }
          20% {
            opacity: 1;
            filter: blur(0);
          }
          68% {
            opacity: 1;
            transform: translateZ(100px) scale(1.1) rotateX(0);
          }
          100% {
            opacity: 0;
            transform: translateZ(1100px) scale(3.2) rotateX(-8deg);
            filter: blur(20px);
          }
        }

        @keyframes brand-arrival {
          0% {
            opacity: 0;
            transform: translateZ(-1000px) scale(.15);
            filter: blur(25px);
          }
          55% {
            opacity: 1;
            transform: translateZ(80px) scale(1.15);
            filter: blur(0);
          }
          75% {
            transform: translateZ(0) scale(1);
          }
          100% {
            opacity: 1;
            transform: translateZ(0) scale(1);
          }
        }

        @keyframes camera-flight {
          0% { transform: translateZ(-150px) scale(.85); }
          40% { transform: translateZ(100px) scale(1.1); }
          75% { transform: translateZ(-40px) scale(1.03); }
          100% { transform: translateZ(0) scale(1); }
        }

        @keyframes cinema-reveal {
          from {
            opacity: 0;
            transform: translateY(20px);
            filter: blur(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes cinema-atmosphere {
          from { transform: scale(.9) rotate(-5deg); }
          to { transform: scale(1.2) rotate(8deg); }
        }

        @keyframes cinema-grid-move {
          from { background-position: 0 0; }
          to { background-position: 0 150px; }
        }

        @keyframes cinema-flash {
          0%, 20%, 40%, 60%, 100% { opacity: 0; }
          21% { opacity: .2; }
          41% { opacity: .14; }
          61% { opacity: .25; }
        }

        @keyframes cinema-exit {
          to {
            opacity: 0;
            visibility: hidden;
            transform: scale(1.06);
            filter: blur(15px);
            pointer-events: none;
          }
        }

        @media (max-width: 600px) {
          .cinema-word {
            white-space: normal;
            overflow-wrap: anywhere;
          }

          .cinema-author { bottom: 95px; }
          .cinema-loading { bottom: 24px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .presora-cinema,
          .cinema-word,
          .cinema-camera,
          .cinema-tagline,
          .cinema-author {
            animation-duration: .01ms !important;
            animation-delay: 0ms !important;
          }
        }
      `}</style>

      <div className="cinema-grid" />
      <div className="cinema-flash" />

      <div className="cinema-corner">
        <span>PRESORA / EXPERIENCE</span>
        <span>CREATIVE STUDIO</span>
      </div>

      <div className="cinema-camera">
        <div className="cinema-word w1">IMAGINE</div>
        <div className="cinema-word w2">CREATE</div>
        <div className="cinema-word w3">TRANSFORM</div>
        <div className="cinema-word w4">YOUR WORLD</div>
        <div className="cinema-word brand">PRESORA</div>
      </div>

      <div className="cinema-tagline">
        YOUR VISION. YOUR WORLD.
      </div>

      <div className="cinema-author">
        CREATED BY MOTAZ SOUIDI
      </div>

      <div className="cinema-loading">
        <div className="cinema-loading-label">
          <span>ENTERING PRESORA</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="cinema-track">
          <div
            className="cinema-progress"
            style={{ width: `${progress}%` }}
          />
        </div>
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
