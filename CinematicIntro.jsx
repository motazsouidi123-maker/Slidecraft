import { useCallback, useEffect, useRef, useState } from 'react'
import './cinematic-intro.css'

/* =========================================================================
   PRESORA — Cinematic Intro
   - Shown once per browser session (sessionStorage), replayable via REPLAY_EVENT
   - No libraries: CSS timeline + one lightweight <canvas> particle field
   - Sound is opt-in only (WebAudio, generated in code, no audio files)
   - Respects prefers-reduced-motion (static finished frame, no canvas loop)
   - Exit is a soft Blur + Fade + Light transition, no page reload
   ========================================================================= */

const SEEN_KEY = 'presora:intro-seen'
export const REPLAY_EVENT = 'presora:replay-intro'

export function hasSeenIntro() {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

function markSeen() {
  try {
    window.sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    /* storage unavailable: the intro simply may show again on reload */
  }
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

const WORD = 'PRESORA'.split('')
const SENTENCES = ['YOUR VISION.', 'YOUR WORLD.']
const READY_MS = 6300 // when EXPLORE becomes clickable (it fades in at 6.0s)
const LEAVE_MS = 1400 // explore transition length
const SKIP_MS = 550 // skip transition length

/* ---------- Optional ambient sound (only created after a user click) ---------- */
function createSound() {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null

  const ctx = new AC()
  if (ctx.resume) ctx.resume()

  const master = ctx.createGain()
  master.gain.setValueAtTime(0, ctx.currentTime)
  master.connect(ctx.destination)

  const lowpass = ctx.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.setValueAtTime(320, ctx.currentTime)
  lowpass.connect(master)

  const oscs = [
    [55, 'sine', 0.5],
    [82.4, 'sine', 0.35],
    [110.2, 'triangle', 0.16],
    [164.8, 'sine', 0.12],
  ].map(([freq, type, level]) => {
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.value = freq
    osc.detune.value = (Math.random() - 0.5) * 8
    const gain = ctx.createGain()
    gain.gain.value = level
    osc.connect(gain)
    gain.connect(lowpass)
    osc.start()
    return osc
  })

  master.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 2.5)
  lowpass.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 8)

  const whoosh = () => {
    const t = ctx.currentTime
    const length = Math.floor(ctx.sampleRate * 1.4)
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1

    const src = ctx.createBufferSource()
    src.buffer = buffer
    const band = ctx.createBiquadFilter()
    band.type = 'bandpass'
    band.Q.value = 0.9
    band.frequency.setValueAtTime(300, t)
    band.frequency.exponentialRampToValueAtTime(5000, t + 1.1)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.18, t + 0.5)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.3)
    src.connect(band)
    band.connect(gain)
    gain.connect(ctx.destination)
    src.start(t)
    src.stop(t + 1.4)
  }

  const stop = (closeAfterMs = 900) => {
    try {
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.7)
    } catch {
      /* ignore */
    }
    window.setTimeout(() => {
      oscs.forEach((o) => {
        try {
          o.stop()
        } catch {
          /* already stopped */
        }
      })
      if (ctx.close) ctx.close().catch(() => {})
    }, closeAfterMs)
  }

  return { whoosh, stop }
}

