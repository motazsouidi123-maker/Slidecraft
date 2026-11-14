import { useState, useEffect, useRef } from 'react'
import { HashRouter, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, MotionConfig, useScroll, useSpring, useReducedMotion } from 'framer-motion'
import { supabase, WA, MAIL } from './supabase'
import Admin from './Admin'
import { Magnetic, Signature, Loader, ScrollProgress, DeckStack, Marquee, BentoCard } from './ui'

const input = 'w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white placeholder-white/30 outline-none transition focus:border-[#ffb86b] focus:bg-white/[0.07] focus:shadow-[0_0_0_4px_rgba(255,184,107,.14)]'
const panel = 'gborder relative rounded-[2rem] bg-[#0b0c1d]/75 backdrop-blur-xl'

const services = [
  { icon: '🎒', t: 'School Presentations', d: 'Clear, colourful slides for class projects, reports and exposés.' },
  { icon: '🎓', t: 'University Presentations', d: 'Academic decks for theses, seminars and research defences, properly structured and sourced.' },
  { icon: '💼', t: 'Business Presentations', d: 'Pitch decks, company profiles and reports that win clients and investors.' },
  { icon: '✨', t: 'Creative PowerPoint', d: 'Bold custom designs, animations and storytelling for any idea.' },
]
const spans = ['md:col-span-2', 'md:col-span-4', 'md:col-span-4', 'md:col-span-2']
const types = ['School', 'University', 'Business', 'Creative']
const langs = ['English', 'French', 'Arabic', 'Italian']

const Reveal = ({ children, delay = 0, className = '' }) => (
  <motion.div className={className} initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] }}>{children}</motion.div>
)
const Btn = ({ to, href, children, ghost }) => {
  const c = `group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 font-semibold transition ${ghost ? 'border border-white/20 bg-white/5 backdrop-blur hover:bg-white/10' : 'aurora-bg text-[#12061a] shadow-[0_10px_40px_-8px_rgba(255,95,162,.6)] hover:shadow-[0_14px_50px_-6px_rgba(255,95,162,.8)]'}`
  return <Magnetic>{to ? <Link to={to} className={c}>{children}</Link> : <a href={href} className={c}>{children}</a>}</Magnetic>
}
const Head = ({ k, children, center }) => (
  <Reveal className={`mb-10 ${center ? 'text-center' : ''}`}>
    <p className="font-mono text-xs uppercase tracking-[.35em] text-[#ffb86b]">— {k}</p>
    <h2 className="font-display mt-3 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">{children}</h2>
  </Reveal>
)
const Words = ({ text, className = '', delay = 0.15 }) => text.split(' ').map((w, i) => (
  <span key={i} className="inline-block overflow-hidden pb-[.12em] align-bottom">
    <motion.span className={`inline-block ${className}`} initial={{ y: '115%' }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: delay + i * 0.09, ease: [0.2, 0.7, 0.2, 1] }}>{w}&nbsp;</motion.span>
  </span>
))

