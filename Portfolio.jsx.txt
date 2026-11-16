import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useSpring, useMotionTemplate, useReducedMotion } from 'framer-motion'
import { SlideArt, sampleStyles } from './ui'

const items = sampleStyles.map((s, k) => ({ ...s, k }))
const cats = ['All', ...Array.from(new Set(items.map(s => s.c)))]
const ctl = 'grid h-11 w-11 place-items-center border border-champ/40 text-silver transition hover:border-champ hover:text-snow focus-visible:border-gold'

/* Draws one of the original sample slides at a fixed size and scales it to its box, so text stays in proportion. */
function Stage({ k, className = '' }) {
  const box = useRef(null)
  const [W, setW] = useState(800), [sc, setSc] = useState(0.4)
  useEffect(() => {
    const el = box.current
    const calc = () => { const w = window.innerWidth >= 640 ? 800 : 520; setW(w); setSc((el.clientWidth || w) / w) }
    calc()
    const ro = new ResizeObserver(calc); ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={box} className={`relative aspect-video w-full overflow-hidden ${className}`}>
      <div style={{ width: W, height: (W * 9) / 16, transform: `scale(${sc})`, transformOrigin: 'top left' }}><SlideArt k={k} /></div>
    </div>
  )
}

function Card({ s, onOpen }) {
  const off = useReducedMotion()
  const rx = useMotionValue(0), ry = useMotionValue(0), gx = useMotionValue(50), gy = useMotionValue(50)
  const srx = useSpring(rx, { stiffness: 160, damping: 16 }), sry = useSpring(ry, { stiffness: 160, damping: 16 })
  const glare = useMotionTemplate`radial-gradient(240px circle at ${gx}% ${gy}%, rgba(233,201,154,.20), transparent 62%)`
  const move = e => {
    if (off || e.pointerType === 'touch') return
    const b = e.currentTarget.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height
    ry.set((x - 0.5) * 12); rx.set((0.5 - y) * 10); gx.set(x * 100); gy.set(y * 100)
  }
  const leave = () => { rx.set(0); ry.set(0); gx.set(50); gy.set(50) }
  return (
    <motion.button type="button" onClick={onOpen} onPointerMove={move} onPointerLeave={leave} aria-label={`Open sample design: ${s.n}`}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      className="gborder group relative block w-full bg-[#0a0705] p-3 text-start outline-none focus-visible:ring-1 focus-visible:ring-gold">
      <Stage k={s.k} className="border border-champ/25" />
      <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: glare }} />
      <span className="mt-4 flex items-start justify-between gap-3 px-1 pb-1">
        <span>
          <span className="font-display block text-2xl font-semibold leading-tight">{s.n}</span>
          <span className="mt-2 flex gap-1.5" aria-hidden="true">{s.p.map(c => <span key={c} className="h-3.5 w-3.5 rounded-full border border-white/20" style={{ background: c }} />)}</span>
        </span>
        <span className="mt-1 whitespace-nowrap border border-gold/50 px-2 py-1 text-[9px] uppercase tracking-[.2em] text-goldlight">{s.c}</span>
      </span>
    </motion.button>
  )
}

