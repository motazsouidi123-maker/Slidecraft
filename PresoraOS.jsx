import React, { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Section } from './ui.jsx'
import { SERVICES } from './Services.jsx'
import { calcPrice, formatDZD } from './pricing.js'
import { MAIL } from './supabase.js'
import './presora-os.css'

/* ==================================================================
   PRESORA/OS
   A small retro-computer desktop that lives on the home page.
   - Draggable / resizable / minimisable windows (touch + mouse + keyboard)
   - Working terminal (help, services, price, open, order, theme, neofetch...)
   - Services, Pricing and Settings apps that reuse the site's own data
   - Compact (phone) layout: single fullscreen window, tap-to-open icons
   Nothing here touches routes, forms, Supabase or admin logic. It only
   links to existing routes with react-router.
================================================================== */

const SETTINGS_KEY = 'presora-os-settings'
const DEFAULT_SETTINGS = { wall: 'amber', accent: 'amber', crt: true }
const WALLS = ['amber', 'midnight', 'paper']
const ACCENTS = ['amber', 'green', 'ice']

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const pad2 = (n) => String(n).padStart(2, '0')
const reducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function loadSettings() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || 'null')
    if (!raw || typeof raw !== 'object') return DEFAULT_SETTINGS
    return {
      wall: WALLS.includes(raw.wall) ? raw.wall : DEFAULT_SETTINGS.wall,
      accent: ACCENTS.includes(raw.accent) ? raw.accent : DEFAULT_SETTINGS.accent,
      crt: typeof raw.crt === 'boolean' ? raw.crt : DEFAULT_SETTINGS.crt,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function saveSettings(s) {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
  } catch {
    /* storage unavailable: settings still apply for this visit */
  }
}

function useMedia(query) {
  const [match, setMatch] = useState(() => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false))
  useEffect(() => {
    if (!window.matchMedia) return undefined
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    if (mq.addEventListener) mq.addEventListener('change', on)
    else mq.addListener(on)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', on)
      else mq.removeListener(on)
    }
  }, [query])
  return match
}

