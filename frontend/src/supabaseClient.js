import { createClient } from '@supabase/supabase-js'

// Ambil dari environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validasi biar ketahuan kalau env-nya kosong
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERROR: Supabase URL/Key tidak terbaca! Cek file .env atau Vercel Settings.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)