function Viewer({ list, index, setIndex, onClose }) {
  const dlg = useRef(null), [dir, setDir] = useState(1)
  const n = list.length, s = list[index]
  const step = d => { setDir(d); setIndex((index + d + n) % n) }
  const jump = k => { setDir(k > index ? 1 : -1); setIndex(k) }

  useEffect(() => {
    const prev = document.activeElement, prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (dlg.current) dlg.current.focus()
    return () => { document.body.style.overflow = prevOverflow; if (prev && prev.focus) prev.focus() }
  }, [])

  const onKey = e => {
    if (e.key === 'Escape') { e.stopPropagation(); onClose() }
    else if (e.key === 'ArrowRight') step(1)
    else if (e.key === 'ArrowLeft') step(-1)
    else if (e.key === 'Tab' && dlg.current) {
      const f = dlg.current.querySelectorAll('a[href],button:not([disabled])')
      if (!f.length) return
      const first = f[0], last = f[f.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dlg.current)) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  }
  const v = { enter: d => ({ x: `${d * 40}%`, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: d => ({ x: `${-d * 25}%`, opacity: 0 }) }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-ink/90 p-3 backdrop-blur-md sm:p-6">
      <motion.div ref={dlg} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`${s.n} sample design`} onKeyDown={onKey}
        initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.98 }} transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
        className="gborder relative my-auto w-full max-w-4xl bg-[#0a0705] p-4 outline-none sm:p-8">
        <button type="button" onClick={onClose} aria-label="Close" className={`${ctl} absolute right-3 top-3 z-10 bg-ink/80`}>✕</button>
        <div className="relative aspect-video w-full overflow-hidden border border-champ/30 shadow-2xl shadow-black">
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div key={s.k} custom={dir} variants={v} initial="enter" animate="center" exit="exit" transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }} className="absolute inset-0"><Stage k={s.k} /></motion.div>
          </AnimatePresence>
          <span className="absolute left-3 top-3 bg-ink/80 px-2 py-1 text-[9px] uppercase tracking-[.2em] text-silver">Sample design</span>
        </div>
        <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="min-h-[6.5rem]">
            <p className="font-display text-3xl font-semibold">{s.n}</p>
            <p className="mt-1 max-w-md text-sm text-silver/70">{s.d}</p>
            <div className="mt-3 flex items-center gap-2" aria-label="Colour palette">{s.p.map(c => <span key={c} title={c} className="h-5 w-5 rounded-full border border-white/20" style={{ background: c }} />)}</div>
          </div>
          <div className="flex flex-col gap-4 md:items-end">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => step(-1)} aria-label="Previous design" className={ctl}>←</button>
              <div className="flex gap-2">{list.map((x, k) => <button type="button" key={x.n} onClick={() => jump(k)} aria-label={`Design ${k + 1}: ${x.n}`} aria-current={k === index} className={`h-1.5 transition-all ${k === index ? 'w-6 bg-gold' : 'w-1.5 bg-stone'}`} />)}</div>
              <button type="button" onClick={() => step(1)} aria-label="Next design" className={ctl}>→</button>
            </div>
            <Link to="/order" state={{ type: s.c, style: s.n }} onClick={onClose}
              className="inline-flex items-center justify-center gap-3 rounded-sm bg-gradient-to-r from-goldlight to-gold px-7 py-3.5 text-xs font-semibold uppercase tracking-[.22em] text-ink transition hover:brightness-110">
              Order this style <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Portfolio() {
  const [cat, setCat] = useState('All'), [open, setOpen] = useState(null)
  const list = useMemo(() => (cat === 'All' ? items : items.filter(s => s.c === cat)), [cat])
  return (
    <div>
      <div role="group" aria-label="Filter sample designs by type" className="mb-8 flex flex-wrap gap-2">
        {cats.map(c => {
          const on = c === cat, count = c === 'All' ? items.length : items.filter(s => s.c === c).length
          return (
            <button key={c} type="button" aria-pressed={on} onClick={() => setCat(c)}
              className={`rounded-sm border px-4 py-2.5 text-xs font-semibold uppercase tracking-[.18em] transition ${on ? 'border-gold bg-gold/15 text-snow' : 'border-champ/30 text-silver/70 hover:border-champ hover:text-snow'}`}>
              {c} <span className="ml-1 text-goldlight/70">{count}</span>
            </button>
          )
        })}
      </div>
      <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((s, i) => (
            <motion.div layout key={s.n} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.4 }}>
              <Card s={s} onOpen={() => setOpen(i)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      <p className="mt-6 text-xs text-stone">Tap a design to open it, then use the arrows or your keyboard (← → Esc).</p>
      <AnimatePresence>{open !== null && list[open] && <Viewer key="viewer" list={list} index={open} setIndex={setOpen} onClose={() => setOpen(null)} />}</AnimatePresence>
    </div>
  )
}
