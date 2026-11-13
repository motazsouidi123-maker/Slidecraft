import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'

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
  const line = 'h-px w-16 bg-gradient-to-r from-transparent via-white/40 to-transparent'
  return (
    <div className="flex flex-col items-center px-5 py-16 text-center" aria-label="Crafted by Motaz">
      <div className="flex items-center gap-3 text-[10px] tracking-[.5em] text-white/50"><span className={line} />◆ CRAFTED BY ◆<span className={line} /></div>
      <motion.p initial={{ opacity: 0, letterSpacing: '.05em' }} whileInView={{ opacity: 1, letterSpacing: '.3em' }} viewport={{ once: true }} transition={{ duration: 1.4 }}
        className="silver mt-4 pl-[.3em] text-5xl font-black md:text-7xl" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>MOTAZ</motion.p>
      <div className="mt-4 flex items-center gap-3 text-violet-300/70"><span className={line} />✦<span className={line} /></div>
    </div>
  )
}
