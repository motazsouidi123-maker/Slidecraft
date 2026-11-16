import { useRef, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion, useScroll, useTransform } from 'framer-motion'

export function Magnetic({ children }) {
  const r = useRef(null), x = useMotionValue(0), y = useMotionValue(0), off = useReducedMotion()
  const sx = useSpring(x, { stiffness: 220, damping: 14 }), sy = useSpring(y, { stiffness: 220, damping: 14 })
  const move = e => { if (off) return; const b = r.current.getBoundingClientRect(); x.set((e.clientX - b.left - b.width / 2) * 0.2); y.set((e.clientY - b.top - b.height / 2) * 0.2) }
  return <motion.span ref={r} style={{ x: sx, y: sy, display: 'inline-block' }} onPointerMove={move} onPointerLeave={() => { x.set(0); y.set(0) }}>{children}</motion.span>
}

export function Wordmark({ sub }) {
  return (
    <span className="inline-flex flex-col leading-none">
      <span className="font-display text-[1.65rem] font-semibold tracking-[.3em] text-snow">PRESORA</span>
      {sub && <span className="mt-1 text-[8px] uppercase tracking-[.28em] text-champ">Created by Motaz Souidi</span>}
    </span>
  )
}

export function Signature() {
  const line = 'h-px w-14 bg-gradient-to-r from-transparent via-champ to-transparent'
  return (
    <div className="flex flex-col items-center px-5 py-16 text-center" aria-label="Created by Motaz Souidi">
      <div className="flex items-center gap-3"><span className={line} /><span className="font-display text-lg italic text-silver/70">Created by</span><span className={line} /></div>
      <motion.p initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true }} transition={{ duration: 1.3 }}
        className="silver font-display mt-3 pr-1 text-5xl font-medium italic tracking-tight sm:text-7xl">Motaz Souidi</motion.p>
      <svg width="170" height="16" viewBox="0 0 170 16" className="mt-3" aria-hidden="true">
        <motion.path d="M2 9 C 32 -2, 54 16, 85 8 S 140 0, 168 9" stroke="#8C7B70" strokeWidth="1.2" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, delay: 0.4 }} />
      </svg>
    </div>
  )
}

/* Cinematic welcome intro. Contract unchanged: <Loader onDone={fn} /> */
export function Loader({ onDone }) {
  const [phase, setPhase] = useState(0)
  const fin = useCallback(() => onDone(), [onDone])
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const a = setTimeout(() => setPhase(1), 3400), b = setTimeout(fin, 5200)
    return () => { clearTimeout(a); clearTimeout(b); document.body.style.overflow = '' }
  }, [fin])
  const words = ['WELCOME,', 'LADIES', 'AND', 'GENTLEMEN.']
  return (
    <motion.div role="dialog" aria-label="Welcome to PRESORA" className="fixed inset-0 z-[100] overflow-hidden bg-ink"
      initial={{ clipPath: 'inset(0% 0% 0% 0%)' }} exit={{ clipPath: 'inset(50% 0% 50% 0%)' }} transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}>
      <motion.div className="absolute left-1/2 top-1/2 h-[80vmax] w-[80vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(140,123,112,.40), rgba(70,56,40,.28) 32%, transparent 62%)' }}
        animate={{ scale: [0.7, 1.15], x: ['-14%', '12%'], opacity: [0.3, 1] }} transition={{ duration: 5.2, ease: 'easeInOut' }} />
      <div className="grain absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#060403_95%)]" />
      <motion.div className="relative grid h-full place-items-center px-6 text-center" animate={{ scale: [1, 1.07] }} transition={{ duration: 5.2, ease: 'linear' }}>
        <AnimatePresence mode="wait">
          {phase === 0 ? (
            <motion.h1 key="w" exit={{ opacity: 0, filter: 'blur(10px)' }} transition={{ duration: 0.6 }} className="font-display text-[2.6rem] font-light leading-tight tracking-[.1em] text-snow sm:text-6xl md:text-7xl">
              {words.map((w, i) => <motion.span key={w} className="mr-[.3em] inline-block" initial={{ opacity: 0, y: 30, filter: 'blur(12px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: 0.4 + i * 0.5, duration: 1 }}>{w}</motion.span>)}
            </motion.h1>
          ) : (
            <motion.div key="l" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
              <p className="silver font-display pl-[.3em] text-5xl font-semibold tracking-[.3em] sm:text-7xl">PRESORA</p>
              <p className="mt-4 text-[10px] uppercase tracking-[.4em] text-champ sm:text-xs">Premium Creative Presentation Studio</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.div className="absolute bottom-0 left-0 h-px bg-champ" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 5.2, ease: 'linear' }} />
      <button onClick={fin} className="absolute bottom-8 right-6 border border-champ/40 px-5 py-2 text-[11px] uppercase tracking-[.3em] text-silver transition hover:border-champ hover:text-snow">Skip intro</button>
    </motion.div>
  )
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const sx = useSpring(scrollYProgress, { stiffness: 120, damping: 25 })
  return <motion.div className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-bronze via-champ to-snow" style={{ scaleX: sx }} />
}

export function Cursor() {
  const [on, setOn] = useState(false), [big, setBig] = useState(false)
  const x = useMotionValue(-100), y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 380, damping: 32 }), sy = useSpring(y, { stiffness: 380, damping: 32 })
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setOn(true)
    const mv = e => { x.set(e.clientX); y.set(e.clientY); setBig(!!(e.target.closest && e.target.closest('a,button,summary,input,select,textarea,label'))) }
    window.addEventListener('pointermove', mv)
    return () => window.removeEventListener('pointermove', mv)
  }, [x, y])
  if (!on) return null
  return (
    <motion.div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[90]" style={{ x: sx, y: sy }}>
      <motion.div className="-translate-x-1/2 -translate-y-1/2 rounded-full border border-champ" animate={{ width: big ? 58 : 26, height: big ? 58 : 26, backgroundColor: big ? 'rgba(140,123,112,.18)' : 'rgba(140,123,112,0)' }} />
    </motion.div>
  )
}

