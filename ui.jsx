import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useReducedMotion, useScroll, useTransform } from 'framer-motion'

export function Magnetic({ children }) {
  const r = useRef(null), x = useMotionValue(0), y = useMotionValue(0), off = useReducedMotion()
  const sx = useSpring(x, { stiffness: 220, damping: 14 }), sy = useSpring(y, { stiffness: 220, damping: 14 })
  const move = e => { if (off) return; const b = r.current.getBoundingClientRect(); x.set((e.clientX - b.left - b.width / 2) * 0.25); y.set((e.clientY - b.top - b.height / 2) * 0.25) }
  return <motion.span ref={r} style={{ x: sx, y: sy, display: 'inline-block' }} onPointerMove={move} onPointerLeave={() => { x.set(0); y.set(0) }}>{children}</motion.span>
}

const faces = ['rotateY(0deg)', 'rotateY(90deg)', 'rotateY(180deg)', 'rotateY(270deg)', 'rotateX(90deg)', 'rotateX(-90deg)']
export function Hero3D() {
  const spin = (d, t) => ({ animate: { rotateY: [0, d * 360], rotateX: [-20, -20] }, transition: { duration: t, repeat: Infinity, ease: 'linear' } })
  return (
    <div className="relative mx-auto mt-16 h-72 w-72 md:h-96 md:w-96" style={{ perspective: 900 }} aria-hidden="true">
      <div className="absolute inset-8 rounded-full bg-violet-600/40 blur-[90px]" />
      <div className="absolute inset-16 rounded-full bg-cyan-400/20 blur-[70px]" />
      <div className="float absolute inset-0 grid place-items-center">
        <div className="scale-90 md:scale-[1.3]" style={{ transformStyle: 'preserve-3d' }}>
          <motion.div {...spin(1, 26)} style={{ transformStyle: 'preserve-3d', width: 120, height: 120, position: 'relative' }}>
            {faces.map(f => <div key={f} className="absolute inset-0 border border-white/30 bg-gradient-to-br from-violet-500/25 via-white/5 to-cyan-400/25 backdrop-blur-[2px]" style={{ transform: `${f} translateZ(60px)` }} />)}
            <motion.div {...spin(-1, 14)} style={{ transformStyle: 'preserve-3d', width: 50, height: 50, position: 'absolute', left: 35, top: 35 }}>
              {faces.map(f => <div key={f} className="absolute inset-0 border border-cyan-200/60 bg-cyan-300/30" style={{ transform: `${f} translateZ(25px)` }} />)}
            </motion.div>
          </motion.div>
        </div>
        {[200, 270].map((s, i) => (
          <motion.div key={s} className="absolute rounded-full border border-violet-300/30" style={{ width: s, height: s, rotateX: 72 }}
            animate={{ rotateZ: [0, i ? -360 : 360] }} transition={{ duration: 18 + i * 8, repeat: Infinity, ease: 'linear' }} />
        ))}
      </div>
      {[['left-2 top-10', 'h-4 w-4 rotate-12 rounded-sm bg-cyan-300/70', 0], ['right-4 top-24', 'h-3 w-3 rounded-full bg-violet-300/80', 1.5], ['left-10 bottom-8', 'h-2.5 w-2.5 rounded-full bg-white/70', 3], ['right-10 bottom-4', 'h-5 w-5 rotate-45 rounded-sm border border-white/50', 2]].map(([p, c, d]) => (
        <span key={p} className={`float absolute ${p} ${c}`} style={{ animationDelay: `${d}s` }} />
      ))}
    </div>
  )
}