/* ---------- Component ---------- */
export default function CinematicIntro({ onDone }) {
  const [reduced] = useState(prefersReducedMotion)
  const [started, setStarted] = useState(reduced) // waits for fonts unless reduced
  const [phase, setPhase] = useState(reduced ? 'ready' : 'intro') // intro | ready | leaving | skipping
  const [soundOn, setSoundOn] = useState(false)

  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const ctaRef = useRef(null)
  const soundRef = useRef(null)
  const leavingRef = useRef(false)
  const readyTimer = useRef(0)
  const leaveTimer = useRef(0)

  /* Leave: 'explore' = cinematic transition, 'skip' = quick fade */
  const leave = useCallback(
    (mode) => {
      if (leavingRef.current) return
      leavingRef.current = true
      window.clearTimeout(readyTimer.current)
      markSeen()

      const sound = soundRef.current
      if (sound) {
        if (mode === 'explore') sound.whoosh()
        sound.stop(mode === 'explore' ? 1800 : 800)
        soundRef.current = null
        setSoundOn(false)
      }

      setPhase(mode === 'skip' ? 'skipping' : 'leaving')
      const wait = reduced ? 30 : mode === 'skip' ? SKIP_MS : LEAVE_MS
      leaveTimer.current = window.setTimeout(() => onDone(), wait)
    },
    [onDone, reduced]
  )

  const toggleSound = () => {
    if (soundRef.current) {
      soundRef.current.stop(900)
      soundRef.current = null
      setSoundOn(false)
      return
    }
    const sound = createSound()
    if (sound) {
      soundRef.current = sound
      setSoundOn(true)
    }
  }

  /* Lock page scroll while the intro is on screen; move focus into the dialog */
  useEffect(() => {
    document.body.classList.add('intro-lock')
    if (rootRef.current) rootRef.current.focus({ preventScroll: true })
    return () => {
      document.body.classList.remove('intro-lock')
      window.clearTimeout(readyTimer.current)
      window.clearTimeout(leaveTimer.current)
      if (soundRef.current) {
        soundRef.current.stop(900)
        soundRef.current = null
      }
    }
  }, [])

  /* Wait for the two brand fonts (max 1.2s) so the reveal never swaps fonts mid-animation */
  useEffect(() => {
    if (reduced) return undefined
    let cancelled = false
    const go = () => {
      if (!cancelled) setStarted(true)
    }
    const fallback = window.setTimeout(go, 1200)
    if (document.fonts && document.fonts.load) {
      Promise.all([
        document.fonts.load('600 48px "Playfair Display"'),
        document.fonts.load('500 14px "Inter"'),
      ])
        .then(go)
        .catch(go)
    } else {
      go()
    }
    return () => {
      cancelled = true
      window.clearTimeout(fallback)
    }
  }, [reduced])

  /* Timeline: EXPLORE becomes clickable once it has appeared */
  useEffect(() => {
    if (!started || reduced) return undefined
    readyTimer.current = window.setTimeout(() => {
      setPhase((p) => (p === 'intro' ? 'ready' : p))
    }, READY_MS)
    return () => window.clearTimeout(readyTimer.current)
  }, [started, reduced])

  useEffect(() => {
    if (phase === 'ready' && ctaRef.current) ctaRef.current.focus({ preventScroll: true })
  }, [phase])

  /* Keyboard: Esc skips, Tab stays inside the dialog */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        leave('skip')
        return
      }
      if (e.key !== 'Tab') return
      const root = rootRef.current
      if (!root) return
      const items = Array.from(root.querySelectorAll('button:not([disabled])'))
      if (!items.length) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      const outside = !root.contains(active) || active === root
      if (e.shiftKey && (active === first || outside)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [leave])

  /* Particle field: sprites + simple perspective projection, additive blending */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const NEAR = 0.25
    const FAR = 1.7
    const SPEED = 0.045

    const makeSprite = (rgb) => {
      const c = document.createElement('canvas')
      c.width = 64
      c.height = 64
      const g = c.getContext('2d')
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
      grad.addColorStop(0, `rgba(${rgb},1)`)
      grad.addColorStop(0.25, `rgba(${rgb},0.55)`)
      grad.addColorStop(1, `rgba(${rgb},0)`)
      g.fillStyle = grad
      g.fillRect(0, 0, 64, 64)
      return c
    }
    const sprites = [makeSprite('169,207,255'), makeSprite('40,123,255'), makeSprite('234,242,255')]

    let w = window.innerWidth
    let h = window.innerHeight
    let dpr = 1
    let raf = 0
    let last = 0
    let t = 0
    let hasPointer = false
    let parts = []
    const cam = { x: 0, y: 0, tx: 0, ty: 0 }

    const rand = (a, b) => a + Math.random() * (b - a)
    const focal = () => Math.min(w, h) * 0.62

    const spawn = (initial) => {
      const z = initial ? rand(NEAR, FAR) : rand(FAR - 0.15, FAR)
      const f = focal()
      const roll = Math.random()
      return {
        x: rand(-1, 1) * ((w / 2) / f) * z * 1.15,
        y: rand(-1, 1) * ((h / 2) / f) * z * 1.15,
        z,
        s: rand(0.6, 1.5),
        c: roll < 0.6 ? 0 : roll < 0.88 ? 1 : 2,
        ph: rand(0, Math.PI * 2),
        sp: rand(0.6, 1.4),
      }
    }

    const draw = (dt) => {
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'

      if (!hasPointer) {
        cam.tx = Math.sin(t * 0.15) * 0.09
        cam.ty = Math.cos(t * 0.11) * 0.05
      }
      const ease = Math.min(1, dt * 2.2)
      cam.x += (cam.tx - cam.x) * ease
      cam.y += (cam.ty - cam.y) * ease

      const f = focal()
      const cx = w / 2
      const cy = h * 0.46

      for (let i = 0; i < parts.length; i += 1) {
        const p = parts[i]
        p.z -= dt * SPEED
        p.ph += dt * 0.4 * p.sp
        if (p.z < NEAR) {
          parts[i] = spawn(false)
          continue
        }
        const k = f / p.z
        const sx = cx + (p.x + Math.sin(p.ph) * 0.03 - cam.x) * k
        const sy = cy + (p.y + Math.cos(p.ph * 0.8) * 0.03 - cam.y) * k
        if (sx < -40 || sx > w + 40 || sy < -40 || sy > h + 40) continue

        const depth = (p.z - NEAR) / (FAR - NEAR) // 0 near .. 1 far
        const fadeIn = Math.min(1, (FAR - p.z) / 0.25)
        const fadeOut = Math.min(1, (p.z - NEAR) / 0.18)
        const twinkle = 0.78 + 0.22 * Math.sin(p.ph * 3)
        const alpha = (0.2 + 0.8 * (1 - depth)) * fadeIn * fadeOut * twinkle * 0.8
        const size = Math.max(3, p.s * k * 0.035)

        ctx.globalAlpha = alpha
        ctx.drawImage(sprites[p.c], sx - size / 2, sy - size / 2, size, size)
      }
      ctx.globalAlpha = 1
    }

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const target = Math.min(w < 700 ? 70 : 130, Math.round((w * h) / 13000))
      while (parts.length < target) parts.push(spawn(true))
      if (parts.length > target) parts = parts.slice(0, target)

      if (reduced) draw(0)
    }

    const loop = (now) => {
      raf = window.requestAnimationFrame(loop)
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016)
      last = now
      t += dt
      draw(dt)
    }
    const startLoop = () => {
      if (reduced || raf) return
      last = performance.now()
      raf = window.requestAnimationFrame(loop)
    }
    const stopLoop = () => {
      window.cancelAnimationFrame(raf)
      raf = 0
    }
    const onVisibility = () => (document.hidden ? stopLoop() : startLoop())
    const onPointer = (e) => {
      if (e.pointerType !== 'mouse') return
      hasPointer = true
      cam.tx = (e.clientX / w - 0.5) * 0.22
      cam.ty = (e.clientY / h - 0.5) * 0.14
    }

    resize()
    startLoop()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stopLoop()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduced])

  const className = ['cin', `cin--${phase}`, !started && 'cin--wait', reduced && 'cin--reduced']
    .filter(Boolean)
    .join(' ')
  const leaving = phase === 'leaving' || phase === 'skipping'

  return (
    <div
      ref={rootRef}
      className={className}
      role="dialog"
      aria-modal="true"
      aria-label="PRESORA introduction"
      tabIndex={-1}
    >
      <div className="cin__bg" aria-hidden="true">
        <div className="cin__base" />
        <div className="cin__rays" />
        <div className="cin__glow" />
        <canvas ref={canvasRef} className="cin__canvas" />
        <div className="cin__vignette" />
        <div className="cin__dark" />
      </div>

      <div className="cin__stage">
        <div className="cin__logo">
          <span className="cin__sr">PRESORA</span>
          <span className="cin__word" data-text="PRESORA" aria-hidden="true">
            {WORD.map((ch, i) => (
              <span key={i} className="cin__ch" style={{ '--i': i }}>
                {ch}
              </span>
            ))}
          </span>
          <span className="cin__flare" aria-hidden="true">
            <span className="cin__streak" />
            <span className="cin__orb" />
            <span className="cin__ghost" />
            <span className="cin__ghost cin__ghost--b" />
          </span>
        </div>

        <span className="cin__rule" aria-hidden="true" />

        <p className="cin__tagline">
          <span className="cin__sr">YOUR VISION. YOUR WORLD.</span>
          {SENTENCES.map((sentence, si) => (
            <span key={sentence} className="cin__sent" aria-hidden="true">
              {Array.from(sentence).map((ch, ci) => (
                <span
                  key={ci}
                  className="cin__tch"
                  style={{ '--i': (si ? SENTENCES[0].length : 0) + ci }}
                >
                  {ch === ' ' ? '\u00A0' : ch}
                </span>
              ))}
            </span>
          ))}
        </p>

        <p className="cin__sign">MADE BY MOTAZ SOUIDI</p>

        <button
          ref={ctaRef}
          type="button"
          className="cin__cta"
          disabled={phase !== 'ready'}
          onClick={() => leave('explore')}
        >
          <span className="cin__cta-label">EXPLORE PRESORA</span>
          <svg
            className="cin__arrow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 12h15" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      <div className="cin__bar">
        <button
          type="button"
          className="cin__mini"
          onClick={toggleSound}
          aria-pressed={soundOn}
          disabled={leaving}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 9v6h4l5 4V5L8 9H4z" />
            {soundOn ? (
              <>
                <path d="M16.5 8.5a5 5 0 0 1 0 7" />
                <path d="M19 6a8.5 8.5 0 0 1 0 12" />
              </>
            ) : (
              <path d="M17 9l5 6M22 9l-5 6" />
            )}
          </svg>
          {soundOn ? 'SOUND ON' : 'SOUND OFF'}
        </button>

        <button type="button" className="cin__mini" onClick={() => leave('skip')} disabled={leaving}>
          SKIP INTRO
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 5l7 7-7 7" />
            <path d="M13 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="cin__bloom" aria-hidden="true" />
    </div>
  )
}