/* Hero composition (also exported as Hero3D for the old contract) */
export function DeckStack() {
  const mx = useMotionValue(0), my = useMotionValue(0), off = useReducedMotion()
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 70, damping: 16 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 70, damping: 16 })
  const move = e => { if (off) return; const b = e.currentTarget.getBoundingClientRect(); mx.set((e.clientX - b.left) / b.width - 0.5); my.set((e.clientY - b.top) / b.height - 0.5) }
  const cards = [
    { cls: 'bg-[#100d0a] border-champ/30', z: 0, t: 'translate(-34%,-30%) rotate(-8deg)', d: 0 },
    { cls: 'bg-snow border-white', z: 70, t: 'translate(26%,-8%) rotate(5deg)', d: 1.2 },
    { cls: 'bg-gradient-to-br from-bronze via-[#2a2016] to-ink border-champ/50', z: 140, t: 'translate(-8%,18%) rotate(-2deg)', d: 2.4 },
  ]
  return (
    <div onPointerMove={move} onPointerLeave={() => { mx.set(0); my.set(0) }} className="relative mx-auto h-[24rem] w-full max-w-lg sm:h-[30rem]" style={{ perspective: 1200 }} aria-hidden="true">
      <div className="absolute inset-6 rounded-full bg-champ/25 blur-[100px]" /><div className="absolute inset-24 rounded-full bg-bronze/60 blur-[80px]" />
      <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }} className="absolute inset-0">
        {cards.map((c, i) => (
          <div key={i} className="absolute left-1/2 top-1/2 w-[70%]" style={{ transform: `translate(-50%,-50%) translateZ(${c.z}px) ${c.t}` }}>
            <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.2, duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}>
              <div className="float relative aspect-[16/10] overflow-hidden rounded-lg border p-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,.9)]" style={{ animationDelay: `${c.d}s` }}>
                <div className={`absolute inset-0 ${c.cls}`} />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent" />
                {i === 0 && <div className="relative flex h-full items-end gap-2">{[30, 55, 42, 75, 60].map(h => <div key={h} className="w-6 bg-champ/70" style={{ height: `${h}%` }} />)}</div>}
                {i === 1 && <div className="relative flex h-full flex-col justify-between text-ink"><div className="h-px w-10 bg-ink" /><p className="font-display text-2xl italic">Less, but better.</p><div className="space-y-1"><div className="h-1 w-3/4 bg-stone/40" /><div className="h-1 w-1/2 bg-stone/40" /></div></div>}
                {i === 2 && <div className="relative flex h-full flex-col justify-between"><span className="text-[8px] tracking-[.35em] text-silver">PRESORA</span><div><div className="mb-2 h-px w-12 bg-champ" /><p className="font-display text-2xl text-snow sm:text-3xl">Annual Strategy</p><p className="mt-1 text-[8px] tracking-[.3em] text-champ">SAMPLE DESIGN</p></div></div>}
              </div>
            </motion.div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
export const Hero3D = DeckStack

export function Marquee({ items }) {
  const row = [...items, ...items]
  return (
    <div className="overflow-hidden border-y border-champ/20 py-5" aria-hidden="true">
      <div className="marquee flex w-max gap-12 whitespace-nowrap font-display text-3xl font-light italic text-silver/55">
        {row.map((t, i) => <span key={i} className="flex items-center gap-12">{t}<span className="text-sm text-champ">◆</span></span>)}
      </div>
    </div>
  )
}

const looks = [
  ['bg-[#0d0a08] text-snow', 'text-snow/[.06]', 'text-silver/70'],
  ['bg-gradient-to-br from-bronze to-[#1b140d] text-snow', 'text-snow/10', 'text-silver/80'],
  ['bg-snow text-ink', 'text-ink/[.07]', 'text-ink/65'],
  ['bg-stone/40 text-snow', 'text-snow/10', 'text-snow/70'],
  ['bg-transparent text-snow', 'text-champ/20', 'text-silver/70'],
  ['bg-silver text-ink', 'text-ink/10', 'text-ink/70'],
]
export function BentoCard({ s, i, cta }) {
  const [box, num, sub] = looks[i % 6]
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} className={`gborder group relative flex h-full min-h-[14rem] flex-col justify-between overflow-hidden rounded-sm p-7 ${box}`}>
      <span className={`font-display absolute -right-1 -top-5 text-[8rem] font-light italic leading-none ${num}`}>{String(i + 1).padStart(2, '0')}</span>
      <span className="relative text-2xl opacity-80" aria-hidden="true">{s.icon}</span>
      <div className="relative mt-8">
        <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{s.t}</h3>
        <p className={`mt-2 max-w-md text-sm leading-relaxed ${sub}`}>{s.d}</p>
        {cta && <Link to="/order" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.2em]">Start a project <span className="transition group-hover:translate-x-1.5">→</span></Link>}
      </div>
    </motion.div>
  )
}
export const ServiceCard = BentoCard

