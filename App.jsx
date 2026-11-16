import { useState, useEffect, useRef } from 'react'
import { HashRouter, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, MotionConfig, useScroll, useSpring, useTransform, useMotionValue, useReducedMotion, animate } from 'framer-motion'
import { supabase, WA, MAIL } from './supabase'
import Admin from './Admin'
import Portfolio from './Portfolio'
import { I18nProvider } from './i18n'
import { Magnetic, Wordmark, Signature, Loader, ScrollProgress, Cursor, Hero3D as HeroVisual, Marquee, BentoCard } from './ui'

const input = 'w-full rounded-sm border border-champ/25 bg-white/[0.03] px-4 py-3.5 text-snow placeholder-stone outline-none transition focus:border-champ focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(140,123,112,.15)]'
const btnBase = 'group inline-flex items-center justify-center gap-3 rounded-sm px-8 py-4 text-xs font-semibold uppercase tracking-[.22em] transition'
const primary = `${btnBase} bg-gradient-to-r from-goldlight via-gold to-[#8C5F34] text-ink shadow-[0_12px_40px_-10px_rgba(192,138,82,.65)] hover:brightness-110`
const ghost = `${btnBase} border border-champ/40 text-snow hover:border-champ hover:bg-white/5`

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
    <p className="text-[11px] uppercase tracking-[.4em] text-champ">{k}</p>
    <h2 className="font-display mt-3 text-5xl font-light leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">{children}</h2>
  </Reveal>
)
const Sep = () => (
  <div className="mx-auto flex max-w-6xl items-center gap-4 px-5" aria-hidden="true">
    <motion.span className="h-px flex-1 origin-right bg-gradient-to-l from-champ/60 to-transparent" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.4 }} />
    <span className="text-xs text-champ">◆</span>
    <motion.span className="h-px flex-1 origin-left bg-gradient-to-r from-champ/60 to-transparent" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.4 }} />
  </div>
)
const Words = ({ text, className = '', delay = 0.2 }) => text.split(' ').map((w, i) => (
  <span key={i} className="inline-block overflow-hidden pb-[.1em] align-bottom">
    <motion.span className={`inline-block ${className}`} initial={{ y: '115%' }} animate={{ y: 0 }} transition={{ duration: 1, delay: delay + i * 0.12, ease: [0.2, 0.7, 0.2, 1] }}>{w}&nbsp;</motion.span>
  </span>
))
const PriceTable = ({ active }) => (
  <ul className="divide-y divide-champ/15 border border-champ/20" aria-label="Pricing">
    {tiers.map(n => (
      <li key={n} className={`flex items-center justify-between px-5 py-3.5 transition ${active === n ? 'bg-champ/15' : ''}`}>
        <span className="text-silver/80">{n} slides</span>
        <span className="font-display text-2xl font-medium text-snow">{dzd(priceFor(n))}</span>
      </li>
    ))}
  </ul>
)
const ServiceGrid = ({ cta }) => (
  <div className="grid w-full min-w-0 grid-cols-1 gap-3 md:grid-cols-6">
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
      <header className={`fixed inset-x-0 top-0 z-50 transition duration-500 ${solid || open ? 'border-b border-champ/15 bg-ink/80 backdrop-blur-xl' : ''}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" aria-label="PRESORA home"><Wordmark sub /></Link>
          <nav className="hidden items-center gap-9 md:flex" aria-label="Main">
            {links.map(([to, l]) => (
              <NavLink key={to} to={to} className="relative py-1 text-[11px] font-medium uppercase tracking-[.25em]">
                {({ isActive }) => (<><span className={isActive ? 'text-snow' : 'text-silver/60 transition hover:text-snow'}>{l}</span>{isActive && <motion.span layoutId="navline" className="absolute inset-x-0 -bottom-1 h-px bg-champ" />}</>)}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/order" className="hidden border border-champ/50 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[.22em] text-snow transition hover:bg-champ hover:text-ink md:block">Start your project</Link>
            <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menu" className="grid h-11 w-11 place-items-center border border-champ/30 md:hidden">
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
  const { scrollYProgress: hp } = useScroll({ target: hero, offset: ['start start', 'end start'] })
  const glowY = useTransform(hp, [0, 1], [0, 160]), deckY = useTransform(hp, [0, 1], [0, 70])
  const { scrollYProgress } = useScroll({ target: tl, offset: ['start 70%', 'end 70%'] })
  const line = useSpring(scrollYProgress, { stiffness: 90, damping: 22 })
  const steps = [['Fill the form', 'Topic, slides, language, type and deadline — optionally attach reference files.'], ['Send on WhatsApp', 'Your order is saved, then WhatsApp opens with all the details ready.'], ['We get to work', 'We follow up with you directly about your presentation.']]
  const faq = [['What do I need to place an order?', 'Just the order form: your name, WhatsApp number, topic, number of slides, language, type and deadline. Instructions and reference files are optional.'], ['Which languages are available?', 'English, Arabic, French, Spanish, Italian, German and Portuguese. Other languages are available upon request.'], ['How much does a presentation cost?', `Pricing is ${dzd(BLOCK_PRICE)} for every ${BLOCK} slides — for example, 10 slides cost ${dzd(1000)} and 20 slides cost ${dzd(2000)}. The order form shows your total instantly. After you submit, WhatsApp opens so you can discuss the details with us directly.`], ['Can I attach my own material?', 'Yes — upload a reference or requirements file (max 10 MB) on the order form.']]
  const showcase = () => { const el = document.getElementById('showcase'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }
  return (
    <>
      <section ref={hero} className="relative overflow-hidden px-5 pb-20 pt-36 md:pt-44">
        <motion.div style={{ y: glowY }} className="absolute -top-40 left-1/2 h-[46rem] w-[46rem] -translate-x-1/3 rounded-full bg-[radial-gradient(circle,rgba(140,123,112,.28),rgba(70,56,40,.2)_40%,transparent_68%)]" />
        <div className="grain absolute inset-0" />
        <div className="relative mx-auto grid w-full min-w-0 max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
          <div className="min-w-0">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-[11px] uppercase tracking-[.4em] text-champ">Premium creative presentation studio</motion.p>
            <h1 className="font-display mt-6 text-[3.3rem] font-light uppercase leading-[.95] tracking-tight sm:text-7xl lg:text-[5.4rem]">
              <Words text="We turn ideas" /><br /><Words text="into impact." className="bronze-text italic" delay={0.55} />
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 1 }} className="mt-8 max-w-xl text-base leading-relaxed text-silver/75 sm:text-lg">
              Presentations are more than slides. They are experiences, stories, and opportunities to make a lasting impression. PRESORA transforms your ideas into beautifully crafted visual presentations.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }} className="mt-10 flex flex-wrap gap-4">
              <Magnetic><Link to="/order" className={primary}>Start your project <span className="transition group-hover:translate-x-1">→</span></Link></Magnetic>
              <Magnetic><button onClick={showcase} className={ghost}>Explore our work</button></Magnetic>
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mt-6 text-[11px] uppercase tracking-[.3em] text-champ">{dzd(BLOCK_PRICE)} for every {BLOCK} slides</motion.p>
          </div>
          <motion.div style={{ y: deckY }} className="w-full min-w-0 max-w-full overflow-hidden"><HeroVisual /></motion.div>
        </div>
        <div className="relative mt-14 flex flex-col items-center gap-2 text-[10px] uppercase tracking-[.4em] text-stone" aria-hidden="true">
          Scroll<span className="relative h-9 w-5 rounded-full border border-champ/40"><span className="wheel absolute left-1/2 top-2 h-1.5 w-1 -translate-x-1/2 rounded-full bg-champ" /></span>
        </div>
      </section>

      <Marquee items={['English', 'العربية', 'Français', 'Español', 'Italiano', 'Deutsch', 'Português', 'Presentations']} />

      <section className="mx-auto max-w-6xl px-5 py-28">
        <Head k="Our services">Ten ways to <em className="bronze-text">present</em></Head>
        <ServiceGrid />
      </section>
      <Sep />

      <section id="showcase" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-28">
        <Head k="Design showcase">Sample <em className="bronze-text">styles</em></Head>
        <p className="-mt-6 mb-8 max-w-xl text-sm text-silver/60">Fictional sample designs that show our range of styles — not actual client projects. Filter by type and open any design to browse.</p>
        <Reveal><Portfolio /></Reveal>
      </section>
      <Sep />

      <section className="mx-auto grid w-full min-w-0 max-w-6xl grid-cols-1 gap-12 px-5 py-28 lg:grid-cols-[.8fr_1.2fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Head k="Multilingual studio">Your language, <em className="bronze-text">our design</em></Head>
          <p className="-mt-6 max-w-sm text-silver/65">Presentations can be designed in the language you request, with typography and layout direction suited to each script — including right-to-left Arabic.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {greetings.map(([name, hello, lang, dir], i) => (
            <Reveal key={name} delay={i * 0.05}>
              <div className="gborder relative flex h-full min-h-[8.5rem] flex-col justify-between rounded-sm bg-white/[0.02] p-5">
                <span className="text-[10px] uppercase tracking-[.3em] text-champ">{name}</span>
                <p lang={lang} dir={dir} className={`mt-6 text-3xl font-light ${lang === 'ar' ? 'font-arabic' : 'font-display italic'}`}>{hello}</p>
              </div>
            </Reveal>
          ))}
          <Reveal delay={0.4}><div className="flex h-full min-h-[8.5rem] flex-col justify-between rounded-sm border border-dashed border-champ/40 p-5"><span className="text-[10px] uppercase tracking-[.3em] text-champ">Other</span><p className="font-display mt-6 text-2xl font-light italic text-silver/80">Other languages upon request</p></div></Reveal>
        </div>
      </section>
      <Sep />

      <section className="mx-auto max-w-6xl px-5 py-28">
        <Head k="Presentation features">Crafted for <em className="bronze-text">each project</em></Head>
        <p className="-mt-6 mb-10 max-w-xl text-sm text-silver/60">Every feature below is tailored to your topic, audience and brief.</p>
        <div className="grid border-l border-t border-champ/20 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f} delay={(i % 3) * 0.06}><div className="group h-full border-b border-r border-champ/20 p-7 transition hover:bg-white/[0.03]"><span className="font-display text-sm italic text-champ">{String(i + 1).padStart(2, '0')}</span><h3 className="font-display mt-3 text-2xl font-medium">{f}</h3></div></Reveal>
          ))}
        </div>
      </section>

      <Sep />
      <section className="mx-auto grid w-full min-w-0 max-w-6xl grid-cols-1 gap-12 px-5 py-28 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <Head k="Pricing">Clear, simple <em className="bronze-text">pricing</em></Head>
          <p className="-mt-6 max-w-sm text-silver/65">{dzd(BLOCK_PRICE)} for every {BLOCK} slides. Enter your slide count on the order form and your total updates automatically. Slide counts in between are billed in {BLOCK}-slide blocks.</p>
        </div>
        <Reveal>
          <PriceTable />
          <div className="mt-6"><Magnetic><Link to="/order" className={primary}>Calculate your total →</Link></Magnetic></div>
        </Reveal>
      </section>

      <section className="px-5 py-20">
        <div className="gborder relative mx-auto max-w-6xl overflow-hidden rounded-sm bg-[#0a0705] p-7 sm:p-14">
          <Head k="Process">How ordering <em className="bronze-text">works</em></Head>
          <div ref={tl} className="relative ml-3 space-y-14 pl-10 sm:ml-6 sm:pl-14">
            <div className="absolute bottom-2 left-0 top-2 w-px bg-champ/20" />
            <motion.div className="absolute bottom-2 left-0 top-2 w-px origin-top bg-champ" style={{ scaleY: line }} />
            {steps.map(([t, d], i) => (
              <Reveal key={t}>
                <span className="absolute -left-[15px] grid h-8 w-8 place-items-center rounded-full border border-champ bg-ink font-display text-sm italic text-snow">{i + 1}</span>
                <h3 className="font-display text-3xl font-light sm:text-5xl">{t}</h3><p className="mt-2 max-w-lg text-silver/65">{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-28">
        <Head k="FAQ">Common <em className="bronze-text">questions</em></Head>
        <div className="border-t border-champ/20">
          {faq.map(([q, a]) => (
            <details key={q} className="group border-b border-champ/20 py-5">
              <summary className="font-display flex cursor-pointer list-none items-center justify-between gap-4 text-2xl font-medium">{q}<span className="text-3xl font-light text-champ transition group-open:rotate-45">+</span></summary>
              <p className="mt-3 max-w-xl text-silver/65">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden px-5 py-32 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(70,56,40,.55),transparent_65%)]" /><div className="grain absolute inset-0" />
        <Reveal className="relative">
          <p className="font-display select-none text-[22vw] font-light leading-none tracking-[.08em] text-transparent [-webkit-text-stroke:1px_#8C7B70] sm:text-[15vw]" aria-hidden="true">PRESORA</p>
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
      <p className="-mt-6 mb-10 text-silver/65">Pricing: <span className="text-snow">{dzd(BLOCK_PRICE)} for every {BLOCK} slides</span> — <Link to="/order" className="underline underline-offset-4">see your total</Link>.</p>
      <ServiceGrid cta />
    </section>
  )
}

const L = ({ t, children }) => <label className="block"><span className="mb-1.5 block text-xs uppercase tracking-[.18em] text-silver/60">{t}</span>{children}</label>

const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const inDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return ymd(d) }
const DRAFT = 'presora_order_draft'
const stepNames = ['Project', 'Details', 'Review']
const chip = on => `rounded-sm border px-4 py-2.5 text-xs font-semibold uppercase tracking-[.18em] transition ${on ? 'border-gold bg-gold/15 text-snow' : 'border-champ/30 text-silver/70 hover:border-champ hover:text-snow'}`

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
  const empty = { name: '', whatsapp: '', topic: '', slides: 10, language: 'English', type: 'School', deadline: '', instructions: '' }
  const [f, setF] = useState(() => {
    let d = {}
    try { d = JSON.parse(sessionStorage.getItem(DRAFT) || '{}') || {} } catch { d = {} }
    const base = { ...empty, ...d }
    if (base.deadline && base.deadline < today) base.deadline = ''
    if (nav && types.includes(nav.type)) base.type = nav.type
    if (nav && nav.style && !base.instructions) base.instructions = `Preferred style: ${nav.style}`
    return base
  })
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [step, setStep] = useState(0), [dir, setDir] = useState(1)
  const set = k => e => setF(v => ({ ...v, [k]: e.target.value }))
  const n = Math.floor(Number(f.slides)) || 0, total = priceFor(n), blocks = Math.ceil(n / BLOCK)
  const go = s => { setDir(s > step ? 1 : -1); setStep(s); setErr('') }
  const bump = d => setF(v => ({ ...v, slides: Math.min(200, Math.max(1, (Math.floor(Number(v.slides)) || 0) + d)) }))
  useEffect(() => { try { sessionStorage.setItem(DRAFT, JSON.stringify(f)) } catch { /* ignore */ } }, [f])

  async function submit() {
    setBusy(true); setErr('')
    try {
      let file_url = null
      if (file) {
        if (file.size > 10 * 1024 * 1024) throw new Error('File is too large (max 10 MB).')
        const path = `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, '_')}`
        const { error } = await supabase.storage.from('order-files').upload(path, file)
        if (error) throw error
        file_url = supabase.storage.from('order-files').getPublicUrl(path).data.publicUrl
      }
      const row = { name: f.name.trim(), whatsapp: f.whatsapp.trim(), topic: f.topic.trim(), slides: Number(f.slides), language: f.language, type: f.type, deadline: f.deadline || null, instructions: f.instructions.trim(), file_url }
      const { error } = await supabase.from('orders').insert(row)
      if (error) throw error
      const msg = `*🆕 New PRESORA Order*\n\n👤 Name: ${row.name}\n📱 WhatsApp: ${row.whatsapp}\n📌 Topic: ${row.topic}\n🖼️ Slides: ${row.slides}\n💰 Price: ${dzd(priceFor(row.slides))}\n🌍 Language: ${row.language}\n🎯 Type: ${row.type}\n⏰ Deadline: ${row.deadline || 'Not set'}\n📝 Instructions: ${row.instructions || '—'}\n📎 File: ${file_url || 'None'}`
      try { sessionStorage.removeItem(DRAFT) } catch { /* ignore */ }
      window.location.href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`
    } catch (ex) { setErr(ex.message || 'Something went wrong. Please try again.') }
    setBusy(false)
  }
  const onSubmit = e => { e.preventDefault(); if (step < 2) go(step + 1); else submit() }

  const rows = [['Topic', f.topic || '—'], ['Slides', n ? `${n} (${dzd(total)})` : '—'], ['Language', f.language], ['Type', f.type], ['Deadline', f.deadline || '—'], ['File', file ? file.name : 'None']]

  return (
    <section className="mx-auto grid w-full min-w-0 max-w-6xl grid-cols-1 gap-12 px-5 pb-28 pt-40 lg:grid-cols-[.8fr_1.2fr]">
      <div className="lg:sticky lg:top-32 lg:self-start">
        <Head k="Start your project">Tell us your <em className="bronze-text">idea</em></Head>
        <p className="-mt-6 mb-6 text-sm text-silver/60">You can specify:</p>
        <ul className="space-y-3 text-silver/75">
          {['Name', 'WhatsApp number', 'Presentation topic', 'Number of slides', 'Language', 'Presentation type', 'Deadline', 'Instructions', 'Reference attachments'].map((t, i) => (
            <li key={t} className="flex items-center gap-4"><span className="font-display w-6 text-sm italic text-champ">{String(i + 1).padStart(2, '0')}</span>{t}</li>
          ))}
        </ul>
        <p className="mb-3 mt-10 text-[11px] uppercase tracking-[.3em] text-champ">Pricing</p>
        <PriceTable active={n} />
      </div>
      <Reveal>
        <form onSubmit={onSubmit} className="gborder relative space-y-6 rounded-sm bg-[#0a0705]/80 p-6 backdrop-blur-xl sm:p-10">
          <ol className="grid grid-cols-3 gap-3" aria-label="Order steps">
            {stepNames.map((t, i) => (
              <li key={t}>
                <button type="button" disabled={i > step} onClick={() => go(i)} aria-current={i === step ? 'step' : undefined} className="block w-full text-start disabled:cursor-default">
                  <span className="block h-px overflow-hidden bg-champ/20"><motion.span className="block h-px bg-gold" initial={false} animate={{ width: i <= step ? '100%' : '0%' }} transition={{ duration: 0.5 }} /></span>
                  <span className={`mt-2 block text-[11px] uppercase tracking-[.2em] ${i === step ? 'text-snow' : i < step ? 'text-goldlight' : 'text-stone'}`}>{i < step ? '✓ ' : `${i + 1}. `}{t}</span>
                </button>
              </li>
            ))}
          </ol>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={step} initial={{ opacity: 0, x: dir * 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -28 }} transition={{ duration: 0.3 }} className="space-y-5">
              {step === 0 && (
                <>
                  <L t="Presentation topic *"><input required className={input} value={f.topic} onChange={set('topic')} placeholder="e.g. Climate change" /></L>
                  <div>
                    <span className="mb-1.5 block text-xs uppercase tracking-[.18em] text-silver/60">Type *</span>
                    <div role="radiogroup" aria-label="Presentation type" className="flex flex-wrap gap-2">
                      {types.map(x => <button key={x} type="button" role="radio" aria-checked={f.type === x} onClick={() => setF(v => ({ ...v, type: x }))} className={chip(f.type === x)}>{x}</button>)}
                    </div>
                  </div>
                  <L t="Language *"><select className={input} value={f.language} onChange={set('language')}>{langs.map(x => <option key={x}>{x}</option>)}</select></L>
                  <div>
                    <L t="Number of slides *">
                      <span className="flex gap-2">
                        <button type="button" onClick={() => bump(-1)} aria-label="One slide less" className="grid w-12 shrink-0 place-items-center border border-champ/30 text-xl text-silver transition hover:border-champ hover:text-snow">−</button>
                        <input required type="number" inputMode="numeric" min="1" max="200" step="1" className={`${input} text-center`} value={f.slides} onChange={set('slides')} />
                        <button type="button" onClick={() => bump(1)} aria-label="One slide more" className="grid w-12 shrink-0 place-items-center border border-champ/30 text-xl text-silver transition hover:border-champ hover:text-snow">+</button>
                      </span>
                    </L>
                    <div className="mt-3 flex flex-wrap gap-2">{tiers.map(t => <button key={t} type="button" onClick={() => setF(v => ({ ...v, slides: t }))} className={chip(n === t)}>{t}</button>)}</div>
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  <div>
                    <L t="Deadline *"><input required type="date" min={today} className={input} value={f.deadline} onChange={set('deadline')} /></L>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[['3 days', 3], ['1 week', 7], ['2 weeks', 14], ['1 month', 30]].map(([l, d]) => <button key={l} type="button" onClick={() => setF(v => ({ ...v, deadline: inDays(d) }))} className={chip(f.deadline === inDays(d))}>{l}</button>)}
                    </div>
                  </div>
                  <L t="Additional instructions"><textarea rows="4" className={input} value={f.instructions} onChange={set('instructions')} placeholder="Colours, style, sources, anything we should know…" /></L>
                  <L t="Reference attachment (optional, max 10 MB)"><span className="flex cursor-pointer flex-col items-center gap-1 rounded-sm border border-dashed border-champ/35 bg-white/[0.02] px-4 py-8 text-center transition hover:border-champ hover:bg-white/[0.05]"><span className="text-xl text-champ">{file ? '✓' : '+'}</span><span className="break-all text-sm text-silver/75">{file ? file.name : 'Tap to choose a file'}</span><input type="file" className="sr-only" onChange={e => setFile(e.target.files[0] || null)} /></span></L>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="relative aspect-video overflow-hidden border border-champ/30 bg-gradient-to-br from-[#16110c] to-ink p-[6%]" aria-label="Cover preview">
                    <div className="flex h-full flex-col justify-between">
                      <span className="text-[9px] tracking-[.35em] text-champ">PRESORA</span>
                      <div>
                        <div className="mb-3 h-px w-14 bg-gold" />
                        <p className="font-display line-clamp-3 text-2xl italic leading-tight text-snow sm:text-4xl">{f.topic || 'Your topic'}</p>
                        <p className="mt-2 text-[9px] uppercase tracking-[.3em] text-goldlight">{f.type} · {f.language} · {n || '—'} slides</p>
                      </div>
                    </div>
                    <span className="absolute right-3 top-3 text-[9px] uppercase tracking-[.2em] text-stone">Cover preview</span>
                  </div>
                  <dl className="grid gap-x-6 gap-y-2 border-y border-champ/15 py-4 text-sm sm:grid-cols-2">
                    {rows.map(([k, v]) => <div key={k} className="flex justify-between gap-3"><dt className="text-silver/55">{k}</dt><dd className="break-all text-end text-snow">{v}</dd></div>)}
                  </dl>
                  <L t="Your name *"><input required className={input} value={f.name} onChange={set('name')} placeholder="Full name" /></L>
                  <L t="WhatsApp number * (with country code)"><input required type="tel" className={input} value={f.whatsapp} onChange={set('whatsapp')} placeholder="+212 6 00 00 00 00" /></L>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-end justify-between gap-4 border border-gold/30 bg-white/[0.03] p-5" aria-live="polite">
            <div>
              <p className="text-[11px] uppercase tracking-[.25em] text-goldlight">Your total</p>
              <p className="mt-1 text-xs text-silver/60">{n >= 1 ? `${blocks} × ${dzd(BLOCK_PRICE)} · ${n} slides` : 'Enter the number of slides'}</p>
            </div>
            <p className="font-display text-4xl font-medium text-snow sm:text-5xl"><CountUp value={total} /></p>
          </div>

          {err && <motion.p role="alert" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: [0, -6, 6, 0] }} className="border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">{err}</motion.p>}

          <div className="flex gap-3">
            {step > 0 && <button type="button" onClick={() => go(step - 1)} className={`${ghost} px-6`}>Back</button>}
            <button disabled={busy} className={`${primary} flex-1 disabled:opacity-50`}>
              {busy ? <span className="inline-flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />Sending…</span> : step < 2 ? 'Continue' : 'Submit & continue on WhatsApp'}
            </button>
          </div>
          {step === 2 && <p className="text-center text-xs text-stone">Your order is saved, then WhatsApp opens with your details ready to send.</p>}
        </form>
      </Reveal>
    </section>
  )
}

