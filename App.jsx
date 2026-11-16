import { useState, useEffect, useRef } from 'react'
import { HashRouter, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, MotionConfig, useScroll, useSpring, useTransform, useMotionValue, useReducedMotion, animate } from 'framer-motion'
import { supabase, WA, MAIL } from './supabase'
import Admin from './Admin'
import Portfolio from './Portfolio'
import { I18nProvider } from './i18n'
import { Magnetic, Wordmark, Signature, Loader, ScrollProgress, HeroVisual, Marquee, BentoCard, sampleStyles } from './ui'

const input = 'w-full rounded-sm border border-bronze/25 bg-white/[0.03] px-4 py-3.5 text-snow placeholder-mute outline-none transition focus:border-bronze focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(192,138,82,.18)]'
const btnBase = 'group inline-flex items-center justify-center gap-3 rounded-sm px-8 py-4 text-xs font-semibold uppercase tracking-[.22em] transition'
const primary = `${btnBase} bg-gradient-to-r from-goldlight via-gold to-[#7a5530] text-ink shadow-[0_12px_40px_-10px_rgba(192,138,82,.65)] hover:brightness-110`
const ghost = `${btnBase} border border-bronze/40 text-snow hover:border-bronze hover:bg-white/5`

const services = [
  { icon: '◆', t: 'Corporate Presentations', d: 'Polished decks for leadership, boards and internal strategy.' },
  { icon: '◇', t: 'Business Pitch Decks', d: 'Persuasive, investor-ready storytelling that gets to the point.' },
  { icon: '❖', t: 'Academic Presentations', d: 'Rigorous structure for theses, defences and conferences.' },
  { icon: '◈', t: 'Educational Slides', d: 'Clear lesson and training material people actually follow.' },
  { icon: '✦', t: 'Marketing Presentations', d: 'Campaign, brand and product stories with visual punch.' },
  { icon: '◐', t: 'Company Profiles', d: 'A confident introduction to who you are and what you do.' },
  { icon: '◎', t: 'Research Presentations', d: 'Complex findings turned into clear charts and narratives.' },
  { icon: '❂', t: 'Portfolio Presentations', d: 'Show your work in a layout worthy of the work itself.' },
  { icon: '✧', t: 'Creative Storytelling', d: 'Cinematic pacing and bold visuals for ideas that need to be felt.' },
  { icon: '▣', t: 'Professional Reports', d: 'Data-rich, well-organised reports built to be read and presented.' },
]
const spans = ['md:col-span-4', 'md:col-span-2', 'md:col-span-2', 'md:col-span-2', 'md:col-span-2', 'md:col-span-3', 'md:col-span-3', 'md:col-span-2', 'md:col-span-4', 'md:col-span-6']
const features = ['Custom slide layouts', 'Professional typography', 'Elegant visual hierarchy', 'Consistent design systems', 'Custom colour palettes', 'Charts and diagrams', 'Professional image selection', 'Smooth transitions', 'Subtle animations', 'Multilingual support', 'High-quality visual storytelling']
const greetings = [['English', 'Welcome', 'en', 'ltr'], ['العربية', 'مرحباً', 'ar', 'rtl'], ['Français', 'Bienvenue', 'fr', 'ltr'], ['Español', 'Bienvenido', 'es', 'ltr'], ['Italiano', 'Benvenuto', 'it', 'ltr'], ['Deutsch', 'Willkommen', 'de', 'ltr'], ['Português', 'Bem-vindo', 'pt', 'ltr']]
const types = ['School', 'University', 'Business', 'Creative']
const BLOCK = 5, BLOCK_PRICE = 500
const dzd = n => `${new Intl.NumberFormat('en-US').format(n)} DZD`
const priceFor = n => (n >= 1 ? Math.ceil(n / BLOCK) * BLOCK_PRICE : 0)
const tiers = [5, 10, 15, 20, 25]
const langs = ['English', 'French', 'Arabic', 'Italian', 'Spanish', 'German', 'Portuguese', 'Other']

const Reveal = ({ children, delay = 0, className = '' }) => (
  <motion.div className={className} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.9, delay, ease: [0.2, 0.7, 0.2, 1] }}>{children}</motion.div>
)
const Head = ({ k, children }) => (
  <Reveal className="mb-12">
    <p className="text-[11px] uppercase tracking-[.4em] text-bronze">{k}</p>
    <h2 className="font-display mt-3 text-5xl font-light leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">{children}</h2>
  </Reveal>
)
const Sep = () => (
  <div className="mx-auto flex max-w-6xl items-center gap-4 px-5" aria-hidden="true">
    <motion.span className="h-px flex-1 origin-right bg-gradient-to-l from-bronze/60 to-transparent" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.4 }} />
    <span className="text-xs text-bronze">◆</span>
    <motion.span className="h-px flex-1 origin-left bg-gradient-to-r from-bronze/60 to-transparent" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.4 }} />
  </div>
)
const Words = ({ text, className = '', delay = 0.2 }) => text.split(' ').map((w, i) => (
  <span key={i} className="inline-block overflow-hidden pb-[.1em] align-bottom">
    <motion.span className={`inline-block ${className}`} initial={{ y: '115%' }} animate={{ y: 0 }} transition={{ duration: 1, delay: delay + i * 0.12, ease: [0.2, 0.7, 0.2, 1] }}>{w}&nbsp;</motion.span>
  </span>
))
const PriceTable = ({ active }) => (
  <ul className="divide-y divide-bronze/15 border border-bronze/20" aria-label="Pricing">
    {tiers.map(n => (
      <li key={n} className={`flex items-center justify-between px-5 py-3.5 transition ${active === n ? 'bg-bronze/15' : ''}`}>
        <span className="text-snow/80">{n} slides</span>
        <span className="font-display text-2xl font-medium text-snow">{dzd(priceFor(n))}</span>
      </li>
    ))}
  </ul>
)
const ServiceGrid = ({ cta }) => (
  <div className="grid gap-3 md:grid-cols-6">
    {services.map((s, i) => <Reveal key={s.t} delay={(i % 3) * 0.08} className={spans[i]}><BentoCard s={s} i={i} cta={cta} /></Reveal>)}
  </div>
)

