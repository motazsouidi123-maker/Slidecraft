import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase, WA } from '../supabase'
import { useI18n } from '../i18n'
import { useOrderDraft } from '../orderDraft'
import { EASE } from '../ui'
import { calcPrice, billedSlides, formatDZD, parseSlides } from '../pricing'
import { Arrow, Field, Reveal, SectionHead, input, trk } from './common'
import { Money, PriceSummary } from './Pricing'

const langs = ['English', 'French', 'Arabic', 'Italian']
const types = ['School', 'University', 'Business', 'Creative']
const MAX_FILE = 10 * 1024 * 1024
const local = msg => Object.assign(new Error(msg), { local: true })
const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
const fmtSize = b => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)
const bad = 'border-paper bg-paper/10'

const Sec = ({ n, title, children }) => (
  <fieldset className="space-y-6 border-t border-steel/25 pt-6 first:border-t-0 first:pt-0">
    <legend className={`mb-6 flex w-full items-center gap-4 text-xs uppercase text-paper ${trk}`}><span dir="ltr" className="font-mono text-steel">0{n}</span>{title}</legend>
    {children}
  </fieldset>
)

export default function Order() {
  const { t } = useI18n()
  const { slides, setSlides } = useOrderDraft()
  const loc = useLocation()
  const [f, setF] = useState({ name: '', whatsapp: '', topic: '', language: 'English', type: types.includes(loc.state?.type) ? loc.state.type : 'School', deadline: '', instructions: '' })
  const [file, setFile] = useState(null)
  const [fileErr, setFileErr] = useState('')
  const [drag, setDrag] = useState(false)
  const [touched, setTouched] = useState({})
  const [tried, setTried] = useState(false)
  const [busy, setBusy] = useState(false)
  const [stage, setStage] = useState('')
  const [err, setErr] = useState('')
  const [done, setDone] = useState(null)

  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }))
  const blur = k => () => setTouched(p => ({ ...p, [k]: true }))
  const today = localToday()
  const digits = f.whatsapp.replace(/\D/g, '')
  const errors = {
    name: f.name.trim().length < 2 && 'v.name',
    whatsapp: !(/^[+\d\s().-]+$/.test(f.whatsapp.trim()) && digits.length >= 8 && digits.length <= 15) && 'v.phone',
    topic: f.topic.trim().length < 2 && 'v.topic',
    slides: parseSlides(slides) === null && 'e.slides',
    deadline: (!f.deadline || f.deadline < today) && 'v.deadline',
  }
  const msg = k => ((touched[k] || tried) && errors[k] ? t(errors[k]) : '')
  const a11y = k => ({ id: `f-${k}`, 'aria-invalid': !!msg(k), 'aria-describedby': msg(k) ? `f-${k}-err` : undefined, onBlur: blur(k) })
  const pct = Math.round(['name', 'whatsapp', 'topic', 'deadline'].filter(k => !errors[k]).length / 4 * 100)

  function pick(files) {
    const x = files && files[0]
    if (!x) return
    if (x.size > MAX_FILE) { setFile(null); setFileErr(t('e.file')); return }
    setFileErr(''); setFile(x)
  }

  async function submit(e) {
    e.preventDefault(); setTried(true)
    if (Object.values(errors).some(Boolean)) {
      setErr(t('v.fix'))
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }
    setBusy(true); setErr(''); setStage('')
    try {
      const n = parseSlides(slides)
      if (n === null) throw local(t('e.slides'))
      let file_url = null
      if (file) {
        if (file.size > MAX_FILE) throw local(t('e.file'))
        setStage('up')
        const path = `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, '_')}`
        const { error } = await supabase.storage.from('order-files').upload(path, file)
        if (error) throw error
        file_url = supabase.storage.from('order-files').getPublicUrl(path).data.publicUrl
      }
      setStage('save')
      const row = { name: f.name.trim(), whatsapp: f.whatsapp.trim(), topic: f.topic.trim(), slides: n, language: f.language, type: f.type, deadline: f.deadline || null, instructions: f.instructions.trim(), file_url }
      const { error } = await supabase.from('orders').insert(row)
      if (error) throw error
      const wa = `*🆕 ${t('wa.title')}*\n\n👤 ${t('wa.name')}: ${row.name}\n📱 ${t('wa.phone')}: ${row.whatsapp}\n📌 ${t('wa.topic')}: ${row.topic}\n🖼️ ${t('wa.slides')}: ${row.slides}\n💰 ${t('wa.price')}: ${formatDZD(calcPrice(row.slides))}\n🌍 ${t('wa.lang')}: ${t(`pl.${row.language}`)}\n🎯 ${t('wa.type')}: ${t(`type.${row.type}`)}\n⏰ ${t('wa.deadline')}: ${row.deadline || t('wa.notset')}\n📝 ${t('wa.instr')}: ${row.instructions || '—'}\n📎 ${t('wa.file')}: ${file_url || t('wa.none')}`
      const url = `https://wa.me/${WA}?text=${encodeURIComponent(wa)}`
      setStage('wa'); setDone({ url })
      window.location.href = url
    } catch (ex) { console.error(ex); setErr(ex.local ? ex.message : t('e.generic')) }
    setBusy(false)
  }

  function reset() {
    setF({ name: '', whatsapp: '', topic: '', language: 'English', type: 'School', deadline: '', instructions: '' })
    setFile(null); setTouched({}); setTried(false); setErr(''); setDone(null); setStage('')
  }

  const n = parseSlides(slides)
  return (
    <section className="px-5 pb-24 pt-36">
      <div className="mx-auto max-w-6xl">
        <SectionHead n="01" k={t('o.k')}>{t('o.h')}</SectionHead>
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="ok" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} role="status"
              className="max-w-2xl border border-steel/25 bg-navy/60 p-8 md:p-12">
              <span aria-hidden="true" className="grid h-12 w-12 place-items-center bg-paper text-2xl text-navy">✓</span>
              <h3 className="font-display mt-6 text-4xl font-semibold">{t('o.ok.t')}</h3>
              <p className="mt-3 text-steel">{t('o.ok.d')}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href={done.url} className={`group inline-flex min-h-12 items-center gap-3 bg-paper px-8 py-4 text-sm font-semibold uppercase text-navy transition hover:bg-steel ${trk}`}>{t('o.ok.btn')}<Arrow /></a>
                <button type="button" onClick={reset} className={`min-h-12 border border-steel/40 px-8 py-4 text-sm font-semibold uppercase text-paper transition hover:border-paper ${trk}`}>{t('o.ok.new')}</button>
              </div>
            </motion.div>
          ) : (
            <Reveal key="form">
              <form onSubmit={submit} noValidate className="grid gap-10 lg:grid-cols-12">
                <div className="space-y-10 border border-steel/25 bg-navy/60 p-6 md:p-10 lg:col-span-8">
                  <Sec n={1} title={t('o.sec.contact')}>
                    <Field id="f-name" t={`${t('o.name')} *`} error={msg('name')}><input {...a11y('name')} autoComplete="name" className={`${input} ${msg('name') ? bad : ''}`} value={f.name} onChange={set('name')} placeholder={t('o.ph.name')} /></Field>
                    <Field id="f-whatsapp" t={`${t('o.phone')} *`} error={msg('whatsapp')}><input {...a11y('whatsapp')} type="tel" inputMode="tel" autoComplete="tel" dir="ltr" className={`${input} ${msg('whatsapp') ? bad : ''}`} value={f.whatsapp} onChange={set('whatsapp')} placeholder={t('o.ph.phone')} /></Field>
                  </Sec>
                  <Sec n={2} title={t('o.sec.project')}>
                    <Field id="f-topic" t={`${t('o.topic')} *`} error={msg('topic')}><input {...a11y('topic')} className={`${input} ${msg('topic') ? bad : ''}`} value={f.topic} onChange={set('topic')} placeholder={t('o.ph.topic')} /></Field>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <Field id="f-slides" t={`${t('o.slides')} *`} error={msg('slides')}><input {...a11y('slides')} type="number" inputMode="numeric" min="1" max="200" step="1" className={`${input} ${msg('slides') ? bad : ''}`} value={slides} onChange={e => setSlides(e.target.value)} /></Field>
                      <Field id="f-language" t={`${t('o.lang')} *`}><select id="f-language" className={input} value={f.language} onChange={set('language')}>{langs.map(x => <option key={x} value={x}>{t(`pl.${x}`)}</option>)}</select></Field>
                      <Field id="f-type" t={`${t('o.type')} *`}><select id="f-type" className={input} value={f.type} onChange={set('type')}>{types.map(x => <option key={x} value={x}>{t(`type.${x}`)}</option>)}</select></Field>
                      <Field id="f-deadline" t={`${t('o.deadline')} *`} error={msg('deadline')}><input {...a11y('deadline')} type="date" min={today} className={`${input} ${msg('deadline') ? bad : ''}`} value={f.deadline} onChange={set('deadline')} /></Field>
                    </div>
                  </Sec>
                  <Sec n={3} title={t('o.sec.extra')}>
                    <Field id="f-instr" t={t('o.instr')}><textarea id="f-instr" rows="4" className={input} value={f.instructions} onChange={set('instructions')} placeholder={t('o.ph.instr')} /></Field>
                    <div>
                      <span className={`mb-2 block text-xs uppercase text-steel ${trk}`}>{t('o.file')}</span>
                      <label onDragOver={e => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files) }}
                        className={`flex min-h-32 cursor-pointer flex-col items-center justify-center gap-1 border border-dashed px-4 py-8 text-center transition focus-within:border-paper hover:border-paper hover:bg-paper/[0.04] ${drag ? 'border-paper bg-paper/[0.08]' : file ? 'border-paper/60' : 'border-steel/40'}`}>
                        {file
                          ? <><span aria-hidden="true" className="grid h-8 w-8 place-items-center bg-paper text-navy">✓</span><span className="break-all text-sm text-paper">{file.name}</span><span className="text-xs text-steel">{t('o.file.size', { s: fmtSize(file.size) })}</span></>
                          : <><span className="text-sm text-paper">{t('o.pick')}</span><span className="text-xs text-steel">{t('o.file.drop')}</span></>}
                        <input id="f-file" type="file" className="sr-only" onChange={e => { pick(e.target.files); e.target.value = '' }} />
                      </label>
                      {file && <button type="button" onClick={() => setFile(null)} className="mt-2 min-h-11 text-sm text-steel underline underline-offset-4 hover:text-paper">{t('o.file.rm')}</button>}
                      {fileErr && <p role="alert" className="mt-2 flex items-start gap-2 text-sm text-paper"><span aria-hidden="true" className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center bg-paper text-[10px] font-bold text-navy">!</span>{fileErr}</p>}
                    </div>
                  </Sec>
                </div>

                <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
                  <div className="border border-steel/25 bg-navy/60 p-6 md:p-8">
                    <p className={`mb-6 text-xs uppercase text-paper ${trk}`}>{t('o.sec.summary')}</p>
                    <PriceSummary slides={slides} />
                    {n !== null && billedSlides(n) !== n && <p className="mt-2 text-xs text-steel">{t('o.charged', { c: billedSlides(n) })}</p>}
                    <dl className="mt-6 space-y-2 border-t border-steel/25 pt-4 text-sm">
                      <div className="flex justify-between gap-4"><dt className="text-steel">{t('o.slides')}</dt><dd dir="ltr">{n ?? '—'}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-steel">{t('o.type')}</dt><dd>{t(`type.${f.type}`)}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-steel">{t('o.lang')}</dt><dd>{t(`pl.${f.language}`)}</dd></div>
                      {n !== null && <div className="flex justify-between gap-4 border-t border-steel/25 pt-2 font-semibold"><dt>{t('o.price')}</dt><dd><Money value={calcPrice(n)} /></dd></div>}
                    </dl>
                    <div className="mt-6"><div className="h-0.5 bg-steel/20"><motion.div className="h-full bg-paper" animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: EASE }} /></div><p className="mt-2 text-xs text-steel">{t('o.prog', { n: pct })}</p></div>
                  </div>
                  <AnimatePresence>
                    {err && <motion.p role="alert" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: [0, -6, 6, 0] }} exit={{ opacity: 0 }} className="border-s-2 border-paper bg-paper/10 p-3 text-sm text-paper">{err}</motion.p>}
                  </AnimatePresence>
                  <button disabled={busy} className={`min-h-14 w-full bg-paper py-4 text-sm font-semibold uppercase text-navy transition hover:bg-steel active:scale-[.99] disabled:opacity-60 ${trk}`}>
                    {busy ? <span className="inline-flex items-center gap-3"><span className="h-4 w-4 animate-spin rounded-full border-2 border-navy/30 border-t-navy" />{stage ? t(`o.stage.${stage}`) : t('o.sending')}</span> : t('o.submit')}
                  </button>
                  <p className="text-center text-xs text-steel">{t('o.note')}</p>
                </aside>
              </form>
            </Reveal>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
