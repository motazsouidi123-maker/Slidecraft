import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { Magnetic, Hero3D, Signature, ServiceCard, Wordmark, LangSwitcher } from './ui'
import { supabase, WA, MAIL } from './supabase'
import { useI18n } from './i18n'
import Admin from './Admin'

const grad = 'bg-gradient-to-r from-copper to-sand'
const card = 'gborder relative rounded-3xl bg-[#0b0806]/75 backdrop-blur-xl p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(192,138,82,.45)]'
const input = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-copper focus:bg-white/[0.08] focus:shadow-[0_0_0_4px_rgba(233,201,154,.14)]'
const trk = 'tracking-[.25em] rtl:tracking-normal'

const Reveal = ({ children, delay = 0, className = '' }) => (
  <motion.div className={className} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }} transition={{ duration: 0.6, delay }}>{children}</motion.div>
)
const Arrow = () => <span className="flip ms-2 inline-block" aria-hidden="true">→</span>
const Btn = ({ to, href, children, ghost }) => {
  const c = `inline-flex items-center justify-center rounded-full px-7 py-3 font-semibold transition hover:scale-105 ${ghost ? 'border border-white/20 hover:bg-white/10' : grad + ' text-[#060403] shadow-lg shadow-copper/30'}`
  return <Magnetic>{to ? <Link to={to} className={c}>{children}</Link> : <a href={href} className={c}>{children}</a>}</Magnetic>
}
const Title = ({ k, children }) => (
  <Reveal className="mb-10 text-center">
    <p className={`text-sm uppercase text-copper ${trk}`}>{k}</p>
    <h2 className="font-display mt-2 text-4xl font-semibold md:text-6xl">{children}</h2>
  </Reveal>
)
// Defined at module level so inputs keep focus while typing.
const Field = ({ t, children }) => <label className="block"><span className="mb-1 block text-sm text-white/60">{t}</span>{children}</label>

// "k" is the stored order type value; labels come from the translation system.
const services = [
  { icon: '🎒', k: 'School', big: false },
  { icon: '🎓', k: 'University', big: true },
  { icon: '💼', k: 'Business', big: true },
  { icon: '✨', k: 'Creative', big: false },
]
const types = services.map(s => s.k)
const langs = ['English', 'French', 'Arabic', 'Italian']

function Nav() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const links = [['/', t('nav.home')], ['/services', t('nav.services')], ['/order', t('nav.order')], ['/contact', t('nav.contact')]]
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#060403]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
        <Link to="/" aria-label="PRESORA"><Wordmark className="text-lg md:text-xl" /></Link>
        <nav className="hidden gap-2 md:flex">
          {links.map(([to, l]) => <NavLink key={to} to={to} className="relative px-4 py-2 text-sm font-medium">{({ isActive }) => (<>{isActive && <motion.span layoutId="navpill" className="absolute inset-0 rounded-full bg-white/10 ring-1 ring-white/15" />}<span className={`relative transition ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}`}>{l}</span></>)}</NavLink>)}
        </nav>
        <div className="hidden items-center gap-3 md:flex"><LangSwitcher id="desktop" /><Btn to="/order">{t('nav.cta')}</Btn></div>
        <button className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-xl md:hidden" aria-expanded={open} onClick={() => setOpen(!open)} aria-label={t('nav.menu')}>{open ? '✕' : '☰'}</button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="flex flex-col gap-4 overflow-hidden px-5 pb-5 md:hidden">
            {links.map(([to, l]) => <Link key={to} to={to} onClick={() => setOpen(false)} className="text-lg text-white/80">{l}</Link>)}
            <div><LangSwitcher id="mobile" /></div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