function Nav() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])
  const links = [['/', 'Home'], ['/services', 'Services'], ['/order', 'Order'], ['/contact', 'Contact']]
  return (
    <>
      <header className="fixed inset-x-0 top-3 z-50 flex justify-center px-3">
        <div className="flex w-full max-w-4xl items-center justify-between rounded-full border border-white/10 bg-[#0a0b18]/70 py-2 pl-5 pr-2 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <Link to="/" className="font-display text-xl font-semibold italic tracking-tight">Slide<span className="aurora-text">Craft</span></Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {links.map(([to, l]) => (
              <NavLink key={to} to={to} className="relative px-4 py-2 text-sm font-medium">
                {({ isActive }) => (<>{isActive && <motion.span layoutId="navpill" className="absolute inset-0 rounded-full bg-white/10 ring-1 ring-white/15" />}<span className={`relative transition ${isActive ? 'text-white' : 'text-white/55 hover:text-white'}`}>{l}</span></>)}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/order" className="aurora-bg hidden rounded-full px-5 py-2.5 text-sm font-bold text-[#12061a] md:block">Order Now</Link>
            <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menu" className="grid h-10 w-10 place-items-center rounded-full border border-white/15 md:hidden">
              <span className="relative h-3 w-5"><span className={`absolute left-0 top-0 h-px w-5 bg-white transition ${open ? 'translate-y-[6px] rotate-45' : ''}`} /><span className={`absolute left-0 top-[11px] h-px w-5 bg-white transition ${open ? '-translate-y-[5px] -rotate-45' : ''}`} /></span>
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <motion.nav initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 flex flex-col justify-center gap-2 bg-[#050611]/95 px-8 backdrop-blur-2xl md:hidden" aria-label="Mobile">
            {links.map(([to, l], i) => (
              <motion.div key={to} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 * i + 0.1 }}>
                <Link to={to} className="font-display block py-2 text-5xl font-semibold italic tracking-tight">{l}</Link>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6"><Btn to="/order">Order Now →</Btn></motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}

function Home() {
  const sample = [
    ['Startup Pitch Deck', 'from-[#7c6cff] to-[#ff5fa2]', 0], ['Biology Research', 'from-[#12142b] to-[#2b2f78]', 1],
    ['Marketing Plan', 'from-[#ff5fa2] to-[#ffb86b]', 2], ['History Class Project', 'from-[#1f2a55] to-[#7c6cff]', 3],
  ]
  const why = [['Four languages', 'English, French, Arabic and Italian.'], ['Custom design', 'Made for your topic, not a recycled template.'], ['Your deadline', 'Tell us the date when you order.'], ['Direct contact', 'Your order opens straight in WhatsApp.']]
  const steps = [['Fill the form', 'Topic, slides, language, type and deadline — optionally attach files.'], ['Send on WhatsApp', 'Your order is saved, then WhatsApp opens with all the details ready.'], ['We get to work', 'We follow up with you directly about your presentation.']]
  const faq = [['What do I need to place an order?', 'Just the form: your name, WhatsApp number, topic, number of slides, language, type and deadline. Files and extra instructions are optional.'], ['Which languages are available?', 'English, French, Arabic and Italian.'], ['How do I discuss price and details?', 'After you submit, WhatsApp opens with your order so you can talk with us directly. You can also use the Contact page.'], ['Can I attach my own material?', 'Yes — upload a reference or requirements file (max 10 MB) on the order form.']]
  const tl = useRef(null)
  const { scrollYProgress } = useScroll({ target: tl, offset: ['start 70%', 'end 70%'] })
  const line = useSpring(scrollYProgress, { stiffness: 90, damping: 22 })
  return (
    <>
      <section className="relative overflow-hidden px-5 pb-16 pt-32 md:pt-40">
        <motion.div className="absolute -left-32 top-10 h-[28rem] w-[28rem] rounded-full bg-[#7c6cff]/25 blur-[130px]" animate={{ x: [0, 70, 0], y: [0, 40, 0] }} transition={{ duration: 16, repeat: Infinity }} />
        <motion.div className="absolute -right-32 top-32 h-[28rem] w-[28rem] rounded-full bg-[#ff5fa2]/20 blur-[130px]" animate={{ x: [0, -70, 0], y: [0, -40, 0] }} transition={{ duration: 18, repeat: Infinity }} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[.25em] text-[#ffd9a0] backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ffb86b]" />Custom PowerPoint studio
            </motion.span>
            <h1 className="mt-7 text-[3.2rem] font-bold leading-[.98] tracking-[-0.045em] sm:text-7xl lg:text-[5.6rem]">
              <Words text="Your Ideas," /><br /><Words text="Beautifully Presented." className="font-display aurora-text font-medium italic tracking-[-0.03em]" delay={0.4} />
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-7 max-w-xl text-lg text-white/65">
              SlideCraft designs custom PowerPoint presentations for students, universities and businesses — in English, French, Arabic and Italian. Tell us your topic, we deliver on time.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 }} className="mt-9 flex flex-wrap gap-4">
              <Btn to="/order">Order Now <span className="transition group-hover:translate-x-1">→</span></Btn><Btn to="/services" ghost>See Services</Btn>
            </motion.div>
          </div>
          <DeckStack />
        </div>
        <div className="relative mt-12 flex flex-col items-center gap-2 font-mono text-[10px] tracking-[.4em] text-white/40" aria-hidden="true">
          SCROLL<span className="relative h-9 w-5 rounded-full border border-white/30"><span className="wheel absolute left-1/2 top-2 h-1.5 w-1 -translate-x-1/2 rounded-full bg-[#ffb86b]" /></span>
        </div>
      </section>

      <Marquee items={['School', 'University', 'Business', 'Creative', 'English', 'Français', 'العربية', 'Italiano']} />

      <section className="mx-auto max-w-6xl px-5 py-24">
        <Head k="Services">What we <em className="aurora-text">create</em></Head>
        <div className="grid gap-4 md:grid-cols-6">
          {services.map((s, i) => <Reveal key={s.t} delay={i * 0.08} className={spans[i]}><BentoCard s={s} i={i} /></Reveal>)}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-5"><Head k="Portfolio">Sample <em className="aurora-text">designs</em></Head>
          <p className="-mt-6 mb-8 text-sm text-white/40">Illustrative style previews — not client projects. Swipe →</p></div>
        <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:px-[max(1.25rem,calc((100vw-72rem)/2))]">
          {sample.map(([t, g, k]) => (
            <motion.div key={t} whileHover={{ y: -8, rotate: k % 2 ? 1 : -1 }} className={`gborder relative aspect-[16/10] min-w-[82%] snap-center rounded-3xl bg-gradient-to-br ${g} p-5 shadow-2xl shadow-black/50 sm:min-w-[360px]`}>
              <div className="flex h-full flex-col justify-between">
                <div className="flex items-center justify-between"><div className="h-2 w-12 rounded bg-white/70" /><span className="font-mono text-[10px] tracking-widest text-white/60">0{k + 1}</span></div>
                {k % 2 ? <div className="flex items-end gap-2">{[35, 60, 45, 80, 55].map(h => <div key={h} className="w-8 rounded-t bg-white/60" style={{ height: h }} />)}</div> : <div><div className="mb-2 h-2.5 w-3/4 rounded bg-white/70" /><div className="h-2 w-1/2 rounded bg-white/40" /></div>}
                <p className="font-display text-xl font-semibold italic">{t}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-24 lg:grid-cols-[.8fr_1.2fr]">
        <div className="lg:sticky lg:top-32 lg:self-start"><Head k="Why SlideCraft">Built around <em className="aurora-text">your</em> needs</Head></div>
        <div>
          {why.map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.06}>
              <div className="group flex items-baseline gap-5 border-t border-white/10 py-6 transition hover:pl-3">
                <span className="font-mono text-sm text-[#ffb86b]">0{i + 1}</span>
                <div><h3 className="font-display text-2xl font-semibold sm:text-3xl">{t}</h3><p className="mt-1 text-white/60">{d}</p></div>
              </div>
            </Reveal>
          ))}
          <div className="border-t border-white/10" />
        </div>
      </section>

      <section className="px-5 py-16">
        <div className={`${panel} mx-auto max-w-6xl overflow-hidden p-6 sm:p-12`}>
          <Head k="Process">How ordering <em className="aurora-text">works</em></Head>
          <div ref={tl} className="relative ml-3 space-y-12 pl-10 sm:ml-6 sm:pl-14">
            <div className="absolute bottom-2 left-0 top-2 w-px bg-white/10" />
            <motion.div className="aurora-bg absolute bottom-2 left-0 top-2 w-px origin-top" style={{ scaleY: line }} />
            {steps.map(([t, d], i) => (
              <Reveal key={t}>
                <span className="aurora-bg absolute -left-[13px] grid h-7 w-7 place-items-center rounded-full font-mono text-xs font-bold text-[#12061a]">{i + 1}</span>
                <h3 className="font-display text-2xl font-semibold sm:text-4xl">{t}</h3><p className="mt-2 max-w-lg text-white/60">{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-24">
        <Head k="FAQ">Common <em className="aurora-text">questions</em></Head>
        <div className="space-y-3">
          {faq.map(([q, a]) => (
            <details key={q} className="group rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 transition open:border-[#ffb86b]/40 open:bg-white/[0.06]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold">{q}<span className="text-2xl text-[#ffb86b] transition group-open:rotate-45">+</span></summary>
              <p className="mt-3 text-white/60">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="px-5 pb-24">
        <Reveal>
          <div className="aurora-bg relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] p-10 text-[#12061a] sm:p-16">
            <span className="font-display pointer-events-none absolute -bottom-16 -right-4 text-[14rem] font-bold italic leading-none text-black/10">S</span>
            <h2 className="font-display relative max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">Ready for a presentation that <em>stands out?</em></h2>
            <div className="relative mt-8"><Magnetic><Link to="/order" className="inline-block rounded-full bg-[#050611] px-8 py-3.5 font-semibold text-white">Start your order →</Link></Magnetic></div>
          </div>
        </Reveal>
      </section>
    </>
  )
}

function Services() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-24 pt-36">
      <Head k="Services">Presentations for <em className="aurora-text">every need</em></Head>
      <div className="grid gap-4 md:grid-cols-6">
        {services.map((s, i) => <Reveal key={s.t} delay={i * 0.08} className={spans[i]}><BentoCard s={s} i={i} cta /></Reveal>)}
      </div>
    </section>
  )
}

const L = ({ t, children }) => <label className="block"><span className="mb-1.5 block text-sm text-white/60">{t}</span>{children}</label>

function Order() {
  const empty = { name: '', whatsapp: '', topic: '', slides: 10, language: 'English', type: 'School', deadline: '', instructions: '' }
  const [f, setF] = useState(empty)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const today = new Date().toISOString().slice(0, 10)
  const pct = Math.round([f.name, f.whatsapp, f.topic, f.deadline].filter(Boolean).length / 4 * 100)

  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('')
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
      const msg = `*🆕 New SlideCraft Order*\n\n👤 Name: ${row.name}\n📱 WhatsApp: ${row.whatsapp}\n📌 Topic: ${row.topic}\n🖼️ Slides: ${row.slides}\n🌍 Language: ${row.language}\n🎯 Type: ${row.type}\n⏰ Deadline: ${row.deadline || 'Not set'}\n📝 Instructions: ${row.instructions || '—'}\n📎 File: ${file_url || 'None'}`
      window.location.href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`
    } catch (ex) { setErr(ex.message || 'Something went wrong. Please try again.') }
    setBusy(false)
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-24 pt-36 lg:grid-cols-[.8fr_1.2fr]">
      <div className="lg:sticky lg:top-32 lg:self-start">
        <Head k="Order">Order your <em className="aurora-text">presentation</em></Head>
        <ol className="space-y-4 text-white/60">
          {['Fill in the details', 'We save your order', 'WhatsApp opens with everything ready'].map((t, i) => (
            <li key={t} className="flex items-center gap-4"><span className="aurora-bg grid h-8 w-8 shrink-0 place-items-center rounded-full font-mono text-xs font-bold text-[#12061a]">{i + 1}</span>{t}</li>
          ))}
        </ol>
      </div>
      <Reveal>
        <form onSubmit={submit} className={`${panel} space-y-4 p-6 sm:p-8`}>
          <div><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><motion.div className="aurora-bg h-full" animate={{ width: `${pct}%` }} /></div><p className="mt-1 text-xs text-white/40">{pct}% of required details filled</p></div>
          <L t="Your name *"><input required className={input} value={f.name} onChange={set('name')} placeholder="Full name" /></L>
          <L t="WhatsApp number * (with country code)"><input required type="tel" className={input} value={f.whatsapp} onChange={set('whatsapp')} placeholder="+212 6 00 00 00 00" /></L>
          <L t="Presentation topic *"><input required className={input} value={f.topic} onChange={set('topic')} placeholder="e.g. Climate change" /></L>
          <div className="grid grid-cols-2 gap-4">
            <L t="Number of slides *"><input required type="number" min="1" max="200" className={input} value={f.slides} onChange={set('slides')} /></L>
            <L t="Language *"><select className={input} value={f.language} onChange={set('language')}>{langs.map(x => <option key={x}>{x}</option>)}</select></L>
            <L t="Type *"><select className={input} value={f.type} onChange={set('type')}>{types.map(x => <option key={x}>{x}</option>)}</select></L>
            <L t="Deadline *"><input required type="date" min={today} className={input} value={f.deadline} onChange={set('deadline')} /></L>
          </div>
          <L t="Additional instructions"><textarea rows="4" className={input} value={f.instructions} onChange={set('instructions')} placeholder="Colours, style, sources, anything we should know…" /></L>
          <L t="Attach a file (optional, max 10 MB)"><span className="flex cursor-pointer flex-col items-center gap-1 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-7 text-center transition hover:border-[#ffb86b] hover:bg-[#ffb86b]/5"><span className="text-2xl">{file ? '✅' : '📎'}</span><span className="break-all text-sm text-white/70">{file ? file.name : 'Tap to choose a file'}</span><input type="file" className="sr-only" onChange={e => setFile(e.target.files[0] || null)} /></span></L>
          {err && <motion.p role="alert" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: [0, -6, 6, 0] }} className="rounded-xl border border-red-400/30 bg-red-500/15 p-3 text-sm text-red-300">{err}</motion.p>}
          <button disabled={busy} className="aurora-bg w-full rounded-full py-4 font-bold text-[#12061a] shadow-[0_10px_40px_-8px_rgba(255,95,162,.6)] transition hover:scale-[1.02] active:scale-[.98] disabled:opacity-50">
            {busy ? <span className="inline-flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />Sending…</span> : 'Submit & continue on WhatsApp'}
          </button>
          <p className="text-center text-xs text-white/40">Your order is saved, then WhatsApp opens with your details ready to send.</p>
        </form>
      </Reveal>
    </section>
  )
}

function Contact() {
  return (
    <section className="mx-auto max-w-5xl px-5 pb-24 pt-36">
      <Head k="Contact">Let’s <em className="aurora-text">talk</em></Head>
      <div className="grid gap-4 md:grid-cols-2">
        <Reveal><div className="aurora-bg flex h-full min-h-[16rem] flex-col justify-between rounded-[2rem] p-8 text-[#12061a]"><span className="text-4xl">💬</span>
          <div><h3 className="font-display text-3xl font-semibold">WhatsApp</h3><p className="mb-5 mt-1 opacity-75">The fastest way to reach us.</p>
            <Magnetic><a href={`https://wa.me/${WA}?text=${encodeURIComponent('Hello SlideCraft! I have a question.')}`} className="inline-block rounded-full bg-[#050611] px-6 py-3 font-semibold text-white">Chat on WhatsApp →</a></Magnetic></div></div></Reveal>
        <Reveal delay={0.1}><div className={`${panel} flex h-full min-h-[16rem] flex-col justify-between p-8`}><span className="text-4xl">✉️</span>
          <div><h3 className="font-display text-3xl font-semibold">Email</h3><p className="mb-5 mt-1 break-all text-white/60">{MAIL}</p>
            <Btn href={`mailto:${MAIL}`} ghost>Send an email</Btn></div></div></Reveal>
      </div>
    </section>
  )
}

function Layout() {
  const location = useLocation(), pathname = location.pathname
  const reduce = useReducedMotion()
  const [ready, setReady] = useState(() => { try { return reduce || sessionStorage.getItem('sc_loaded') === '1' } catch { return true } })
  const done = () => { try { sessionStorage.setItem('sc_loaded', '1') } catch { /* ignore */ } setReady(true) }
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <>
      <AnimatePresence>{!ready && <Loader onDone={done} />}</AnimatePresence>
      <ScrollProgress />
      <Nav />
      <main className="min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div key={pathname} initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4 }}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/order" element={<Order />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="relative border-t border-white/10">
        <Signature />
        <nav className="flex flex-wrap justify-center gap-6 pb-4 text-sm text-white/50" aria-label="Footer">
          {[['/', 'Home'], ['/services', 'Services'], ['/order', 'Order'], ['/contact', 'Contact']].map(([to, l]) => <Link key={to} to={to} className="hover:text-white">{l}</Link>)}
        </nav>
        <p className="pb-8 text-center text-xs text-white/35">© {new Date().getFullYear()} SlideCraft. All rights reserved.</p>
      </footer>
    </>
  )
}
export default function App() { return <MotionConfig reducedMotion="user"><HashRouter><Layout /></HashRouter></MotionConfig> }
