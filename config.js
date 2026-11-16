export const WHATSAPP = (import.meta.env.VITE_WHATSAPP || '').replace(/\D/g, '')
export const EMAIL = import.meta.env.VITE_EMAIL || ''
export const waLink = (text = '') =>
  WHATSAPP ? `https://wa.me/${WHATSAPP}${text ? `?text=${encodeURIComponent(text)}` : ''}` : ''
export const STATUSES = ['Pending', 'In Progress', 'Completed']
