import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { LANGS, useI18n } from './i18n'
import { imgSrcSmall } from './portfolioData'

const SERIF = '"Cormorant Garamond", Georgia, "Times New Roman", serif'
export const EASE = [0.22, 1, 0.36, 1]

export function Magnetic({ children }) {
  const r = useRef(null), x = useMotionValue(0), y = useMotionValue(0), off = useReducedMotion()
  const sx = useSpring(x, { stiffness: 220, damping: 14 }), sy = useSpring(y, { stiffness: 220, damping: 14 })
  const move = e => {
    if (off || e.pointerType !== 'mouse' || !r.current) return
    const b = r.current.getBoundingClientRect()
    x.set((e.clientX - b.left - b.width / 2) * 0.2)
    y.set((e.clientY - b.top - b.height / 2) * 0.2)
  }
  return <motion.span ref={r} style={{ x: sx, y: sy, display: 'inline-block' }} onPointerMove={move} onPointerLeave={() => { x.set(0); y.set(0) }}>{children}</motion.span>
}

// Typographic wordmark: always Latin and left-to-right, even in the Arabic interface.
export function Wordmark({ className = 'text-xl', rule = false }) {
  return (
    <span dir="ltr" lang="en" className={`inline-flex flex-col ${className}`} style={{ fontFamily: SERIF }}>
      <span className="silver font-bold tracking-[.42em]">PRESORA</span>
      {rule && <span className="mt-3 h-px w-full bg-gradient-to-r from-steel to-transparent" />}
    </span>
  )
}

// Staggered word-by-word headline reveal.
export function Words({ text, className = '', delay = 0 }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span key={i} aria-hidden="true" className="me-[.22em] -my-[.1em] inline-block overflow-hidden py-[.1em] align-bottom">
          <motion.span className="inline-block" initial={{ y: '115%' }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: delay + i * 0.08, ease: EASE }}>{w}</motion.span>
        </span>
      ))}
    </span>
  )
}

export function LangSwitcher({ id = 'ls' }) {
  const { lang, setLang, t } = useI18n()
  return (
    <div role="group" aria-label={t('nav.lang')} dir="ltr" className="relative inline-flex border border-steel/30">
      {Object.entries(LANGS).map(([k, v]) => (
        <button key={k} type="button" onClick={() => setLang(k)} aria-pressed={lang === k} lang={k} title={v.name} className="relative min-w-11 px-3 py-2 text-xs font-semibold tracking-widest">
          {lang === k && <motion.span layoutId={`lang-${id}`} className="absolute inset-0 bg-paper" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
          <span className={`relative transition ${lang === k ? 'text-navy' : 'text-steel hover:text-paper'}`}>{v.short}</span>
        </button>
      ))}
    </div>
  )
}

// Abstract slide mock-ups built only from the three brand colours. Always labelled as samples.
export function SlidePreview({ v = 0, title, tag = true }) {
  const { t } = useI18n()
  const tone = ['bg-paper text-navy', 'bg-navy text-paper', 'bg-steel text-navy', 'bg-navy text-paper'][v % 4]
  return (
    <div className={`relative aspect-video w-full overflow-hidden border border-steel/30 ${tone}`}>
      {v % 4 === 0 && <div className="absolute bottom-[8%] end-[6%] aspect-square w-1/4 bg-steel/50" />}
      {v % 4 === 1 && <div className="absolute -bottom-1/3 -end-1/6 aspect-square w-2/3 rounded-full border border-steel/50" />}
      {v % 4 === 2 && <div className="absolute inset-x-[6%] bottom-[8%] flex h-1/3 gap-[3%]">{[1, 2, 3].map(n => <div key={n} className="flex-1 bg-navy/20" />)}</div>}
      {v % 4 === 3 && <div className="absolute inset-x-[6%] bottom-[8%] flex h-2/5 items-end gap-[3%]">{[40, 65, 50, 85, 70].map((h, n) => <div key={n} className="flex-1 bg-paper/60" style={{ height: `${h}%` }} />)}</div>}
      {tag && <span className="absolute end-3 top-3 border border-current px-2 py-0.5 text-[9px] uppercase tracking-[.2em] opacity-60 rtl:tracking-normal">{t('sample')}</span>}
      <div className="relative z-10 p-[6%]">
        <div className="h-px w-10 bg-current opacity-50" />
        <p className="font-display mt-3 max-w-[70%] text-lg font-semibold leading-tight sm:text-2xl">{title}</p>
      </div>
    </div>
  )
}

function Frame({ id, title, pos, delay, depth, scrollY, off, eager }) {
  const y = useTransform(scrollY, [0, 700], [0, off ? 0 : depth])
  return (
    <motion.div style={{ ...pos, y }} initial={off ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)', opacity: 0 }} animate={off ? { opacity: 1 } : { clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
      transition={{ duration: 1.1, delay, ease: EASE }} className="absolute w-[72%] border border-steel/30 shadow-[0_30px_70px_-30px_rgba(16,28,44,.9)]">
      <img src={imgSrcSmall(id)} width="1600" height="900" alt="" loading={eager ? 'eager' : 'lazy'} decoding="async" fetchPriority={eager ? 'high' : 'auto'} className="aspect-video w-full object-cover" />
    </motion.div>
  )
}
// Hero composition of three real demo designs (decorative: the Portfolio section carries the labelled, captioned versions).
export function HeroStage() {
  const { scrollY } = useScroll(), off = useReducedMotion()
  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-xl" aria-hidden="true">
      <div className="absolute -bottom-4 -end-4 start-8 top-8 border border-steel/25" />
      <Frame id="uni-seminar" pos={{ top: 0, insetInlineStart: '28%' }} delay={0.5} depth={-70} scrollY={scrollY} off={off} />
      <Frame id="school-science" pos={{ top: '14%', insetInlineStart: '14%' }} delay={0.7} depth={-35} scrollY={scrollY} off={off} />
      <Frame id="biz-pitch" pos={{ top: '30%', insetInlineStart: 0 }} delay={0.9} depth={20} scrollY={scrollY} off={off} eager />
    </div>
  )
}