const styles = [
  { n: 'Luxury Corporate', d: 'Black canvases, bronze accents and generous space for confident boardroom decks.', p: ['#060403', '#463828', '#8C7B70', '#FDFDFD'] },
  { n: 'Minimalist Editorial', d: 'Magazine-style typography and whitespace that lets one idea speak at a time.', p: ['#FDFDFD', '#060403', '#C5BBB6', '#645C58'] },
  { n: 'Modern Technology', d: 'Precise grids, data visuals and a calm, forward-looking tone.', p: ['#060403', '#645C58', '#C5BBB6', '#8C7B70'] },
  { n: 'Academic Excellence', d: 'Clear structure for research, theses and lectures — arguments first, decoration second.', p: ['#C5BBB6', '#060403', '#645C58', '#FDFDFD'] },
  { n: 'Creative Storytelling', d: 'Cinematic pacing and bold imagery to carry an audience through a narrative.', p: ['#463828', '#8C7B70', '#FDFDFD', '#060403'] },
  { n: 'Business Strategy', d: 'Frameworks, roadmaps and comparisons that make decisions easy to follow.', p: ['#060403', '#FDFDFD', '#463828', '#C5BBB6'] },
]
function Slide({ k }) {
  if (k === 0) return (<div className="flex h-full flex-col justify-between bg-ink p-[6%]"><div className="flex justify-between text-[9px] tracking-[.3em] text-champ"><span>PRESORA</span><span>01</span></div><div><div className="mb-3 h-px w-16 bg-champ" /><p className="font-display text-3xl italic text-snow sm:text-5xl">Annual Strategy Review</p><p className="mt-2 text-[10px] tracking-[.25em] text-silver">CORPORATE PRESENTATION</p></div></div>)
  if (k === 1) return (<div className="flex h-full flex-col justify-between bg-snow p-[6%] text-ink"><span className="text-[9px] tracking-[.3em] text-stone">ESSAY / 02</span><p className="font-display text-4xl font-light leading-none sm:text-6xl">Less, but<br /><em>better.</em></p><div className="grid grid-cols-3 gap-3"><div className="h-1 bg-ink" /><div className="h-1 bg-stone/30" /><div className="h-1 bg-stone/30" /></div></div>)
  if (k === 2) return (<div className="relative h-full bg-ink p-[6%]" style={{ backgroundImage: 'linear-gradient(rgba(197,187,182,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(197,187,182,.07) 1px,transparent 1px)', backgroundSize: '28px 28px' }}><p className="text-[9px] tracking-[.3em] text-champ">TECHNOLOGY / 03</p><p className="font-display mt-2 text-2xl text-snow sm:text-4xl">Growth, visualised</p><svg viewBox="0 0 200 70" className="absolute bottom-[8%] left-[6%] w-[88%]" aria-hidden="true"><polyline points="0,60 40,48 80,52 120,28 160,22 200,6" fill="none" stroke="#C5BBB6" strokeWidth="1.6" /><polyline points="0,66 40,60 80,58 120,48 160,44 200,34" fill="none" stroke="#8C7B70" strokeWidth="1.6" /></svg></div>)
  if (k === 3) return (<div className="flex h-full flex-col bg-silver p-[6%] text-ink"><p className="text-[9px] tracking-[.3em] text-stone">RESEARCH / 04</p><p className="font-display mt-2 text-2xl font-semibold sm:text-4xl">Thesis Defence</p><div className="mt-auto grid grid-cols-3 gap-3">{['Abstract', 'Method', 'Results'].map(t => <div key={t} className="border-t border-ink pt-2 text-[10px] font-semibold uppercase tracking-widest">{t}<div className="mt-2 space-y-1"><div className="h-1 bg-ink/30" /><div className="h-1 w-2/3 bg-ink/30" /></div></div>)}</div></div>)
  if (k === 4) return (<div className="flex h-full flex-col justify-between bg-gradient-to-br from-bronze via-champ to-bronze p-[6%]"><p className="text-[9px] tracking-[.3em] text-snow/70">STORY / 05</p><p className="font-display text-3xl italic leading-tight text-snow sm:text-5xl">Every story begins with a single slide.</p><div className="h-px w-20 bg-snow/60" /></div>)
  return (<div className="h-full bg-ink p-[6%]"><p className="text-[9px] tracking-[.3em] text-champ">STRATEGY / 06</p><div className="mt-3 grid h-[78%] grid-cols-2 gap-2">{['Plan', 'Build', 'Launch', 'Review'].map((t, j) => <div key={t} className={`flex items-end border p-3 font-display text-xl ${j === 3 ? 'border-champ bg-bronze/60 text-snow' : 'border-champ/30 text-silver'}`}>{t}</div>)}</div></div>)
}
const ctl = 'grid h-11 w-11 place-items-center border border-champ/40 text-silver transition hover:border-champ hover:text-snow'
export function SlideViewer() {
  const [i, setI] = useState(0), [dir, setDir] = useState(1), [fs, setFs] = useState(false), box = useRef(null)
  const n = styles.length
  const step = d => { setDir(d); setI(v => (v + d + n) % n) }
  const jump = k => { setDir(k > i ? 1 : -1); setI(k) }
  useEffect(() => { const h = () => setFs(!!document.fullscreenElement); document.addEventListener('fullscreenchange', h); return () => document.removeEventListener('fullscreenchange', h) }, [])
  const canFs = typeof document !== 'undefined' && !!document.fullscreenEnabled
  const toggle = () => { if (document.fullscreenElement) document.exitFullscreen(); else if (box.current && box.current.requestFullscreen) box.current.requestFullscreen() }
  const s = styles[i]
  const v = { enter: d => ({ x: `${d * 60}%`, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: d => ({ x: `${-d * 30}%`, opacity: 0 }) }
  return (
    <div ref={box} tabIndex={0} onKeyDown={e => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1) }} aria-roledescription="carousel" aria-label="Sample presentation styles"
      className={`gborder relative rounded-sm bg-[#0a0705] p-4 outline-none sm:p-8 ${fs ? 'flex flex-col justify-center' : ''}`}>
      <div className="relative mx-auto aspect-video w-full max-w-4xl overflow-hidden border border-champ/30 shadow-2xl shadow-black">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div key={i} custom={dir} variants={v} initial="enter" animate="center" exit="exit" transition={{ duration: 0.65, ease: [0.2, 0.7, 0.2, 1] }} className="absolute inset-0"><Slide k={i} /></motion.div>
        </AnimatePresence>
        <span className="absolute left-3 top-3 bg-ink/80 px-2 py-1 text-[9px] uppercase tracking-[.2em] text-silver">Sample design</span>
      </div>
      <div className="mx-auto mt-6 flex max-w-4xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-[5.5rem]">
          <p className="font-display text-2xl font-semibold">{s.n}</p>
          <p className="mt-1 max-w-md text-sm text-silver/70">{s.d}</p>
          <div className="mt-3 flex items-center gap-2" aria-label="Colour palette">{s.p.map(c => <span key={c} title={c} className="h-5 w-5 rounded-full border border-white/20" style={{ background: c }} />)}</div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => step(-1)} aria-label="Previous slide" className={ctl}>←</button>
          <div className="flex gap-2">{styles.map((_, k) => <button key={k} onClick={() => jump(k)} aria-label={`Slide ${k + 1}`} aria-current={k === i} className={`h-1.5 transition-all ${k === i ? 'w-6 bg-champ' : 'w-1.5 bg-stone'}`} />)}</div>
          <button onClick={() => step(1)} aria-label="Next slide" className={ctl}>→</button>
          {canFs && <button onClick={toggle} aria-label={fs ? 'Exit fullscreen' : 'Fullscreen preview'} className={ctl}>{fs ? '✕' : '⤢'}</button>}
        </div>
      </div>
    </div>
  )
}
