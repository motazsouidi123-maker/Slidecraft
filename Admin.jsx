import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Field, Section } from './ui.jsx'
import { supabase } from './supabase.js'

const STATUSES = ['pending', 'in_progress', 'completed']
const LABELS = { pending: 'Pending', in_progress: 'In progress', completed: 'Completed' }

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (err) setError(err.message)
    setLoading(false)
  }

  return (
    <Section eyebrow="Admin" title="Sign in">
      <div className="login-wrap">
        <Card>
          <form onSubmit={handleLogin} style={{ display: 'grid', gap: 16 }}>
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </Field>
            {error && <div className="error-box">{error}</div>}
            <Button type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Card>
      </div>
    </Section>
  )
}

function Dashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [openId, setOpenId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    else setOrders(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function updateStatus(id, status) {
    setError('')
    const { data, error: err } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
    if (err) {
      setError(err.message)
      return
    }
    if (!data || data.length === 0) {
      setError('Status was not updated. Check your permissions.')
      return
    }
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o)))
  }

  const count = (s) => orders.filter((o) => o.status === s).length
  const visible = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  return (
    <Section eyebrow="Admin" title="Orders">
      <div className="admin-bar">
        <span style={{ color: 'var(--muted)', fontSize: 14 }}>{orders.length} total</span>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="ghost" onClick={load}>
            Refresh
          </Button>
          <Button variant="ghost" onClick={() => supabase.auth.signOut()}>
            Sign out
          </Button>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <span>All</span>
          <strong>{orders.length}</strong>
        </div>
        {STATUSES.map((s) => (
          <div className="stat" key={s}>
            <span>{LABELS[s]}</span>
            <strong>{count(s)}</strong>
          </div>
        ))}
      </div>

      <div className="filters">
        {['all', ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            className={filter === s ? 'active' : ''}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? 'All' : LABELS[s]}
          </button>
        ))}
      </div>

      {error && (
        <div className="error-box" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading orders...</p>
      ) : visible.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No orders to show.</p>
      ) : (
        <div className="order-list">
          {visible.map((o) => {
            const isOpen = openId === o.id
            const digits = String(o.whatsapp || '').replace(/\D/g, '')
            return (
              <div className="order-card" key={o.id}>
                <button
                  type="button"
                  className="order-head"
                  onClick={() => setOpenId(isOpen ? null : o.id)}
                >
                  <span>
                    <strong>{o.name}</strong>
                    <small>
                      {o.topic} · {o.slides} slides
                    </small>
                  </span>
                  <span className={`badge badge-${o.status}`}>{LABELS[o.status] || o.status}</span>
                </button>

                {isOpen && (
                  <div className="order-body">
                    <div>
                      <b>WhatsApp: </b>
                      {digits ? (
                        <a className="link" href={`https://wa.me/${digits}`} target="_blank" rel="noreferrer">
                          {o.whatsapp}
                        </a>
                      ) : (
                        o.whatsapp
                      )}
                    </div>
                    <div>
                      <b>Type: </b>
                      {o.type}
                    </div>
                    <div>
                      <b>Language: </b>
                      {o.language}
                    </div>
                    <div>
                      <b>Deadline: </b>
                      {o.deadline || 'Not specified'}
                    </div>
                    {o.instructions && (
                      <div>
                        <b>Instructions: </b>
                        {o.instructions}
                      </div>
                    )}
                    <div>
                      <b>File: </b>
                      {o.file_url ? (
                        <a className="link" href={o.file_url} target="_blank" rel="noreferrer">
                          Open file
                        </a>
                      ) : (
                        'No file'
                      )}
                    </div>
                    <div>
                      <b>Created: </b>
                      {o.created_at ? new Date(o.created_at).toLocaleString() : '-'}
                    </div>
                    <Field label="Status">
                      <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}>
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Section>
  )
}

export default function Admin() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <Section>
        <p style={{ color: 'var(--muted)' }}>Loading...</p>
      </Section>
    )
  }

  return session ? <Dashboard /> : <Login />
}
