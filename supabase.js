import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://vkyowysvlcsibbbpuknv.supabase.co'

// قيمة بديلة حتى لا تتعطل الصفحة إذا لم يتم ضبط المفتاح في Vercel
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'missing-anon-key'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export const WA = (import.meta.env.VITE_WHATSAPP || '').replace(/\D/g, '')
export const MAIL = import.meta.env.VITE_EMAIL || ''