function Nav() {
  const [open, setOpen] = useState(false), [solid, setSolid] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => { const h = () => setSolid(window.scrollY > 30); h(); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h) }, [])
  const links = [['/', 'Home'], ['/services', 'Services'], ['/order', 'Order'], ['/contact', 'Contact']]
  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition duration-500 ${solid || open ? 'border-b border-bronze/15 bg-ink/80 backdrop-blur-xl' : ''}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" aria-label="PRESORA home"><Wordmark sub /></Link>
          <nav className="hidden items-center gap-9 md:flex" aria-label="Main">
            {links.map(([to, l]) => (
              <NavLink key={to} to={to} className="relative py-1 text-[11px] font-medium uppercase tracking-[.25em]">
                {({ isActive }) => (<><span className={isActive ? 'text-snow' : 'text-snow/60 transition hover:text-snow'}>{l}</span>{isActive && <motion.span layoutId="navline" className="absolute inset-x-0 -bottom-1 h-px bg-bronze" />}</>)}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/order" className="hidden border border-bronze/50 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[.22em] text-snow transition hover:bg-bronze hover:text-ink md:block">Start your project</Link>
            <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menu" className="grid h-11 w-11 place-items-center border border-bronze/30 md:hidden">
              <span className="relative h-3 w-5"><span className={`absolute left-0 top-0 h-px w-5 bg-snow transition ${open ? 'translate-y-[6px] rotate-45' : ''}`} /><span className={`absolute left-0 top-[11px] h-px w-5 bg-snow transition ${open ? '-translate-y-[5px] -rotate-45' : ''}`} /></span>
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <motion.nav initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 flex flex-col justify-center gap-3 bg-ink/97 px-8 backdrop-blur-2xl md:hidden" aria-label="Mobile">
            {links.map(([to, l], i) => (
              <motion.div key={to} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i + 0.1, duration: 0.7 }}>
                <Link to={to} className="font-display block py-1 text-6xl font-light italic tracking-tight">{l}</Link>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8"><Link to="/order" className={primary}>Start your project</Link></motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}

function Home() {
  const hero = useRef(null), tl = useRef(null)
  const { scrollYProgress } = useScroll({ target: tl, offset: ['start 70%', 'end 70%'] })
  const line = useSpring(scrollYProgress, { stiffness: 90, damping: 22 })
  const steps = [['Fill the form', 'Topic, slides, language, type and deadline — optionally attach reference files.'], ['Send on WhatsApp', 'Your order is saved, then WhatsApp opens with all the details ready.'], ['We get to work', 'We follow up with you directly about your presentation.']]
  const faq = [['What do I need to place an order?', 'Just the order form: your name, WhatsApp number, topic, number of slides, language, type and deadline. Instructions and reference files are optional.'], ['Which languages are available?', 'English, Arabic, French, Spanish, Italian, German and Portuguese. Other languages are available upon request.'], ['How much does a presentation cost?', `Pricing is ${dzd(BLOCK_PRICE)} for every ${BLOCK} slides — for example, 10 slides cost ${dzd(1000)} and 20 slides cost ${dzd(2000)}. The order form shows your total instantly. After you submit, WhatsApp opens so you can discuss the details with us directly.`], ['Can I attach my own material?', 'Yes — upload a reference or requirements file (max 10 MB) on the order form.']]
  const showcase = () => { const el = document.getElementById('showcase'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }
  const scrollDown = () => { const el = document.getElementById('services'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }
  return (
    <>
      <section ref={hero} className="relative overflow-hidden px-5 pb-16 pt-32 md:pt-40 lg:flex lg:min-h-[100svh] lg:flex-col lg:justify-center">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[34rem] w-[34rem] -translate-x-1/3 rounded-full bg-[radial-gradient(circle,rgba(192,138,82,.18),rgba(23,21,18,.4)_45%,transparent_70%)]" />
        <div className="grain absolute inset-0" />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-12">
          <div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-[11px] uppercase tracking-[.4em] text-bronze">Premium creative presentation studio</motion.p>
            <h1 className="font-display mt-6 text-[2.9rem] font-light uppercase leading-[.96] tracking-tight sm:text-6xl lg:text-[4.4rem]">
              <Words text="We turn ideas" /><br /><Words text="into impact." className="bronze-text italic" delay={0.55} />
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 1 }} className="mt-7 max-w-xl text-base leading-relaxed text-snow/70 sm:text-lg">
              Presentations are more than slides. They are experiences, stories, and opportunities to make a lasting impression. PRESORA transforms your ideas into beautifully crafted visual presentations.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }} className="mt-9 flex flex-wrap gap-4">
              <Magnetic><Link to="/order" className={primary}>Start your project <span className="transition group-hover:translate-x-1">→</span></Link></Magnetic>
              <Magnetic><button onClick={showcase} className={ghost}>Explore our work</button></Magnetic>
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mt-6 text-[11px] uppercase tracking-[.3em] text-bronze">{dzd(BLOCK_PRICE)} for every {BLOCK} slides</motion.p>
          </div>
          <HeroVisual />
        </div>
        <motion.button type="button" onClick={scrollDown} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} aria-label="Scroll to services" className="relative mx-auto mt-12 flex flex-col items-center gap-3 text-[10px] uppercase tracking-[.4em] text-mute transition hover:text-snow">
          Scroll
          <span className="relative block h-12 w-px overflow-hidden bg-bronze/25" aria-hidden="true"><span className="wheel absolute left-0 top-0 block h-4 w-px bg-goldlight" /></span>
        </motion.button>
      </section>

      <Marquee items={['English', 'العربية', 'Français', 'Español', 'Italiano', 'Deutsch', 'Português', 'Presentations']} />

      <section id="services" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-28">
        <Head k="Our services">Ten ways to <em className="bronze-text">present</em></Head>
        <ServiceGrid />
      </section>
      <Sep />

      <section id="showcase" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-28">
        <Head k="Design showcase">Sample <em className="bronze-text">styles</em></Head>
        <p className="-mt-6 mb-8 max-w-xl text-sm text-snow/60">Fictional sample designs that show our range of styles — not actual client projects. Filter by type and open any design to browse.</p>
        <Reveal><Portfolio /></Reveal>
      </section>
      <Sep />

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-28 lg:grid-cols-[.8fr_1.2fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Head k="Multilingual studio">Your language, <em className="bronze-text">our design</em></Head>
          <p className="-mt-6 max-w-sm text-snow/65">Presentations can be designed in the language you request, with typography and layout direction suited to each script — including right-to-left Arabic.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {greetings.map(([name, hello, lang, dir], i) => (
            <Reveal key={name} delay={i * 0.05}>
              <div className="gborder relative flex h-full min-h-[8.5rem] flex-col justify-between rounded-sm bg-white/[0.02] p-5">
                <span className="text-[10px] uppercase tracking-[.3em] text-bronze">{name}</span>
                <p lang={lang} dir={dir} className={`mt-6 text-3xl font-light ${lang === 'ar' ? 'font-arabic' : 'font-display italic'}`}>{hello}</p>
              </div>
            </Reveal>
          ))}
          <Reveal delay={0.4}><div className="flex h-full min-h-[8.5rem] flex-col justify-between rounded-sm border border-dashed border-bronze/40 p-5"><span className="text-[10px] uppercase tracking-[.3em] text-bronze">Other</span><p className="font-display mt-6 text-2xl font-light italic text-snow/80">Other languages upon request</p></div></Reveal>
        </div>
      </section>
      <Sep />

      <section className="mx-auto max-w-6xl px-5 py-28">
        <Head k="Presentation features">Crafted for <em className="bronze-text">each project</em></Head>
        <p className="-mt-6 mb-10 max-w-xl text-sm text-snow/60">Every feature below is tailored to your topic, audience and brief.</p>
        <div className="grid border-l border-t border-bronze/20 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f} delay={(i % 3) * 0.06}><div className="group h-full border-b border-r border-bronze/20 p-7 transition hover:bg-white/[0.03]"><span className="font-display text-sm italic text-bronze">{String(i + 1).padStart(2, '0')}</span><h3 className="font-display mt-3 text-2xl font-medium">{f}</h3></div></Reveal>
          ))}
        </div>
      </section>

      <Sep />
      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-28 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <Head k="Pricing">Clear, simple <em className="bronze-text">pricing</em></Head>
          <p className="-mt-6 max-w-sm text-snow/65">{dzd(BLOCK_PRICE)} for every {BLOCK} slides. Enter your slide count on the order form and your total updates automatically. Slide counts in between are billed in {BLOCK}-slide blocks.</p>
        </div>
        <Reveal>
          <PriceTable />
          <div className="mt-6"><Magnetic><Link to="/order" className={primary}>Calculate your total →</Link></Magnetic></div>
        </Reveal>
      </section>

      <section className="px-5 py-20">
        <div className="gborder relative mx-auto max-w-6xl overflow-hidden rounded-sm bg-[#171512] p-7 sm:p-14">
          <Head k="Process">How ordering <em className="bronze-text">works</em></Head>
          <div ref={tl} className="relative ml-3 space-y-14 pl-10 sm:ml-6 sm:pl-14">
            <div className="absolute bottom-2 left-0 top-2 w-px bg-bronze/20" />
            <motion.div className="absolute bottom-2 left-0 top-2 w-px origin-top bg-bronze" style={{ scaleY: line }} />
            {steps.map(([t, d], i) => (
              <Reveal key={t}>
                <span className="absolute -left-[15px] grid h-8 w-8 place-items-center rounded-full border border-bronze bg-ink font-display text-sm italic text-snow">{i + 1}</span>
                <h3 className="font-display text-3xl font-light sm:text-5xl">{t}</h3><p className="mt-2 max-w-lg text-snow/65">{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-28">
        <Head k="FAQ">Common <em className="bronze-text">questions</em></Head>
        <div className="border-t border-bronze/20">
          {faq.map(([q, a]) => (
            <details key={q} className="group border-b border-bronze/20 py-5">
              <summary className="font-display flex cursor-pointer list-none items-center justify-between gap-4 text-2xl font-medium">{q}<span className="text-3xl font-light text-bronze transition group-open:rotate-45">+</span></summary>
              <p className="mt-3 max-w-xl text-snow/65">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden px-5 py-32 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(70,56,40,.55),transparent_65%)]" /><div className="grain absolute inset-0" />
        <Reveal className="relative">
          <p className="font-display select-none text-[22vw] font-light leading-none tracking-[.08em] text-transparent [-webkit-text-stroke:1px_#C08A52] sm:text-[15vw]" aria-hidden="true">PRESORA</p>
          <h2 className="font-display -mt-4 text-3xl font-light italic text-snow sm:text-5xl">Make every presentation matter.</h2>
          <div className="mt-10"><Magnetic><Link to="/order" className={primary}>Start your project →</Link></Magnetic></div>
        </Reveal>
      </section>
    </>
  )
}

function Services() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-28 pt-40">
      <Head k="Services">Presentations for <em className="bronze-text">every need</em></Head>
      <p className="-mt-6 mb-10 text-snow/65">Pricing: <span className="text-snow">{dzd(BLOCK_PRICE)} for every {BLOCK} slides</span> — <Link to="/order" className="underline underline-offset-4">see your total</Link>.</p>
      <ServiceGrid cta />
    </section>
  )
}

const L = ({ t, children }) => <label className="block"><span className="mb-1.5 block text-xs uppercase tracking-[.18em] text-snow/60">{t}</span>{children}</label>
const Help = ({ children }) => <p className="mt-1.5 text-xs text-mute">{children}</p>
const Err = ({ id, msg }) => (msg ? <p id={id} role="alert" className="mt-1.5 text-xs text-[#E8A58C]">{msg}</p> : null)

const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const inDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return ymd(d) }
const DRAFT = 'presora_order_draft'
const stepNames = ['Project', 'Details', 'Review']
const chip = on => `rounded-sm border px-4 py-2.5 text-xs font-semibold uppercase tracking-[.18em] transition ${on ? 'border-bronze bg-bronze/15 text-snow' : 'border-bronze/30 text-snow/70 hover:border-bronze hover:text-snow'}`
const bad = on => (on ? 'border-[#D98B6F] focus:border-[#D98B6F]' : '')
const ACCEPT = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'png', 'jpg', 'jpeg', 'webp', 'zip']
const MAX_MB = 10
const fmtSize = b => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`)
const styleNames = sampleStyles.map(s => s.n)

function CountUp({ value }) {
  const off = useReducedMotion()
  const mv = useMotionValue(value)
  const text = useTransform(mv, v => (v > 0 ? dzd(Math.round(v)) : '—'))
  useEffect(() => {
    if (off) { mv.set(value); return }
    const c = animate(mv, value, { duration: 0.6, ease: [0.2, 0.7, 0.2, 1] })
    return () => c.stop()
  }, [value, off, mv])
  return <motion.span>{text}</motion.span>
}

function Order() {
  const { state: nav } = useLocation()
  const today = ymd(new Date())
  const empty = { name: '', whatsapp: '', topic: '', slides: 10, language: 'English', type: 'School', style: '', deadline: '', instructions: '' }
  const [f, setF] = useState(() => {
    let d = {}
    try { d = JSON.parse(sessionStorage.getItem(DRAFT) || '{}') || {} } catch { d = {} }
    const base = { ...empty, ...d }
    if (base.deadline && base.deadline < today) base.deadline = ''
    if (!styleNames.includes(base.style)) base.style = ''
    if (nav && types.includes(nav.type)) base.type = nav.type
    if (nav && styleNames.includes(nav.style)) base.style = nav.style
    return base
  })
  const [file, setFile] = useState(null), [fileErr, setFileErr] = useState(''), [drag, setDrag] = useState(false)
  const [busy, setBusy] = useState(false), [phase, setPhase] = useState('')
  const [err, setErr] = useState(''), [done, setDone] = useState(null)
  const [step, setStep] = useState(0), [dir, setDir] = useState(1), [tried, setTried] = useState({})
  const set = k => e => setF(v => ({ ...v, [k]: e.target.value }))
  const n = Math.floor(Number(f.slides)) || 0, total = priceFor(n), blocks = Math.ceil(n / BLOCK)
  const go = s => { setDir(s > step ? 1 : -1); setStep(s); setErr('') }
  const bump = d => setF(v => ({ ...v, slides: Math.min(200, Math.max(1, (Math.floor(Number(v.slides)) || 0) + d)) }))
  useEffect(() => { try { sessionStorage.setItem(DRAFT, JSON.stringify(f)) } catch { /* ignore */ } }, [f])

  const validate = s => {
    const e = {}
    if (s === 0) {
      if (f.topic.trim().length < 3) e.topic = 'Enter your presentation topic (at least 3 characters).'
      if (!/^\d+$/.test(String(f.slides)) || n < 1 || n > 200) e.slides = 'Enter a whole number of slides from 1 to 200.'
    }
    if (s === 1) {
      if (f.name.trim().length < 2) e.name = 'Enter your full name.'
      const digits = f.whatsapp.replace(/\D/g, '')
      if (!/^\+?[\d\s().-]+$/.test(f.whatsapp.trim()) || digits.length < 8 || digits.length > 15) e.whatsapp = 'Enter a valid number with country code, e.g. +213 5 00 00 00 00.'
      if (!f.deadline) e.deadline = 'Choose a deadline.'
      else if (f.deadline < today) e.deadline = 'The deadline cannot be in the past.'
    }
    return e
  }
  const errs = tried[step] ? validate(step) : {}
  const focusFirst = () => setTimeout(() => { const el = document.querySelector('[aria-invalid="true"]'); if (el) el.focus() }, 0)

  const pick = list => {
    const x = list && list[0]
    if (!x) return
    const ext = (x.name.split('.').pop() || '').toLowerCase()
    if (!ACCEPT.includes(ext)) { setFile(null); setFileErr(`“.${ext}” files are not supported, so this file was not attached. Allowed: ${ACCEPT.join(', ')}.`); return }
    if (x.size === 0) { setFile(null); setFileErr('This file is empty, so it was not attached.'); return }
    if (x.size > MAX_MB * 1024 * 1024) { setFile(null); setFileErr(`This file is ${fmtSize(x.size)}; the maximum is ${MAX_MB} MB, so it was not attached.`); return }
    setFileErr(''); setFile(x)
  }

  async function submit() {
    for (const s of [0, 1]) {
      if (Object.keys(validate(s)).length) { setTried(t => ({ ...t, [s]: true })); go(s); focusFirst(); return }
    }
    setBusy(true); setErr(''); setPhase('')
    try {
      let file_url = null
      if (file) {
        if (file.size > MAX_MB * 1024 * 1024) throw new Error('File is too large (max 10 MB).')
        setPhase('Uploading your file…')
        const path = `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, '_')}`
        const { error } = await supabase.storage.from('order-files').upload(path, file)
        if (error) throw error
        file_url = supabase.storage.from('order-files').getPublicUrl(path).data.publicUrl
      }
      setPhase('Saving your order…')
      const extra = f.instructions.trim()
      const row = { name: f.name.trim(), whatsapp: f.whatsapp.trim(), topic: f.topic.trim(), slides: Number(f.slides), language: f.language, type: f.type, deadline: f.deadline || null, instructions: [f.style ? `Preferred style: ${f.style}` : '', extra].filter(Boolean).join('\n'), file_url }
      const { error } = await supabase.from('orders').insert(row)
      if (error) throw error
      const msg = `*🆕 New PRESORA Order*\n\n👤 Name: ${row.name}\n📱 WhatsApp: ${row.whatsapp}\n📌 Topic: ${row.topic}\n🖼️ Slides: ${row.slides}\n💰 Price: ${dzd(priceFor(row.slides))}\n🌍 Language: ${row.language}\n🎯 Type: ${row.type}\n🎨 Style: ${f.style || 'No preference'}\n⏰ Deadline: ${row.deadline || 'Not set'}\n📝 Instructions: ${extra || '—'}\n📎 File: ${file_url || 'None'}`
      try { sessionStorage.removeItem(DRAFT) } catch { /* ignore */ }
      setDone({ wa: `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, total: priceFor(row.slides), slides: row.slides, topic: row.topic })
    } catch (ex) { setErr(ex.message || 'Something went wrong. Please try again.') }
    setBusy(false); setPhase('')
  }
  const next = () => {
    if (Object.keys(validate(step)).length) { setTried(t => ({ ...t, [step]: true })); focusFirst(); return }
    go(step + 1)
  }
  const onSubmit = e => { e.preventDefault(); if (busy) return; if (step < 2) next(); else submit() }
  const restart = () => { setDone(null); setF({ ...empty }); setFile(null); setFileErr(''); setTried({}); setStep(0); setErr('') }

  const chosen = sampleStyles.find(s => s.n === f.style)
  const sections = [
    { title: 'Project', at: 0, rows: [['Type', f.type], ['Topic', f.topic.trim() || '—'], ['Slides', n ? `${n} slides` : '—'], ['Language', f.language], ['Style', f.style || 'No preference'], ['Price', n ? dzd(total) : '—']] },
    { title: 'Details', at: 1, rows: [['Name', f.name.trim() || '—'], ['WhatsApp', f.whatsapp.trim() || '—'], ['Deadline', f.deadline || '—'], ['Instructions', f.instructions.trim() || '—'], ['Reference file', file ? `${file.name} (${fmtSize(file.size)})` : 'None']] },
  ]

  if (done) return (
    <section className="mx-auto max-w-xl px-5 pb-28 pt-40">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="gborder relative bg-char p-8 text-center sm:p-12" role="status">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-bronze text-2xl text-goldlight">✓</span>
        <h1 className="font-display mt-6 text-4xl font-light sm:text-5xl">Your order is <em className="bronze-text">saved</em></h1>
        <p className="mt-4 text-snow/70">“{done.topic}” · {done.slides} slides · <span className="text-snow">{dzd(done.total)}</span></p>
        <p className="mt-4 text-sm text-snow/60">One last step: open WhatsApp and press send, so we can confirm the details with you directly. Nothing is sent until you do.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a href={done.wa} target="_blank" rel="noreferrer" className={primary}>Open WhatsApp →</a>
          <Link to="/" className={ghost}>Back to home</Link>
        </div>
        <button type="button" onClick={restart} className="mt-6 text-xs uppercase tracking-[.2em] text-mute transition hover:text-snow">Place another order</button>
      </motion.div>
    </section>
  )

  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-28 pt-36 sm:pt-40 lg:grid-cols-[.8fr_1.2fr]">
      <div className="lg:sticky lg:top-32 lg:self-start">
        <Head k="Start your project">Tell us your <em className="bronze-text">idea</em></Head>
        <ol className="space-y-3 text-snow/75">
          {[['Project', 'Type, topic, slides, language and style'], ['Details', 'Your contact, deadline and files'], ['Review', 'Check everything, then confirm']].map(([t, d], i) => (
            <li key={t} className="flex items-baseline gap-4"><span className="font-display w-6 text-sm italic text-bronze">{String(i + 1).padStart(2, '0')}</span><span><span className="text-snow">{t}</span> <span className="text-sm text-snow/50">— {d}</span></span></li>
          ))}
        </ol>
        <p className="mb-3 mt-10 text-[11px] uppercase tracking-[.3em] text-bronze">Pricing</p>
        <PriceTable active={n} />
      </div>
      <Reveal>
        <form onSubmit={onSubmit} noValidate className="gborder relative space-y-6 rounded-sm bg-char/80 p-6 backdrop-blur-xl sm:p-10">
          <ol className="grid grid-cols-3 gap-3" aria-label="Order steps">
            {stepNames.map((t, i) => (
              <li key={t}>
                <button type="button" disabled={i >= step} onClick={() => go(i)} aria-current={i === step ? 'step' : undefined} className="block w-full text-start disabled:cursor-default">
                  <span className="block h-px overflow-hidden bg-bronze/20"><motion.span className="block h-px bg-goldlight" initial={false} animate={{ width: i <= step ? '100%' : '0%' }} transition={{ duration: 0.5 }} /></span>
                  <span className={`mt-2 block text-[11px] uppercase tracking-[.2em] ${i === step ? 'text-snow' : i < step ? 'text-goldlight' : 'text-mute'}`}>{i < step ? '✓ ' : `${i + 1}. `}{t}</span>
                </button>
              </li>
            ))}
          </ol>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={step} initial={{ opacity: 0, x: dir * 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -24 }} transition={{ duration: 0.28 }} className="space-y-6">
              {step === 0 && (
                <>
                  <div>
                    <span className="mb-1.5 block text-xs uppercase tracking-[.18em] text-snow/60">Presentation type *</span>
                    <div role="radiogroup" aria-label="Presentation type" className="flex flex-wrap gap-2">
                      {types.map(x => <button key={x} type="button" role="radio" aria-checked={f.type === x} onClick={() => setF(v => ({ ...v, type: x }))} className={chip(f.type === x)}>{x}</button>)}
                    </div>
                  </div>
                  <div>
                    <L t="Presentation topic *"><input className={`${input} ${bad(errs.topic)}`} value={f.topic} onChange={set('topic')} placeholder="e.g. Climate change" aria-invalid={!!errs.topic || undefined} aria-describedby="e-topic" /></L>
                    {errs.topic ? <Err id="e-topic" msg={errs.topic} /> : <Help>What the presentation is about, in a few words.</Help>}
                  </div>
                  <div>
                    <L t="Number of slides *">
                      <span className="flex gap-2">
                        <button type="button" onClick={() => bump(-1)} aria-label="One slide less" className="grid w-12 shrink-0 place-items-center border border-bronze/30 text-xl text-snow/80 transition hover:border-bronze hover:text-snow">−</button>
                        <input type="number" inputMode="numeric" min="1" max="200" step="1" className={`${input} text-center ${bad(errs.slides)}`} value={f.slides} onChange={set('slides')} aria-invalid={!!errs.slides || undefined} aria-describedby="e-slides" />
                        <button type="button" onClick={() => bump(1)} aria-label="One slide more" className="grid w-12 shrink-0 place-items-center border border-bronze/30 text-xl text-snow/80 transition hover:border-bronze hover:text-snow">+</button>
                      </span>
                    </L>
                    <div className="mt-3 flex flex-wrap gap-2">{tiers.map(t => <button key={t} type="button" onClick={() => setF(v => ({ ...v, slides: t }))} className={chip(n === t)}>{t}</button>)}</div>
                    {errs.slides ? <Err id="e-slides" msg={errs.slides} /> : <Help>{dzd(BLOCK_PRICE)} for every {BLOCK} slides; the total updates below.</Help>}
                  </div>
                  <L t="Presentation language *"><select className={input} value={f.language} onChange={set('language')}>{langs.map(x => <option key={x}>{x}</option>)}</select></L>
                  <div>
                    <span className="mb-1.5 block text-xs uppercase tracking-[.18em] text-snow/60">Presentation style</span>
                    {chosen && (
                      <div className="mb-3 flex items-center justify-between gap-3 border border-bronze/40 bg-bronze/10 p-3" aria-live="polite">
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-[.25em] text-goldlight">{nav && nav.style === chosen.n ? 'Selected from portfolio' : 'Selected style'} · Demo sample</p>
                          <p className="font-display truncate text-xl font-semibold">{chosen.n} <span className="text-sm font-normal text-snow/50">· {chosen.c}</span></p>
                        </div>
                        <span className="flex shrink-0 gap-1" aria-hidden="true">{chosen.p.map(c => <span key={c} className="h-4 w-4 rounded-full border border-white/20" style={{ background: c }} />)}</span>
                      </div>
                    )}
                    <div role="radiogroup" aria-label="Presentation style" className="flex flex-wrap gap-2">
                      <button type="button" role="radio" aria-checked={f.style === ''} onClick={() => setF(v => ({ ...v, style: '' }))} className={chip(f.style === '')}>No preference</button>
                      {sampleStyles.map(s => <button key={s.n} type="button" role="radio" aria-checked={f.style === s.n} onClick={() => setF(v => ({ ...v, style: s.n }))} className={chip(f.style === s.n)}>{s.n}</button>)}
                    </div>
                    <Help>Styles come from our sample portfolio. Your design is made specifically for your topic.</Help>
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  <div>
                    <L t="Your name *"><input autoComplete="name" className={`${input} ${bad(errs.name)}`} value={f.name} onChange={set('name')} placeholder="Full name" aria-invalid={!!errs.name || undefined} aria-describedby="e-name" /></L>
                    <Err id="e-name" msg={errs.name} />
                  </div>
                  <div>
                    <L t="WhatsApp number * (with country code)"><input type="tel" autoComplete="tel" className={`${input} ${bad(errs.whatsapp)}`} value={f.whatsapp} onChange={set('whatsapp')} placeholder="+213 5 00 00 00 00" aria-invalid={!!errs.whatsapp || undefined} aria-describedby="e-wa" /></L>
                    {errs.whatsapp ? <Err id="e-wa" msg={errs.whatsapp} /> : <Help>We confirm your order and send updates on this number.</Help>}
                  </div>
                  <div>
                    <L t="Deadline *"><input type="date" min={today} className={`${input} ${bad(errs.deadline)}`} value={f.deadline} onChange={set('deadline')} aria-invalid={!!errs.deadline || undefined} aria-describedby="e-dl" /></L>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[['3 days', 3], ['1 week', 7], ['2 weeks', 14], ['1 month', 30]].map(([l, d]) => <button key={l} type="button" onClick={() => setF(v => ({ ...v, deadline: inDays(d) }))} className={chip(f.deadline === inDays(d))}>{l}</button>)}
                    </div>
                    {errs.deadline ? <Err id="e-dl" msg={errs.deadline} /> : <Help>When you need the finished presentation.</Help>}
                  </div>
                  <div>
                    <L t="Project instructions (optional)"><textarea rows="4" maxLength={1500} className={input} value={f.instructions} onChange={set('instructions')} placeholder="Colours, sources, audience, anything we should know…" /></L>
                    <Help>{f.instructions.length}/1500 characters</Help>
                  </div>
                  <div>
                    <span className="mb-1.5 block text-xs uppercase tracking-[.18em] text-snow/60">Reference file (optional, max {MAX_MB} MB)</span>
                    <label onDragOver={e => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files) }}
                      className={`flex cursor-pointer flex-col items-center gap-1 rounded-sm border border-dashed px-4 py-8 text-center transition ${drag ? 'border-goldlight bg-bronze/10' : fileErr ? 'border-[#D98B6F]' : file ? 'border-bronze bg-bronze/10' : 'border-bronze/35 bg-white/[0.02] hover:border-bronze hover:bg-white/[0.05]'}`}>
                      <span className="text-xl text-bronze" aria-hidden="true">{file ? '✓' : '+'}</span>
                      <span className="break-all text-sm text-snow/75">{file ? file.name : 'Tap to choose a file, or drop it here'}</span>
                      <span className="text-xs text-mute">{file ? `${fmtSize(file.size)} · ready` : `PDF, Word, PowerPoint, Excel, images, TXT or ZIP`}</span>
                      <input type="file" className="sr-only" accept={ACCEPT.map(x => `.${x}`).join(',')} onChange={e => { pick(e.target.files); e.target.value = '' }} />
                    </label>
                    <div aria-live="polite">
                      {file && !fileErr && (
                        <div className="mt-2 flex items-center justify-between gap-3 border border-bronze/30 bg-bronze/10 px-3 py-2 text-xs">
                          <span className="text-goldlight">✓ File accepted. It uploads securely when you confirm your order.</span>
                          <button type="button" onClick={() => setFile(null)} className="shrink-0 uppercase tracking-[.15em] text-snow/70 transition hover:text-snow">Remove</button>
                        </div>
                      )}
                      {fileErr && <p role="alert" className="mt-2 text-xs text-[#E8A58C]">{fileErr}</p>}
                    </div>
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="relative aspect-video overflow-hidden border border-bronze/30 bg-gradient-to-br from-char to-ink p-[6%]" aria-label="Cover preview">
                    <div className="flex h-full flex-col justify-between">
                      <span className="text-[9px] tracking-[.35em] text-bronze">PRESORA</span>
                      <div>
                        <div className="mb-3 h-px w-14 bg-bronze" />
                        <p className="font-display line-clamp-3 text-2xl italic leading-tight text-snow sm:text-4xl">{f.topic.trim() || 'Your topic'}</p>
                        <p className="mt-2 text-[9px] uppercase tracking-[.3em] text-goldlight">{f.type} · {f.language} · {n || '—'} slides{f.style ? ` · ${f.style}` : ''}</p>
                      </div>
                    </div>
                    <span className="absolute right-3 top-3 text-[9px] uppercase tracking-[.2em] text-mute">Cover preview</span>
                  </div>
                  {sections.map(sec => (
                    <div key={sec.title} className="border border-bronze/20 p-4 sm:p-5">
                      <div className="mb-3 flex items-center justify-between"><h2 className="text-[11px] uppercase tracking-[.25em] text-bronze">{sec.title}</h2><button type="button" onClick={() => go(sec.at)} className="text-[11px] uppercase tracking-[.2em] text-snow/70 underline underline-offset-4 transition hover:text-snow">Edit</button></div>
                      <dl className="space-y-2 text-sm">
                        {sec.rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4"><dt className="shrink-0 text-snow/50">{k}</dt><dd className="min-w-0 whitespace-pre-line break-words text-end text-snow">{v}</dd></div>)}
                      </dl>
                    </div>
                  ))}
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {err && <motion.p role="alert" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="border border-[#D98B6F]/40 bg-[#D98B6F]/10 p-3 text-sm text-[#E8A58C]">{err}</motion.p>}

          <div className="sticky bottom-0 z-20 -mx-6 space-y-3 border-t border-bronze/20 bg-char/95 px-6 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
            <div className="flex items-end justify-between gap-4 border border-bronze/30 bg-white/[0.03] p-3 sm:p-5" aria-live="polite">
              <div>
                <p className="text-[11px] uppercase tracking-[.25em] text-goldlight">Your total</p>
                <p className="mt-1 text-xs text-snow/60">{n >= 1 ? `${blocks} × ${dzd(BLOCK_PRICE)} · ${n} slides` : 'Enter the number of slides'}</p>
              </div>
              <p className="font-display text-3xl font-medium text-snow sm:text-5xl"><CountUp value={total} /></p>
            </div>
            <div className="flex gap-3">
              {step > 0 && <button type="button" onClick={() => go(step - 1)} disabled={busy} className={`${ghost} px-6 disabled:opacity-50`}>Back</button>}
              <button disabled={busy} className={`${primary} flex-1 disabled:opacity-50`}>
                {busy ? <span className="inline-flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />{phase || 'Sending…'}</span> : step < 2 ? 'Continue' : 'Confirm order'}
              </button>
            </div>
            {step === 2 && <p className="text-center text-xs text-mute">Your order is saved first. Then you open WhatsApp with your details ready to send.</p>}
          </div>
        </form>
      </Reveal>
    </section>
  )
}