/* ------------------------------------------------------------------
   Glyphs
------------------------------------------------------------------- */
const G = ({ children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {children}
  </svg>
)

const GLYPHS = {
  readme: <G><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></G>,
  services: <G><rect x="3.5" y="3.5" width="7" height="7" rx="1" /><rect x="13.5" y="3.5" width="7" height="7" rx="1" /><rect x="3.5" y="13.5" width="7" height="7" rx="1" /><rect x="13.5" y="13.5" width="7" height="7" rx="1" /></G>,
  pricing: <G><rect x="5" y="3" width="14" height="18" rx="1.5" /><path d="M8 7h8M8 12h2M12 12h2M16 12h0M8 16h2M12 16h2M16 16h0" /></G>,
  terminal: <G><rect x="3" y="4.5" width="18" height="15" rx="1.5" /><path d="M7 10l3 2.5L7 15M12.5 15H17" /></G>,
  settings: <G><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></G>,
  gallery: <G><path d="M4 7l8-3 8 3v10l-8 3-8-3z" /><path d="M4 7l8 3 8-3M12 10v10" /></G>,
  order: <G><path d="M4 5h2l2 11h10l2-8H7" /><circle cx="10" cy="20" r="1.2" /><circle cx="17" cy="20" r="1.2" /></G>,
  contact: <G><rect x="3" y="5.5" width="18" height="13" rx="1.5" /><path d="M3.5 7l8.5 6 8.5-6" /></G>,
}

/* ------------------------------------------------------------------
   Apps registry
------------------------------------------------------------------- */
const WINDOW_APPS = {
  readme: { title: 'readme.txt', label: 'readme.txt', w: 440, h: 340 },
  services: { title: 'services.app', label: 'services.app', w: 540, h: 360 },
  pricing: { title: 'pricing.calc', label: 'pricing.calc', w: 410, h: 390 },
  terminal: { title: 'terminal — presora-sh', label: 'terminal', w: 580, h: 380 },
  settings: { title: 'settings.sys', label: 'settings.sys', w: 390, h: 370 },
}

const ICONS_LEFT = [
  { id: 'readme', label: 'readme.txt', kind: 'window' },
  { id: 'services', label: 'services.app', kind: 'window' },
  { id: 'pricing', label: 'pricing.calc', kind: 'window' },
  { id: 'terminal', label: 'terminal', kind: 'window' },
  { id: 'settings', label: 'settings.sys', kind: 'window' },
]
const ICONS_RIGHT = [
  { id: 'gallery', label: '3D gallery', kind: 'scroll' },
  { id: 'order', label: 'order.exe', kind: 'route', to: '/order' },
  { id: 'contact', label: 'contact.lnk', kind: 'route', to: '/contact' },
]
const DOCK = ['readme', 'services', 'pricing', 'terminal', 'settings']

/* ------------------------------------------------------------------
   Window manager state
------------------------------------------------------------------- */
function initGeom(id, desk, nth) {
  const d = WINDOW_APPS[id]
  const side = desk.w >= 900 ? 112 : 12
  const w = Math.min(d.w, Math.max(260, desk.w - side * 2))
  const h = Math.min(d.h, Math.max(190, desk.h - 24))
  const x = clamp(side + 28 * nth + (id === 'terminal' ? 40 : 0), 8, Math.max(8, desk.w - w - 8))
  const y = clamp(14 + 24 * nth, 8, Math.max(8, desk.h - h - 8))
  return { x, y, w, h }
}

function wmReducer(state, a) {
  switch (a.type) {
    case 'open': {
      const prev = state.wins[a.id]
      const order = [...state.order.filter((x) => x !== a.id), a.id]
      const win = prev ? { ...prev, open: true, min: false } : { ...a.geom, open: true, min: false, max: false }
      return { order, wins: { ...state.wins, [a.id]: win } }
    }
    case 'focus': {
      if (state.order[state.order.length - 1] === a.id) return state
      return { ...state, order: [...state.order.filter((x) => x !== a.id), a.id] }
    }
    case 'close': {
      const w = state.wins[a.id]
      if (!w) return state
      return { order: state.order.filter((x) => x !== a.id), wins: { ...state.wins, [a.id]: { ...w, open: false, min: false } } }
    }
    case 'min': {
      const w = state.wins[a.id]
      if (!w) return state
      return { order: state.order.filter((x) => x !== a.id), wins: { ...state.wins, [a.id]: { ...w, min: true } } }
    }
    case 'max': {
      const w = state.wins[a.id]
      if (!w) return state
      return { ...state, wins: { ...state.wins, [a.id]: { ...w, max: !w.max } } }
    }
    case 'geom': {
      const w = state.wins[a.id]
      if (!w) return state
      return { ...state, wins: { ...state.wins, [a.id]: { ...w, ...a.geom } } }
    }
    case 'closeAll': {
      const wins = {}
      Object.keys(state.wins).forEach((k) => {
        wins[k] = { ...state.wins[k], open: false, min: false }
      })
      return { order: [], wins }
    }
    default:
      return state
  }
}

/* ------------------------------------------------------------------
   Small pieces
------------------------------------------------------------------- */
function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <time dateTime={now.toISOString()} className="pos-clock">
      {pad2(now.getHours())}:{pad2(now.getMinutes())}
    </time>
  )
}

function Win({ id, geom, title, z, focused, compact, onFocus, onClose, onMin, onMax, onDragStart, onResizeStart, onKeyMove, flush, children, setEl }) {
  const cls = ['pos-win', focused ? 'is-focus' : '', geom.max ? 'is-max' : '', geom.min ? 'is-min' : ''].filter(Boolean).join(' ')
  return (
    <section
      ref={setEl}
      className={cls}
      style={{ left: geom.x, top: geom.y, width: geom.w, height: geom.h, zIndex: 10 + z }}
      aria-label={title}
      data-win={id}
      onPointerDownCapture={onFocus}
    >
      <header
        className="pos-title"
        onPointerDown={onDragStart}
        onDoubleClick={compact ? undefined : onMax}
        tabIndex={compact ? -1 : 0}
        onKeyDown={onKeyMove}
        aria-label={`${title} window title bar. Use arrow keys to move.`}
      >
        <i className="pos-title-ic" aria-hidden="true">
          {GLYPHS[id]}
        </i>
        <b>{title}</b>
        <span className="pos-wbs">
          <button type="button" className="pos-wb" onClick={onMin} aria-label={`Minimize ${title}`}>
            <span aria-hidden="true">&#8211;</span>
          </button>
          <button type="button" className="pos-wb pos-wb-max" onClick={onMax} aria-label={geom.max ? `Restore ${title}` : `Maximize ${title}`}>
            <span aria-hidden="true">{geom.max ? '❐' : '□'}</span>
          </button>
          <button type="button" className="pos-wb pos-wb-x" onClick={onClose} aria-label={`Close ${title}`}>
            <span aria-hidden="true">&#215;</span>
          </button>
        </span>
      </header>
      <div className={`pos-body${flush ? ' is-flush' : ''}`}>{children}</div>
      <span className="pos-rs" onPointerDown={onResizeStart} aria-hidden="true" />
    </section>
  )
}

