import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
export const WA = (import.meta.env.VITE_WHATSAPP || '').replace(/\D/g, '')
export const MAIL = import.meta.env.VITE_EMAIL || ''
