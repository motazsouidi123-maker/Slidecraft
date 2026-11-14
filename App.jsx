import { useCallback, useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { Signature, ServiceCard, Wordmark, LangSwitcher, Words, HeroStage, HeroWordmark, EASE } from './ui'
import { WA, MAIL } from './supabase'
import { useI18n } from './i18n'
import { OrderDraftProvider } from './orderDraft'
import Admin from './Admin'
import import Order from './OrderForm''
import PortfolioGallery from './Portfolio'
import Comparison from './Comparison'
import Loader from './Loader'
import { Calculator, PriceTable } from './Pricing'
import { Arrow, Btn, Reveal, SectionHead, trk } from './common'

// "k" is the stored order type value; labels come from the translation system.
const services = [{ k: 'School' }, { k: 'University' }, { k: 'Business' }, { k: 'Creative' }]
const NAV = [['/', 'nav.home'], ['/services', 'nav.services'], ['/portfolio', 'nav.portfolio'], ['/pricing', 'nav.pricing'], ['/order', 'nav.order'], ['/contact', 'nav.contact']]

function Nav() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-steel/20 bg-navy/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <Link to="/" aria-label="PRESORA" onClick={() => setOpen(false)}><Wordmark className="text-lg md:text-xl" /></Link>
        <nav className="hidden gap-1 lg:flex">
          {NAV.map(([to, k]) => <NavLink key={to} to={to} end={to === '/'} className="relative px-3 py-2 text-xs font-semibold uppercase tracking-[.18em] rtl:tracking-normal xl:px-4">{({ isActive }) => (<>{isActive && <motion.span layoutId="navline" className="absolute inset-x-3 -bottom-0.5 h-px bg-paper xl:inset-x-4" />}<span className={`transition ${isActive ? 'text-paper' : 'text-steel hover:text-paper'}`}>{t(k)}</span></>)}</NavLink>)}
        </nav>
        <div className="hidden items-center gap-4 lg:flex"><LangSwitcher id="desktop" /><Btn to="/order">{t('nav.cta')}</Btn></div>
        <button className="grid h-12 w-12 place-items-center border border-steel/30 lg:hidden" aria-expanded={open} onClick={() => setOpen(!open)} aria-label={t('nav.menu')}>
          {open ? <span className="text-lg leading-none">✕</span> : <span className="flex flex-col gap-1.5"><span className="block h-px w-5 bg-paper" /><span className="block h-px w-5 bg-paper" /></span>}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-steel/20 lg:hidden">
            <div className="flex flex-col px-5 pb-6">
              {NAV.map(([to, k], i) => <Link key={to} to={to} onClick={() => setOpen(false)} className="flex min-h-14 items-baseline gap-4 border-b border-steel/20 py-4 font-display text-3xl font-semibold"><span dir="ltr" className="font-mono text-xs text-steel">0{i + 1}</span>{t(k)}</Link>)}
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
      <section className="relative px-5 pb-16 pt-32 md:pt-40">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className={`flex items-center gap-4 text-xs uppercase text-steel ${trk}`}><span className="h-px w-12 bg-steel" />{t('hero.badge')}</motion.div>
            <h1 className="font-display mt-8 text-[clamp(3rem,8.4vw,7.2rem)] font-semibold leading-[.96] tracking-[-.02em] rtl:leading-[1.25] rtl:tracking-normal">
              <Words text={t('hero.t1')} /><br /><Words text={t('hero.t2')} delay={0.3} className="italic text-steel rtl:not-italic" />
            </h1>
            <motion.p dir="ltr" lang="en" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-8 border-s-2 border-steel ps-4 text-xs font-semibold tracking-[.35em] text-paper">{t('brand.tag')}</motion.p>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8, ease: EASE }} className="mt-6 max-w-xl text-lg text-steel">{t('hero.sub')}</motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15, duration: 0.8, ease: EASE }} className="mt-10 flex flex-wrap gap-4">
              <Btn to="/order">{t('hero.c1')}<Arrow /></Btn><Btn to="/portfolio" ghost>{t('nav.portfolio')}</Btn>
            </motion.div>
          </div>
          <div className="lg:col-span-5"><HeroStage /></div>
        </div>

        <div className="mx-auto mt-20 max-w-7xl">
          <HeroWordmark />
          <div className={`mt-6 grid grid-cols-1 border-y border-steel/25 text-xs uppercase text-steel sm:grid-cols-3 ${trk}`}>
            {['hero.m1', 'hero.m2', 'hero.m3'].map((k, i) => <span key={k} className={`px-1 py-4 sm:px-6 ${i ? 'border-t border-steel/25 sm:border-s sm:border-t-0' : 'sm:ps-0'}`}>{t(k)}</span>)}
          </div>
          <div className={`mt-8 flex items-center gap-4 text-[10px] uppercase text-steel ${trk}`} aria-hidden="true">
            {t('hero.scroll')}<span className="relative h-10 w-px overflow-hidden bg-steel/25"><span className="cue absolute inset-0 bg-paper" /></span><span className="h-px flex-1 bg-steel/25" />
          </div>
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
          <SectionHead n="02" k={t('k.portfolio')}>{t('h.portfolio')}</SectionHead>
          <PortfolioGallery limit={6} />
        </div>
      </section>

      <section className="relative px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHead n="03" k={t('k.pricing')} lead={t('pr.lead')}>{t('h.pricing')}</SectionHead>
          <Reveal><Calculator /></Reveal>
          <div className="mt-8"><Btn to="/pricing" ghost>{t('pr.view')}<Arrow /></Btn></div>
        </div>
      </section>

      <section className="px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHead n="04" k={t('k.why')}>{t('h.why')}</SectionHead>
          <div className="grid border-y border-steel/25 md:grid-cols-4">
            {['w1', 'w2', 'w3', 'w4'].map((k, n) => (
              <Reveal key={k} delay={n * 0.08} className="border-t border-steel/25 p-8 first:border-t-0 md:border-s md:border-t-0 md:first:border-s-0">
                <span dir="ltr" className="font-display text-5xl text-steel/60">0{n + 1}</span>
                <h3 className="font-display mt-6 text-2xl font-semibold">{t(`${k}.t`)}</h3><p className="mt-2 text-sm text-steel">{t(`${k}.d`)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHead n="05" k={t('k.process')}>{t('h.process')}</SectionHead>
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
          <div className="lg:col-span-4"><SectionHead n="06" k={t('k.faq')}>{t('h.faq')}</SectionHead></div>
          <div className="border-t border-steel/25 lg:col-span-8 lg:mt-24">
            {['1', '2', '3', '4', '5'].map(n => (
              <details key={n} className="group border-b border-steel/25 py-6">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 font-display text-2xl font-semibold marker:hidden md:text-3xl">{t(`q${n}`)}<span className="text-steel transition duration-300 group-open:rotate-45" aria-hidden="true">+</span></summary>
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
    <>
      <section className="relative px-5 pb-24 pt-36">
        <div className="lines pointer-events-none absolute inset-0 mx-auto max-w-7xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <SectionHead n="01" k={t('k.services')}>{t('h.services2')}</SectionHead>
          <div className="border-t border-steel/25">{services.map((s, i) => <Reveal key={s.k} delay={i * 0.06}><ServiceCard s={s} i={i} cta /></Reveal>)}</div>
        </div>
      </section>
      <section className="px-5 pb-24 pt-12">
        <div className="mx-auto max-w-7xl">
          <SectionHead n="02" k={t('k.compare')} lead={t('cmp.lead')}>{t('h.compare')}</SectionHead>
          <Comparison />
        </div>
      </section>
    </>
  )
}

function PortfolioPage() {
  const { t } = useI18n()
  return (
    <section className="px-5 pb-24 pt-36">
      <div className="mx-auto max-w-7xl">
        <SectionHead n="01" k={t('k.portfolio')}>{t('h.portfolio2')}</SectionHead>
        <PortfolioGallery />
      </div>
    </section>
  )
}

function PricingPage() {
  const { t } = useI18n()
  return (
    <section className="relative px-5 pb-24 pt-36">
      <div className="lines pointer-events-none absolute inset-0 mx-auto max-w-7xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl">
        <SectionHead n="01" k={t('k.pricing')} lead={t('pr.lead')}>{t('h.pricing')}</SectionHead>
        <PriceTable />
        <div className="mt-24"><SectionHead n="02" k={t('calc.k')}>{t('calc.h')}</SectionHead><Reveal><Calculator /></Reveal></div>
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
  return (
    <>
      <Nav />
      <main className="min-h-screen">
        <AnimatePresence mode="wait"><motion.div key={pathname} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/pricing" element={<PricingPage />} />
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
          <nav className="flex flex-col md:col-span-5 md:items-end">{NAV.map(([to, k]) => <Link key={to} to={to} className={`flex min-h-11 items-center text-xs font-semibold uppercase text-steel transition hover:text-paper ${trk}`}>{t(k)}</Link>)}</nav>
        </div>
        <div className="border-t border-steel/25"><Signature /></div>
        <p className="pb-8 text-center text-xs text-steel/70">{t('f.rights', { y: new Date().getFullYear() })}</p>
      </footer>
    </>
  )
}

export default function App() {
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  return (
    <MotionConfig reducedMotion="user">
      <OrderDraftProvider>
        <HashRouter>
          <Loader onReady={onReady} />
          {ready && <Layout />}
        </HashRouter>
      </OrderDraftProvider>
    </MotionConfig>
  )
}