function Home() {
  const { t } = useI18n()
  const portfolio = [['from-bronze to-copper', 'pf.1'], ['from-stone to-silver', 'pf.2'], ['from-champagne to-sand', 'pf.3'], ['from-[#2a2018] to-champagne', 'pf.4']]
  const why = [['🌍', 'w1'], ['🎨', 'w2'], ['⏰', 'w3'], ['💬', 'w4']]
  return (
    <>
      <section className="relative overflow-hidden px-5 pb-24 pt-32 text-center md:pt-40">
        <motion.div className="absolute -start-24 top-10 h-96 w-96 rounded-full bg-bronze/60 blur-[120px]" animate={{ x: [0, 70, 0], y: [0, 40, 0] }} transition={{ duration: 14, repeat: Infinity }} />
        <motion.div className="absolute -end-24 top-40 h-96 w-96 rounded-full bg-copper/20 blur-[120px]" animate={{ x: [0, -70, 0], y: [0, -40, 0] }} transition={{ duration: 16, repeat: Infinity }} />
        <div className="relative mx-auto max-w-5xl">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs uppercase text-sand backdrop-blur ${trk}`}>✦ {t('hero.badge')}</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: 0.1, duration: 0.9 }} className="font-display mt-7 text-[3rem] font-semibold leading-[1.05] tracking-[-0.02em] rtl:leading-[1.3] rtl:tracking-normal sm:text-6xl md:text-8xl">
            {t('hero.t1')}<br /><span className="animgrad">{t('hero.t2')}</span>
          </motion.h1>
          <motion.p dir="ltr" lang="en" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6 text-xs tracking-[.4em] text-champagne">{t('brand.tag')}</motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mx-auto mt-6 max-w-2xl text-lg text-white/65">{t('hero.sub')}</motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-10 flex flex-wrap justify-center gap-4">
            <Btn to="/order">{t('hero.c1')}<Arrow /></Btn><Btn to="/services" ghost>{t('hero.c2')}</Btn>
          </motion.div>
          <Hero3D />
          <div className={`mt-8 flex flex-col items-center gap-2 text-[10px] text-white/40 tracking-[.4em] rtl:tracking-normal`} aria-hidden="true">
            {t('hero.scroll')}<span className="relative h-9 w-5 rounded-full border border-white/30"><span className="wheel absolute left-1/2 top-2 h-1.5 w-1 -translate-x-1/2 rounded-full bg-sand" /></span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <Title k={t('k.services')}>{t('h.services')}</Title>
        <div className="grid gap-4 md:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.k} delay={i * 0.1} className={s.big ? 'md:col-span-2' : ''}><ServiceCard s={s} i={i} /></Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <Title k={t('k.portfolio')}>{t('h.portfolio')}</Title>
        <p className="-mt-6 mb-8 text-center text-sm text-white/40">{t('portfolio.note')}</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {portfolio.map(([g, k], i) => (
            <Reveal key={k} delay={i * 0.08}>
              <motion.div whileHover={{ y: -6, rotate: -1 }} className={`flex aspect-video flex-col justify-between rounded-2xl bg-gradient-to-br ${g} p-4 shadow-xl`}>
                <div className="h-2 w-10 rounded bg-white/70" /><div><div className="mb-1 h-2 w-3/4 rounded bg-white/50" /><p className="text-sm font-bold">{t(k)}</p></div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <Title k={t('k.why')}>{t('h.why')}</Title>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {why.map(([i, k], n) => (
            <Reveal key={k} delay={n * 0.08}><div className={`${card} h-full`}><div className="text-3xl">{i}</div><h3 className="mt-3 font-bold">{t(`${k}.t`)}</h3><p className="mt-1 text-sm text-white/60">{t(`${k}.d`)}</p></div></Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <Title k={t('k.process')}>{t('h.process')}</Title>
        <div className="grid gap-4 md:grid-cols-3">
          {['p1', 'p2', 'p3'].map((k, n) => (
            <Reveal key={k} delay={n * 0.1}><div className={`${card} h-full`}><span dir="ltr" className={`${grad} inline-block bg-clip-text font-mono text-3xl font-black text-transparent`}>0{n + 1}</span><h3 className="mt-2 text-lg font-bold">{t(`${k}.t`)}</h3><p className="mt-1 text-white/60">{t(`${k}.d`)}</p></div></Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16">
        <Title k={t('k.faq')}>{t('h.faq')}</Title>
        <div className="space-y-3">
          {['1', '2', '3', '4'].map(n => (
            <details key={n} className={`${card} group py-4`}><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold marker:hidden">{t(`q${n}`)}<span className="text-sand transition group-open:rotate-45">+</span></summary><p className="mt-3 text-white/60">{t(`a${n}`)}</p></details>
          ))}
        </div>
      </section>

      <section className="px-5 py-20 text-center">
        <Reveal><div className={`mx-auto max-w-3xl rounded-3xl ${grad} p-10 text-[#060403]`}>
          <h2 className="font-display text-4xl font-bold md:text-5xl">{t('cta.t')}</h2>
          <div className="mt-6"><Link to="/order" className="inline-block rounded-full bg-[#060403] px-8 py-3 font-semibold text-ivory transition hover:scale-105">{t('cta.b')}</Link></div>
        </div></Reveal>
      </section>
    </>
  )
}

function Services() {
  const { t } = useI18n()
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 pt-36">
      <Title k={t('k.services')}>{t('h.services2')}</Title>
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((s, i) => (
          <Reveal key={s.k} delay={i * 0.1}><ServiceCard s={s} i={i} cta /></Reveal>
        ))}
      </div>
    </section>
  )
}

