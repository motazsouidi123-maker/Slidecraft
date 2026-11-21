import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Section } from './ui.jsx'
import './showcase3d.css'

/* ==================================================================
   3D PRESENTATION SHOWCASE
   - Perspective carousel with real slide thickness (front, back, edges)
   - Drag / swipe / keyboard / buttons / scrubber navigation
   - Click or tap the centre slide for a fullscreen zoomable preview
   - Falls back to a native scroll-snap 2D strip when 3D is unsupported,
     slow, or when the visitor prefers reduced motion
   Slides are supplied by the parent (renderSlide), so there is no
   circular import and the existing Slide markup is reused as-is.
================================================================== */

const MODE_KEY = 'presora-gallery-mode'
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const pad = (n) => String(n).padStart(2, '0')

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function readSavedMode() {
  try {
    const v = window.localStorage.getItem(MODE_KEY)
    return v === '3d' || v === '2d' ? v : null
  } catch {
    return null
  }
}

function saveMode(mode) {
  try {
    window.localStorage.setItem(MODE_KEY, mode)
  } catch {
    /* storage may be unavailable; the choice still applies for this visit */
  }
}

/* Decide the starting mode: 3D only when the device can plausibly handle it. */
function capable3D() {
  if (typeof window === 'undefined') return false
  const css = window.CSS
  if (!css || !css.supports) return false
  if (!css.supports('transform-style', 'preserve-3d') || !css.supports('perspective', '1px')) return false
  const nav = window.navigator || {}
  if (nav.connection && nav.connection.saveData) return false
  if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2) return false
  if (nav.deviceMemory && nav.deviceMemory <= 2) return false
  return true
}

function initialMode() {
  const saved = readSavedMode()
  if (saved) return saved
  if (reducedMotion()) return '2d'
  return capable3D() ? '3d' : '2d'
}

/* ------------------------------------------------------------------
   Icons (inline SVG, decorative)
------------------------------------------------------------------- */
const Svg = ({ children, ...p }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...p}>
    {children}
  </svg>
)
const IconPlus = () => <Svg><path d="M12 5v14M5 12h14" /></Svg>
const IconMinus = () => <Svg><path d="M5 12h14" /></Svg>
const IconClose = () => <Svg><path d="M6 6l12 12M18 6L6 18" /></Svg>
const IconReset = () => <Svg><path d="M4 12a8 8 0 1 0 2.6-5.9" /><path d="M4 4v4.6h4.6" /></Svg>
const IconExpand = () => <Svg><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></Svg>
const IconPrev = () => <Svg><path d="M15 5l-7 7 7 7" /></Svg>
const IconNext = () => <Svg><path d="M9 5l7 7-7 7" /></Svg>

