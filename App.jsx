import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { Magnetic, Hero3D, Signature, ServiceCard } from './ui'
import { supabase, WA, MAIL } from './supabase'
import Admin from './Admin'

const grad = 'bg-gradient-to-r from-violet-500 to-cyan-400'
const card = 'gborder relative rounded-3xl bg-[#0d0a1f]/70 backdrop-blur-xl p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(124,92,255,.5)]'
const input = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-cyan-400 focus:bg-white/[0.08] focus:shadow-[0_0_0_4px_rgba(34,211,238,.12)]'

const Reveal = ({ children, delay = 0, className = '' }) => (
  <motion.div className={className} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }} transition={{ duration: 0.6, delay }}>{children}</motion.div>
)
const Btn = ({ to, href, children, ghost }) => {
  const c = `inline-flex items-center justify-center rounded-full px-7 py-3 font-semibold transition hover:scale-105 ${ghost ? 'border border-white/20 hover:bg-white/10' : grad + ' text-black shadow-lg shadow-violet-500/30'}`
  return <Magnetic>{to ? <Link to={to} className={c}>{children}</Link> : <a href={href} className={c}>{children}</a>}</Magnetic>
}
const Title = ({ k, children }) => (
  <Reveal className="mb-10 text-center">
    <p className="text-sm uppercase tracking-widest text-cyan-400">{k}</p>
    <h2 className="mt-2 text-3xl font-bold md:text-5xl">{children}</h2>
  </Reveal>
)

const services = [
  { icon: '🎒', t: 'School Presentations', d: 'Clear, colourful slides for class projects, reports and exposés.', big: false },
  { icon: '🎓', t: 'University Presentations', d: 'Academic decks for theses, seminars and research defences, properly structured and sourced.', big: true },
  { icon: '💼', t: 'Business Presentations', d: 'Pitch decks, company profiles and reports that win clients and investors.', big: true },
  { icon: '✨', t: 'Creative PowerPoint', d: 'Bold custom designs, animations and storytelling for any idea.', big: false },
]
const types = ['School', 'University', 'Business', 'Creative']
const langs = ['English', 'French', 'Arabic', 'Italian']

