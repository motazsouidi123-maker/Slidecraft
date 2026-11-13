import { useState } from 'react'
import { HashRouter, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, WA, MAIL } from './supabase'
import Admin from './Admin'

const grad = 'bg-gradient-to-r from-violet-500 to-cyan-400'
const card = 'rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur p-6'
const input = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none focus:border-cyan-400'

const Reveal = ({ children, delay = 0, className = '' }) => (
  <motion.div className={className} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }} transition={{ duration: 0.6, delay }}>{children}</motion.div>
)
const Btn = ({ to, href, children, ghost }) => {
  const c = `inline-flex items-center justify-center rounded-full px-7 py-3 font-semibold transition hover:scale-105 ${ghost ? 'border border-white/20 hover:bg-white/10' : grad + ' text-black shadow-lg shadow-violet-500/30'}`
  return to ? <Link to={to} className={c}>{children}</Link> : <a href={href} className={c}>{children}</a>
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
        <Link to="/" className="text-xl font-extrabold"><span className={`${grad} bg-clip-text text-transparent`}>Slide</span>Craft</Link>
        <nav className="hidden gap-8 md:flex">
          {links.map(([to, l]) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'text-cyan-400' : 'text-white/70 hover:text-white'}>{l}</NavLink>)}
        </nav>
        <div className="hidden md:block"><Btn to="/order">Order Now</Btn></div>
        <button className="text-2xl md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? '✕' : '☰'}</button>
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
  const reviews = [
    ['Sara M.', 'University student', 'My thesis defence deck looked unbelievable. Delivered a day early!'],
    ['Karim B.', 'Startup founder', 'The pitch deck helped us close our first round. Professional and fast.'],
    ['Giulia R.', 'High-school student', 'Perfect Italian translation and a beautiful design. Got top marks!'],
  ]
  return (
    <>
      <section className="relative overflow-hidden px-5 pb-24 pt-40 text-center">
        <motion.div className="absolute -left-20 top-20 h-80 w-80 rounded-full bg-violet-600/40 blur-[110px]" animate={{ x: [0, 60, 0], y: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity }} />
        <motion.div className="absolute -right-20 top-40 h-80 w-80 rounded-full bg-cyan-500/30 blur-[110px]" animate={{ x: [0, -60, 0], y: [0, -30, 0] }} transition={{ duration: 14, repeat: Infinity }} />
        <div className="relative mx-auto max-w-4xl">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1 text-sm text-cyan-300">✨ Custom PowerPoint design service</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }} className="mt-6 text-5xl font-extrabold leading-tight md:text-7xl">
            Your Ideas, <span className={`${grad} bg-clip-text text-transparent`}>Beautifully Presented.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            SlideCraft designs custom PowerPoint presentations for students, universities and businesses — in English, French, Arabic and Italian. Tell us your topic, we deliver on time.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-10 flex flex-wrap justify-center gap-4">
            <Btn to="/order">Order Now →</Btn><Btn to="/services" ghost>See Services</Btn>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <Title k="Services">What we create</Title>
        <div className="grid gap-4 md:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.t} delay={i * 0.08} className={s.big ? 'md:col-span-2' : ''}>
              <div className={`${card} h-full transition hover:border-cyan-400/40`}><div className="text-4xl">{s.icon}</div><h3 className="mt-4 text-xl font-bold">{s.t}</h3><p className="mt-2 text-white/60">{s.d}</p></div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <Title k="Portfolio">Recent work</Title>
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
        <Title k="Testimonials">Loved by customers</Title>
        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map(([n, r, q], i) => (
            <Reveal key={n} delay={i * 0.1}><div className={`${card} h-full`}><p className="text-amber-300">★★★★★</p><p className="mt-3 text-white/80">“{q}”</p><p className="mt-4 font-semibold">{n}</p><p className="text-sm text-white/50">{r}</p></div></Reveal>
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
          <Reveal key={s.t} delay={i * 0.08}><div className={`${card} h-full`}><div className="text-5xl">{s.icon}</div><h3 className="mt-4 text-2xl font-bold">{s.t}</h3><p className="mt-2 text-white/60">{s.d}</p>
            <Link to="/order" className="mt-5 inline-block text-cyan-400 hover:underline">Order this →</Link></div></Reveal>
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
          <L t="Attach a file (optional, max 10 MB)"><input type="file" onChange={e => setFile(e.target.files[0] || null)} className="w-full text-sm text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white" /></L>
          {err && <p className="rounded-xl bg-red-500/15 p-3 text-sm text-red-300">{err}</p>}
          <button disabled={busy} className={`w-full rounded-full ${grad} py-3.5 font-bold text-black transition hover:scale-[1.02] disabled:opacity-50`}>{busy ? 'Sending…' : 'Submit & continue on WhatsApp'}</button>
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
  const { pathname } = useLocation()
  return (
    <>
      <Nav />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/order" element={<Order />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-white/40">
        © {new Date().getFullYear()} SlideCraft. All rights reserved.
      </footer>
    </>
  )
}
export default function App() { return <HashRouter><Layout /></HashRouter> }
