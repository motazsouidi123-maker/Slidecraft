import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useSpring, useScroll } from 'framer-motion'

/* Kept for compatibility: buttons no longer chase the pointer, they simply lift slightly on hover. */
export function Magnetic({ children }) {
  return <motion.span style={{ display: 'inline-block' }} whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>{children}</motion.span>
}

export function Wordmark({ sub }) {
  return (
    <span className="inline-flex flex-col leading-none">
      <span className="font-display text-[1.65rem] font-semibold tracking-[.3em] text-snow">PRESORA</span>
      {sub && <span className="mt-1 text-[8px] uppercase tracking-[.28em] text-bronze">Created by Motaz Souidi</span>}
    </span>
  )
}

export function Signature() {
  const line = 'h-px w-14 bg-gradient-to-r from-transparent via-bronze to-transparent'
  return (
    <div className="flex flex-col items-center px-5 py-16 text-center" aria-label="Created by Motaz Souidi">
      <div className="flex items-center gap-3"><span className={line} /><span className="font-display text-lg italic text-snow/70">Created by</span><span className={line} /></div>
      <motion.p initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true }} transition={{ duration: 1.3 }}
        className="gold-text font-display mt-3 pr-1 text-5xl font-medium italic tracking-tight sm:text-7xl">Motaz Souidi</motion.p>
      <svg width="170" height="16" viewBox="0 0 170 16" className="mt-3" aria-hidden="true">
        <motion.path d="M2 9 C 32 -2, 54 16, 85 8 S 140 0, 168 9" stroke="#C08A52" strokeWidth="1.2" fill="none" strokeLinecap="round"
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
        style={{ background: 'radial-gradient(circle, rgba(192,138,82,.28), rgba(23,21,18,.5) 34%, transparent 62%)' }}
        animate={{ scale: [0.8, 1.1], opacity: [0.3, 1] }} transition={{ duration: 5.2, ease: 'easeInOut' }} />
      <div className="grain absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#0B0B0B_95%)]" />
      <div className="relative grid h-full place-items-center px-6 text-center">
        <AnimatePresence mode="wait">
          {phase === 0 ? (
            <motion.h1 key="w" exit={{ opacity: 0, filter: 'blur(10px)' }} transition={{ duration: 0.6 }} className="font-display text-[2.6rem] font-light leading-tight tracking-[.1em] text-snow sm:text-6xl md:text-7xl">
              {words.map((w, i) => <motion.span key={w} className="mr-[.3em] inline-block" initial={{ opacity: 0, y: 30, filter: 'blur(12px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: 0.4 + i * 0.5, duration: 1 }}>{w}</motion.span>)}
            </motion.h1>
          ) : (
            <motion.div key="l" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
              <p className="gold-text font-display pl-[.3em] text-5xl font-semibold tracking-[.3em] sm:text-7xl">PRESORA</p>
              <p className="mt-4 text-[10px] uppercase tracking-[.4em] text-bronze sm:text-xs">Premium Creative Presentation Studio</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <motion.div className="absolute bottom-0 left-0 h-px bg-bronze" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 5.2, ease: 'linear' }} />
      <button onClick={fin} className="absolute bottom-8 right-6 border border-bronze/40 px-5 py-2 text-[11px] uppercase tracking-[.3em] text-snow/80 transition hover:border-bronze hover:text-snow">Skip intro</button>
    </motion.div>
  )
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const sx = useSpring(scrollYProgress, { stiffness: 120, damping: 25 })
  return <motion.div className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-bronze via-goldlight to-snow" style={{ scaleX: sx }} />
}

/* ---------- Hero visual ---------- */

/* Static, lightweight hero composition. Used on phones, low-power devices, reduced motion, or when WebGL is unavailable. */
export function DeckStack() {
  const cards = [
    { cls: 'bg-char border-bronze/30', z: 0, t: 'translate(-34%,-30%) rotate(-8deg)', d: 0 },
    { cls: 'bg-snow border-snow', z: 40, t: 'translate(26%,-8%) rotate(5deg)', d: 1.2 },
    { cls: 'bg-gradient-to-br from-bronze via-[#4a3420] to-ink border-goldlight/40', z: 80, t: 'translate(-8%,18%) rotate(-2deg)', d: 2.4 },
  ]
  return (
    <div className="relative h-full w-full" aria-hidden="true">
      <div className="absolute inset-10 rounded-full bg-bronze/15 blur-[100px]" /><div className="absolute inset-24 rounded-full bg-goldlight/10 blur-[80px]" />
      {cards.map((c, i) => (
        <div key={i} className="absolute left-1/2 top-1/2 w-[70%]" style={{ transform: `translate(-50%,-50%) ${c.t}` }}>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.2, duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}>
            <div className="float relative aspect-[16/10] overflow-hidden rounded-md border p-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,.9)]" style={{ animationDelay: `${c.d}s` }}>
              <div className={`absolute inset-0 ${c.cls}`} />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent" />
              {i === 0 && <div className="relative flex h-full items-end gap-2">{[30, 55, 42, 75, 60].map(h => <div key={h} className="w-6 bg-bronze/70" style={{ height: `${h}%` }} />)}</div>}
              {i === 1 && <div className="relative flex h-full flex-col justify-between text-ink"><div className="h-px w-10 bg-ink" /><p className="font-display text-2xl italic">Less, but better.</p><div className="space-y-1"><div className="h-1 w-3/4 bg-ink/20" /><div className="h-1 w-1/2 bg-ink/20" /></div></div>}
              {i === 2 && <div className="relative flex h-full flex-col justify-between"><span className="text-[8px] tracking-[.35em] text-goldlight">PRESORA</span><div><div className="mb-2 h-px w-12 bg-goldlight" /><p className="font-display text-2xl text-snow sm:text-3xl">Annual Strategy</p><p className="mt-1 text-[8px] tracking-[.3em] text-goldlight">SAMPLE DESIGN</p></div></div>}
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  )
}
export const Hero3D = DeckStack

const Scene3D = lazy(() => import('./Hero3D'))

function canRun3D() {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    if (window.innerWidth < 768) return false
    const nav = navigator
    if (nav.connection && nav.connection.saveData) return false
    if ((nav.hardwareConcurrency || 8) < 4 || (nav.deviceMemory || 8) < 4) return false
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    if (!gl) return false
    const ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext()
    return true
  } catch { return false }
}

/* The 3D scene is code-split and only loaded on capable desktop devices; everything else gets the flat composition. */
export function HeroVisual() {
  const [use3D, setUse3D] = useState(false)
  useEffect(() => { setUse3D(canRun3D()) }, [])
  return (
    <div className="relative mx-auto h-[22rem] w-full max-w-lg sm:h-[28rem] lg:h-[34rem] lg:max-w-none">
      {use3D
        ? <Suspense fallback={<DeckStack />}><Scene3D onFail={() => setUse3D(false)} /></Suspense>
        : <DeckStack />}
    </div>
  )
}

export function Marquee({ items }) {
  const row = [...items, ...items]
  return (
    <div className="overflow-hidden border-y border-bronze/20 py-5" aria-hidden="true">
      <div className="marquee flex w-max gap-12 whitespace-nowrap font-display text-3xl font-light italic text-snow/50">
        {row.map((t, i) => <span key={i} className="flex items-center gap-12">{t}<span className="text-sm text-bronze">◆</span></span>)}
      </div>
    </div>
  )
}

const looks = [
  ['bg-char text-snow', 'text-snow/[.05]', 'text-snow/70'],
  ['bg-gradient-to-br from-bronze to-[#7a5530] text-ink', 'text-ink/10', 'text-ink/75'],
  ['bg-snow text-ink', 'text-ink/[.07]', 'text-ink/65'],
  ['bg-ink text-snow', 'text-bronze/20', 'text-snow/70'],
  ['bg-char text-snow', 'text-goldlight/10', 'text-snow/70'],
  ['bg-goldlight text-ink', 'text-ink/10', 'text-ink/70'],
]
export function BentoCard({ s, i, cta }) {
  const [box, num, sub] = looks[i % 6]
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} className={`gborder group relative flex h-full min-h-[14rem] flex-col justify-between overflow-hidden rounded-sm p-7 ${box}`}>
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

/* ---------- Portfolio sample designs (all fictional DEMO / SAMPLE content) ---------- */

const THEMES = {
  dark: { bg: '#0B0B0B', fg: '#F5F1EA', ac: '#C08A52', mu: '#8F867B', line: 'rgba(192,138,82,.35)' },
  char: { bg: '#171512', fg: '#F5F1EA', ac: '#E9C99A', mu: '#8F867B', line: 'rgba(233,201,154,.3)' },
  light: { bg: '#F5F1EA', fg: '#0B0B0B', ac: '#C08A52', mu: '#6F675D', line: 'rgba(11,11,11,.25)' },
  bronze: { bg: 'linear-gradient(135deg,#C08A52,#7a5530)', fg: '#0B0B0B', ac: '#F5F1EA', mu: 'rgba(11,11,11,.65)', line: 'rgba(11,11,11,.3)' },
  grid: { bg: '#0B0B0B', fg: '#F5F1EA', ac: '#E9C99A', mu: '#8F867B', line: 'rgba(233,201,154,.3)', grid: true },
}

export const sampleStyles = [
  { n: 'Luxury Corporate', c: 'Corporate', th: 'dark', featured: true, use: 'Boardroom decks, annual reviews, investor updates', d: 'Black canvases, bronze accents and generous space for confident leadership presentations.', p: ['#0B0B0B', '#171512', '#C08A52', '#E9C99A'], order: 'Business',
    slides: [{ t: 'cover', title: 'Annual Strategy Review', sub: 'Corporate presentation' }, { t: 'list', h: 'Agenda', items: ['Performance overview', 'Strategic priorities', 'Outlook and investments'] }, { t: 'stats', h: 'Year at a glance', stats: [['+24%', 'Revenue growth', 78], ['12', 'New markets', 55], ['96%', 'Client retention', 96]] }] },
  { n: 'Minimalist Editorial', c: 'Minimal', th: 'light', use: 'Essays, keynotes, one-idea-per-slide talks', d: 'Magazine-style typography and whitespace that lets one idea speak at a time.', p: ['#F5F1EA', '#0B0B0B', '#C08A52', '#8F867B'], order: 'Creative',
    slides: [{ t: 'cover', title: 'Less, but better.', sub: 'Essay' }, { t: 'list', h: 'Three principles', items: ['Remove what does not help', 'Give every idea room', 'Let type do the work'] }, { t: 'stats', h: 'In numbers', stats: [['1', 'Idea per slide', 30], ['3', 'Colours maximum', 45], ['0', 'Clutter', 4]] }] },
  { n: 'Modern Technology', c: 'Technology', th: 'grid', use: 'Product launches, tech briefings, data stories', d: 'Precise grids, data visuals and a calm, forward-looking tone.', p: ['#0B0B0B', '#171512', '#E9C99A', '#8F867B'], order: 'Business',
    slides: [{ t: 'cover', title: 'Growth, visualised', sub: 'Technology briefing' }, { t: 'list', h: 'Roadmap', items: ['Platform foundations', 'Automation layer', 'Intelligence features'] }, { t: 'stats', h: 'Platform metrics', stats: [['3.2×', 'Faster delivery', 80], ['99.9%', 'Availability', 99], ['40%', 'Cost reduction', 40]] }] },
  { n: 'Academic Excellence', c: 'Education', th: 'char', use: 'Lectures, theses, training material', d: 'Clear structure for research and teaching, with arguments first and decoration second.', p: ['#171512', '#F5F1EA', '#E9C99A', '#8F867B'], order: 'University',
    slides: [{ t: 'cover', title: 'Thesis Defence', sub: 'Academic presentation' }, { t: 'list', h: 'Structure', items: ['Research question', 'Method and data', 'Findings and limits'] }, { t: 'stats', h: 'Study overview', stats: [['120', 'Participants', 60], ['4', 'Research phases', 40], ['2', 'Key findings', 20]] }] },
  { n: 'Creative Storytelling', c: 'Creative', th: 'bronze', featured: true, use: 'Brand stories, portfolios, cinematic narratives', d: 'Cinematic pacing and bold imagery to carry an audience through a narrative.', p: ['#C08A52', '#E9C99A', '#F5F1EA', '#0B0B0B'], order: 'Creative',
    slides: [{ t: 'cover', title: 'Every story begins with a single slide.', sub: 'Creative narrative' }, { t: 'list', h: 'Story arc', items: ['The spark', 'The turning point', 'The resolution'] }, { t: 'stats', h: 'Pacing', stats: [['3', 'Acts', 30], ['12', 'Scenes', 60], ['1', 'Message', 10]] }] },
  { n: 'Business Strategy', c: 'Business', th: 'char', use: 'Roadmaps, comparisons, decision papers', d: 'Frameworks and comparisons that make decisions easy to follow.', p: ['#171512', '#F5F1EA', '#C08A52', '#E9C99A'], order: 'Business',
    slides: [{ t: 'cover', title: 'Plan. Build. Launch.', sub: 'Business strategy' }, { t: 'list', h: 'Priorities', items: ['Focus on core customers', 'Simplify the offer', 'Scale what works'] }, { t: 'stats', h: 'Targets', stats: [['Q1', 'Plan', 25], ['Q2', 'Build', 50], ['Q3', 'Launch', 75]] }] },
  { n: 'Brand Campaign', c: 'Marketing', th: 'dark', featured: true, use: 'Campaign pitches, brand and product stories', d: 'Bold hierarchy and warm metallic accents for campaigns that need to be remembered.', p: ['#0B0B0B', '#C08A52', '#E9C99A', '#F5F1EA'], order: 'Business',
    slides: [{ t: 'cover', title: 'Make it unforgettable.', sub: 'Campaign concept' }, { t: 'list', h: 'Campaign pillars', items: ['A clear promise', 'A distinctive look', 'A consistent voice'] }, { t: 'stats', h: 'Target outcomes', stats: [['2×', 'Reach', 70], ['35%', 'Engagement', 35], ['5', 'Channels', 50]] }] },
  { n: 'Clinical Overview', c: 'Medical', th: 'light', use: 'Medical lectures, case reviews, health briefings', d: 'Calm, legible layouts that present complex information without noise.', p: ['#F5F1EA', '#171512', '#C08A52', '#8F867B'], order: 'University',
    slides: [{ t: 'cover', title: 'Case Review', sub: 'Medical presentation' }, { t: 'list', h: 'Outline', items: ['Presentation and history', 'Assessment and findings', 'Management plan'] }, { t: 'stats', h: 'Summary data', stats: [['85%', 'Response rate', 85], ['14', 'Days follow-up', 45], ['3', 'Key outcomes', 30]] }] },
]

/* Draws one slide in an 800×450 design space (multiplied by u); Portfolio scales it to its container. */
export function SlideArt({ k, i = 0, u = 1 }) {
  const s = sampleStyles[k % sampleStyles.length], th = THEMES[s.th], sl = s.slides[i % s.slides.length]
  const z = n => Math.round(n * u * 100) / 100
  const serif = '"Cormorant Garamond", Georgia, serif'
  const box = { width: '100%', height: '100%', boxSizing: 'border-box', padding: `${z(44)}px ${z(56)}px`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: th.fg, background: th.bg, fontFamily: 'Manrope, system-ui, sans-serif', position: 'relative', overflow: 'hidden' }
  if (th.grid) { box.backgroundImage = 'linear-gradient(rgba(233,201,154,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(233,201,154,.07) 1px,transparent 1px)'; box.backgroundSize = `${z(32)}px ${z(32)}px`; box.backgroundColor = th.bg }
  const tag = { fontSize: z(12), letterSpacing: '.3em', color: th.mu, textTransform: 'uppercase' }
  const top = (
    <div style={{ display: 'flex', justifyContent: 'space-between', ...tag }}>
      <span style={{ color: th.ac, fontWeight: 600 }}>PRESORA</span><span>Sample · {String(i + 1).padStart(2, '0')}/{String(s.slides.length).padStart(2, '0')}</span>
    </div>
  )
  if (sl.t === 'cover') return (
    <div style={box}>{top}
      <div><div style={{ width: z(72), height: 2, background: th.ac, marginBottom: z(20) }} />
        <p style={{ fontFamily: serif, fontStyle: 'italic', fontWeight: 300, fontSize: z(sl.title.length > 28 ? 52 : 68), lineHeight: 1.02, margin: 0, maxWidth: z(620) }}>{sl.title}</p>
        <p style={{ ...tag, marginTop: z(18), color: th.ac }}>{sl.sub}</p></div>
    </div>
  )
  if (sl.t === 'list') return (
    <div style={box}>{top}
      <div><p style={{ fontFamily: serif, fontSize: z(48), fontWeight: 500, margin: `0 0 ${z(22)}px` }}>{sl.h}</p>
        {sl.items.map((it, j) => (
          <div key={it} style={{ display: 'flex', gap: z(24), alignItems: 'baseline', borderTop: `1px solid ${th.line}`, padding: `${z(14)}px 0` }}>
            <span style={{ fontFamily: serif, fontStyle: 'italic', fontSize: z(22), color: th.ac, width: z(34) }}>{String(j + 1).padStart(2, '0')}</span><span style={{ fontSize: z(20) }}>{it}</span>
          </div>))}
      </div>
    </div>
  )
  return (
    <div style={box}>{top}
      <div><p style={{ fontFamily: serif, fontSize: z(48), fontWeight: 500, margin: `0 0 ${z(26)}px` }}>{sl.h}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: z(32) }}>
          {sl.stats.map(([v, l, pct]) => (
            <div key={l}><p style={{ fontFamily: serif, fontSize: z(64), fontWeight: 300, margin: 0, lineHeight: 1, color: th.ac }}>{v}</p>
              <p style={{ ...tag, margin: `${z(10)}px 0 ${z(12)}px` }}>{l}</p>
              <div style={{ height: 3, background: th.line }}><div style={{ height: 3, width: `${pct}%`, background: th.ac }} /></div></div>))}
        </div>
      </div>
    </div>
  )
}
