import { Button, Card, Section } from './ui.jsx'
import { WA, MAIL } from './supabase.js'

export default function Contact() {
  return (
    <Section
      eyebrow="Contact"
      title="Get in touch"
      intro="Have a question before ordering? Reach us directly."
    >
      <div className="grid grid-2">
        <Card className="contact-card">
          <h3>WhatsApp</h3>
          <p>The fastest way to reach us and to receive your finished presentation.</p>
          {WA ? (
            <Button href={`https://wa.me/${WA}`} target="_blank" rel="noreferrer">
              Chat on WhatsApp
            </Button>
          ) : (
            <p style={{ marginTop: 14, color: 'var(--muted)' }}>WhatsApp is not configured yet.</p>
          )}
        </Card>

        <Card className="contact-card">
          <h3>Email</h3>
          <p>For longer requests, files or business inquiries.</p>
          {MAIL ? (
            <Button href={`mailto:${MAIL}`} variant="ghost">
              {MAIL}
            </Button>
          ) : (
            <p style={{ marginTop: 14, color: 'var(--muted)' }}>Email is not configured yet.</p>
          )}
        </Card>
      </div>
    </Section>
  )
}
