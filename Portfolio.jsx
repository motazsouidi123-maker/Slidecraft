import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SlideArt, sampleStyles } from './ui'

const items = sampleStyles.map((s, k) => ({ ...s, k }))
const cats = ['All', ...Array.from(new Set(items.map(s => s.c)))]
const featured = items.filter(s => s.featured)
const ctl = 'grid h-11 w-11 place-items-center border border-bronze/40 text-snow/80 transition hover:border-bronze hover:text-snow focus-visible:border-goldlight outline-none'
const orderBtn = 'inline-flex items-center justify-center gap-3 rounded-sm bg-gradient-to-r from-goldlight to-bronze px-7 py-3.5 text-xs font-semibold uppercase tracking-[.22em] text-ink transition hover:brightness-110'

/* Draws one slide at a fixed design size and scales it to its box, so text stays in proportion. */
function Stage({ k, i = 0, className = '' }) {
  const box = useRef(null)
  const [u, setU] = useState(1), [sc, setSc] = useState(0.4)
  useEffect(() => {
    const el = box.current
    const calc = () => { const nu = window.innerWidth >= 640 ? 1 : 0.7; setU(nu); setSc((el.clientWidth || 800 * nu) / (800 * nu)) }
    calc()
    const ro = new ResizeObserver(calc); ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={box} className={`relative aspect-video w-full overflow-hidden ${className}`}>
      <div style={{ width: 800 * u, height: 450 * u, transform: `scale(${sc})`, transformOrigin: 'top left' }}><SlideArt k={k} i={i} u={u} /></div>
    </div>
  )
}

const Demo = ({ className = '' }) => <span className={`border border-goldlight/50 bg-ink/80 px-2 py-1 text-[9px] font-semibold uppercase tracking-[.2em] text-goldlight ${className}`}>Demo</span>

function Card({ s, onOpen, big }) {
  return (
    <motion.button type="button" onClick={onOpen} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 26 }} aria-label={`Open sample design: ${s.n}`}
      className="gborder group relative block w-full bg-char p-3 text-start outline-none transition-shadow hover:shadow-[0_24px_50px_-24px_rgba(192,138,82,.45)] focus-visible:ring-1 focus-visible:ring-goldlight">
      <div className="relative">
        <Stage k={s.k} className="border border-bronze/25" />
        <Demo className="absolute left-2 top-2" />
        <span aria-hidden="true" className="absolute inset-0 grid place-items-center bg-ink/55 text-[10px] font-semibold uppercase tracking-[.3em] text-snow opacity-0 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">Preview</span>
      </div>
      <span className="mt-4 flex items-start justify-between gap-3 px-1 pb-1">
        <span>
          <span className={`font-display block font-semibold leading-tight ${big ? 'text-3xl' : 'text-2xl'}`}>{s.n}</span>
          <span className="mt-1 block text-xs text-snow/55">{s.use}</span>
          <span className="mt-3 flex gap-1.5" aria-hidden="true">{s.p.map(c => <span key={c} className="h-3.5 w-3.5 rounded-full border border-white/20" style={{ background: c }} />)}</span>
        </span>
        <span className="mt-1 whitespace-nowrap border border-bronze/50 px-2 py-1 text-[9px] uppercase tracking-[.2em] text-goldlight">{s.c}</span>
      </span>
    </motion.button>
  )
}