function Contact() {
  return (
    <section className="mx-auto max-w-5xl px-5 pb-28 pt-40">
      <Head k="Contact">Let’s <em className="bronze-text">talk</em></Head>
      <div className="grid gap-3 md:grid-cols-2">
        <Reveal><div className="flex h-full min-h-[17rem] flex-col justify-between rounded-sm bg-gradient-to-br from-goldlight via-gold to-[#7a5530] p-8 text-ink"><span className="text-3xl">◆</span>
          <div><h3 className="font-display text-4xl font-semibold">WhatsApp</h3><p className="mb-6 mt-1 text-ink/70">The fastest way to reach us.</p>
            <Magnetic><a href={`https://wa.me/${WA}?text=${encodeURIComponent('Hello PRESORA! I have a question.')}`} className="inline-block bg-ink px-6 py-3.5 text-xs font-semibold uppercase tracking-[.22em] text-snow">Chat on WhatsApp →</a></Magnetic></div></div></Reveal>
        <Reveal delay={0.1}><div className="gborder relative flex h-full min-h-[17rem] flex-col justify-between rounded-sm bg-[#171512]/80 p-8"><span className="text-3xl text-bronze">◇</span>
          <div><h3 className="font-display text-4xl font-semibold">Email</h3><p className="mb-6 mt-1 break-all text-snow/65">{MAIL}</p>
            <a href={`mailto:${MAIL}`} className={ghost}>Send an email</a></div></div></Reveal>
      </div>
    </section>
  )
}