/* ------------------------------------------------------------------
   3D carousel engine (no React re-render per frame)
------------------------------------------------------------------- */
function useCarousel3D({ enabled, count, resetKey, stageRef, worldRef, cardRefs, shadeRefs, onActive, onOpen, onSlow, monitor }) {
  const st = useRef({
    pos: 0,
    target: 0,
    dragging: false,
    down: null,
    raf: 0,
    last: 0,
    w: 560,
    compact: false,
    tx: 0,
    ty: 0,
    tiltX: 0,
    tiltY: 0,
    slow: 0,
    active: 0,
  }).current

  const cb = useRef({})
  cb.current = { onActive, onOpen, onSlow }
  const live = useRef({})
  live.current = { count, monitor, enabled }

  const unit = () => st.w * (st.compact ? 0.56 : 0.6)

  const apply = useCallback(() => {
    const n = live.current.count
    const W = st.w
    const compact = st.compact
    const vis = compact ? 2.7 : 4.2
    for (let i = 0; i < n; i += 1) {
      const el = cardRefs.current[i]
      if (!el) continue
      const o = i - st.pos
      const ax = Math.abs(o)
      if (ax > vis) {
        if (el.dataset.hid !== '1') {
          el.style.visibility = 'hidden'
          el.dataset.hid = '1'
        }
        continue
      }
      if (el.dataset.hid === '1') {
        el.style.visibility = 'visible'
        el.dataset.hid = '0'
      }
      const sg = o < 0 ? -1 : 1
      const near = Math.min(ax, 1)
      const far = Math.max(ax - 1, 0)
      const x = sg * (near * W * (compact ? 0.56 : 0.6) + far * W * (compact ? 0.2 : 0.24))
      const z = -(near * (compact ? 110 : 160) + far * 70)
      const ry = -sg * (near * (compact ? 34 : 40) + Math.min(far, 2) * 3)
      const sc = 1 - Math.min(ax, 3) * 0.05
      const fade = ax > vis - 1 ? clamp(vis - ax, 0, 1) : 1
      el.style.transform = `translate3d(${x.toFixed(1)}px,0,${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) scale(${sc.toFixed(3)})`
      el.style.opacity = fade >= 1 ? '' : fade.toFixed(3)
      el.style.zIndex = String(100 - Math.round(ax * 10))
      const sh = shadeRefs.current[i]
      if (sh) sh.style.opacity = (Math.min(ax, 2.2) * 0.26).toFixed(3)
    }
  }, [cardRefs, shadeRefs, st])

  const tick = useCallback(
    (t) => {
      st.raf = 0
      const raw = st.last ? t - st.last : 16
      st.last = t
      const dt = Math.min(raw, 64) / 1000
      const reduced = reducedMotion()
      let moving = false

      if (st.dragging) {
        moving = true
      } else {
        const d = st.target - st.pos
        if (reduced || Math.abs(d) < 0.0008) {
          st.pos = st.target
        } else {
          st.pos += d * (1 - Math.exp(-dt * 7.5))
          moving = true
        }
      }

      const ddx = st.tx - st.tiltX
      const ddy = st.ty - st.tiltY
      if (!reduced && (Math.abs(ddx) > 0.001 || Math.abs(ddy) > 0.001)) {
        const k = 1 - Math.exp(-dt * 6)
        st.tiltX += ddx * k
        st.tiltY += ddy * k
        moving = true
      } else {
        st.tiltX = st.tx
        st.tiltY = st.ty
      }

      const world = worldRef.current
      if (world) {
        world.style.transform = `rotateX(${(-st.tiltY * 3.2).toFixed(2)}deg) rotateY(${(st.tiltX * 5).toFixed(2)}deg)`
      }
      apply()

      const idx = clamp(Math.round(st.pos), 0, live.current.count - 1)
      const activeEl = cardRefs.current[idx]
      if (activeEl) {
        activeEl.style.setProperty('--gx', `${(50 + st.tiltX * 38).toFixed(1)}%`)
        activeEl.style.setProperty('--gy', `${(34 + st.tiltY * 30).toFixed(1)}%`)
      }
      if (idx !== st.active) {
        st.active = idx
        cb.current.onActive(idx)
      }

      /* Frame-time watchdog: sustained slow frames while animating => 2D fallback */
      if (live.current.monitor && moving && raw > 0 && raw < 500) {
        if (raw > 42) st.slow += 1
        else st.slow = Math.max(0, st.slow - 1)
        if (st.slow >= 14) {
          st.slow = 0
          cb.current.onSlow()
        }
      }

      if (moving) st.raf = requestAnimationFrame(tick)
      else st.last = 0
    },
    [apply, cardRefs, st, worldRef]
  )

  const kick = useCallback(() => {
    if (!st.raf) st.raf = requestAnimationFrame(tick)
  }, [st, tick])

  const goTo = useCallback(
    (i) => {
      st.target = clamp(Math.round(i), 0, live.current.count - 1)
      kick()
    },
    [kick, st]
  )

  /* measure + (re)apply on resize */
  useLayoutEffect(() => {
    if (!enabled) return undefined
    const stage = stageRef.current
    const measure = () => {
      const first = cardRefs.current.find(Boolean)
      if (first && first.offsetWidth) st.w = first.offsetWidth
      st.compact = !!stage && stage.clientWidth < 640
      apply()
    }
    measure()
    let ro
    if (typeof ResizeObserver !== 'undefined' && stage) {
      ro = new ResizeObserver(measure)
      ro.observe(stage)
    } else {
      window.addEventListener('resize', measure)
    }
    return () => {
      if (ro) ro.disconnect()
      else window.removeEventListener('resize', measure)
      cancelAnimationFrame(st.raf)
      st.raf = 0
      st.last = 0
    }
  }, [enabled, apply, cardRefs, stageRef, st])

  /* reset position when the slide list changes (filter) */
  useLayoutEffect(() => {
    if (!enabled) return
    st.pos = 0
    st.target = 0
    st.active = 0
    cb.current.onActive(0)
    apply()
  }, [resetKey, enabled, apply, st])

  /* ------- pointer handling ------- */
  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const now = performance.now()
    st.down = { id: e.pointerId, x: e.clientX, y: e.clientY, pos: st.pos, target: e.target, samples: [{ t: now, x: e.clientX }] }
  }

  const onPointerMove = (e) => {
    const d = st.down
    const stage = stageRef.current
    if (d && d.id === e.pointerId) {
      const dx = e.clientX - d.x
      const dy = e.clientY - d.y
      if (!st.dragging) {
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.1) {
          st.dragging = true
          try {
            stage.setPointerCapture(e.pointerId)
          } catch {
            /* pointer may already be released */
          }
          stage.classList.add('is-dragging')
        } else if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
          st.down = null /* vertical intent: leave it to normal page scrolling */
          return
        }
      }
      if (st.dragging) {
        const n = live.current.count
        let p = d.pos - dx / unit()
        if (p < 0) p *= 0.35
        if (p > n - 1) p = n - 1 + (p - (n - 1)) * 0.35
        st.pos = p
        st.target = p
        d.samples.push({ t: performance.now(), x: e.clientX })
        if (d.samples.length > 6) d.samples.shift()
        kick()
      }
      return
    }
    if (e.pointerType === 'mouse' && !reducedMotion() && stage) {
      const r = stage.getBoundingClientRect()
      st.tx = clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1)
      st.ty = clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1, 1)
      kick()
    }
  }

  const finish = (e, cancelled) => {
    const d = st.down
    if (!d || d.id !== e.pointerId) return
    st.down = null
    const stage = stageRef.current
    if (st.dragging) {
      st.dragging = false
      if (stage) {
        stage.classList.remove('is-dragging')
        try {
          stage.releasePointerCapture(e.pointerId)
        } catch {
          /* ignore */
        }
      }
      const s = d.samples
      let v = 0
      if (s.length > 1) {
        const a = s[0]
        const b = s[s.length - 1]
        if (b.t - a.t > 0) v = (b.x - a.x) / (b.t - a.t) /* px per ms */
      }
      const cards = (-v * 1000) / unit()
      const base = Math.round(st.pos)
      st.target = clamp(clamp(Math.round(st.pos + cards * 0.22), base - 3, base + 3), 0, live.current.count - 1)
      kick()
    } else if (!cancelled) {
      const card = d.target && d.target.closest ? d.target.closest('[data-i]') : null
      if (card) {
        const i = Number(card.dataset.i)
        if (i === Math.round(st.pos)) cb.current.onOpen(i, card)
        else goTo(i)
      }
    }
  }

  const handlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp: (e) => finish(e, false),
    onPointerCancel: (e) => finish(e, true),
    onPointerLeave: (e) => {
      if (e.pointerType === 'mouse') {
        st.tx = 0
        st.ty = 0
        kick()
      }
    },
  }

  return { goTo, handlers }
}