function Order() {
  const { t } = useI18n()
  const empty = { name: '', whatsapp: '', topic: '', slides: 10, language: 'English', type: 'School', deadline: '', instructions: '' }
  const [f, setF] = useState(empty)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const today = new Date().toISOString().slice(0, 10)
  const pct = Math.round([f.name, f.whatsapp, f.topic, f.deadline].filter(Boolean).length / 4 * 100)
  const local = msg => Object.assign(new Error(msg), { local: true })

  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('')
    try {
      const slides = Number(f.slides)
      if (!Number.isInteger(slides) || slides < 1 || slides > 200) throw local(t('e.slides'))
      let file_url = null
      if (file) {
        if (file.size > 10 * 1024 * 1024) throw local(t('e.file'))
        const path = `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, '_')}`
        const { error } = await supabase.storage.from('order-files').upload(path, file)
        if (error) throw error
        file_url = supabase.storage.from('order-files').getPublicUrl(path).data.publicUrl
      }
      const row = { name: f.name.trim(), whatsapp: f.whatsapp.trim(), topic: f.topic.trim(), slides, language: f.language, type: f.type, deadline: f.deadline || null, instructions: f.instructions.trim(), file_url }
      const { error } = await supabase.from('orders').insert(row)
      if (error) throw error
      const msg = `*🆕 ${t('wa.title')}*\n\n👤 ${t('wa.name')}: ${row.name}\n📱 ${t('wa.phone')}: ${row.whatsapp}\n📌 ${t('wa.topic')}: ${row.topic}\n🖼️ ${t('wa.slides')}: ${row.slides}\n🌍 ${t('wa.lang')}: ${t(`pl.${row.language}`)}\n🎯 ${t('wa.type')}: ${t(`type.${row.type}`)}\n⏰ ${t('wa.deadline')}: ${row.deadline || t('wa.notset')}\n📝 ${t('wa.instr')}: ${row.instructions || '—'}\n📎 ${t('wa.file')}: ${file_url || t('wa.none')}`
      window.location.href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`
    } catch (ex) { console.error(ex); setErr(ex.local ? ex.message : t('e.generic')) }
    setBusy(false)
  }

  return (
    <section className="mx-auto max-w-2xl px-5 pb-20 pt-36">
      <Title k={t('o.k')}>{t('o.h')}</Title>
      <Reveal>
        <form onSubmit={submit} className={`${card} space-y-4`}>
          <div><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><motion.div className={`h-full ${grad}`} animate={{ width: `${pct}%` }} /></div><p className="mt-1 text-xs text-white/40">{t('o.prog', { n: pct })}</p></div>
          <Field t={`${t('o.name')} *`}><input required className={input} value={f.name} onChange={set('name')} placeholder={t('o.ph.name')} /></Field>
          <Field t={`${t('o.phone')} *`}><input required type="tel" className={input} value={f.whatsapp} onChange={set('whatsapp')} placeholder={t('o.ph.phone')} /></Field>
          <Field t={`${t('o.topic')} *`}><input required className={input} value={f.topic} onChange={set('topic')} placeholder={t('o.ph.topic')} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field t={`${t('o.slides')} *`}><input required type="number" min="1" max="200" step="1" className={input} value={f.slides} onChange={set('slides')} /></Field>
            <Field t={`${t('o.lang')} *`}><select className={input} value={f.language} onChange={set('language')}>{langs.map(x => <option key={x} value={x}>{t(`pl.${x}`)}</option>)}</select></Field>
            <Field t={`${t('o.type')} *`}><select className={input} value={f.type} onChange={set('type')}>{types.map(x => <option key={x} value={x}>{t(`type.${x}`)}</option>)}</select></Field>
            <Field t={`${t('o.deadline')} *`}><input required type="date" min={today} className={input} value={f.deadline} onChange={set('deadline')} /></Field>
          </div>
          <Field t={t('o.instr')}><textarea rows="4" className={input} value={f.instructions} onChange={set('instructions')} placeholder={t('o.ph.instr')} /></Field>
          <Field t={t('o.file')}><span className="flex cursor-pointer flex-col items-center gap-1 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-6 text-center transition hover:border-copper hover:bg-copper/5"><span className="text-2xl">{file ? '✅' : '📎'}</span><span className="break-all text-sm text-white/70">{file ? file.name : t('o.pick')}</span><input type="file" className="sr-only" onChange={e => setFile(e.target.files[0] || null)} /></span></Field>
          {err && <motion.p role="alert" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: [0, -6, 6, 0] }} className="rounded-xl border border-red-400/30 bg-red-500/15 p-3 text-sm text-red-300">{err}</motion.p>}
          <button disabled={busy} className={`w-full rounded-full ${grad} py-3.5 font-bold text-[#060403] shadow-lg shadow-copper/30 transition hover:scale-[1.02] active:scale-[.98] disabled:opacity-50`}>{busy ? <span className="inline-flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />{t('o.sending')}</span> : t('o.submit')}</button>
          <p className="text-center text-xs text-white/40">{t('o.note')}</p>
        </form>
      </Reveal>
    </section>
  )
}

function Contact() {
  const { t } = useI18n()
  return (
    <section className="mx-auto max-w-3xl px-5 pb-20 pt-36">
      <Title k={t('c.k')}>{t('c.h')}</Title>
      <div className="grid gap-4 md:grid-cols-2">
        <Reveal><div className={`${card} h-full text-center`}><div className="text-4xl">💬</div><h3 className="mt-3 text-xl font-bold">{t('c.wa')}</h3><p className="mb-5 mt-1 text-white/60">{t('c.wad')}</p>
          <Btn href={`https://wa.me/${WA}?text=${encodeURIComponent(t('c.hello'))}`}>{t('c.wab')}</Btn></div></Reveal>
        <Reveal delay={0.1}><div className={`${card} h-full text-center`}><div className="text-4xl">✉️</div><h3 className="mt-3 text-xl font-bold">{t('c.em')}</h3><p dir="ltr" className="mb-5 mt-1 break-all text-white/60">{MAIL}</p>
          <Btn href={`mailto:${MAIL}`} ghost>{t('c.emb')}</Btn></div></Reveal>
      </div>
    </section>
  )
}

function Layout() {
  const { t } = useI18n()
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
        <p className="pb-8 text-center text-xs text-white/35">{t('f.rights', { y: new Date().getFullYear() })}</p>
      </footer>
    </>
  )
}
export default function App() { return <MotionConfig reducedMotion="user"><HashRouter><Layout /></HashRouter></MotionConfig> }
