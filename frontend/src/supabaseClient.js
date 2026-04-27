import { createClient } from '@supabase/supabase-js'

// Ambil dari variabel .env (Vite butuh prefix VITE_)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validasi sederhana biar kamu nggak pusing kalau lupa isi .env
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Waduh Ri! Supabase URL atau Anon Key belum terisi di .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)