/* ------------------------------------------------------------------
   Fullscreen zoom viewer (touch + desktop)
------------------------------------------------------------------- */
const MIN_ZOOM = 1
const MAX_ZOOM = 5

function ZoomViewer({ items, index, onIndex, onClose, renderSlide, originRect }) {
  const item = items[index]
  const dialogRef = useRef(null)
  const stageRef = useRef(null)
  const panelRef = useRef(null)
  const view = useRef({ s: 1, x: 0, y: 0 })
  const pointers = useRef(new Map())
  const gesture = useRef(null)
  const lastTap = useRef({ t: 0, x: 0, y: 0 })
  const [pct, setPct] = useState(100)
  const [closing, setClosing] = useState(false)
  const reduced = reducedMotion()

  const paint = useCallback((animate) => {
    const el = panelRef.current
    if (!el) return
    const v = view.current
    el.style.transition = animate && !reducedMotion() ? 'transform .28s cubic-bezier(.22,1,.36,1)' : 'none'
    el.style.transform = `translate3d(${v.x.toFixed(1)}px,${v.y.toFixed(1)}px,0) scale(${v.s.toFixed(4)})`
    setPct(Math.round(v.s * 100))
  }, [])

  const bounds = useCallback((s) => {
    const el = panelRef.current
    const stage = stageRef.current
    if (!el || !stage) return { mx: 0, my: 0 }
    const r = stage.getBoundingClientRect()
    return {
      mx: Math.max(0, (el.offsetWidth * s - r.width) / 2),
      my: Math.max(0, (el.offsetHeight * s - r.height) / 2),
    }
  }, [])

  const setView = useCallback(
    (s, x, y, animate = false) => {
      const ns = clamp(s, MIN_ZOOM, MAX_ZOOM)
      const { mx, my } = bounds(ns)
      view.current = { s: ns, x: ns <= 1.001 ? 0 : clamp(x, -mx, mx), y: ns <= 1.001 ? 0 : clamp(y, -my, my) }
      paint(animate)
    },
    [bounds, paint]
  )

  const toStageCenter = (cx, cy) => {
    const r = stageRef.current.getBoundingClientRect()
    return { x: cx - (r.left + r.width / 2), y: cy - (r.top + r.height / 2) }
  }

  const zoomAt = useCallback(
    (nextScale, cx, cy, animate = false) => {
      const v = view.current
      const s2 = clamp(nextScale, MIN_ZOOM, MAX_ZOOM)
      const a = cx === undefined ? { x: 0, y: 0 } : toStageCenter(cx, cy)
      const k = s2 / v.s
      setView(s2, a.x - (a.x - v.x) * k, a.y - (a.y - v.y) * k, animate)
    },
    [setView]
  )

  const reset = useCallback(() => setView(1, 0, 0, true), [setView])

  const requestClose = useCallback(() => {
    if (closing) return
    if (reducedMotion()) {
      onClose()
      return
    }
    setClosing(true)
    window.setTimeout(onClose, 170)
  }, [closing, onClose])

  const go = useCallback(
    (d) => {
      const n = clamp(index + d, 0, items.length - 1)
      if (n !== index) onIndex(n)
    },
    [index, items.length, onIndex]
  )

  /* new slide => reset zoom */
  useLayoutEffect(() => {
    view.current = { s: 1, x: 0, y: 0 }
    paint(false)
  }, [index, paint])

  /* opening animation from the clicked card (skipped for reduced motion) */
  useLayoutEffect(() => {
    const el = panelRef.current
    if (!el || reduced || !originRect || !el.animate) return
    const to = el.getBoundingClientRect()
    if (!to.width) return
    const sx = clamp(originRect.width / to.width, 0.2, 1)
    const dx = originRect.left + originRect.width / 2 - (to.left + to.width / 2)
    const dy = originRect.top + originRect.height / 2 - (to.top + to.height / 2)
    el.animate(
      [
        { transform: `translate3d(${dx}px,${dy}px,0) scale(${sx})`, opacity: 0.55 },
        { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 },
      ],
      { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)' }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* scroll lock, aria-hidden background, focus management */
  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    const prevOverflow = root.style.overflow
    const prevPad = body.style.paddingRight
    const sw = window.innerWidth - root.clientWidth
    root.style.overflow = 'hidden'
    if (sw > 0) body.style.paddingRight = `${sw}px`
    const appRoot = document.getElementById('root')
    if (appRoot) appRoot.setAttribute('aria-hidden', 'true')
    const opener = document.activeElement
    const first = dialogRef.current && (dialogRef.current.querySelector('.s3d-ic-close') || dialogRef.current.querySelector('button'))
    if (first) first.focus({ preventScroll: true })
    return () => {
      root.style.overflow = prevOverflow
      body.style.paddingRight = prevPad
      if (appRoot) appRoot.removeAttribute('aria-hidden')
      if (opener && opener.focus) {
        try {
          opener.focus({ preventScroll: true })
        } catch {
          /* ignore */
        }
      }
    }
  }, [])

  /* keyboard: Esc, arrows, +, -, 0, focus trap */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        requestClose()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        go(-1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        go(1)
      } else if ((e.key === '+' || e.key === '=') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        zoomAt(view.current.s * 1.4, undefined, undefined, true)
      } else if ((e.key === '-' || e.key === '_') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        zoomAt(view.current.s / 1.4, undefined, undefined, true)
      } else if (e.key === '0' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        reset()
      } else if (e.key === 'Tab') {
        const nodes = dialogRef.current ? dialogRef.current.querySelectorAll('button:not([disabled])') : []
        if (!nodes.length) return
        const a = nodes[0]
        const b = nodes[nodes.length - 1]
        if (!dialogRef.current.contains(document.activeElement)) {
          e.preventDefault()
          a.focus()
        } else if (e.shiftKey && document.activeElement === a) {
          e.preventDefault()
          b.focus()
        } else if (!e.shiftKey && document.activeElement === b) {
          e.preventDefault()
          a.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [go, requestClose, reset, zoomAt])

  /* wheel zoom: plain wheel only. Ctrl+wheel / pinch is left to the browser's own page zoom. */
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined
    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey) return
      e.preventDefault()
      zoomAt(view.current.s * Math.exp(-e.deltaY * 0.0018), e.clientX, e.clientY)
    }
    stage.addEventListener('wheel', onWheel, { passive: false })
    return () => stage.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  /* pointer gestures on the slide only (touch-action: none there; the rest of the page keeps native zoom) */
  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const el = panelRef.current
    try {
      el.setPointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const v = view.current
    if (pointers.current.size === 2) {
      const [p1, p2] = [...pointers.current.values()]
      const mid = toStageCenter((p1.x + p2.x) / 2, (p1.y + p2.y) / 2)
      gesture.current = { type: 'pinch', d0: Math.hypot(p1.x - p2.x, p1.y - p2.y) || 1, s0: v.s, mid0: mid, t0: { x: v.x, y: v.y } }
    } else if (pointers.current.size === 1) {
      gesture.current = { type: 'one', x0: e.clientX, y0: e.clientY, t0: { x: v.x, y: v.y }, moved: false, t: performance.now() }
      el.classList.add('is-grabbing')
    }
  }

  const onPointerMove = (e) => {
    const p = pointers.current.get(e.pointerId)
    if (!p) return
    p.x = e.clientX
    p.y = e.clientY
    const g = gesture.current
    if (!g) return
    if (g.type === 'pinch' && pointers.current.size >= 2) {
      const [p1, p2] = [...pointers.current.values()]
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y) || 1
      const s2 = clamp(g.s0 * (dist / g.d0), MIN_ZOOM, MAX_ZOOM)
      const mid = toStageCenter((p1.x + p2.x) / 2, (p1.y + p2.y) / 2)
      const k = s2 / g.s0
      setView(s2, mid.x - (g.mid0.x - g.t0.x) * k, mid.y - (g.mid0.y - g.t0.y) * k)
    } else if (g.type === 'one') {
      const dx = e.clientX - g.x0
      const dy = e.clientY - g.y0
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) g.moved = true
      if (view.current.s > 1.001) {
        setView(view.current.s, g.t0.x + dx, g.t0.y + dy)
      } else if (g.moved) {
        /* at fit size: follow the finger horizontally, decide on release */
        const el = panelRef.current
        el.style.transition = 'none'
        el.style.transform = `translate3d(${(dx * 0.5).toFixed(1)}px,0,0)`
      }
    }
  }

  const onPointerUp = (e) => {
    const p = pointers.current.get(e.pointerId)
    if (!p) return
    const g = gesture.current
    pointers.current.delete(e.pointerId)
    const el = panelRef.current
    try {
      el.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    if (pointers.current.size === 0) el.classList.remove('is-grabbing')

    if (g && g.type === 'one' && pointers.current.size === 0) {
      const dx = e.clientX - g.x0
      const dy = e.clientY - g.y0
      const fit = view.current.s <= 1.001
      if (fit && Math.abs(dx) > 64 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        paint(false)
        go(dx < 0 ? 1 : -1)
        gesture.current = null
        return
      }
      if (fit && g.moved) paint(true) /* snap back */
      if (!g.moved) {
        /* tap / double tap toggles zoom */
        const now = performance.now()
        const lt = lastTap.current
        if (now - lt.t < 320 && Math.hypot(e.clientX - lt.x, e.clientY - lt.y) < 28) {
          if (view.current.s > 1.05) reset()
          else zoomAt(2.6, e.clientX, e.clientY, true)
          lastTap.current = { t: 0, x: 0, y: 0 }
        } else {
          lastTap.current = { t: now, x: e.clientX, y: e.clientY }
        }
      }
    }
    if (pointers.current.size === 1) {
      /* pinch ended with one finger left: continue as a pan from here */
      const [rest] = [...pointers.current.values()]
      const v = view.current
      gesture.current = { type: 'one', x0: rest.x, y0: rest.y, t0: { x: v.x, y: v.y }, moved: true, t: performance.now() }
    } else if (pointers.current.size === 0) {
      gesture.current = null
    }
  }

  const onPointerCancel = (e) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size === 0) {
      gesture.current = null
      panelRef.current.classList.remove('is-grabbing')
      paint(true)
    }
  }

  if (!item) return null

  const dialog = (
    <div
      ref={dialogRef}
      className={`s3d-zoom${closing ? ' is-closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${item.label} · ${item.deck}, slide ${item.index + 1} of ${item.total}. Fullscreen preview`}
    >
      <div className="s3d-zoom-bar">
        <div className="s3d-zoom-title">
          <strong>{item.deck}</strong>
          <span>
            {item.label} · Slide {item.index + 1} of {item.total}
          </span>
        </div>
        <div className="s3d-zoom-tools" role="group" aria-label="Zoom controls">
          <button type="button" className="s3d-ic" onClick={() => zoomAt(view.current.s / 1.4, undefined, undefined, true)} aria-label="Zoom out" disabled={pct <= 100}>
            <IconMinus />
          </button>
          <span className="s3d-pct" aria-live="polite">{pct}%</span>
          <button type="button" className="s3d-ic" onClick={() => zoomAt(view.current.s * 1.4, undefined, undefined, true)} aria-label="Zoom in" disabled={pct >= MAX_ZOOM * 100}>
            <IconPlus />
          </button>
          <button type="button" className="s3d-ic s3d-ic-text" onClick={reset} aria-label="Reset zoom" disabled={pct === 100}>
            <IconReset />
            <span>Reset</span>
          </button>
          <button type="button" className="s3d-ic s3d-ic-text s3d-ic-close" onClick={requestClose} aria-label="Close fullscreen preview">
            <IconClose />
            <span>Close</span>
          </button>
        </div>
      </div>

      <div
        className="s3d-zoom-stage"
        ref={stageRef}
        onClick={(e) => {
          if (e.target === e.currentTarget) requestClose()
        }}
      >
        <div
          className="s3d-zoom-panel"
          ref={panelRef}
          key={index}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        >
          {renderSlide(item.slide, item.index, item.total, item.label)}
        </div>
      </div>

      <div className="s3d-zoom-foot">
        <button type="button" className="s3d-ic s3d-ic-text" onClick={() => go(-1)} disabled={index === 0} aria-label="Previous slide">
          <IconPrev />
          <span>Prev</span>
        </button>
        <span className="s3d-zoom-count">
          {pad(index + 1)} / {pad(items.length)}
        </span>
        <button type="button" className="s3d-ic s3d-ic-text" onClick={() => go(1)} disabled={index === items.length - 1} aria-label="Next slide">
          <span>Next</span>
          <IconNext />
        </button>
      </div>
      <p className="s3d-zoom-hint" aria-hidden="true">
        <span className="s3d-hint-fine">Scroll to zoom · drag to pan · double-click to toggle · Esc to close</span>
        <span className="s3d-hint-touch">Pinch to zoom · drag to pan · double-tap to toggle · swipe for next</span>
      </p>
    </div>
  )

  return createPortal(dialog, document.body)
}