function Nav() {
  const [open, setOpen] = useState(false)
  const links = [['/', 'Home'], ['/services', 'Services'], ['/order', 'Order'], ['/contact', 'Contact']]
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#07050f]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight"><span className={`grid h-8 w-8 place-items-center rounded-lg ${grad} text-sm text-black shadow-lg shadow-violet-500/40`}>S</span><span>Slide<span className="animgrad">Craft</span></span></Link>
        <nav className="hidden gap-8 md:flex">
          {links.map(([to, l]) => <NavLink key={to} to={to} className="relative px-4 py-2 text-sm font-medium">{({ isActive }) => (<>{isActive && <motion.span layoutId="navpill" className="absolute inset-0 rounded-full bg-white/10 ring-1 ring-white/15" />}<span className={`relative transition ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}`}>{l}</span></>)}</NavLink>)}
        </nav>
        <div className="hidden md:block"><Btn to="/order">Order Now</Btn></div>
        <button className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-xl md:hidden" aria-expanded={open} onClick={() => setOpen(!open)} aria-label="Menu">{open ? '✕' : '☰'}</button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="flex flex-col gap-4 overflow-hidden px-5 pb-5 md:hidden">
            {links.map(([to, l]) => <Link key={to} to={to} onClick={() => setOpen(false)} className="text-lg text-white/80">{l}</Link>)}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

function Home() {
  const portfolio = [['from-violet-600 to-fuchsia-500', 'Startup Pitch Deck'], ['from-cyan-500 to-blue-600', 'Biology Research'], ['from-fuchsia-500 to-orange-400', 'Marketing Plan'], ['from-emerald-400 to-cyan-600', 'History Class Project']]
  return (
    <>
      <section className="relative overflow-hidden px-5 pb-24 pt-32 text-center md:pt-40">
        <motion.div className="absolute -left-24 top-10 h-96 w-96 rounded-full bg-violet-600/35 blur-[120px]" animate={{ x: [0, 70, 0], y: [0, 40, 0] }} transition={{ duration: 14, repeat: Infinity }} />
        <motion.div className="absolute -right-24 top-40 h-96 w-96 rounded-full bg-cyan-500/25 blur-[120px]" animate={{ x: [0, -70, 0], y: [0, -40, 0] }} transition={{ duration: 16, repeat: Infinity }} />
        <div className="relative mx-auto max-w-5xl">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs uppercase tracking-[.25em] text-cyan-300 backdrop-blur">✦ Custom PowerPoint design service</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: 0.1, duration: 0.9 }} className="mt-7 text-[2.9rem] font-black leading-[1.02] tracking-[-0.04em] sm:text-6xl md:text-8xl">
            Your Ideas,<br /><span className="animgrad">Beautifully Presented.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mx-auto mt-7 max-w-2xl text-lg text-white/65">
            SlideCraft designs custom PowerPoint presentations for students, universities and businesses — in English, French, Arabic and Italian. Tell us your topic, we deliver on time.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-10 flex flex-wrap justify-center gap-4">
            <Btn to="/order">Order Now →</Btn><Btn to="/services" ghost>See Services</Btn>
          </motion.div>
          <Hero3D />
          <div className="mt-8 flex flex-col items-center gap-2 text-[10px] tracking-[.4em] text-white/40" aria-hidden="true">
            SCROLL<span className="relative h-9 w-5 rounded-full border border-white/30"><span className="wheel absolute left-1/2 top-2 h-1.5 w-1 -translate-x-1/2 rounded-full bg-cyan-300" /></span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <Title k="Services">What we create</Title>
        <div className="grid gap-4 md:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.t} delay={i * 0.1} className={s.big ? 'md:col-span-2' : ''}><ServiceCard s={s} i={i} /></Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <Title k="Portfolio">Sample designs</Title>
        <p className="-mt-6 mb-8 text-center text-sm text-white/40">Illustrative style previews — not client projects.</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {portfolio.map(([g, t], i) => (
            <Reveal key={t} delay={i * 0.08}>
              <motion.div whileHover={{ y: -6, rotate: -1 }} className={`flex aspect-video flex-col justify-between rounded-2xl bg-gradient-to-br ${g} p-4 shadow-xl`}>
                <div className="h-2 w-10 rounded bg-white/70" /><div><div className="mb-1 h-2 w-3/4 rounded bg-white/50" /><p className="text-sm font-bold">{t}</p></div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <Title k="Why SlideCraft">Built around your needs</Title>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[['🌍', 'Four languages', 'English, French, Arabic and Italian.'], ['🎨', 'Custom design', 'Made for your topic, not a recycled template.'], ['⏰', 'Your deadline', 'Tell us the date when you order.'], ['💬', 'Direct contact', 'Your order opens straight in WhatsApp.']].map(([i, t, d], n) => (
            <Reveal key={t} delay={n * 0.08}><div className={`${card} h-full`}><div className="text-3xl">{i}</div><h3 className="mt-3 font-bold">{t}</h3><p className="mt-1 text-sm text-white/60">{d}</p></div></Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <Title k="Process">How ordering works</Title>
        <div className="grid gap-4 md:grid-cols-3">
          {[['Fill the form', 'Topic, slides, language, type and deadline — optionally attach files.'], ['Send on WhatsApp', 'Your order is saved, then WhatsApp opens with all the details ready.'], ['We get to work', 'We follow up with you directly about your presentation.']].map(([t, d], n) => (
            <Reveal key={t} delay={n * 0.1}><div className={`${card} h-full`}><span className={`${grad} bg-clip-text font-mono text-3xl font-black text-transparent`}>0{n + 1}</span><h3 className="mt-2 text-lg font-bold">{t}</h3><p className="mt-1 text-white/60">{d}</p></div></Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16">
        <Title k="FAQ">Common questions</Title>
        <div className="space-y-3">
          {[['What do I need to place an order?', 'Just the form: your name, WhatsApp number, topic, number of slides, language, type and deadline. Files and extra instructions are optional.'], ['Which languages are available?', 'English, French, Arabic and Italian.'], ['How do I discuss price and details?', 'After you submit, WhatsApp opens with your order so you can talk with us directly. You can also use the Contact page.'], ['Can I attach my own material?', 'Yes — upload a reference or requirements file (max 10 MB) on the order form.']].map(([q, a]) => (
            <details key={q} className={`${card} group py-4`}><summary className="cursor-pointer list-none font-semibold marker:hidden">{q}<span className="float-right text-cyan-300 transition group-open:rotate-45">+</span></summary><p className="mt-3 text-white/60">{a}</p></details>
          ))}
        </div>
      </section>

      <section className="px-5 py-20 text-center">
        <Reveal><div className={`mx-auto max-w-3xl rounded-3xl ${grad} p-10 text-black`}>
          <h2 className="text-3xl font-extrabold md:text-4xl">Ready for a presentation that stands out?</h2>
          <div className="mt-6"><Link to="/order" className="inline-block rounded-full bg-black px-8 py-3 font-semibold text-white hover:scale-105 transition">Start your order</Link></div>
        </div></Reveal>
      </section>
    </>
  )
}

function Services() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 pt-36">
      <Title k="Services">Presentations for every need</Title>
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((s, i) => (
          <Reveal key={s.t} delay={i * 0.1}><ServiceCard s={s} i={i} cta /></Reveal>
        ))}
      </div>
    </section>
  )
}

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

  const L = ({ t, children }) => <label className="block"><span className="mb-1 block text-sm text-white/60">{t}</span>{children}</label>
  return (
    <section className="mx-auto max-w-2xl px-5 pb-20 pt-36">
      <Title k="Order">Order your presentation</Title>
      <Reveal>
        <form onSubmit={submit} className={`${card} space-y-4`}>
          <div><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><motion.div className={`h-full ${grad}`} animate={{ width: `${pct}%` }} /></div><p className="mt-1 text-xs text-white/40">{pct}% of required details filled</p></div>
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
          <L t="Attach a file (optional, max 10 MB)"><span className="flex cursor-pointer flex-col items-center gap-1 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-6 text-center transition hover:border-cyan-400 hover:bg-cyan-400/5"><span className="text-2xl">{file ? '✅' : '📎'}</span><span className="break-all text-sm text-white/70">{file ? file.name : 'Tap to choose a file'}</span><input type="file" className="sr-only" onChange={e => setFile(e.target.files[0] || null)} /></span></L>
          {err && <motion.p role="alert" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: [0, -6, 6, 0] }} className="rounded-xl border border-red-400/30 bg-red-500/15 p-3 text-sm text-red-300">{err}</motion.p>}
          <button disabled={busy} className={`w-full rounded-full ${grad} py-3.5 font-bold text-black shadow-lg shadow-violet-500/30 transition hover:scale-[1.02] active:scale-[.98] disabled:opacity-50`}>{busy ? <span className="inline-flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />Sending…</span> : 'Submit & continue on WhatsApp'}</button>
          <p className="text-center text-xs text-white/40">Your order is saved, then WhatsApp opens with your details ready to send.</p>
        </form>
      </Reveal>
    </section>
  )
}

function Contact() {
  return (
    <section className="mx-auto max-w-3xl px-5 pb-20 pt-36">
      <Title k="Contact">Let’s talk</Title>
      <div className="grid gap-4 md:grid-cols-2">
        <Reveal><div className={`${card} h-full text-center`}><div className="text-4xl">💬</div><h3 className="mt-3 text-xl font-bold">WhatsApp</h3><p className="mb-5 mt-1 text-white/60">Fastest way to reach us.</p>
          <Btn href={`https://wa.me/${WA}?text=${encodeURIComponent('Hello SlideCraft! I have a question.')}`}>Chat on WhatsApp</Btn></div></Reveal>
        <Reveal delay={0.1}><div className={`${card} h-full text-center`}><div className="text-4xl">✉️</div><h3 className="mt-3 text-xl font-bold">Email</h3><p className="mb-5 mt-1 break-all text-white/60">{MAIL}</p>
          <Btn href={`mailto:${MAIL}`} ghost>Send an email</Btn></div></Reveal>
      </div>
    </section>
  )
}

function Layout() {
  const location = useLocation(), pathname = location.pathname
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <>
      <Nav />
      <main className="min-h-screen">
        <AnimatePresence mode="wait"><motion.div key={pathname} initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/order" element={<Order />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Home />} />
        </Routes>
        </motion.div></AnimatePresence>
      </main>
      <footer className="relative border-t border-white/10">
        <Signature />
        <p className="pb-8 text-center text-xs text-white/35">© {new Date().getFullYear()} SlideCraft. All rights reserved.</p>
      </footer>
    </>
  )
}
export default function App() { return <MotionConfig reducedMotion="user"><HashRouter><Layout /></HashRouter></MotionConfig> }
