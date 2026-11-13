import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from './supabase'

const ST = { pending: 'Pending', in_progress: 'In progress', completed: 'Completed' }
const COL = { pending: 'bg-amber-500/15 text-amber-300', in_progress: 'bg-cyan-500/15 text-cyan-300', completed: 'bg-emerald-500/15 text-emerald-300' }
const input = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-cyan-400 focus:shadow-[0_0_0_4px_rgba(34,211,238,.12)]'
const grad = 'bg-gradient-to-r from-violet-500 to-cyan-400'

export default function Admin() {
  const [session, setSession] = useState(undefined)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])
  if (session === undefined) return <p className="pt-40 text-center text-white/50">Loading…</p>
  return session ? <Dashboard /> : <Login />
}

function Login() {
  const [email, setEmail] = useState(''), [pw, setPw] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  async function go(e) {
    e.preventDefault(); setBusy(true); setErr('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    if (error) setErr(error.message)
    setBusy(false)
  }
  return (
    <section className="mx-auto max-w-sm px-5 pt-40">
      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={go} className="gborder relative space-y-4 rounded-3xl bg-[#0d0a1f]/70 p-6 backdrop-blur-xl">
        <h1 className="text-2xl font-bold">🔒 Admin login</h1>
        <input required type="email" className={input} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input required type="password" className={input} placeholder="Password" value={pw} onChange={e => setPw(e.target.value)} />
        {err && <p className="text-sm text-red-300">{err}</p>}
        <button disabled={busy} className={`w-full rounded-full ${grad} py-3 font-bold text-black disabled:opacity-50`}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </motion.form>
    </section>
  )
}

function Dashboard() {
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
    if (!confirm('Delete this order permanently?')) return
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) return setErr(error.message)
    setOrders(o => o.filter(x => x.id !== id))
  }

  const counts = useMemo(() => ({ all: orders.length, pending: orders.filter(o => o.status === 'pending').length, in_progress: orders.filter(o => o.status === 'in_progress').length, completed: orders.filter(o => o.status === 'completed').length }), [orders])
  const shown = useMemo(() => {
    const s = q.toLowerCase()
    return orders.filter(o => (flt === 'all' || o.status === flt) && (!s || [o.name, o.whatsapp, o.topic, o.language, o.type].join(' ').toLowerCase().includes(s)))
  }, [orders, q, flt])

  const tabs = [['all', 'All'], ['pending', 'Pending'], ['in_progress', 'In progress'], ['completed', 'Completed']]
  return (
    <section className="mx-auto max-w-5xl px-5 pb-20 pt-32">
      <div className="mb-6 flex items-center justify-between">
        <div><p className="text-xs uppercase tracking-[.3em] text-cyan-400">Admin</p><h1 className="text-2xl font-bold md:text-3xl">Orders dashboard</h1></div>
        <div className="flex gap-2">
          <button onClick={load} className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10">↻ Refresh</button>
          <button onClick={() => supabase.auth.signOut()} className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10">Log out</button>
        </div>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setFlt(k)} className={`rounded-2xl border p-4 text-left transition ${flt === k ? 'border-cyan-400/60 bg-cyan-400/10 shadow-[0_0_30px_-8px_rgba(34,211,238,.5)]' : 'border-white/10 bg-white/[0.04] hover:border-white/25'}`}>
            <p className="animgrad text-3xl font-extrabold">{counts[k]}</p><p className="text-sm text-white/60">{l}</p>
          </button>
        ))}
      </div>
      <input className={`${input} mb-4`} placeholder="🔍 Search name, phone, topic, language…" value={q} onChange={e => setQ(e.target.value)} />
      {err && <p className="mb-4 rounded-xl bg-red-500/15 p-3 text-sm text-red-300">{err}</p>}
      {loading && [0, 1, 2].map(i => <div key={i} className="mb-3 h-16 animate-pulse rounded-2xl bg-white/5" />)}
      {!loading && !shown.length && <p className="py-10 text-center text-white/50">No orders found.</p>}
      <div className="space-y-3">
        <AnimatePresence>
          {shown.map(o => (
            <motion.div key={o.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="gborder relative rounded-2xl bg-[#0d0a1f]/70 p-4 transition hover:-translate-y-0.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button onClick={() => setOpen(open === o.id ? null : o.id)} className="min-w-0 flex-1 text-left">
                  <p className="truncate font-semibold">{o.topic}</p>
                  <p className="text-sm text-white/50">{o.name} · {o.slides} slides · {new Date(o.created_at).toLocaleDateString()}</p>
                </button>
                <select value={o.status} onChange={e => setStatus(o.id, e.target.value)} className={`rounded-full border-0 px-3 py-2 text-sm font-semibold outline-none ${COL[o.status]}`}>
                  {Object.entries(ST).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              {open === o.id && (
                <div className="mt-4 grid gap-2 border-t border-white/10 pt-4 text-sm md:grid-cols-2">
                  <p><span className="text-white/50">Customer:</span> {o.name}</p>
                  <p><span className="text-white/50">WhatsApp:</span> {o.whatsapp}</p>
                  <p><span className="text-white/50">Language:</span> {o.language}</p>
                  <p><span className="text-white/50">Type:</span> {o.type}</p>
                  <p><span className="text-white/50">Deadline:</span> {o.deadline || '—'}</p>
                  <p><span className="text-white/50">Ordered:</span> {new Date(o.created_at).toLocaleString()}</p>
                  <p className="md:col-span-2"><span className="text-white/50">Instructions:</span> {o.instructions || '—'}</p>
                  <div className="flex flex-wrap gap-2 md:col-span-2">
                    <a target="_blank" rel="noreferrer" href={`https://wa.me/${o.whatsapp.replace(/\D/g, '')}`} className={`rounded-full ${grad} px-4 py-2 font-semibold text-black`}>Message customer</a>
                    {o.file_url && <a target="_blank" rel="noreferrer" href={o.file_url} className="rounded-full border border-white/20 px-4 py-2">📎 Open file</a>}
                    <button onClick={() => remove(o.id)} className="rounded-full border border-red-400/40 px-4 py-2 text-red-300">Delete</button>
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
