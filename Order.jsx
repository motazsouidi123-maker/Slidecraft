import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Card, Field, Section } from './ui.jsx'
import { supabase, WA } from './supabase.js'
import { calcPrice, formatDZD } from './pricing.js'
import { SERVICES } from './Services.jsx'

const LANGUAGES = ['Arabic', 'English', 'French', 'Spanish', 'Italian', 'German', 'Portuguese', 'Other']
const TYPES = [...SERVICES.map((s) => s.title), 'Other']
const MAX_FILE_MB = 10

export default function Order() {
  const [params] = useSearchParams()
  const initialSlides = params.get('slides') || '10'

  const [form, setForm] = useState({
    name: '',
    whatsapp: '',
    topic: '',
    slides: initialSlides,
    language: 'Arabic',
    type: TYPES[0],
    deadline: '',
    instructions: '',
  })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [waUrl, setWaUrl] = useState('')
  const [done, setDone] = useState(false)

  const price = calcPrice(form.slides)
  const today = new Date().toISOString().slice(0, 10)

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  function validate() {
    if (form.name.trim().length < 2) return 'Please enter your name.'
    if (!/^\+?[0-9\s-]{8,20}$/.test(form.whatsapp.trim())) return 'Please enter a valid WhatsApp number.'
    if (form.topic.trim().length < 2) return 'Please enter the topic of your presentation.'
    const slides = Number(form.slides)
    if (!Number.isInteger(slides) || slides < 1) return 'Number of slides must be a whole number of at least 1.'
    if (file && file.size > MAX_FILE_MB * 1024 * 1024) return `File is too large. Maximum size is ${MAX_FILE_MB} MB.`
    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const problem = validate()
    if (problem) {
      setError(problem)
      return
    }

    setLoading(true)
    try {
      let fileUrl = null

      if (file) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`
        const { error: upErr } = await supabase.storage.from('order-files').upload(path, file)
        if (upErr) throw new Error('File upload failed: ' + upErr.message)
        fileUrl = supabase.storage.from('order-files').getPublicUrl(path).data.publicUrl
      }

      const slides = Number(form.slides)

      const { error: insErr } = await supabase.from('orders').insert([
        {
          name: form.name.trim(),
          whatsapp: form.whatsapp.trim(),
          topic: form.topic.trim(),
          slides,
          language: form.language,
          type: form.type,
          deadline: form.deadline || null,
          instructions: form.instructions.trim() || null,
          file_url: fileUrl,
          status: 'pending',
        },
      ])
      if (insErr) throw new Error('Could not save your order: ' + insErr.message)

      const lines = [
        'New order — PRESORA',
        `Name: ${form.name.trim()}`,
        `Topic: ${form.topic.trim()}`,
        `Slides: ${slides}`,
        `Type: ${form.type}`,
        `Language: ${form.language}`,
        `Deadline: ${form.deadline || 'Not specified'}`,
        `Price: ${formatDZD(calcPrice(slides))}`,
      ]
      if (form.instructions.trim()) lines.push(`Notes: ${form.instructions.trim()}`)
      if (fileUrl) lines.push(`File: ${fileUrl}`)

      const url = WA ? `https://wa.me/${WA}?text=${encodeURIComponent(lines.join('\n'))}` : ''
      setWaUrl(url)
      setDone(true)
      if (url) window.open(url, '_blank', 'noopener')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setForm({
      name: '',
      whatsapp: '',
      topic: '',
      slides: '10',
      language: 'Arabic',
      type: TYPES[0],
      deadline: '',
      instructions: '',
    })
    setFile(null)
    setWaUrl('')
    setDone(false)
    setError('')
  }

  if (done) {
    return (
      <Section eyebrow="Order" title="Your order was received">
        <Card>
          <div className="success-box" style={{ marginBottom: 20 }}>
            Thank you. Your order has been saved. Send the prefilled message on WhatsApp to confirm it with us.
          </div>
          <div className="hero-actions">
            {waUrl && (
              <Button href={waUrl} target="_blank" rel="noreferrer">
                Open WhatsApp
              </Button>
            )}
            <Button variant="ghost" onClick={reset}>
              Place another order
            </Button>
          </div>
        </Card>
      </Section>
    )
  }

  return (
    <Section
      eyebrow="Order"
      title="Order your presentation"
      intro="Fill in the details below. 500 DZD for every 5 slides."
    >
      <Card>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <Field label="Full name">
              <input value={form.name} onChange={set('name')} autoComplete="name" />
            </Field>
            <Field label="WhatsApp number" hint="Include the country code, e.g. +213...">
              <input
                value={form.whatsapp}
                onChange={set('whatsapp')}
                inputMode="tel"
                autoComplete="tel"
              />
            </Field>
            <Field label="Presentation topic" className="full">
              <input value={form.topic} onChange={set('topic')} />
            </Field>
            <Field label="Number of slides">
              <input
                type="number"
                inputMode="numeric"
                min="1"
                value={form.slides}
                onChange={set('slides')}
              />
            </Field>
            <Field label="Presentation language">
              <select value={form.language} onChange={set('language')}>
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Presentation type">
              <select value={form.type} onChange={set('type')}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Deadline (optional)">
              <input type="date" min={today} value={form.deadline} onChange={set('deadline')} />
            </Field>
            <Field label="Extra instructions (optional)" className="full">
              <textarea value={form.instructions} onChange={set('instructions')} />
            </Field>
            <Field
              label="Attach a file (optional)"
              hint={`Maximum ${MAX_FILE_MB} MB.`}
              className="full"
            >
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </Field>

            <div className="summary full">
              <span>Estimated price</span>
              <strong>{formatDZD(price)}</strong>
            </div>

            {error && <div className="error-box full">{error}</div>}

            <div className="full">
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Submit order'}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </Section>
  )
}