/* The Admin page needs the i18n provider. Restores page language/direction when leaving it. */
function AdminShell() {
  const prev = useRef(null)
  if (prev.current === null) prev.current = { d: document.documentElement.dir, l: document.documentElement.lang }
  useEffect(() => () => { document.documentElement.dir = prev.current.d; document.documentElement.lang = prev.current.l }, [])
  return <I18nProvider><Admin /></I18nProvider>
}

function FloatingContact({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.a initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.4 }} href={`https://wa.me/${WA}`} aria-label="Chat with PRESORA on WhatsApp"
          className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full border border-bronze/50 bg-ink/85 text-snow/80 shadow-2xl shadow-black/60 backdrop-blur transition hover:scale-110 hover:border-bronze hover:text-snow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12Z" /></svg>
        </motion.a>
      )}
    </AnimatePresence>
  )
}

function Layout() {
  const location = useLocation(), pathname = location.pathname
  const [ready, setReady] = useState(() => { try { return sessionStorage.getItem('presora_intro') === '1' || window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return true } })
  const done = () => { try { sessionStorage.setItem('presora_intro', '1') } catch { /* ignore */ } setReady(true) }
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <>
      <AnimatePresence>{!ready && <Loader onDone={done} />}</AnimatePresence>
      <ScrollProgress />
      <Nav />
      <main className="min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div key={pathname} initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.45 }}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/order" element={<Order />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<AdminShell />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <FloatingContact show={ready && pathname !== '/admin' && pathname !== '/order'} />
      <footer className="relative border-t border-bronze/20">
        <Signature />
        <p className="px-5 pb-4 text-center text-[11px] uppercase tracking-[.3em] text-bronze">Premium creative presentation studio</p>
        <nav className="flex flex-wrap justify-center gap-7 pb-4 text-xs uppercase tracking-[.2em] text-snow/60" aria-label="Footer">
          {[['/', 'Home'], ['/services', 'Services'], ['/order', 'Order'], ['/contact', 'Contact']].map(([to, l]) => <Link key={to} to={to} className="hover:text-snow">{l}</Link>)}
        </nav>
        <p className="pb-8 text-center text-xs text-mute">© {new Date().getFullYear()} PRESORA. All rights reserved.</p>
      </footer>
    </>
  )
}
export default function App() { return <MotionConfig reducedMotion="user"><HashRouter><Layout /></HashRouter></MotionConfig> }
