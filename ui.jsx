import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import { LANGS, useI18n } from './i18n'

const SERIF = '"Cormorant Garamond", Georgia, "Times New Roman", serif'

export function Magnetic({ children }) {
  const r = useRef(null), x = useMotionValue(0), y = useMotionValue(0), off = useReducedMotion()
  const sx = useSpring(x, { stiffness: 220, damping: 14 }), sy = useSpring(y, { stiffness: 220, damping: 14 })
  const move = e => {
    if (off || e.pointerType !== 'mouse' || !r.current) return // mouse only, keeps touch scrolling smooth
    const b = r.current.getBoundingClientRect()
    x.set((e.clientX - b.left - b.width / 2) * 0.25)
    y.set((e.clientY - b.top - b.height / 2) * 0.25)
  }
  return <motion.span ref={r} style={{ x: sx, y: sy, display: 'inline-block' }} onPointerMove={move} onPointerLeave={() => { x.set(0); y.set(0) }}>{children}</motion.span>
}

// Typographic wordmark. Always Latin, always left-to-right, even inside the Arabic interface.
export function Wordmark({ className = 'text-xl' }) {
  return (
    <span dir="ltr" lang="en" className={`silver inline-block font-semibold tracking-[.38em] ${className}`} style={{ fontFamily: SERIF }}>PRESORA</span>
  )
}

export function LangSwitcher({ id = 'ls' }) {
  const { lang, setLang, t } = useI18n()
  return (
    <div role="group" aria-label={t('nav.lang')} dir="ltr" className="relative inline-flex rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur">
      {Object.entries(LANGS).map(([k, v]) => (
        <button key={k} type="button" onClick={() => setLang(k)} aria-pressed={lang === k} lang={k} title={v.name} className="relative rounded-full px-3 py-1.5 text-xs font-semibold">
          {lang === k && <motion.span layoutId={`lang-${id}`} className="absolute inset-0 rounded-full bg-gradient-to-r from-copper to-sand" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
          <span className={`relative transition ${lang === k ? 'text-[#060403]' : 'text-silver hover:text-ivory'}`}>{v.short}</span>
        </button>
      ))}
    </div>
  )
}

const faces = ['rotateY(0deg)', 'rotateY(90deg)', 'rotateY(180deg)', 'rotateY(270deg)', 'rotateX(90deg)', 'rotateX(-90deg)']
export function Hero3D() {
  const spin = (d, t) => ({ animate: { rotateY: [0, d * 360], rotateX: [-20, -20] }, transition: { duration: t, repeat: Infinity, ease: 'linear' } })
  return (
    <div className="relative mx-auto mt-16 h-72 w-72 md:h-96 md:w-96" style={{ perspective: 900 }} aria-hidden="true">
      <div className="absolute inset-8 rounded-full bg-copper/30 blur-[90px]" />
      <div className="absolute inset-16 rounded-full bg-sand/15 blur-[70px]" />
      <div className="absolute inset-20 rounded-full bg-champagne/20 blur-[80px]" />
      <div className="float absolute inset-0 grid place-items-center" style={{ willChange: 'transform' }}>
        <div className="scale-90 md:scale-[1.3]" style={{ transformStyle: 'preserve-3d' }}>
          <motion.div {...spin(1, 26)} style={{ transformStyle: 'preserve-3d', width: 120, height: 120, position: 'relative', willChange: 'transform' }}>
            {faces.map(f => <div key={f} className="absolute inset-0 border border-sand/35 bg-gradient-to-br from-bronze/50 via-white/5 to-copper/30 backdrop-blur-[2px]" style={{ transform: `${f} translateZ(60px)` }} />)}
            <motion.div {...spin(-1, 14)} style={{ transformStyle: 'preserve-3d', width: 50, height: 50, position: 'absolute', left: 35, top: 35 }}>
              {faces.map(f => <div key={f} className="absolute inset-0 border border-sand/70 bg-copper/35" style={{ transform: `${f} translateZ(25px)` }} />)}
            </motion.div>
          </motion.div>
        </div>
        {[200, 270].map((s, i) => (
          <motion.div key={s} className="absolute rounded-full border border-champagne/35" style={{ width: s, height: s, rotateX: 72 }}
            animate={{ rotateZ: [0, i ? -360 : 360] }} transition={{ duration: 18 + i * 8, repeat: Infinity, ease: 'linear' }} />
        ))}
      </div>
      {[['left-2 top-10', 'h-4 w-4 rotate-12 rounded-sm bg-sand/70', 0], ['right-4 top-24', 'h-3 w-3 rounded-full bg-copper/80', 1.5], ['left-10 bottom-8', 'h-2.5 w-2.5 rounded-full bg-ivory/70', 3], ['right-10 bottom-4', 'h-5 w-5 rotate-45 rounded-sm border border-silver/50', 2]].map(([p, c, d]) => (
        <span key={p} className={`float absolute ${p} ${c}`} style={{ animationDelay: `${d}s` }} />
      ))}
    </div>
  )
}

const hues = ['from-copper to-bronze', 'from-sand to-champagne', 'from-champagne to-stone', 'from-bronze to-copper']
export function ServiceCard({ s, i, cta }) {
  const { t } = useI18n()
  const glow = e => {
    if (e.pointerType !== 'mouse') return
    const b = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - b.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - b.top}px`)
  }
  return (
    <motion.div whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} onPointerMove={glow}
      className="gborder group relative h-full overflow-hidden rounded-3xl bg-[#0b0806]/75 p-6 backdrop-blur-xl">
      <span className="spot pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className={`absolute -end-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${hues[i % 4]} opacity-25 blur-3xl transition-opacity duration-500 group-hover:opacity-55`} />
      <span className="absolute end-5 top-4 font-mono text-xs tracking-widest text-white/25" dir="ltr">0{i + 1}</span>
      <div className={`relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${hues[i % 4]} text-2xl shadow-lg`}>{s.icon}</div>
      <h3 className="relative mt-5 text-xl font-bold tracking-tight">{t(`sv.${s.k}.t`)}</h3>
      <p className="relative mt-2 text-white/60">{t(`sv.${s.k}.d`)}</p>
      {cta && <Link to="/order" className="relative mt-5 inline-flex items-center gap-1 text-sand">{t('sv.order')} <span className="flip inline-block transition group-hover:translate-x-1">→</span></Link>}
    </motion.div>
  )
}

export function Signature() {
  const { t } = useI18n()
  const line = 'h-px w-16 bg-gradient-to-r from-transparent via-sand/50 to-transparent'
  return (
    <div className="flex flex-col items-center px-5 py-16 text-center">
      <div className="flex items-center gap-3 text-sand/60" aria-hidden="true"><span className={line} />◆<span className={line} /></div>
      <motion.p dir="ltr" lang="en" initial={{ opacity: 0, letterSpacing: '.02em' }} whileInView={{ opacity: 1, letterSpacing: '.12em' }} viewport={{ once: true }} transition={{ duration: 1.4 }}
        className="silver mt-4 text-4xl font-semibold md:text-6xl" style={{ fontFamily: SERIF }}>{t('f.made')}</motion.p>
      <div className="mt-4 flex items-center gap-3 text-copper/70" aria-hidden="true"><span className={line} />✦<span className={line} /></div>
    </div>
  )
}