// Oversized editorial wordmark for the hero. Always Latin and left-to-right.
export function HeroWordmark() {
  const off = useReducedMotion()
  return (
    <div dir="ltr" lang="en" className="overflow-hidden" aria-hidden="true">
      <motion.div initial={off ? { opacity: 0 } : { y: '105%' }} animate={off ? { opacity: 1 } : { y: 0 }} transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
        className="silver whitespace-nowrap text-center font-bold leading-[.95] tracking-[.08em] text-[clamp(2.6rem,15.5vw,14rem)]" style={{ fontFamily: SERIF }}>PRESORA</motion.div>
    </div>
  )
}

// Architectural list row. "s.k" is the service/order type key.
export function ServiceCard({ s, i, cta }) {
  const { t } = useI18n()
  return (
    <Link to={cta ? '/order' : '/services'} className="group grid grid-cols-[auto_1fr_auto] items-start gap-5 border-b border-steel/25 px-2 py-8 transition duration-300 hover:bg-paper/[0.04] md:gap-10 md:px-6">
      <span dir="ltr" className="pt-2 font-mono text-sm text-steel">0{i + 1}</span>
      <div>
        <h3 className="font-display text-3xl font-semibold md:text-4xl">{t(`sv.${s.k}.t`)}</h3>
        <p className="mt-3 max-w-xl text-steel">{t(`sv.${s.k}.d`)}</p>
        {cta && <span className="mt-5 inline-block text-xs font-semibold uppercase tracking-[.2em] text-paper rtl:tracking-normal">{t('sv.order')}</span>}
      </div>
      <span className="flip pt-2 text-2xl text-steel transition duration-300 group-hover:translate-x-1 group-hover:text-paper rtl:group-hover:-translate-x-1" aria-hidden="true">→</span>
    </Link>
  )
}

export function Signature() {
  const { t } = useI18n()
  const line = 'h-px w-16 bg-gradient-to-r from-transparent via-steel/60 to-transparent'
  return (
    <div className="flex flex-col items-center px-5 py-16 text-center">
      <div className="flex items-center gap-3 text-steel/70" aria-hidden="true"><span className={line} />◆<span className={line} /></div>
      <motion.p dir="ltr" lang="en" initial={{ opacity: 0, letterSpacing: '.02em' }} whileInView={{ opacity: 1, letterSpacing: '.12em' }} viewport={{ once: true }} transition={{ duration: 1.4, ease: EASE }}
        className="silver mt-4 text-4xl font-semibold md:text-6xl" style={{ fontFamily: SERIF }}>{t('f.made')}</motion.p>
    </div>
  )
}