const hues = ['from-emerald-400 to-cyan-500', 'from-violet-500 to-indigo-500', 'from-sky-400 to-blue-600', 'from-fuchsia-500 to-orange-400']
export function ServiceCard({ s, i, cta }) {
  return (
    <motion.div whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="gborder group relative h-full overflow-hidden rounded-3xl bg-[#0d0a1f]/70 p-6 backdrop-blur-xl">
      <div className={`absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${hues[i % 4]} opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-50`} />
      <span className="absolute right-5 top-4 font-mono text-xs tracking-widest text-white/25">0{i + 1}</span>
      <div className={`relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${hues[i % 4]} text-2xl shadow-lg`}>{s.icon}</div>
      <h3 className="relative mt-5 text-xl font-bold tracking-tight">{s.t}</h3>
      <p className="relative mt-2 text-white/60">{s.d}</p>
      {cta && <Link to="/order" className="relative mt-5 inline-flex items-center gap-1 text-cyan-300">Order this <span className="transition group-hover:translate-x-1">→</span></Link>}
    </motion.div>
  )
}

export function Signature() {
  const line = 'h-px w-14 bg-gradient-to-r from-transparent via-[#ffd9a0]/60 to-transparent'
  return (
    <div className="flex flex-col items-center px-5 py-16 text-center" aria-label="Created by Motaz Souidi">
      <div className="flex items-center gap-3"><span className={line} /><span className="font-display text-sm italic tracking-wide text-white/50">Created by</span><span className={line} /></div>
      <motion.p initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true }} transition={{ duration: 1.2 }}
        className="silver font-display mt-3 pr-1 text-4xl font-semibold italic tracking-tight sm:text-6xl">Motaz Souidi</motion.p>
      <svg width="170" height="16" viewBox="0 0 170 16" className="mt-3" aria-hidden="true">
        <motion.path d="M2 9 C 32 -2, 54 16, 85 8 S 140 0, 168 9" stroke="#ffd9a0" strokeWidth="1.2" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, delay: 0.4 }} />
      </svg>
    </div>
  )
}

export function Loader({ onDone }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let v = 0
    const t = setInterval(() => { v = Math.min(100, v + Math.ceil(Math.random() * 9) + 3); setN(v); if (v >= 100) { clearInterval(t); setTimeout(onDone, 350) } }, 60)
    return () => clearInterval(t)
  }, [onDone])
  return (
    <motion.div role="status" aria-label="Loading" className="fixed inset-0 z-[100] grid place-items-center bg-[#050611]" exit={{ y: '-100%' }} transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}>
      <div className="text-center">
        <p className="font-display text-5xl font-semibold italic">Slide<span className="aurora-text">Craft</span></p>
        <div className="mx-auto mt-6 h-px w-48 overflow-hidden bg-white/10"><div className="aurora-bg h-full transition-all" style={{ width: `${n}%` }} /></div>
        <p className="mt-3 font-mono text-xs tracking-[.4em] text-white/40">{String(n).padStart(3, '0')}</p>
      </div>
    </motion.div>
  )
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const sx = useSpring(scrollYProgress, { stiffness: 120, damping: 25 })
  return <motion.div className="aurora-bg fixed inset-x-0 top-0 z-[60] h-[3px] origin-left" style={{ scaleX: sx }} />
}

