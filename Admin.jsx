import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from './supabase'
import { useI18n } from './i18n'

// Database status values never change; only the displayed labels are translated.
const STATUSES = ['pending', 'in_progress', 'completed']
const COL = { pending: 'bg-steel/15 text-steel', in_progress: 'bg-steel/30 text-paper', completed: 'bg-paper text-navy' }
const input = 'w-full rounded-none border border-paper/10 bg-paper/5 px-4 py-3 text-paper placeholder-paper/30 outline-none transition focus:border-paper'
const grad = 'bg-paper'
const LOCALE = { en: 'en-GB', fr: 'fr-FR', ar: 'ar' }

export default function Admin() {
  const { t } = useI18n()
  const [session, setSession] = useState(undefined)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])
  if (session === undefined) return <p className="pt-40 text-center text-paper/50">{t('a.loading')}</p>
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
      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={go} className="relative border border-steel/25 space-y-4 rounded-none bg-navy/70 p-6">
        <h1 className="font-display text-3xl font-semibold">🔒 {t('a.login')}</h1>
        <input required type="email" dir="ltr" className={`${input} text-start`} placeholder={t('a.email')} value={email} onChange={e => setEmail(e.target.value)} />
        <input required type="password" dir="ltr" className={`${input} text-start`} placeholder={t('a.pw')} value={pw} onChange={e => setPw(e.target.value)} />
        {err && <p dir="ltr" className="text-start text-sm text-paper">{err}</p>}
        <button disabled={busy} className={`w-full rounded-none ${grad} py-3 font-bold text-navy disabled:opacity-50`}>{busy ? t('a.signing') : t('a.signin')}</button>
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
  const F = ({ k, children }) => <p><span className="text-paper/50">{t(k)}:</span> {children}</p>
  return (
    <section className="mx-auto max-w-5xl px-5 pb-20 pt-32">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs uppercase tracking-[.3em] text-steel rtl:tracking-normal">{t('a.k')}</p><h1 className="font-display text-3xl font-semibold md:text-5xl">{t('a.h')}</h1></div>
        <div className="flex gap-2">
          <button onClick={load} className="rounded-none border border-paper/20 px-4 py-2 text-sm hover:bg-paper/10">↻ {t('a.refresh')}</button>
          <button onClick={() => supabase.auth.signOut()} className="rounded-none border border-paper/20 px-4 py-2 text-sm hover:bg-paper/10">{t('a.logout')}</button>
        </div>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setFlt(k)} className={`rounded-none border p-4 text-start transition ${flt === k ? 'border-paper bg-paper/10' : 'border-paper/10 bg-paper/[0.04] hover:border-paper/25'}`}>
            <p className="font-display text-4xl font-semibold text-paper">{counts[k]}</p><p className="text-sm text-paper/60">{l}</p>
          </button>
        ))}
      </div>
      <input className={`${input} mb-4`} placeholder={`🔍 ${t('a.search')}`} value={q} onChange={e => setQ(e.target.value)} />
      {err && <p dir="ltr" className="mb-4 border-s-2 border-paper bg-paper/10 p-3 text-start text-sm text-paper">{err}</p>}
      {loading && [0, 1, 2].map(i => <div key={i} className="mb-3 h-16 animate-pulse rounded-none bg-paper/5" />)}
      {!loading && !shown.length && <p className="py-10 text-center text-paper/50">{t('a.none')}</p>}
      <div className="space-y-3">
        <AnimatePresence>
          {shown.map(o => (
            <motion.div key={o.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative border border-steel/25 rounded-none bg-navy/70 p-4 transition hover:-translate-y-0.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button onClick={() => setOpen(open === o.id ? null : o.id)} className="min-w-0 flex-1 text-start">
                  <p className="truncate font-semibold">{o.topic}</p>
                  <p className="text-sm text-paper/50">{o.name} · {t('a.slides', { n: o.slides })} · {new Date(o.created_at).toLocaleDateString(loc)}</p>
                </button>
                <select value={o.status} onChange={e => setStatus(o.id, e.target.value)} className={`rounded-none border-0 px-3 py-2 text-sm font-semibold outline-none ${COL[o.status]}`}>
                  {STATUSES.map(k => <option key={k} value={k}>{t(`st.${k}`)}</option>)}
                </select>
              </div>
              {open === o.id && (
                <div className="mt-4 grid gap-2 border-t border-paper/10 pt-4 text-sm md:grid-cols-2">
                  <F k="a.customer">{o.name}</F>
                  <F k="a.wa"><span dir="ltr" className="inline-block">{o.whatsapp}</span></F>
                  <F k="a.lang">{t(`pl.${o.language}`) === `pl.${o.language}` ? o.language : t(`pl.${o.language}`)}</F>
                  <F k="a.type">{t(`type.${o.type}`) === `type.${o.type}` ? o.type : t(`type.${o.type}`)}</F>
                  <F k="a.deadline">{o.deadline || '—'}</F>
                  <F k="a.ordered">{new Date(o.created_at).toLocaleString(loc)}</F>
                  <p className="md:col-span-2"><span className="text-paper/50">{t('a.instr')}:</span> {o.instructions || '—'}</p>
                  <div className="flex flex-wrap gap-2 md:col-span-2">
                    <a target="_blank" rel="noreferrer" href={`https://wa.me/${o.whatsapp.replace(/\D/g, '')}`} className={`rounded-none ${grad} px-4 py-2 font-semibold text-navy`}>{t('a.msg')}</a>
                    {o.file_url && <a target="_blank" rel="noreferrer" href={o.file_url} className="rounded-none border border-paper/20 px-4 py-2">📎 {t('a.file')}</a>}
                    <button onClick={() => remove(o.id)} className="rounded-none border border-steel/40 px-4 py-2 text-steel">{t('a.del')}</button>
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
