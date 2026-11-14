import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from './supabase'
import { useI18n } from './i18n'
import { priceFor } from './pricing'
import { Money } from './components/Pricing'

// Database status values never change; only the displayed labels are translated.
const STATUSES = ['pending', 'in_progress', 'completed']
const COL = { pending: 'bg-steel/15 text-steel', in_progress: 'bg-steel/30 text-paper', completed: 'bg-paper text-navy' }
const BAR = { pending: 'bg-steel/40', in_progress: 'bg-steel', completed: 'bg-paper' }
const input = 'w-full min-h-12 rounded-none border border-paper/10 bg-paper/5 px-4 py-3 text-paper placeholder-paper/30 outline-none transition focus:border-paper'
const grad = 'bg-paper'
const LOCALE = { en: 'en-GB', fr: 'fr-FR', ar: 'ar' }
const lab = 'text-xs uppercase tracking-[.18em] text-steel rtl:tracking-normal'

const Lock = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="5" y="11" width="14" height="9" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
const Chev = ({ open }) => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className={`transition duration-300 ${open ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" /></svg>

export default function Admin() {
  const { t } = useI18n()
  const [session, setSession] = useState(undefined)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])
  if (session === undefined) return <p role="status" className="pt-40 text-center text-paper/50">{t('a.loading')}</p>
  return session ? <Dashboard /> : <Login />
}

function Login() {
  const { t } = useI18n()
  const [email, setEmail] = useState(''), [pw, setPw] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  async function go(e) {
    e.preventDefault(); setBusy(true); setErr('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    if (error) setErr(error.message)
    setBusy(false)
  }
  return (
    <section className="mx-auto max-w-md px-5 pb-20 pt-36">
      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={go} className="relative space-y-5 rounded-none border border-steel/25 bg-navy/70 p-6 md:p-10">
        <div className="flex items-center gap-3 text-steel"><Lock /><span className={lab}>{t('a.k')}</span><span className="h-px flex-1 bg-steel/25" /></div>
        <h1 className="font-display text-4xl font-semibold">{t('a.login')}</h1>
        <input required type="email" dir="ltr" autoComplete="username" aria-label={t('a.email')} className={`${input} text-start`} placeholder={t('a.email')} value={email} onChange={e => setEmail(e.target.value)} />
        <input required type="password" dir="ltr" autoComplete="current-password" aria-label={t('a.pw')} className={`${input} text-start`} placeholder={t('a.pw')} value={pw} onChange={e => setPw(e.target.value)} />
        {err && <p dir="ltr" role="alert" className="border-s-2 border-paper bg-paper/10 p-3 text-start text-sm text-paper">{err}</p>}
        <button disabled={busy} className={`min-h-12 w-full rounded-none ${grad} py-3 font-bold text-navy disabled:opacity-50`}>{busy ? t('a.signing') : t('a.signin')}</button>
      </motion.form>
    </section>
  )
}

// Module-level so it is not re-created on every Dashboard render.
const Item = ({ label, children }) => <div className="flex justify-between gap-4 border-b border-steel/15 py-2.5 text-sm last:border-b-0"><dt className="shrink-0 text-steel">{label}</dt><dd className="min-w-0 break-words text-end">{children}</dd></div>

function Dashboard() {
  const { t, lang } = useI18n()
  const loc = LOCALE[lang]
  const [orders, setOrders] = useState([]), [q, setQ] = useState(''), [flt, setFlt] = useState('all'), [open, setOpen] = useState(null), [err, setErr] = useState(''), [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (error) setErr(error.message); else { setErr(''); setOrders(data) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function setStatus(id, status) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) return setErr(error.message)
    setOrders(o => o.map(x => x.id === id ? { ...x, status } : x))
  }
  async function remove(id) {
    if (!confirm(t('a.confirm'))) return
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) return setErr(error.message)
    setOrders(o => o.filter(x => x.id !== id))
  }

  const counts = useMemo(() => ({ all: orders.length, pending: orders.filter(o => o.status === 'pending').length, in_progress: orders.filter(o => o.status === 'in_progress').length, completed: orders.filter(o => o.status === 'completed').length }), [orders])
  const shown = useMemo(() => {
    const s = q.toLowerCase()
    return orders.filter(o => (flt === 'all' || o.status === flt) && (!s || [o.name, o.whatsapp, o.topic, o.language, o.type].join(' ').toLowerCase().includes(s)))
  }, [orders, q, flt])

  const tabs = [['all', t('a.all')], ...STATUSES.map(k => [k, t(`st.${k}`)])]
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 pt-32">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-steel/25 pb-8">
        <div><p className={lab}>{t('a.k')}</p><h1 className="font-display mt-3 text-4xl font-semibold md:text-6xl">{t('a.h')}</h1><p className="mt-3 text-steel">{t('a.sub')}</p></div>
        <div className="flex gap-2">
          <button onClick={load} className="min-h-12 rounded-none border border-paper/20 px-5 text-sm transition hover:bg-paper/10">↻ {t('a.refresh')}</button>
          <button onClick={() => supabase.auth.signOut()} className="min-h-12 rounded-none border border-paper/20 px-5 text-sm transition hover:bg-paper/10">{t('a.logout')}</button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-px border border-steel/25 bg-steel/25 md:grid-cols-4">
        {tabs.map(([k, l]) => (
          <button key={k} aria-pressed={flt === k} onClick={() => setFlt(k)} className={`relative rounded-none p-5 text-start transition ${flt === k ? 'bg-paper text-navy' : 'bg-navy hover:bg-paper/[0.06]'}`}>
            <p className="font-display text-5xl font-semibold">{counts[k]}</p><p className={`mt-1 text-sm ${flt === k ? 'text-navy/70' : 'text-steel'}`}>{l}</p>
            {k !== 'all' && <span aria-hidden="true" className={`absolute end-4 top-4 h-2 w-2 ${flt === k ? 'bg-navy' : BAR[k]}`} />}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input className={`${input} flex-1 basis-64`} aria-label={t('a.search')} placeholder={t('a.search')} value={q} onChange={e => setQ(e.target.value)} />
        <p className="text-sm text-steel">{t('a.shown', { n: shown.length })}</p>
      </div>
      {err && <p dir="ltr" role="alert" className="mb-4 border-s-2 border-paper bg-paper/10 p-3 text-start text-sm text-paper">{err}</p>}
      {loading && [0, 1, 2].map(i => <div key={i} className="mb-3 h-20 animate-pulse rounded-none bg-paper/5" />)}
      {!loading && !shown.length && <p className="border border-dashed border-steel/30 py-14 text-center text-paper/50">{t('a.none')}</p>}
      <div className="space-y-3">
        <AnimatePresence>
          {shown.map(o => {
            const isOpen = open === o.id
            return (
              <motion.div key={o.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative overflow-hidden rounded-none border border-steel/25 bg-navy/70 transition hover:border-steel/50">
                <span aria-hidden="true" className={`absolute inset-y-0 start-0 w-1 ${BAR[o.status] || 'bg-steel/40'}`} />
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 ps-6">
                  <button onClick={() => setOpen(isOpen ? null : o.id)} aria-expanded={isOpen} aria-label={isOpen ? t('a.hide') : t('a.show')} className="flex min-h-12 min-w-0 flex-1 basis-64 items-center gap-4 text-start">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{o.topic}</span>
                      <span className="block text-sm text-paper/50">{o.name} · {t('a.slides', { n: o.slides })} · {new Date(o.created_at).toLocaleDateString(loc)}</span>
                    </span>
                    <span className="hidden font-display text-xl font-semibold sm:block">{priceFor(o.slides) !== null && <Money value={priceFor(o.slides)} />}</span>
                    <span className="text-steel"><Chev open={isOpen} /></span>
                  </button>
                  <select aria-label={t('a.status')} value={o.status} onChange={e => setStatus(o.id, e.target.value)} className={`min-h-12 rounded-none border-0 px-3 py-2 text-sm font-semibold outline-none ${COL[o.status]}`}>
                    {STATUSES.map(k => <option key={k} value={k}>{t(`st.${k}`)}</option>)}
                  </select>
                </div>
                {isOpen && (
                  <div className="grid gap-x-10 gap-y-6 border-t border-steel/20 p-4 ps-6 md:grid-cols-2">
                    <div>
                      <p className={`${lab} mb-2`}>{t('a.contact')}</p>
                      <dl>
                        <Item label={t('a.customer')}>{o.name}</Item>
                        <Item label={t('a.wa')}><span dir="ltr" className="inline-block">{o.whatsapp}</span></Item>
                      </dl>
                    </div>
                    <div>
                      <p className={`${lab} mb-2`}>{t('a.project')}</p>
                      <dl>
                        <Item label={t('a.lang')}>{t(`pl.${o.language}`) === `pl.${o.language}` ? o.language : t(`pl.${o.language}`)}</Item>
                        <Item label={t('a.type')}>{t(`type.${o.type}`) === `type.${o.type}` ? o.type : t(`type.${o.type}`)}</Item>
                        <Item label={t('a.slidesN')}><span dir="ltr">{o.slides}</span></Item>
                        {priceFor(o.slides) !== null && <Item label={t('a.price')}><Money value={priceFor(o.slides)} /></Item>}
                        <Item label={t('a.deadline')}>{o.deadline || '—'}</Item>
                        <Item label={t('a.ordered')}>{new Date(o.created_at).toLocaleString(loc)}</Item>
                      </dl>
                    </div>
                    <div className="md:col-span-2">
                      <p className={`${lab} mb-2`}>{t('a.instr')}</p>
                      <p className="whitespace-pre-wrap break-words border-s-2 border-steel/40 bg-paper/[0.04] p-4 text-sm">{o.instructions || '—'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 md:col-span-2">
                      <a target="_blank" rel="noreferrer" href={`https://wa.me/${o.whatsapp.replace(/\D/g, '')}`} className={`inline-flex min-h-12 items-center rounded-none ${grad} px-5 font-semibold text-navy transition hover:bg-steel`}>{t('a.msg')}</a>
                      {o.file_url && <a target="_blank" rel="noreferrer" href={o.file_url} className="inline-flex min-h-12 items-center rounded-none border border-paper/20 px-5 transition hover:bg-paper/10">{t('a.file')}</a>}
                      <button onClick={() => remove(o.id)} className="ms-auto min-h-12 rounded-none border border-steel/40 px-5 text-steel transition hover:border-paper hover:text-paper">{t('a.del')}</button>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </section>
  )
}
