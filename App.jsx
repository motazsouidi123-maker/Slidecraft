import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { Signature, ServiceCard, Wordmark, LangSwitcher, Words, HeroStage, EASE } from './ui'
import { supabase, WA, MAIL } from './supabase'
import { useI18n } from './i18n'
import Admin from './Admin'

const trk = 'tracking-[.2em] rtl:tracking-normal'
const input = 'w-full border border-steel/30 bg-paper/[0.04] px-4 py-3.5 text-paper placeholder-steel/50 outline-none transition focus:border-paper focus:bg-paper/[0.08]'

const Reveal = ({ children, delay = 0, className = '' }) => (
  <motion.div className={className} initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.8, delay, ease: EASE }}>{children}</motion.div>
)
const ClipReveal = ({ children, delay = 0, className = '' }) => (
  <motion.div className={className} initial={{ clipPath: 'inset(0 0 100% 0)' }} whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
    viewport={{ once: true, margin: '-60px' }} transition={{ duration: 1, delay, ease: EASE }}>{children}</motion.div>
)
const Arrow = () => <span className="flip inline-block transition duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" aria-hidden="true">→</span>
const Btn = ({ to, href, children, ghost, inverse }) => {
  const c = `group inline-flex items-center justify-center gap-3 px-8 py-4 text-sm font-semibold uppercase transition duration-300 ${trk} ${ghost ? 'border border-steel/40 text-paper hover:border-paper hover:bg-paper hover:text-navy' : inverse ? 'bg-navy text-paper hover:bg-navy/80' : 'bg-paper text-navy hover:bg-steel'}`
  return <motion.span whileTap={{ scale: 0.97 }} className="inline-block">{to ? <Link to={to} className={c}>{children}</Link> : <a href={href} className={c}>{children}</a>}</motion.span>
}
const SectionHead = ({ n, k, children }) => (
  <Reveal className="mb-12 md:mb-16">
    <div className={`flex items-center gap-4 text-xs uppercase text-steel ${trk}`}><span dir="ltr" className="font-mono">{n}</span><span className="h-px flex-1 bg-steel/25" /><span>{k}</span></div>
    <h2 className="font-display mt-8 max-w-3xl text-4xl font-semibold leading-[1.05] rtl:leading-[1.3] md:text-6xl">{children}</h2>
  </Reveal>
)
// Module-level so inputs keep focus while typing.
const Field = ({ t, children }) => <label className="block"><span className={`mb-2 block text-xs uppercase text-steel ${trk}`}>{t}</span>{children}</label>

// "k" is the stored order type value; labels come from the translation system.
const services = [{ k: 'School' }, { k: 'University' }, { k: 'Business' }, { k: 'Creative' }]
const types = services.map(s => s.k)
const langs = ['English', 'French', 'Arabic', 'Italian']

function Nav() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const links = [['/', t('nav.home')], ['/services', t('nav.services')], ['/order', t('nav.order')], ['/contact', t('nav.contact')]]
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-steel/20 bg-navy/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <Link to="/" aria-label="PRESORA" onClick={() => setOpen(false)}><Wordmark className="text-lg md:text-xl" /></Link>
        <nav className="hidden gap-1 md:flex">
          {links.map(([to, l]) => <NavLink key={to} to={to} className="relative px-4 py-2 text-xs font-semibold uppercase tracking-[.2em] rtl:tracking-normal">{({ isActive }) => (<>{isActive && <motion.span layoutId="navline" className="absolute inset-x-4 -bottom-0.5 h-px bg-paper" />}<span className={`transition ${isActive ? 'text-paper' : 'text-steel hover:text-paper'}`}>{l}</span></>)}</NavLink>)}
        </nav>
        <div className="hidden items-center gap-4 md:flex"><LangSwitcher id="desktop" /><Btn to="/order">{t('nav.cta')}</Btn></div>
        <button className="grid h-11 w-11 place-items-center border border-steel/30 md:hidden" aria-expanded={open} onClick={() => setOpen(!open)} aria-label={t('nav.menu')}>
          {open ? <span className="text-lg leading-none">✕</span> : <span className="flex flex-col gap-1.5"><span className="block h-px w-5 bg-paper" /><span className="block h-px w-5 bg-paper" /></span>}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="overflow-hidden border-t border-steel/20 md:hidden">
            <div className="flex flex-col px-5 pb-6">
              {links.map(([to, l], i) => <Link key={to} to={to} onClick={() => setOpen(false)} className="flex items-baseline gap-4 border-b border-steel/20 py-4 font-display text-3xl font-semibold"><span dir="ltr" className="font-mono text-xs text-steel">0{i + 1}</span>{l}</Link>)}
              <div className="mt-6 flex items-center justify-between gap-4"><LangSwitcher id="mobile" /><Btn to="/order">{t('nav.cta')}</Btn></div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

