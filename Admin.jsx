import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from './supabase'
import { useI18n } from './i18n'

// Database status values never change; only the displayed labels are translated.
const STATUSES = ['pending', 'in_progress', 'completed']
const COL = { pending: 'bg-stone/40 text-silver', in_progress: 'bg-copper/20 text-sand', completed: 'bg-champagne/30 text-ivory' }
const input = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-copper focus:shadow-[0_0_0_4px_rgba(233,201,154,.14)]'
const grad = 'bg-gradient-to-r from-copper to-sand'
const LOCALE = { en: 'en-GB', fr: 'fr-FR', ar: 'ar' }

export default function Admin() {
  const { t } = useI18n()
  const [session, setSession] = useState(undefined)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])
  if (session === undefined) return <p className="pt-40 text-center text-white/50">{t('a.loading')}</p>
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
    <section className="mx-auto max-w-sm px-5 pt-40">
      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={go} className="gborder relative space-y-4 rounded-3xl bg-[#0b0806]/75 p-6 backdrop-blur-xl">
        <h1 className="text-2xl font-bold">🔒 {t('a.login')}</h1>
        <input required type="email" dir="ltr" className={`${input} text-start`} placeholder={t('a.email')} value={email} onChange={e => setEmail(e.target.value)} />
        <input required type="password" dir="ltr" className={`${input} text-start`} placeholder={t('a.pw')} value={pw} onChange={e => setPw(e.target.value)} />
        {err && <p dir="ltr" className="text-start text-sm text-red-300">{err}</p>}
        <button disabled={busy} className={`w-full rounded-full ${grad} py-3 font-bold text-[#060403] disabled:opacity-50`}>{busy ? t('a.signing') : t('a.signin')}</button>
      </motion.form>
    </section>
  )
}

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
  const F = ({ k, children }) => <p><span className="text-white/50">{t(k)}:</span> {children}</p>
  return (
    <section className="mx-auto max-w-5xl px-5 pb-20 pt-32">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs uppercase tracking-[.3em] text-copper rtl:tracking-normal">{t('a.k')}</p><h1 className="text-2xl font-bold md:text-3xl">{t('a.h')}</h1></div>
        <div className="flex gap-2">
          <button onClick={load} className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10">↻ {t('a.refresh')}</button>
          <button onClick={() => supabase.auth.signOut()} className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10">{t('a.logout')}</button>
        </div>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setFlt(k)} className={`rounded-2xl border p-4 text-start transition ${flt === k ? 'border-copper/60 bg-copper/10 shadow-[0_0_30px_-8px_rgba(192,138,82,.5)]' : 'border-white/10 bg-white/[0.04] hover:border-white/25'}`}>
            <p className="animgrad text-3xl font-extrabold">{counts[k]}</p><p className="text-sm text-white/60">{l}</p>
          </button>
        ))}
      </div>
      <input className={`${input} mb-4`} placeholder={`🔍 ${t('a.search')}`} value={q} onChange={e => setQ(e.target.value)} />
      {err && <p dir="ltr" className="mb-4 rounded-xl bg-red-500/15 p-3 text-start text-sm text-red-300">{err}</p>}
      {loading && [0, 1, 2].map(i => <div key={i} className="mb-3 h-16 animate-pulse rounded-2xl bg-white/5" />)}
      {!loading && !shown.length && <p className="py-10 text-center text-white/50">{t('a.none')}</p>}
      <div className="space-y-3">
        <AnimatePresence>
          {shown.map(o => (
            <motion.div key={o.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="gborder relative rounded-2xl bg-[#0b0806]/75 p-4 transition hover:-translate-y-0.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button onClick={() => setOpen(open === o.id ? null : o.id)} className="min-w-0 flex-1 text-start">
                  <p className="truncate font-semibold">{o.topic}</p>
                  <p className="text-sm text-white/50">{o.name} · {t('a.slides', { n: o.slides })} · {new Date(o.created_at).toLocaleDateString(loc)}</p>
                </button>
                <select value={o.status} onChange={e => setStatus(o.id, e.target.value)} className={`rounded-full border-0 px-3 py-2 text-sm font-semibold outline-none ${COL[o.status]}`}>
                  {STATUSES.map(k => <option key={k} value={k}>{t(`st.${k}`)}</option>)}
                </select>
              </div>
              {open === o.id && (
                <div className="mt-4 grid gap-2 border-t border-white/10 pt-4 text-sm md:grid-cols-2">
                  <F k="a.customer">{o.name}</F>
                  <F k="a.wa"><span dir="ltr" className="inline-block">{o.whatsapp}</span></F>
                  <F k="a.lang">{t(`pl.${o.language}`) === `pl.${o.language}` ? o.language : t(`pl.${o.language}`)}</F>
                  <F k="a.type">{t(`type.${o.type}`) === `type.${o.type}` ? o.type : t(`type.${o.type}`)}</F>
                  <F k="a.deadline">{o.deadline || '—'}</F>
                  <F k="a.ordered">{new Date(o.created_at).toLocaleString(loc)}</F>
                  <p className="md:col-span-2"><span className="text-white/50">{t('a.instr')}:</span> {o.instructions || '—'}</p>
                  <div className="flex flex-wrap gap-2 md:col-span-2">
                    <a target="_blank" rel="noreferrer" href={`https://wa.me/${o.whatsapp.replace(/\D/g, '')}`} className={`rounded-full ${grad} px-4 py-2 font-semibold text-[#060403]`}>{t('a.msg')}</a>
                    {o.file_url && <a target="_blank" rel="noreferrer" href={o.file_url} className="rounded-full border border-white/20 px-4 py-2">📎 {t('a.file')}</a>}
                    <button onClick={() => remove(o.id)} className="rounded-full border border-red-400/40 px-4 py-2 text-red-300">{t('a.del')}</button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  )
}