/* ------------------------------------------------------------------
   Gallery
------------------------------------------------------------------- */
function Face({ item, renderSlide }) {
  return <>{renderSlide(item.slide, item.index, item.total, item.label)}</>
}

export default function Showcase3D({ categories, renderSlide }) {
  const [filter, setFilter] = useState('all')
  const [mode, setMode] = useState(initialMode)
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState(null) /* { index, rect } */
  const [notice, setNotice] = useState('')
  const forced = useRef(readSavedMode() === '3d')

  const items = useMemo(() => {
    const list = []
    categories.forEach((c) => {
      if (filter !== 'all' && c.id !== filter) return
      c.slides.forEach((slide, index) => {
        list.push({ key: `${c.id}-${index}`, slide, index, total: c.slides.length, label: c.label, deck: c.deck, catId: c.id })
      })
    })
    return list
  }, [categories, filter])

  const stageRef = useRef(null)
  const worldRef = useRef(null)
  const cardRefs = useRef([])
  const shadeRefs = useRef([])
  const trackRef = useRef(null)
  const flatRefs = useRef([])

  const is3d = mode === '3d'

  const openZoom = useCallback((i, el) => {
    const face = el ? el.querySelector('.s3d-front') || el : null
    const r = face ? face.getBoundingClientRect() : null
    setZoom({ index: i, rect: r ? { left: r.left, top: r.top, width: r.width, height: r.height } : null })
  }, [])

  const carousel = useCarousel3D({
    enabled: is3d,
    count: items.length,
    resetKey: filter,
    stageRef,
    worldRef,
    cardRefs,
    shadeRefs,
    onActive: setActive,
    onOpen: openZoom,
    onSlow: () => {
      setMode('2d')
      setNotice('Switched to the lightweight 2D view to keep things smooth on this device.')
    },
    monitor: !forced.current,
  })

  /* ---- 2D strip helpers ---- */
  const scrollFlat = useCallback((i, smooth = true) => {
    const track = trackRef.current
    const el = flatRefs.current[i]
    if (!track || !el) return
    const left = el.offsetLeft - (track.clientWidth - el.offsetWidth) / 2
    track.scrollTo({ left, behavior: smooth && !reducedMotion() ? 'smooth' : 'auto' })
  }, [])

  const onFlatScroll = useCallback(() => {
    const track = trackRef.current
    if (!track || track._raf) return
    track._raf = requestAnimationFrame(() => {
      track._raf = 0
      const mid = track.scrollLeft + track.clientWidth / 2
      let best = 0
      let dist = Infinity
      flatRefs.current.forEach((el, i) => {
        if (!el) return
        const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid)
        if (d < dist) {
          dist = d
          best = i
        }
      })
      setActive(best)
    })
  }, [])

  useEffect(() => {
    if (is3d) return
    setActive(0)
    const track = trackRef.current
    if (track) track.scrollLeft = 0
  }, [filter, is3d])

  const goTo = useCallback(
    (i) => {
      const n = clamp(i, 0, items.length - 1)
      if (is3d) carousel.goTo(n)
      else {
        setActive(n)
        scrollFlat(n)
      }
    },
    [carousel, is3d, items.length, scrollFlat]
  )

  const switchMode = () => {
    const next = is3d ? '2d' : '3d'
    forced.current = next === '3d'
    saveMode(next)
    setNotice('')
    setMode(next)
    setActive(0)
  }

  const onKeyDown = (e) => {
    if (e.target !== e.currentTarget) return
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      goTo(active + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goTo(active - 1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      goTo(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      goTo(items.length - 1)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const el = is3d ? cardRefs.current[active] : flatRefs.current[active]
      openZoom(active, el)
    }
  }

  const zoomRef = useRef(null)
  zoomRef.current = zoom

  const closeZoom = useCallback(() => {
    const z = zoomRef.current
    setZoom(null)
    /* keep the gallery on the slide that was last viewed */
    if (z) window.setTimeout(() => goTo(z.index), 0)
  }, [goTo])

  /* keep zoom index inside range if the list changes */
  const current = items[clamp(active, 0, Math.max(0, items.length - 1))]

  return (
    <Section id="showcase3d" className="s3d-section">
      <div className="showcase-head">
        <span className="eyebrow">3D Showcase</span>
        <h2 className="showcase-title">STEP INSIDE THE DECK.</h2>
        <p className="section-intro">
          Drag, swipe or use the arrows to move through original sample slides in real depth. Tap the centre slide to
          open a fullscreen preview you can zoom and pan.
        </p>
      </div>

      <div className="showcase-tabs s3d-filters" role="group" aria-label="Filter the 3D gallery by category">
        {[{ id: 'all', label: 'All' }, ...categories.map((c) => ({ id: c.id, label: c.label }))].map((c) => (
          <button
            key={c.id}
            type="button"
            className={c.id === filter ? 'active' : ''}
            aria-pressed={c.id === filter}
            onClick={() => setFilter(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="s3d" data-mode={mode} role="region" aria-roledescription="carousel" aria-label="3D presentation gallery">
        {is3d ? (
          <div
            className="s3d-stage"
            ref={stageRef}
            tabIndex={0}
            onKeyDown={onKeyDown}
            aria-label="Slide gallery. Use left and right arrow keys to browse, Enter to open fullscreen."
            {...carousel.handlers}
          >
            <div className="s3d-glow" aria-hidden="true" />
            <div className="s3d-world" ref={worldRef}>
              {items.map((item, i) => (
                <div
                  className="s3d-card"
                  key={item.key}
                  data-i={i}
                  ref={(el) => {
                    cardRefs.current[i] = el
                  }}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${item.deck}, slide ${item.index + 1} of ${item.total}`}
                  aria-hidden={i === active ? undefined : 'true'}
                >
                  <div className="s3d-body">
                    <span className="s3d-edge s3d-edge-l" />
                    <span className="s3d-edge s3d-edge-r" />
                    <span className="s3d-back" />
                    <div className="s3d-front">
                      <Face item={item} renderSlide={renderSlide} />
                      <span className="s3d-sheen" />
                      <span
                        className="s3d-shade"
                        ref={(el) => {
                          shadeRefs.current[i] = el
                        }}
                      />
                    </div>
                    <span className="s3d-shadow" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="s3d-track"
            ref={trackRef}
            tabIndex={0}
            onScroll={onFlatScroll}
            onKeyDown={onKeyDown}
            aria-label="Slide strip. Swipe or scroll sideways to browse, Enter to open fullscreen."
          >
            {items.map((item, i) => (
              <div
                className={`s3d-flat${i === active ? ' is-active' : ''}`}
                key={item.key}
                ref={(el) => {
                  flatRefs.current[i] = el
                }}
                role="button"
                tabIndex={0}
                aria-label={`Open fullscreen preview: ${item.deck}, slide ${item.index + 1} of ${item.total}`}
                onClick={(e) => openZoom(i, e.currentTarget)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openZoom(i, e.currentTarget)
                  }
                }}
              >
                <Face item={item} renderSlide={renderSlide} />
              </div>
            ))}
          </div>
        )}

        <div className="s3d-meta">
          <div className="s3d-caption" aria-live="polite" aria-atomic="true">
            <strong>{current ? current.deck : ''}</strong>
            <span>
              {current ? `${current.label} · Slide ${current.index + 1} of ${current.total}` : ''}
            </span>
          </div>
          <span className="s3d-count" aria-hidden="true">
            {pad(Math.min(active + 1, items.length))} / {pad(items.length)}
          </span>
        </div>

        <div className="s3d-controls">
          <button type="button" className="s3d-ic s3d-ic-text" onClick={() => goTo(active - 1)} disabled={active <= 0} aria-label="Previous slide">
            <IconPrev />
            <span>Prev</span>
          </button>

          <label className="s3d-scrub">
            <span className="sr-only">Browse slides</span>
            <input
              type="range"
              min={0}
              max={Math.max(0, items.length - 1)}
              step={1}
              value={Math.min(active, Math.max(0, items.length - 1))}
              onChange={(e) => goTo(Number(e.target.value))}
              aria-valuetext={current ? `${current.deck}, slide ${current.index + 1} of ${current.total}` : undefined}
            />
          </label>

          <button type="button" className="s3d-ic s3d-ic-text" onClick={() => goTo(active + 1)} disabled={active >= items.length - 1} aria-label="Next slide">
            <span>Next</span>
            <IconNext />
          </button>

          <button
            type="button"
            className="s3d-ic s3d-ic-text s3d-ic-accent"
            onClick={() => openZoom(active, (is3d ? cardRefs.current[active] : flatRefs.current[active]) || null)}
            aria-label="Open fullscreen preview"
          >
            <IconExpand />
            <span>Fullscreen</span>
          </button>

          <button type="button" className="s3d-ic s3d-ic-text" onClick={switchMode} aria-pressed={is3d} aria-label={is3d ? 'Switch to simple 2D view' : 'Switch to 3D view'}>
            <span className="s3d-mode">{is3d ? '3D' : '2D'}</span>
            <span>{is3d ? 'Use 2D' : 'Use 3D'}</span>
          </button>
        </div>

        <p className="s3d-hint">
          <span className="s3d-hint-fine">Drag, use ← → keys, or move your mouse for perspective.</span>
          <span className="s3d-hint-touch">Swipe sideways to browse. Tap the centre slide to zoom.</span>
        </p>
        {notice && (
          <p className="s3d-notice" role="status">
            {notice}
          </p>
        )}
      </div>

      <p className="showcase-note">Original sample content for illustration. These are not client projects.</p>

      {zoom && items.length > 0 && (
        <ZoomViewer
          items={items}
          index={clamp(zoom.index, 0, items.length - 1)}
          onIndex={(n) => setZoom((z) => (z ? { ...z, index: n, rect: null } : z))}
          onClose={closeZoom}
          renderSlide={renderSlide}
          originRect={zoom.rect}
        />
      )}
    </Section>
  )
}
