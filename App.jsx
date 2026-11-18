
import { useCallback, useEffect, useRef, useState } from 'react'
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
  const [soundEnabled, setSoundEnabled] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    const start = Date.now()
    const duration = 7900

    const interval = setInterval(() => {
      const value = Math.min(100, ((Date.now() - start) / duration) * 100)
      setProgress(value)
    }, 40)

    const timer = setTimeout(onDone, duration)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
      if (audioRef.current) audioRef.current.close()
    }
  }, [onDone])

  const enableSound = () => {
    if (soundEnabled) return

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext

    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    audioRef.current = ctx
    ctx.resume()
    setSoundEnabled(true)

    const impact = (delay, startFreq, endFreq, duration, volume) => {
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      const start = ctx.currentTime + delay

      oscillator.type = 'sawtooth'
      oscillator.frequency.setValueAtTime(startFreq, start)
      oscillator.frequency.exponentialRampToValueAtTime(
        endFreq,
        start + duration
      )

      gain.gain.setValueAtTime(0.001, start)
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.06)
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration)

      oscillator.connect(gain)
      gain.connect(ctx.destination)

      oscillator.start(start)
      oscillator.stop(start + duration + 0.05)
    }

    // Cinematic synthetic whooshes and bass impacts
    impact(0, 180, 45, 1.2, 0.18)
    impact(1.7, 500, 65, 0.8, 0.12)
    impact(3.1, 260, 40, 1.1, 0.2)
    impact(4.6, 650, 90, 0.7, 0.13)
    impact(6.1, 220, 35, 1.3, 0.2)
    impact(7.1, 420, 55, 0.8, 0.15)
  }

  return (
    <div className="presora-film-intro">
      <style>{`
        .presora-film-intro {
          position: fixed;
          inset: 0;
          z-index: 999999;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #050a12;
          color: #fff;
          perspective: 1000px;
          animation: film-exit 1s ease 7.15s forwards;
          isolation: isolate;
        }

        .presora-film-intro::before {
          content: "";
          position: absolute;
          inset: -50%;
          background:
            radial-gradient(ellipse at 50% 50%, rgba(41,85,128,.55), transparent 48%),
            radial-gradient(ellipse at 50% 100%, rgba(25,48,77,.5), transparent 55%);
          animation: atmosphere 7s ease-in-out infinite alternate;
          z-index: -2;
        }

        .presora-film-intro::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 10;
          background:
            linear-gradient(90deg, rgba(0,0,0,.45), transparent 25%, transparent 75%, rgba(0,0,0,.45)),
            linear-gradient(0deg, rgba(0,0,0,.55), transparent 22%, transparent 78%, rgba(0,0,0,.45));
        }

        .film-grid {
          position: absolute;
          inset: -50%;
          opacity: .13;
          background-image:
            linear-gradient(rgba(160,200,235,.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(160,200,235,.15) 1px, transparent 1px);
          background-size: 70px 70px;
          transform: perspective(500px) rotateX(62deg) scale(1.8);
          animation: grid-move 8s linear infinite;
        }

        .film-top {
          position: absolute;
          top: 34px;
          left: 5vw;
          right: 5vw;
          display: flex;
          justify-content: space-between;
          color: rgba(210,230,250,.55);
          font-size: 10px;
          letter-spacing: .25em;
          z-index: 12;
        }

        .film-scenes {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          transform-style: preserve-3d;
        }

        .film-word {
          position: absolute;
          width: 100%;
          padding: 0 3vw;
          text-align: center;
          white-space: nowrap;
          font-size: clamp(48px, 14vw, 170px);
          line-height: .95;
          font-weight: 900;
          letter-spacing: -.065em;
          opacity: 0;
          color: #fff;
          text-shadow: 0 0 45px rgba(125,185,235,.3);
          transform: translateZ(-700px) scale(.3);
          animation: word-camera 1.35s cubic-bezier(.15,.75,.2,1) both;
        }

        .film-word.one { animation-delay: .15s; }
        .film-word.two { animation-delay: 1.35s; }
        .film-word.three { animation-delay: 2.55s; }
        .film-word.four {
          animation-delay: 3.75s;
          font-size: clamp(36px, 10vw, 120px);
          letter-spacing: .02em;
        }

        .film-word.five {
          animation-delay: 5.1s;
          font-size: clamp(50px, 13vw, 150px);
          letter-spacing: .12em;
          color: #c6e2ff;
        }

        .film-word span {
          display: inline-block;
          background: linear-gradient(180deg, #fff 10%, #b8d7f5 55%, #638db5 100%);
          color: transparent;
          background-clip: text;
          -webkit-background-clip: text;
        }

        .film-flash {
          position: absolute;
          inset: 0;
          background: #d9edff;
          opacity: 0;
          pointer-events: none;
          z-index: 8;
          animation: film-flashes 7.5s ease both;
        }

        .film-tagline {
          position: absolute;
          top: 68%;
          width: 100%;
          text-align: center;
          padding: 0 15px;
          color: #c1d8ef;
          font-size: clamp(10px, 2vw, 15px);
          letter-spacing: .35em;
          opacity: 0;
          animation: tagline-show 1.2s ease 5.5s forwards;
        }

        .film-loading {
          position: absolute;
          bottom: 42px;
          left: 8vw;
          right: 8vw;
          z-index: 12;
        }

        .film-loading-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          color: rgba(210,230,250,.65);
          font-size: 10px;
          letter-spacing: .2em;
        }

        .film-loading-track {
          width: 100%;
          height: 2px;
          background: rgba(180,210,240,.18);
          overflow: hidden;
        }

        .film-loading-fill {
          height: 100%;
          background: linear-gradient(90deg, #4779a8, #d4eaff);
          box-shadow: 0 0 15px #8ccaff;
          transition: width .08s linear;
        }

        .film-sound {
          position: absolute;
          right: 5vw;
          top: 65px;
          z-index: 20;
          border: 1px solid rgba(180,210,240,.35);
          color: #d7eaff;
          background: rgba(10,25,42,.65);
          padding: 10px 14px;
          font-size: 9px;
          letter-spacing: .16em;
          cursor: pointer;
          backdrop-filter: blur(10px);
        }

        .film-author {
          position: absolute;
          bottom: 105px;
          left: 0;
          right: 0;
          text-align: center;
          color: rgba(205,225,245,.65);
          font-size: 10px;
          letter-spacing: .3em;
          opacity: 0;
          animation: tagline-show 1s ease 6.2s forwards;
          z-index: 12;
        }

        @keyframes word-camera {
          0% {
            opacity: 0;
            transform: translateZ(-900px) scale(.2) rotateX(12deg);
            filter: blur(18px);
          }
          18% {
            opacity: 1;
            filter: blur(0);
          }
          72% {
            opacity: 1;
            transform: translateZ(180px) scale(1.15);
          }
          100% {
            opacity: 0;
            transform: translateZ(900px) scale(2.5);
            filter: blur(16px);
          }
        }

        @keyframes film-flashes {
          0%, 18%, 36%, 54%, 72%, 100% { opacity: 0; }
          19% { opacity: .17; }
          37% { opacity: .22; }
          55% { opacity: .12; }
          73% { opacity: .3; }
        }

        @keyframes tagline-show {
          from { opacity: 0; transform: translateY(20px); filter: blur(8px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }

        @keyframes atmosphere {
          from { transform: scale(.9) rotate(0deg); }
          to { transform: scale(1.25) rotate(12deg); }
        }

        @keyframes grid-move {
          from { background-position: 0 0; }
          to { background-position: 0 140px; }
        }

        @keyframes film-exit {
          to {
            opacity: 0;
            visibility: hidden;
            transform: scale(1.04);
            filter: blur(12px);
            pointer-events: none;
          }
        }

        @media (max-width: 600px) {
          .film-word {
            white-space: normal;
            overflow-wrap: anywhere;
          }

          .film-top {
            font-size: 8px;
          }

          .film-sound {
            top: 65px;
          }

          .film-loading {
            bottom: 25px;
          }

          .film-author {
            bottom: 90px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .presora-film-intro,
          .film-word,
          .film-flash,
          .film-tagline,
          .film-author {
            animation-duration: .01ms !important;
            animation-delay: 0ms !important;
          }
        }
      `}</style>

      <div className="film-grid" />
      <div className="film-flash" />

      <div className="film-top">
        <span>PRESORA / ORIGINAL</span>
        <span>CREATIVE STUDIO</span>
      </div>

      <button className="film-sound" onClick={enableSound}>
        {soundEnabled ? '♫ SOUND ENABLED' : '♫ ENABLE SOUND'}
      </button>

      <div className="film-scenes">
        <div className="film-word one">
          <span>IMAGINE</span>
        </div>
        <div className="film-word two">
          <span>CREATE</span>
        </div>
        <div className="film-word three">
          <span>BUILD</span>
        </div>
        <div className="film-word four">
          <span>YOUR WORLD</span>
        </div>
        <div className="film-word five">
          <span>PRESORA</span>
        </div>
      </div>

      <div className="film-tagline">
        YOUR VISION. YOUR WORLD.
      </div>

      <div className="film-author">
        CREATED BY MOTAZ SOUIDI
      </div>

      <div className="film-loading">
        <div className="film-loading-info">
          <span>PREPARING YOUR EXPERIENCE</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="film-loading-track">
          <div
            className="film-loading-fill"
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