/* ------------------------------------------------------------------
   App: readme
------------------------------------------------------------------- */
function ReadmeApp({ api }) {
  return (
    <div className="pos-doc">
      <p className="pos-kicker">PRESORA/OS 1.0</p>
      <h3>We turn ideas into impact.</h3>
      <p>
        PRESORA is a presentation design studio for students, universities and businesses. This little computer is a
        peek at how we like to work: clear, fast and a bit playful.
      </p>
      <ul className="pos-list">
        <li><b>services.app</b> shows what we design.</li>
        <li><b>pricing.calc</b> gives an instant estimate.</li>
        <li><b>terminal</b> understands <code>help</code>.</li>
      </ul>
      <div className="pos-actions">
        <button type="button" className="pos-btn" onClick={() => api.openApp('services')}>Open services</button>
        <button type="button" className="pos-btn" onClick={() => api.openApp('terminal')}>Open terminal</button>
        <Link className="pos-btn pos-btn-pri" to="/order">Order a presentation</Link>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
   App: services
------------------------------------------------------------------- */
function ServicesApp() {
  const [sel, setSel] = useState(0)
  const s = SERVICES[sel]
  return (
    <div className="pos-split">
      <div className="pos-listbox" role="group" aria-label="Services">
        {SERVICES.map((x, i) => (
          <button key={x.id} type="button" className={i === sel ? 'is-on' : ''} aria-pressed={i === sel} onClick={() => setSel(i)}>
            <span className="pos-num">{pad2(i + 1)}</span>
            {x.title}
          </button>
        ))}
      </div>
      <div className="pos-detail" key={s.id}>
        <h3>{s.title}</h3>
        <p>{s.text}</p>
        <ul className="pos-list">
          {s.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <Link className="pos-btn pos-btn-pri" to="/order">Order this</Link>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
   App: pricing
------------------------------------------------------------------- */
function PricingApp() {
  const [slides, setSlides] = useState('10')
  const n = Number(slides)
  const valid = Number.isFinite(n) && n >= 1
  const price = valid ? calcPrice(n) : 0
  const blocks = valid ? Math.ceil(n / 5) : 0
  return (
    <div className="pos-calc">
      <label className="pos-field">
        <span>Number of slides</span>
        <input type="number" inputMode="numeric" min="1" step="1" value={slides} onChange={(e) => setSlides(e.target.value)} />
      </label>
      <div className="pos-chiprow" role="group" aria-label="Quick slide counts">
        {[5, 10, 15, 20, 25].map((v) => (
          <button key={v} type="button" className={String(v) === slides ? 'is-on' : ''} aria-pressed={String(v) === slides} onClick={() => setSlides(String(v))}>
            {v}
          </button>
        ))}
      </div>
      <div className="pos-lcd" aria-live="polite">
        <span>{blocks > 0 ? `${blocks} group${blocks > 1 ? 's' : ''} of 5 slides` : 'Enter slides'}</span>
        <strong>{formatDZD(price)}</strong>
      </div>
      <p className="pos-fine">500 DZD for every 5 slides, rounded up to the next group of 5.</p>
      <Link className={`pos-btn pos-btn-pri${price ? '' : ' is-off'}`} to={`/order?slides=${price ? n : ''}`} aria-disabled={!price}>
        Order this presentation
      </Link>
    </div>
  )
}

/* ------------------------------------------------------------------
   App: settings
------------------------------------------------------------------- */
const WALL_LABEL = { amber: 'Amber grid', midnight: 'Midnight', paper: 'Paper' }
const ACCENT_LABEL = { amber: 'Amber', green: 'Phosphor', ice: 'Ice' }

function SettingsApp({ settings, setSettings, api }) {
  return (
    <div className="pos-set">
      <fieldset>
        <legend>Wallpaper</legend>
        <div className="pos-chiprow">
          {WALLS.map((w) => (
            <button key={w} type="button" className={settings.wall === w ? 'is-on' : ''} aria-pressed={settings.wall === w} onClick={() => setSettings({ ...settings, wall: w })}>
              {WALL_LABEL[w]}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Accent colour</legend>
        <div className="pos-chiprow">
          {ACCENTS.map((a) => (
            <button key={a} type="button" className={`pos-acc pos-acc-${a}${settings.accent === a ? ' is-on' : ''}`} aria-pressed={settings.accent === a} onClick={() => setSettings({ ...settings, accent: a })}>
              <i aria-hidden="true" />
              {ACCENT_LABEL[a]}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Screen</legend>
        <button type="button" role="switch" aria-checked={settings.crt} className={`pos-switch${settings.crt ? ' is-on' : ''}`} onClick={() => setSettings({ ...settings, crt: !settings.crt })}>
          <i aria-hidden="true" />
          CRT scanlines
        </button>
      </fieldset>
      <div className="pos-actions">
        <button type="button" className="pos-btn" onClick={api.reboot}>Reboot</button>
        <button type="button" className="pos-btn" onClick={api.closeAll}>Close all windows</button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
   App: terminal
------------------------------------------------------------------- */
const TERM_COMMANDS = ['help', 'ls', 'open', 'services', 'price', 'order', 'contact', 'theme', 'crt', 'neofetch', 'fortune', 'whoami', 'date', 'echo', 'clear', 'reboot', 'exit', 'sudo']
const OPEN_NAMES = ['readme', 'services', 'pricing', 'terminal', 'settings', 'gallery', 'order', 'contact']
const FORTUNES = [
  'Make one point per slide. Then make it unmistakable.',
  'White space is not empty. It is where the idea breathes.',
  'If everything is bold, nothing is.',
  'A good deck is edited, not decorated.',
  'Your audience reads slower than you think. Design for that.',
  'Hierarchy first. Colour second. Animation last.',
]

const banner = () => [
  { k: 'ok', t: 'PRESORA/OS terminal  ·  presora-sh 1.0' },
  { k: 'dim', t: "Type 'help' to list commands. Tab completes, ↑ ↓ browse history." },
]

function TerminalApp({ api }) {
  const [lines, setLines] = useState(banner)
  const [value, setValue] = useState('')
  const bodyRef = useRef(null)
  const inputRef = useRef(null)
  const hist = useRef({ list: [], i: -1 })
  const apiRef = useRef(api)
  apiRef.current = api
  const startedAt = useRef(typeof performance !== 'undefined' ? performance.now() : 0)

  useEffect(() => {
    const b = bodyRef.current
    if (b) b.scrollTop = b.scrollHeight
  }, [lines])

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(pointer: fine)').matches && inputRef.current) {
      inputRef.current.focus({ preventScroll: true })
    }
  }, [])

  const exec = useCallback((raw) => {
    const a = apiRef.current
    const text = raw.trim()
    const out = []
    const o = (t, k = 'out') => out.push({ k, t })
    if (text) {
      const [cmd, ...args] = text.split(/\s+/)
      const rest = args.join(' ')
      switch (cmd.toLowerCase()) {
        case 'help':
          o('Commands:', 'ok')
          o('  help             show this list')
          o('  ls               list desktop items')
          o('  open <name>      open an app (readme, services, pricing, terminal, settings, gallery, order, contact)')
          o('  services         what we design')
          o('  price <slides>   instant price estimate')
          o('  order [slides]   go to the order form')
          o('  contact          ways to reach us')
          o('  theme <name>     amber | green | ice')
          o('  crt on|off       toggle scanlines')
          o('  neofetch         system info')
          o('  fortune          a design thought')
          o('  whoami · date · echo · clear · reboot · exit')
          break
        case 'ls':
          o('readme.txt  services.app  pricing.calc  settings.sys  terminal')
          o('3d-gallery  order.exe  contact.lnk', 'dim')
          break
        case 'open': {
          const name = (args[0] || '').toLowerCase().replace(/\.(txt|app|calc|sys|exe|lnk)$/, '')
          const key = name === '3d-gallery' ? 'gallery' : name
          if (!key) o('usage: open <name>', 'err')
          else if (!OPEN_NAMES.includes(key)) o(`open: no such app: ${args[0]}`, 'err')
          else {
            o(`opening ${key} ...`, 'ok')
            window.setTimeout(() => a.activate(key), 120)
          }
          break
        }
        case 'services':
          SERVICES.forEach((s, i) => {
            o(`${pad2(i + 1)}  ${s.title}`, 'ok')
            o(`    ${s.text}`, 'dim')
          })
          break
        case 'price': {
          const n = Number(args[0])
          if (!args[0]) o('usage: price <number of slides>', 'err')
          else if (!Number.isFinite(n) || n < 1) o(`price: '${args[0]}' is not a valid number of slides`, 'err')
          else {
            const blocks = Math.ceil(n / 5)
            o(`${Math.floor(n)} slides  →  ${blocks} group${blocks > 1 ? 's' : ''} of 5`)
            o(`price: ${formatDZD(calcPrice(n))}`, 'ok')
          }
          break
        }
        case 'order': {
          const n = Number(args[0])
          const q = Number.isFinite(n) && n >= 1 ? `?slides=${Math.floor(n)}` : ''
          o('opening the order form ...', 'ok')
          window.setTimeout(() => a.go(`/order${q}`), 350)
          break
        }
        case 'contact':
          o('WhatsApp   +213 673 088 320')
          o('Instagram  @i3._.x2')
          if (MAIL) o(`Email      ${MAIL}`)
          o("or run 'open contact'", 'dim')
          break
        case 'theme': {
          const t = (args[0] || '').toLowerCase()
          if (!t) o(`theme: ${a.settings.accent}  (amber | green | ice)`)
          else if (!ACCENTS.includes(t)) o(`theme: unknown theme '${args[0]}'. try amber, green or ice`, 'err')
          else {
            a.setSettings({ ...a.settings, accent: t })
            o(`theme set to ${t}`, 'ok')
          }
          break
        }
        case 'crt': {
          const v = (args[0] || '').toLowerCase()
          if (v !== 'on' && v !== 'off') o(`crt: ${a.settings.crt ? 'on' : 'off'}  (usage: crt on|off)`)
          else {
            a.setSettings({ ...a.settings, crt: v === 'on' })
            o(`crt ${v}`, 'ok')
          }
          break
        }
        case 'neofetch': {
          const up = Math.max(1, Math.round(((typeof performance !== 'undefined' ? performance.now() : 0) - startedAt.current) / 1000))
          const rows = [
            '  ╔═══════╗   guest@presora',
            '  ║ ▓▓▓▓▓ ║   ───────────────',
            '  ║ ▓ P ▓ ║   OS       PRESORA/OS 1.0',
            '  ║ ▓▓▓▓▓ ║   Host     Presentation studio',
            '  ╚═══╤═══╝   Shell    presora-sh',
            '   ═══╧═══    Services ' + SERVICES.length,
            `              Pricing  500 DZD / 5 slides`,
            `              Theme    ${a.settings.accent}`,
            `              Session  ${up}s`,
          ]
          out.push({ k: 'pre', t: rows.join('\n') })
          break
        }
        case 'fortune':
          o(FORTUNES[Math.floor(Math.random() * FORTUNES.length)], 'ok')
          break
        case 'whoami':
          o('guest — welcome to the studio')
          break
        case 'date':
          o(new Date().toString())
          break
        case 'echo':
          o(rest)
          break
        case 'clear':
          setLines([])
          return
        case 'reboot':
          o('rebooting ...', 'ok')
          window.setTimeout(() => a.reboot(), 250)
          break
        case 'exit':
          window.setTimeout(() => a.closeSelf(), 80)
          o('bye.', 'dim')
          break
        case 'sudo':
          o('guest is not in the sudoers file. This incident will be reported to the design team.', 'err')
          break
        default:
          o(`presora-sh: command not found: ${cmd}. try 'help'`, 'err')
      }
    }
    setLines((l) => [...l, { k: 'cmd', t: text }, ...out].slice(-240))
  }, [])

  const submit = (e) => {
    e.preventDefault()
    const text = value
    if (text.trim()) {
      hist.current.list.push(text)
      hist.current.i = hist.current.list.length
    }
    setValue('')
    exec(text)
  }

  const onKeyDown = (e) => {
    const h = hist.current
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!h.list.length) return
      h.i = clamp(h.i - 1, 0, h.list.length - 1)
      setValue(h.list[h.i])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!h.list.length) return
      h.i = clamp(h.i + 1, 0, h.list.length)
      setValue(h.i >= h.list.length ? '' : h.list[h.i])
    } else if (e.key === 'Tab') {
      const parts = value.split(/\s+/)
      const pool = parts.length <= 1 ? TERM_COMMANDS : parts[0] === 'open' ? OPEN_NAMES : parts[0] === 'theme' ? ACCENTS : []
      const stub = (parts[parts.length - 1] || '').toLowerCase()
      const hits = pool.filter((c) => c.startsWith(stub))
      if (stub && hits.length === 1) {
        e.preventDefault()
        parts[parts.length - 1] = hits[0]
        setValue(parts.join(' ') + (parts.length === 1 && hits[0] !== 'help' ? ' ' : ''))
      } else if (stub && hits.length > 1) {
        e.preventDefault()
        setLines((l) => [...l, { k: 'cmd', t: value }, { k: 'dim', t: hits.join('  ') }])
      }
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault()
      setLines([])
    } else if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      e.preventDefault()
      setLines((l) => [...l, { k: 'cmd', t: value + '^C' }])
      setValue('')
    }
  }

  const focusInput = () => {
    const sel = window.getSelection && window.getSelection()
    if (sel && sel.toString()) return
    if (inputRef.current) inputRef.current.focus({ preventScroll: true })
  }

  return (
    <div className="pos-term">
      <div className="pos-term-body" ref={bodyRef} onClick={focusInput} role="log" aria-live="polite" aria-label="Terminal output">
        {lines.map((l, i) =>
          l.k === 'cmd' ? (
            <div className="pos-t-cmd" key={i}>
              <span className="pos-prompt">presora@studio:~$</span> {l.t}
            </div>
          ) : l.k === 'pre' ? (
            <pre className="pos-t-pre" key={i}>{l.t}</pre>
          ) : (
            <div className={`pos-t-${l.k}`} key={i}>{l.t}</div>
          )
        )}
        <form className="pos-term-form" onSubmit={submit}>
          <label htmlFor="pos-term-input" className="pos-prompt">presora@studio:~$</label>
          <input
            id="pos-term-input"
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Terminal command"
          />
        </form>
      </div>
      <div className="pos-term-chips" role="group" aria-label="Quick commands">
        {['help', 'services', 'price 10', 'neofetch', 'fortune', 'clear'].map((c) => (
          <button key={c} type="button" onClick={() => exec(c)}>
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
   Boot screen
------------------------------------------------------------------- */
const BOOT_LINES = [
  'PRESORA/OS BIOS v1.0',
  '> checking memory ........ 640K OK',
  '> mounting /studio ....... OK',
  '> loading typography ..... OK',
  '> starting window server . OK',
  '> welcome, guest',
]

function Boot({ onSkip }) {
  return (
    <div className="pos-boot" onClick={onSkip} role="presentation">
      <div className="pos-boot-log" aria-hidden="true">
        {BOOT_LINES.map((l, i) => (
          <span className="pos-boot-l" key={l} style={{ '--n': l.length, '--i': i }}>
            {l}
          </span>
        ))}
      </div>
      <div className="pos-boot-bar" aria-hidden="true" />
      <button type="button" className="pos-boot-skip" onClick={onSkip}>
        Skip
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------
   Desktop
------------------------------------------------------------------- */
export default function PresoraOS() {
  const navigate = useNavigate()
  const compact = useMedia('(max-width: 720px)')
  const coarse = useMedia('(pointer: coarse)')

  const [settings, setSettingsState] = useState(loadSettings)
  const [phase, setPhase] = useState('idle') /* idle | booting | ready */
  const [wm, dispatch] = useReducer(wmReducer, { order: [], wins: {} })
  const [selIcon, setSelIcon] = useState(null)
  const [menu, setMenu] = useState(false)
  const [desk, setDesk] = useState({ w: 1000, h: 480 })

  const screenRef = useRef(null)
  const deskRef = useRef(null)
  const winEls = useRef({})
  const bootTimer = useRef(0)
  const deskRefLatest = useRef(desk)
  deskRefLatest.current = desk
  const wmRef = useRef(wm)
  wmRef.current = wm
  const compactRef = useRef(compact)
  compactRef.current = compact

  const setSettings = useCallback((s) => {
    setSettingsState(s)
    saveSettings(s)
  }, [])

  /* measure desktop area */
  useLayoutEffect(() => {
    const el = deskRef.current
    if (!el) return undefined
    const measure = () => setDesk({ w: el.clientWidth, h: el.clientHeight })
    measure()
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure)
      return () => window.removeEventListener('resize', measure)
    }
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const openApp = useCallback((id) => {
    const cur = wmRef.current
    const nth = cur.order.length
    dispatch({ type: 'open', id, geom: initGeom(id, deskRefLatest.current, nth) })
  }, [])

  const startBoot = useCallback(() => {
    window.clearTimeout(bootTimer.current)
    dispatch({ type: 'closeAll' })
    setSelIcon(null)
    if (reducedMotion()) {
      setPhase('ready')
      return
    }
    setPhase('booting')
    bootTimer.current = window.setTimeout(() => setPhase('ready'), 2500)
  }, [])

  const finishBoot = useCallback(() => {
    window.clearTimeout(bootTimer.current)
    setPhase('ready')
  }, [])

  /* start the boot sequence the first time the screen is on view */
  useEffect(() => {
    const el = screenRef.current
    if (!el) return undefined
    if (typeof IntersectionObserver === 'undefined') {
      startBoot()
      return undefined
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect()
          startBoot()
        }
      },
      { threshold: 0.35 }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      window.clearTimeout(bootTimer.current)
    }
  }, [startBoot])

  /* welcome window once the desktop is ready (not on phones, where windows are fullscreen) */
  useEffect(() => {
    if (phase !== 'ready') return
    if (compactRef.current) return
    if (wmRef.current.order.length === 0 && !wmRef.current.wins.readme) openApp('readme')
  }, [phase, openApp])

  /* close menu on outside press / Escape */
  useEffect(() => {
    if (!menu) return undefined
    const away = (e) => {
      if (!e.target.closest || !e.target.closest('.pos-menu-wrap')) setMenu(false)
    }
    const key = (e) => {
      if (e.key === 'Escape') setMenu(false)
    }
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('keydown', key)
    }
  }, [menu])

  const scrollToGallery = useCallback(() => {
    const el = document.getElementById('showcase3d')
    if (el) el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
  }, [])

  const activate = useCallback(
    (id) => {
      const icon = [...ICONS_LEFT, ...ICONS_RIGHT].find((i) => i.id === id)
      if (WINDOW_APPS[id]) openApp(id)
      else if (id === 'gallery') scrollToGallery()
      else if (icon && icon.to) navigate(icon.to)
    },
    [navigate, openApp, scrollToGallery]
  )

  const top = wm.order.length ? wm.order[wm.order.length - 1] : null
  const frontId = top && wm.wins[top] && wm.wins[top].open && !wm.wins[top].min ? top : null

  const api = useMemo(
    () => ({
      openApp,
      activate,
      go: (to) => navigate(to),
      settings,
      setSettings,
      reboot: startBoot,
      closeAll: () => dispatch({ type: 'closeAll' }),
      closeSelf: () => dispatch({ type: 'close', id: 'terminal' }),
    }),
    [activate, navigate, openApp, settings, setSettings, startBoot]
  )

  /* ---- window dragging / resizing (direct DOM writes, committed on release) ---- */
  const beginPointer = (e, id, mode) => {
    if (compactRef.current) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (e.target.closest && e.target.closest('button')) return
    const w = wmRef.current.wins[id]
    const el = winEls.current[id]
    if (!w || !el || w.max) return
    dispatch({ type: 'focus', id })
    const sx = e.clientX
    const sy = e.clientY
    const o = { x: w.x, y: w.y, w: w.w, h: w.h }
    const dk = deskRefLatest.current
    let cur = { ...o }
    el.classList.add('is-moving')
    const move = (ev) => {
      const dx = ev.clientX - sx
      const dy = ev.clientY - sy
      if (mode === 'drag') {
        cur.x = clamp(o.x + dx, 60 - o.w, dk.w - 60)
        cur.y = clamp(o.y + dy, 0, dk.h - 36)
        el.style.left = `${cur.x}px`
        el.style.top = `${cur.y}px`
      } else {
        cur.w = clamp(o.w + dx, 260, Math.max(260, dk.w - o.x))
        cur.h = clamp(o.h + dy, 180, Math.max(180, dk.h - o.y))
        el.style.width = `${cur.w}px`
        el.style.height = `${cur.h}px`
      }
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      el.classList.remove('is-moving')
      dispatch({ type: 'geom', id, geom: cur })
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  const keyMove = (e, id) => {
    if (compactRef.current) return
    const step = e.shiftKey ? 48 : 16
    const map = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    const d = map[e.key]
    if (!d) return
    e.preventDefault()
    const w = wmRef.current.wins[id]
    if (!w || w.max) return
    const dk = deskRefLatest.current
    dispatch({ type: 'geom', id, geom: { x: clamp(w.x + d[0], 60 - w.w, dk.w - 60), y: clamp(w.y + d[1], 0, dk.h - 36) } })
  }

  const toggleDock = (id) => {
    const w = wm.wins[id]
    if (!w || !w.open || w.min) openApp(id)
    else if (frontId === id) dispatch({ type: 'min', id })
    else dispatch({ type: 'focus', id })
  }

  const focusTitle = frontId ? WINDOW_APPS[frontId].title : 'Desktop'
  const openIds = Object.keys(wm.wins).filter((id) => wm.wins[id].open)

  const renderApp = (id) => {
    switch (id) {
      case 'readme':
        return <ReadmeApp api={api} />
      case 'services':
        return <ServicesApp />
      case 'pricing':
        return <PricingApp />
      case 'terminal':
        return <TerminalApp api={api} />
      case 'settings':
        return <SettingsApp settings={settings} setSettings={setSettings} api={api} />
      default:
        return null
    }
  }

  const renderIcon = (ic, idx) => (
    <button
      key={ic.id}
      type="button"
      className={`pos-icon${selIcon === ic.id ? ' is-sel' : ''}`}
      style={{ '--i': idx }}
      onClick={(e) => {
        setSelIcon(ic.id)
        if (coarse || e.detail !== 1) activate(ic.id)
      }}
      aria-label={`${ic.label}${ic.kind === 'route' ? ' (opens a page)' : ic.kind === 'scroll' ? ' (jumps to the 3D gallery)' : ''}`}
    >
      <span className="pos-glyph">{GLYPHS[ic.id]}</span>
      <span className="pos-icon-label">{ic.label}</span>
    </button>
  )

  return (
    <Section id="presora-os" className="pos-section">
      <div className="showcase-head">
        <span className="eyebrow">Presora OS</span>
        <h2 className="showcase-title">WELCOME TO THE STUDIO COMPUTER.</h2>
        <p className="section-intro">
          Poke around. Open windows, drag them around, run commands in the terminal, estimate a price, or jump straight
          to an order.
        </p>
      </div>

      <div className="pos-machine">
        <div
          className={`pos-screen${phase === 'booting' ? ' is-booting' : ''}${phase === 'ready' ? ' is-ready' : ''}`}
          ref={screenRef}
          data-wall={settings.wall}
          data-accent={settings.accent}
          data-crt={settings.crt ? 'on' : 'off'}
          role="group"
          aria-label="PRESORA/OS desktop"
        >
          {phase === 'booting' && <Boot onSkip={finishBoot} />}

          <div className="pos-bar">
            <div className="pos-menu-wrap">
              <button type="button" className="pos-logo" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((v) => !v)}>
                <span aria-hidden="true">◆</span> PRESORA
              </button>
              {menu && (
                <div className="pos-menu" role="menu">
                  <button type="button" role="menuitem" onClick={() => { setMenu(false); openApp('readme') }}>About PRESORA/OS</button>
                  <button type="button" role="menuitem" onClick={() => { setMenu(false); openApp('settings') }}>System settings</button>
                  <button type="button" role="menuitem" onClick={() => { setMenu(false); openApp('terminal') }}>Terminal</button>
                  <hr />
                  <button type="button" role="menuitem" onClick={() => { setMenu(false); dispatch({ type: 'closeAll' }) }}>Close all windows</button>
                  <button type="button" role="menuitem" onClick={() => { setMenu(false); startBoot() }}>Reboot</button>
                </div>
              )}
            </div>
            <span className="pos-bar-title" aria-live="polite">{focusTitle}</span>
            <span className="pos-bar-r">
              <span className="pos-online">online</span>
              <Clock />
            </span>
          </div>

          <div className="pos-desk" ref={deskRef} onPointerDown={(e) => { if (e.target === e.currentTarget) setSelIcon(null) }}>
            <div className="pos-floor" aria-hidden="true" />
            <div className="pos-mark" aria-hidden="true">PRESORA</div>

            <div className="pos-icons pos-icons-l" role="group" aria-label="Desktop apps">
              {ICONS_LEFT.map((ic, i) => renderIcon(ic, i))}
            </div>
            <div className="pos-icons pos-icons-r" role="group" aria-label="Site shortcuts">
              {ICONS_RIGHT.map((ic, i) => renderIcon(ic, i + ICONS_LEFT.length))}
            </div>

            {openIds.map((id) => {
              const g = wm.wins[id]
              const z = Math.max(0, wm.order.indexOf(id))
              return (
                <Win
                  key={id}
                  id={id}
                  geom={g}
                  title={WINDOW_APPS[id].title}
                  z={z}
                  focused={frontId === id}
                  compact={compact}
                  flush={id === 'terminal'}
                  setEl={(el) => {
                    if (el) winEls.current[id] = el
                    else delete winEls.current[id]
                  }}
                  onFocus={() => dispatch({ type: 'focus', id })}
                  onClose={() => dispatch({ type: 'close', id })}
                  onMin={() => dispatch({ type: 'min', id })}
                  onMax={() => dispatch({ type: 'max', id })}
                  onDragStart={(e) => beginPointer(e, id, 'drag')}
                  onResizeStart={(e) => beginPointer(e, id, 'resize')}
                  onKeyMove={(e) => keyMove(e, id)}
                >
                  {renderApp(id)}
                </Win>
              )
            })}
          </div>

          <div className="pos-dock">
            <div className="pos-dock-apps" role="group" aria-label="Running and pinned apps">
              {DOCK.map((id) => {
                const w = wm.wins[id]
                const running = !!(w && w.open)
                return (
                  <button
                    key={id}
                    type="button"
                    className={`pos-dk${running ? ' is-run' : ''}${frontId === id ? ' is-front' : ''}`}
                    onClick={() => toggleDock(id)}
                    aria-label={`${WINDOW_APPS[id].label}${running ? (w.min ? ' (minimized, click to restore)' : ' (running)') : ''}`}
                    aria-pressed={frontId === id}
                    title={WINDOW_APPS[id].label}
                  >
                    {GLYPHS[id]}
                  </button>
                )
              })}
            </div>
            <span className="pos-hint">
              <span className="pos-hint-fine">double-click an icon to open</span>
              <span className="pos-hint-touch">tap an icon to open</span>
            </span>
          </div>
        </div>

        <div className="pos-chin" aria-hidden="true">
          <span>PRESORA · MODEL P-01</span>
          <i className="pos-vents" />
          <span className="pos-led">power</span>
        </div>
      </div>
    </Section>
  )
}