function Contact() {
  return (
    <section className="mx-auto max-w-5xl px-5 pb-28 pt-40">
      <Head k="Contact">Let’s <em className="bronze-text">talk</em></Head>
      <div className="grid w-full min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
        <Reveal><div className="flex h-full min-h-[17rem] flex-col justify-between rounded-sm bg-gradient-to-br from-goldlight via-gold to-[#8C5F34] p-8 text-ink"><span className="text-3xl">◆</span>
          <div><h3 className="font-display text-4xl font-semibold">WhatsApp</h3><p className="mb-6 mt-1 text-ink/70">The fastest way to reach us.</p>
            <Magnetic><a href={`https://wa.me/${WA}?text=${encodeURIComponent('Hello PRESORA! I have a question.')}`} className="inline-block bg-ink px-6 py-3.5 text-xs font-semibold uppercase tracking-[.22em] text-snow">Chat on WhatsApp →</a></Magnetic></div></div></Reveal>
        <Reveal delay={0.1}><div className="gborder relative flex h-full min-h-[17rem] flex-col justify-between rounded-sm bg-[#0a0705]/80 p-8"><span className="text-3xl text-champ">◇</span>
          <div><h3 className="font-display text-4xl font-semibold">Email</h3><p className="mb-6 mt-1 break-all text-silver/65">{MAIL}</p>
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
          className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full border border-champ/50 bg-ink/85 text-silver shadow-2xl shadow-black/60 backdrop-blur transition hover:scale-110 hover:border-champ hover:text-snow">
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
      <Cursor />
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
      <FloatingContact show={ready && pathname !== '/admin'} />
      <footer className="relative border-t border-champ/20">
        <Signature />
        <p className="px-5 pb-4 text-center text-[11px] uppercase tracking-[.3em] text-champ">Premium creative presentation studio</p>
        <nav className="flex flex-wrap justify-center gap-7 pb-4 text-xs uppercase tracking-[.2em] text-silver/60" aria-label="Footer">
          {[['/', 'Home'], ['/services', 'Services'], ['/order', 'Order'], ['/contact', 'Contact']].map(([to, l]) => <Link key={to} to={to} className="hover:text-snow">{l}</Link>)}
        </nav>
        <p className="pb-8 text-center text-xs text-stone">© {new Date().getFullYear()} PRESORA. All rights reserved.</p>
      </footer>
    </>
  )
}
export default function App() { return <MotionConfig reducedMotion="user"><HashRouter><Layout /></HashRouter></MotionConfig> }