function Viewer({ list, index, setIndex, onClose }) {
  const dlg = useRef(null), frame = useRef(null)
  const [dir, setDir] = useState(1), [j, setJ] = useState(0), [fs, setFs] = useState(false)
  const n = list.length, s = list[index], total = s.slides.length
  const slide = d => { setDir(d); setJ(v => (v + d + total) % total) }
  const jump = k => { setDir(k > j ? 1 : -1); setJ(k) }
  const project = d => { setDir(d); setJ(0); setIndex((index + d + n) % n) }
  const canFs = typeof document !== 'undefined' && !!document.fullscreenEnabled

  useEffect(() => {
    const prev = document.activeElement, prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (dlg.current) dlg.current.focus()
    const h = () => setFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => {
      document.removeEventListener('fullscreenchange', h)
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
      document.body.style.overflow = prevOverflow; if (prev && prev.focus) prev.focus()
    }
  }, [])
  const toggleFs = () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); else if (frame.current && frame.current.requestFullscreen) frame.current.requestFullscreen().catch(() => {}) }

  const onKey = e => {
    if (e.key === 'Escape') { if (!document.fullscreenElement) { e.stopPropagation(); onClose() } }
    else if (e.key === 'ArrowRight') slide(1)
    else if (e.key === 'ArrowLeft') slide(-1)
    else if ((e.key === 'f' || e.key === 'F') && canFs) toggleFs()
    else if (e.key === 'Tab' && dlg.current) {
      const f = dlg.current.querySelectorAll('a[href],button:not([disabled])')
      if (!f.length) return
      const first = f[0], last = f[f.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dlg.current)) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  }
  const v = { enter: d => ({ x: `${d * 30}%`, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: d => ({ x: `${-d * 20}%`, opacity: 0 }) }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-ink/92 p-3 backdrop-blur-md sm:p-6">
      <motion.div ref={dlg} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`${s.n} sample design`} onKeyDown={onKey}
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
        className="gborder relative my-auto w-full max-w-4xl bg-char p-4 outline-none sm:p-8">
        <button type="button" onClick={onClose} aria-label="Close preview" className={`${ctl} absolute right-3 top-3 z-10 bg-ink/80`}>✕</button>

        <div ref={frame} className={`relative w-full overflow-hidden border border-bronze/30 shadow-2xl shadow-black ${fs ? 'flex h-full items-center justify-center bg-ink' : ''}`}>
          <div className={`relative aspect-video w-full ${fs ? 'max-h-full max-w-[177.78vh]' : ''}`}>
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div key={`${s.k}-${j}`} custom={dir} variants={v} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }} className="absolute inset-0"><Stage k={s.k} i={j} /></motion.div>
            </AnimatePresence>
          </div>
          <Demo className="absolute left-3 top-3" />
          {fs && (
            <>
              <button type="button" onClick={() => slide(-1)} aria-label="Previous slide" className={`${ctl} absolute left-3 top-1/2 -translate-y-1/2 bg-ink/70`}>←</button>
              <button type="button" onClick={() => slide(1)} aria-label="Next slide" className={`${ctl} absolute right-3 top-1/2 -translate-y-1/2 bg-ink/70`}>→</button>
              <button type="button" onClick={toggleFs} aria-label="Exit full screen" className={`${ctl} absolute right-3 top-3 bg-ink/70`}>✕</button>
            </>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-[11px] uppercase tracking-[.25em] text-goldlight" aria-live="polite">Slide {j + 1} / {total}</p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => slide(-1)} aria-label="Previous slide" className={ctl}>←</button>
            <div className="flex gap-2">{s.slides.map((_, k) => <button type="button" key={k} onClick={() => jump(k)} aria-label={`Go to slide ${k + 1}`} aria-current={k === j} className="grid h-8 w-5 place-items-center"><span className={`h-1.5 transition-all ${k === j ? 'w-5 bg-goldlight' : 'w-1.5 bg-mute'}`} /></button>)}</div>
            <button type="button" onClick={() => slide(1)} aria-label="Next slide" className={ctl}>→</button>
            {canFs && <button type="button" onClick={toggleFs} aria-label="Full screen preview" className={ctl}>⤢</button>}
          </div>
        </div>

        <div className="mt-6 grid gap-6 border-t border-bronze/20 pt-6 md:grid-cols-[1.2fr_.8fr] md:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3"><p className="font-display text-3xl font-semibold">{s.n}</p><span className="border border-bronze/50 px-2 py-1 text-[9px] uppercase tracking-[.2em] text-goldlight">{s.c}</span></div>
            <p className="mt-2 max-w-md text-sm text-snow/70">{s.d}</p>
            <dl className="mt-4 grid gap-1 text-xs text-snow/60">
              <div className="flex gap-2"><dt className="text-snow/40">Ideal for</dt><dd>{s.use}</dd></div>
              <div className="flex gap-2"><dt className="text-snow/40">Preview</dt><dd>{total} sample slides · fictional demo content</dd></div>
            </dl>
            <div className="mt-3 flex items-center gap-2" aria-label="Colour palette">{s.p.map(c => <span key={c} title={c} className="h-5 w-5 rounded-full border border-white/20" style={{ background: c }} />)}</div>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <Link to="/order" state={{ type: s.order, style: s.n, styleId: s.k }} onClick={onClose} className={orderBtn}>Order this style <span aria-hidden="true">→</span></Link>
            {n > 1 && (
              <div className="flex items-center gap-4 text-[11px] uppercase tracking-[.2em] text-snow/60">
                <button type="button" onClick={() => project(-1)} className="transition hover:text-snow">← Prev style</button>
                <button type="button" onClick={() => project(1)} className="transition hover:text-snow">Next style →</button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Portfolio() {
  const [cat, setCat] = useState('All'), [open, setOpen] = useState(null)
  const list = useMemo(() => (cat === 'All' ? items : items.filter(s => s.c === cat)), [cat])
  const openProject = s => { const i = list.findIndex(x => x.k === s.k); if (i >= 0) setOpen(i) }
  const openFeatured = s => { setCat('All'); setOpen(items.findIndex(x => x.k === s.k)) }
  return (
    <div>
      <div className="mb-14">
        <p className="mb-4 text-[11px] uppercase tracking-[.3em] text-bronze">Featured</p>
        <div className="grid gap-4 md:grid-cols-3">
          {featured.map(s => <Card key={s.n} s={s} big onOpen={() => openFeatured(s)} />)}
        </div>
      </div>

      <p className="mb-4 text-[11px] uppercase tracking-[.3em] text-bronze">All sample styles</p>
      <div role="group" aria-label="Filter sample designs by category" className="mb-8 flex flex-wrap gap-2">
        {cats.map(c => {
          const on = c === cat, count = c === 'All' ? items.length : items.filter(s => s.c === c).length
          return (
            <button key={c} type="button" aria-pressed={on} onClick={() => setCat(c)}
              className={`rounded-sm border px-4 py-2.5 text-xs font-semibold uppercase tracking-[.18em] transition ${on ? 'border-bronze bg-bronze/15 text-snow' : 'border-bronze/30 text-snow/70 hover:border-bronze hover:text-snow'}`}>
              {c} <span className="ml-1 text-goldlight/70">{count}</span>
            </button>
          )
        })}
      </div>
      <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map(s => (
            <motion.div layout key={s.n} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35 }}>
              <Card s={s} onOpen={() => openProject(s)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      <p className="mt-6 text-xs text-mute">All designs are fictional demo samples, not client projects. Open one, then use the arrows or your keyboard (← → F Esc).</p>
      <AnimatePresence>{open !== null && list[open] && <Viewer key="viewer" list={list} index={open} setIndex={setOpen} onClose={() => setOpen(null)} />}</AnimatePresence>
    </div>
  )
}
