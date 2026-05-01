import { useState } from 'react'
// ✅ GANTI: Gunakan instance api sentral, hapus Supabase client
import api from '../../api/axios' 
import { Palette, Check, Layout, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const THEMES = [
  { id: 'violet', name: 'Royal Purple', class: 'bg-violet-600', shadow: 'shadow-violet-200' },
  { id: 'emerald', name: 'Emerald Sea', class: 'bg-emerald-500', shadow: 'shadow-emerald-200' },
  { id: 'rose', name: 'Rose Pink', class: 'bg-rose-500', shadow: 'shadow-rose-200' },
  { id: 'amber', name: 'Golden Amber', class: 'bg-amber-500', shadow: 'shadow-amber-200' },
  { id: 'sky', name: 'Ocean Sky', class: 'bg-sky-500', shadow: 'shadow-sky-200' },
  { id: 'slate', name: 'Midnight', class: 'bg-slate-900', shadow: 'shadow-slate-300' },
]

export default function AppearanceView({ user, setUser }) {
  const [selectedTheme, setSelectedTheme] = useState(user?.theme_color || 'violet')
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const handleSaveTheme = async (themeId) => {
    if (themeId === selectedTheme) return; 

    setLoading(true)
    try {
      // ✅ PROSES UPDATE KE RAILWAY BACKEND
      const res = await api.put('/user/update-theme', {
        theme_color: themeId
      });

      if (res.data && res.data.success) {
        // Update Local State agar UI berubah seketika
        setSelectedTheme(themeId)
        const updatedUser = { ...user, theme_color: themeId }
        setUser(updatedUser)
        
        // ✅ Simpan ke LocalStorage agar sesi tetap konsisten (Gunakan key 'user' sesuai AuthPage)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        // Trigger Toast Gacor
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
      }
    } catch (err) {
      console.error("Gagal update tema cloud:", err.message)
      alert("Gagal sinkronisasi tema ke pangkalan data Railway ⚠️")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto pb-20 text-left">
      
      {/* --- TOAST NOTIFICATION --- */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed top-10 right-10 z-[100] bg-slate-900 text-white px-6 py-4 rounded-[2rem] shadow-2xl border border-white/10 flex items-center gap-3"
          >
            <div className="bg-emerald-500 p-1.5 rounded-full">
               <CheckCircle2 size={16} strokeWidth={3} />
            </div>
            <p className="text-[10px] font-black uppercase italic tracking-widest">Visual Protocol Applied! ✨</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HEADER --- */}
      <div className="mb-12 px-2">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-950 leading-none mb-4">
          Appearance
        </h1>
        <p className="text-xs text-slate-400 font-bold italic uppercase tracking-widest">Sesuaikan aura visual halaman publik Skuy kamu secara real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT: THEME PICKER */}
        <div className="lg:col-span-7 bg-white p-8 md:p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full -mr-32 -mt-32 blur-[80px] opacity-40 pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-10 relative z-10">
            <div className="p-3 bg-violet-600 text-white rounded-2xl shadow-lg shadow-violet-200">
              <Palette size={20} strokeWidth={3} />
            </div>
            <div>
               <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Visual Core</h2>
               <p className="text-[9px] text-slate-400 font-bold uppercase italic mt-1">Pilih protokol warna untuk identitas brand kamu</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 relative z-10">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleSaveTheme(theme.id)}
                disabled={loading}
                className={`relative p-5 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 group ${
                  selectedTheme === theme.id 
                  ? 'border-violet-600 bg-violet-50/50 shadow-xl shadow-violet-100 scale-105' 
                  : 'border-slate-50 bg-slate-50 hover:border-violet-200 hover:bg-white active:scale-95'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl ${theme.class} ${theme.shadow} shadow-lg group-hover:rotate-12 transition-transform duration-500`} />
                <span className={`text-[10px] font-black uppercase italic tracking-tighter ${selectedTheme === theme.id ? 'text-violet-700' : 'text-slate-500'}`}>
                  {theme.name}
                </span>
                
                {selectedTheme === theme.id && (
                  <div className="absolute top-3 right-3 text-violet-600 bg-white rounded-full p-1 shadow-md border border-violet-100">
                    <Check size={12} strokeWidth={4} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: LIVE PREVIEW MOCKUP */}
        <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-950 p-10 rounded-[3.5rem] text-white relative overflow-hidden flex flex-col items-center justify-center min-h-[450px] shadow-2xl shadow-slate-200 border-4 border-white">
              <div className="absolute top-0 right-0 w-40 h-40 bg-violet-600/30 blur-[100px] rounded-full" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-fuchsia-600/20 blur-[100px] rounded-full" />
              
              <div className="text-center mb-10 relative z-10">
                 <Layout className="text-white/20 mx-auto mb-4" size={40} />
                 <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2">Cloud Preview</h3>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Real-time cloud sync check</p>
              </div>
              
              {/* Mini Website Mockup */}
              <div className="w-full max-w-[220px] bg-white rounded-[2.5rem] p-5 shadow-2xl scale-110 relative z-10 border border-white/20">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 mx-auto mb-4 border border-slate-50 shadow-inner overflow-hidden">
                   <img 
                    src={user?.profile_picture ? (user.profile_picture.startsWith('http') ? user.profile_picture : `${import.meta.env.VITE_API_URL}/uploads/${user.profile_picture}`) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}` }}
                   />
                </div>
                <div className="h-2 w-20 bg-slate-200 rounded-full mx-auto mb-2" />
                <div className="h-1.5 w-12 bg-slate-100 rounded-full mx-auto mb-6" />
                
                <div className="space-y-2">
                    <div className={`h-10 w-full rounded-2xl transition-all duration-700 shadow-lg ${THEMES.find(t => t.id === selectedTheme)?.class}`} />
                    <div className="h-6 w-full rounded-xl bg-slate-50 border border-slate-100" />
                </div>
              </div>
            </div>

            {/* SYNC STATUS */}
            <AnimatePresence>
                {loading && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-3 bg-violet-50 py-4 rounded-2xl border border-violet-100"
                    >
                        <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] font-black text-violet-600 uppercase italic tracking-widest">
                            Syncing Theme to Railway...
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  )
}