function Home() {
  const { t } = useI18n()
  return (
    <>
      <section className="relative px-5 pb-24 pt-32 md:pt-44">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className={`flex items-center gap-4 text-xs uppercase text-steel ${trk}`}><span className="h-px w-12 bg-steel" />{t('hero.badge')}</motion.div>
            <h1 className="font-display mt-8 text-[clamp(3.1rem,9.5vw,8rem)] font-semibold leading-[.96] tracking-[-.02em] rtl:leading-[1.25] rtl:tracking-normal">
              <Words text={t('hero.t1')} /><br /><Words text={t('hero.t2')} delay={0.3} className="italic text-steel rtl:not-italic" />
            </h1>
            <motion.p dir="ltr" lang="en" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-8 border-s-2 border-steel ps-4 text-xs font-semibold tracking-[.35em] text-paper">{t('brand.tag')}</motion.p>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8, ease: EASE }} className="mt-6 max-w-xl text-lg text-steel">{t('hero.sub')}</motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15, duration: 0.8, ease: EASE }} className="mt-10 flex flex-wrap gap-4">
              <Btn to="/order">{t('hero.c1')}<Arrow /></Btn><Btn to="/services" ghost>{t('hero.c2')}</Btn>
            </motion.div>
          </div>
          <div className="lg:col-span-5"><HeroStage /></div>
        </div>
        <div className={`mx-auto mt-20 flex max-w-7xl items-center gap-4 text-[10px] uppercase text-steel ${trk}`} aria-hidden="true">
          {t('hero.scroll')}<span className="relative h-10 w-px overflow-hidden bg-steel/25"><span className="cue absolute inset-0 bg-paper" /></span><span className="h-px flex-1 bg-steel/25" />
        </div>
      </section>

      <section className="relative px-5 py-24">
        <div className="lines pointer-events-none absolute inset-0 mx-auto max-w-7xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <SectionHead n="01" k={t('k.services')}>{t('h.services')}</SectionHead>
          <div className="border-t border-steel/25">{services.map((s, i) => <Reveal key={s.k} delay={i * 0.06}><ServiceCard s={s} i={i} /></Reveal>)}</div>
        </div>
      </section>

      <section className="px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHead n="02" k={t('k.why')}>{t('h.why')}</SectionHead>
          <div className="grid border-y border-steel/25 md:grid-cols-4">
            {['w1', 'w2', 'w3', 'w4'].map((k, n) => (
              <Reveal key={k} delay={n * 0.08} className="border-steel/25 p-8 md:border-s md:first:border-s-0">
                <span dir="ltr" className="font-display text-5xl text-steel/60">0{n + 1}</span>
                <h3 className="font-display mt-6 text-2xl font-semibold">{t(`${k}.t`)}</h3><p className="mt-2 text-sm text-steel">{t(`${k}.d`)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHead n="03" k={t('k.process')}>{t('h.process')}</SectionHead>
          <div className="grid gap-12 md:grid-cols-3">
            {['p1', 'p2', 'p3'].map((k, n) => (
              <Reveal key={k} delay={n * 0.1}>
                <span dir="ltr" className="outline-num font-display block text-8xl font-bold leading-none">0{n + 1}</span>
                <div className="mt-6 h-px w-full bg-steel/25" />
                <h3 className="font-display mt-6 text-3xl font-semibold">{t(`${k}.t`)}</h3><p className="mt-3 text-steel">{t(`${k}.d`)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4"><SectionHead n="04" k={t('k.faq')}>{t('h.faq')}</SectionHead></div>
          <div className="border-t border-steel/25 lg:col-span-8 lg:mt-24">
            {['1', '2', '3', '4'].map(n => (
              <details key={n} className="group border-b border-steel/25 py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-2xl font-semibold marker:hidden md:text-3xl">{t(`q${n}`)}<span className="text-steel transition duration-300 group-open:rotate-45" aria-hidden="true">+</span></summary>
                <p className="mt-4 max-w-2xl text-steel">{t(`a${n}`)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24">
        <Reveal><div className="mx-auto grid max-w-7xl items-end gap-10 bg-paper px-8 py-16 text-navy md:grid-cols-12 md:px-16 md:py-24">
          <h2 className="font-display text-4xl font-semibold leading-[1.05] rtl:leading-[1.3] md:col-span-8 md:text-6xl">{t('cta.t')}</h2>
          <div className="md:col-span-4 md:text-end"><Btn to="/order" inverse>{t('cta.b')}<Arrow /></Btn></div>
        </div></Reveal>
      </section>
    </>
  )
}

function Services() {
  const { t } = useI18n()
  return (
    <section className="relative px-5 pb-24 pt-36">
      <div className="lines pointer-events-none absolute inset-0 mx-auto max-w-7xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl">
        <SectionHead n="01" k={t('k.services')}>{t('h.services2')}</SectionHead>
        <div className="border-t border-steel/25">{services.map((s, i) => <Reveal key={s.k} delay={i * 0.06}><ServiceCard s={s} i={i} cta /></Reveal>)}</div>
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
    <section className="px-5 pb-24 pt-36">
      <div className="mx-auto max-w-3xl">
        <SectionHead n="01" k={t('o.k')}>{t('o.h')}</SectionHead>
        <Reveal>
          <form onSubmit={submit} className="space-y-6 border border-steel/25 bg-navy/60 p-6 md:p-10">
            <div><div className="h-0.5 bg-steel/20"><motion.div className="h-full bg-paper" animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: EASE }} /></div><p className="mt-2 text-xs text-steel">{t('o.prog', { n: pct })}</p></div>
            <Field t={`${t('o.name')} *`}><input required className={input} value={f.name} onChange={set('name')} placeholder={t('o.ph.name')} /></Field>
            <Field t={`${t('o.phone')} *`}><input required type="tel" className={input} value={f.whatsapp} onChange={set('whatsapp')} placeholder={t('o.ph.phone')} /></Field>
            <Field t={`${t('o.topic')} *`}><input required className={input} value={f.topic} onChange={set('topic')} placeholder={t('o.ph.topic')} /></Field>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field t={`${t('o.slides')} *`}><input required type="number" min="1" max="200" step="1" className={input} value={f.slides} onChange={set('slides')} /></Field>
              <Field t={`${t('o.lang')} *`}><select className={input} value={f.language} onChange={set('language')}>{langs.map(x => <option key={x} value={x}>{t(`pl.${x}`)}</option>)}</select></Field>
              <Field t={`${t('o.type')} *`}><select className={input} value={f.type} onChange={set('type')}>{types.map(x => <option key={x} value={x}>{t(`type.${x}`)}</option>)}</select></Field>
              <Field t={`${t('o.deadline')} *`}><input required type="date" min={today} className={input} value={f.deadline} onChange={set('deadline')} /></Field>
            </div>
            <Field t={t('o.instr')}><textarea rows="4" className={input} value={f.instructions} onChange={set('instructions')} placeholder={t('o.ph.instr')} /></Field>
            <Field t={t('o.file')}><span className="flex cursor-pointer flex-col items-center gap-1 border border-dashed border-steel/40 px-4 py-8 text-center transition hover:border-paper hover:bg-paper/[0.04]"><span className="break-all text-sm text-paper">{file ? file.name : t('o.pick')}</span><input type="file" className="sr-only" onChange={e => setFile(e.target.files[0] || null)} /></span></Field>
            {err && <motion.p role="alert" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: [0, -6, 6, 0] }} className="border-s-2 border-paper bg-paper/10 p-3 text-sm text-paper">{err}</motion.p>}
            <button disabled={busy} className={`w-full bg-paper py-4 text-sm font-semibold uppercase text-navy transition hover:bg-steel active:scale-[.99] disabled:opacity-50 ${trk}`}>{busy ? <span className="inline-flex items-center gap-3"><span className="h-4 w-4 animate-spin rounded-full border-2 border-navy/30 border-t-navy" />{t('o.sending')}</span> : t('o.submit')}</button>
            <p className="text-center text-xs text-steel">{t('o.note')}</p>
          </form>
        </Reveal>
      </div>
    </section>
  )
}

function Contact() {
  const { t } = useI18n()
  return (
    <section className="px-5 pb-24 pt-36">
      <div className="mx-auto max-w-5xl">
        <SectionHead n="01" k={t('c.k')}>{t('c.h')}</SectionHead>
        <div className="grid border border-steel/25 md:grid-cols-2">
          <Reveal className="p-8 md:p-12"><h3 className="font-display text-3xl font-semibold">{t('c.wa')}</h3><p className="mb-8 mt-3 text-steel">{t('c.wad')}</p>
            <Btn href={`https://wa.me/${WA}?text=${encodeURIComponent(t('c.hello'))}`}>{t('c.wab')}<Arrow /></Btn></Reveal>
          <Reveal delay={0.1} className="border-t border-steel/25 p-8 md:border-s md:border-t-0 md:p-12"><h3 className="font-display text-3xl font-semibold">{t('c.em')}</h3><p dir="ltr" className="mb-8 mt-3 break-all text-steel rtl:text-right">{MAIL}</p>
            <Btn href={`mailto:${MAIL}`} ghost>{t('c.emb')}</Btn></Reveal>
        </div>
      </div>
    </section>
  )
}

function Layout() {
  const { t } = useI18n()
  const location = useLocation(), pathname = location.pathname
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  const links = [['/', 'nav.home'], ['/services', 'nav.services'], ['/order', 'nav.order'], ['/contact', 'nav.contact']]
  return (
    <>
      <Nav />
      <main className="min-h-screen">
        <AnimatePresence mode="wait"><motion.div key={pathname} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}>
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
      <footer className="border-t border-steel/25 px-5">
        <div className="mx-auto grid max-w-7xl gap-10 py-16 md:grid-cols-12">
          <div className="md:col-span-7"><Wordmark className="text-3xl md:text-5xl" rule /><p dir="ltr" lang="en" className="mt-6 text-xs font-semibold tracking-[.35em] text-steel">{t('brand.tag')}</p></div>
          <nav className="flex flex-col gap-3 md:col-span-5 md:items-end">{links.map(([to, k]) => <Link key={to} to={to} className={`text-xs font-semibold uppercase text-steel transition hover:text-paper ${trk}`}>{t(k)}</Link>)}</nav>
        </div>
        <div className="border-t border-steel/25"><Signature /></div>
        <p className="pb-8 text-center text-xs text-steel/70">{t('f.rights', { y: new Date().getFullYear() })}</p>
      </footer>
    </>
  )
}
export default function App() { return <MotionConfig reducedMotion="user"><HashRouter><Layout /></HashRouter></MotionConfig> }