export function DeckStack() {
  const mx = useMotionValue(0), my = useMotionValue(0), off = useReducedMotion()
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 80, damping: 15 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), { stiffness: 80, damping: 15 })
  const move = e => { if (off) return; const b = e.currentTarget.getBoundingClientRect(); mx.set((e.clientX - b.left) / b.width - 0.5); my.set((e.clientY - b.top) / b.height - 0.5) }
  const cards = ['from-[#171a3d] to-[#2b2f78]', 'from-[#ff5fa2] to-[#ffb86b]', 'from-[#7c6cff] to-[#4b3df0]']
  const chips = [['left-0 top-6', 'EN · FR · AR · IT', 0], ['right-0 top-1/3', '✦ Custom design', 1.2], ['left-2 bottom-8', '⏰ Your deadline', 2.4]]
  return (
    <div onPointerMove={move} onPointerLeave={() => { mx.set(0); my.set(0) }} className="relative mx-auto h-[22rem] w-full max-w-md sm:h-[27rem]" style={{ perspective: 1100 }} aria-hidden="true">
      <div className="absolute inset-10 rounded-full bg-[#7c6cff]/35 blur-[90px]" /><div className="absolute inset-20 rounded-full bg-[#ff5fa2]/25 blur-[80px]" />
      <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }} className="absolute inset-0">
        {cards.map((g, i) => (
          <div key={i} className="absolute left-1/2 top-1/2 w-[76%]" style={{ transform: `translate(-50%,-50%) translateZ(${i * 55}px) translate(${(2 - i) * -20}px,${(2 - i) * 16}px) rotate(${(2 - i) * -4}deg)` }}>
            <motion.div initial={{ opacity: 0, y: 70 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.15, duration: 0.9 }}
              className={`aspect-[16/10] rounded-2xl border border-white/25 bg-gradient-to-br ${g} p-4 shadow-2xl shadow-black/60`}>
              {i === 2 && (<div className="flex h-full flex-col justify-between"><div><div className="h-2 w-10 rounded bg-white/80" /><div className="mt-3 h-3 w-3/4 rounded bg-white/90" /><div className="mt-2 h-2 w-1/2 rounded bg-white/50" /></div>
                <div className="flex items-end gap-2">{[40, 70, 52, 90].map(h => <div key={h} className="w-6 rounded-t bg-white/70" style={{ height: h * 0.55 }} />)}<div className="ml-auto h-12 w-12 rounded-full border-4 border-white/70" /></div></div>)}
            </motion.div>
          </div>
        ))}
      </motion.div>
      {chips.map(([p, t, d]) => <span key={t} style={{ animationDelay: `${d}s` }} className={`float absolute ${p} rounded-full border border-white/15 bg-[#0a0b18]/80 px-3 py-1.5 text-xs backdrop-blur`}>{t}</span>)}
    </div>
  )
}

export function Marquee({ items }) {
  const row = [...items, ...items]
  return (
    <div className="overflow-hidden border-y border-white/10 py-4" aria-hidden="true">
      <div className="marquee flex w-max gap-10 whitespace-nowrap font-display text-2xl italic text-white/45">
        {row.map((t, i) => <span key={i} className="flex items-center gap-10">{t}<span className="text-[#ffb86b]">✦</span></span>)}
      </div>
    </div>
  )
}

const looks = [
  { box: 'bg-[#0e1024]', num: 'text-white/10', sub: 'text-white/60' },
  { box: 'bg-gradient-to-br from-[#4b3df0] to-[#8a2be2]', num: 'text-white/20', sub: 'text-white/75' },
  { box: 'bg-[#0a0b18]', num: 'text-[#ffb86b]/20', sub: 'text-white/60' },
  { box: 'bg-gradient-to-br from-[#ff5fa2] to-[#ffb86b] text-[#1a0b14]', num: 'text-black/15', sub: 'text-[#1a0b14]/75' },
]
export function BentoCard({ s, i, cta }) {
  const l = looks[i % 4]
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} className={`gborder group relative flex h-full min-h-[15rem] flex-col justify-between overflow-hidden rounded-[2rem] p-7 ${l.box}`}>
      <span className={`font-display absolute -right-2 -top-6 text-[9rem] font-bold italic leading-none ${l.num}`}>0{i + 1}</span>
      <div className="relative grid h-12 w-12 place-items-center rounded-2xl border border-white/20 bg-white/10 text-2xl backdrop-blur">{s.icon}</div>
      <div className="relative mt-10">
        <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{s.t}</h3>
        <p className={`mt-2 max-w-md ${l.sub}`}>{s.d}</p>
        {cta && <Link to="/order" className="mt-4 inline-flex items-center gap-2 font-semibold underline-offset-4 hover:underline">Order this <span className="transition group-hover:translate-x-1.5">→</span></Link>}
      </div>
    </motion.div>
  )
}
