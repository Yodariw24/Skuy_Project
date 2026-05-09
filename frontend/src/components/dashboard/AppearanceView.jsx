import { useState, useEffect } from 'react'
import api from '../../api/axios' 
import { Palette, Check, Layout, CheckCircle2, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const THEMES = [
  { id: 'violet', name: 'Royal Purple', class: 'bg-violet-600', shadow: 'shadow-violet-200', border: 'border-violet-700' },
  { id: 'emerald', name: 'Emerald Sea', class: 'bg-emerald-500', shadow: 'shadow-emerald-200', border: 'border-emerald-700' },
  { id: 'rose', name: 'Rose Pink', class: 'bg-rose-500', shadow: 'shadow-rose-200', border: 'border-rose-700' },
  { id: 'amber', name: 'Golden Amber', class: 'bg-amber-500', shadow: 'shadow-amber-200', border: 'border-amber-700' },
  { id: 'sky', name: 'Ocean Sky', class: 'bg-sky-500', shadow: 'shadow-sky-200', border: 'border-sky-700' },
  { id: 'slate', name: 'Midnight', class: 'bg-slate-900', shadow: 'shadow-slate-300', border: 'border-slate-950' },
]

export default function AppearanceView({ user, setUser }) {
  const [selectedTheme, setSelectedTheme] = useState(user?.theme_color || 'violet')
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (user?.theme_color) {
      setSelectedTheme(user.theme_color)
    }
  }, [user])

  const handleSaveTheme = async (themeId) => {
    if (themeId === selectedTheme) return; 

    setLoading(true)
    try {
      // ✅ SINKRONISASI RAILWAY
      const res = await api.put('/api/user/update-theme', {
        theme_color: themeId
      });

      if (res.data && res.data.success) {
        setSelectedTheme(themeId)
        const updatedUser = { ...user, theme_color: themeId }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
      }
    } catch (err) {
      console.error("Gagal update tema:", err.message)
    } finally {
      setLoading(false)
    }
  }

  const currentThemeData = THEMES.find(t => t.id === selectedTheme) || THEMES[0];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto pb-20 text-left px-2">
      
      {/* --- TOAST NOTIFICATION --- */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 md:left-auto md:right-10 md:translate-x-0 z-[100] bg-slate-950 text-white px-8 py-5 rounded-[2rem] border-4 border-emerald-500 shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] flex items-center gap-4"
          >
            <CheckCircle2 className="text-emerald-400" size={24} strokeWidth={3} />
            <p className="text-[11px] font-black uppercase italic tracking-[0.2em]">Visual Core Synchronized! ✨</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HEADER --- */}
      <div className="mb-14 px-2">
        <div className="flex items-center gap-3 mb-4">
            <Zap className="text-violet-600 animate-pulse" size={20} fill="currentColor" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Style Protocol v2.3</p>
        </div>
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-slate-950 leading-none">
          Brand <span className="text-violet-600">Appearance</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT: THEME PICKER */}
        <div className="lg:col-span-7 bg-white p-8 md:p-12 rounded-[3.5rem] border-4 border-slate-950 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="flex items-center gap-4 mb-12 relative z-10">
            <div className="p-3 bg-slate-950 text-white rounded-2xl shadow-xl">
              <Palette size={24} strokeWidth={2.5} />
            </div>
            <div>
               <h2 className="text-lg font-black text-slate-950 uppercase tracking-tight italic">Visual Core Selection</h2>
               <p className="text-[10px] text-slate-400 font-bold uppercase italic tracking-widest">Update brand aura secara real-time</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 relative z-10">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleSaveTheme(theme.id)}
                disabled={loading}
                className={`relative p-6 rounded-[2.5rem] border-4 transition-all flex flex-col items-center gap-4 group ${
                  selectedTheme === theme.id 
                  ? 'border-slate-950 bg-slate-50 shadow-[6px_6px_0px_0px_#7C3AED] scale-105' 
                  : 'border-slate-100 bg-white hover:border-slate-200 active:scale-95'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl ${theme.class} border-4 border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-6 transition-all duration-500`} />
                <span className={`text-[10px] font-black uppercase italic tracking-tight ${selectedTheme === theme.id ? 'text-slate-950' : 'text-slate-400'}`}>
                  {theme.name}
                </span>
                
                {selectedTheme === theme.id && (
                  <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 border-4 border-slate-950 shadow-sm">
                    <Check size={14} strokeWidth={4} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: LIVE PREVIEW MOCKUP */}
        <div className="lg:col-span-5 space-y-8">
            <div className="bg-[#0F0F1A] p-12 rounded-[4rem] text-white relative overflow-hidden flex flex-col items-center justify-center min-h-[500px] shadow-[12px_12px_0px_0px_#E2E8F0] border-4 border-slate-950">
              {/* Animated Glow Background */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3] 
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className={`absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full ${currentThemeData.class} opacity-30`} 
              />
              
              <div className="text-center mb-10 relative z-10">
                 <Layout className="text-white/10 mx-auto mb-4" size={48} />
                 <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Cloud Preview</h3>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Identity Node Protocol</p>
              </div>
              
              {/* Mini Website Mockup - SULTAN STYLE */}
              <motion.div 
                layout
                className="w-full max-w-[240px] bg-white rounded-[3rem] p-6 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.3)] relative z-10 border-4 border-slate-950"
              >
                <div className="w-16 h-16 rounded-[1.8rem] bg-slate-100 mx-auto mb-6 border-4 border-slate-950 overflow-hidden shadow-[4px_4px_0px_0px_#ddd]">
                   <img 
                    src={user?.profile_picture ? (user.profile_picture.startsWith('http') ? user.profile_picture : `${import.meta.env.VITE_API_URL || 'https://skuyproject-production.up.railway.app'}/uploads/${user.profile_picture}`) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}` }}
                   />
                </div>
                <div className="h-3 w-24 bg-slate-950 rounded-full mx-auto mb-3" />
                <div className="h-2 w-16 bg-slate-200 rounded-full mx-auto mb-8" />
                
                <div className="space-y-3">
                    <motion.div 
                      animate={{ backgroundColor: currentThemeData.id === 'slate' ? '#0f172a' : '' }}
                      className={`h-12 w-full rounded-2xl border-4 border-slate-950 transition-all duration-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${currentThemeData.class}`} 
                    />
                    <div className="h-8 w-full rounded-xl bg-slate-50 border-2 border-slate-200" />
                </div>
              </motion.div>
            </div>

            {/* SYNC STATUS */}
            <AnimatePresence>
                {loading && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-4 bg-slate-950 py-5 rounded-[2rem] border-4 border-slate-950 shadow-[6px_6px_0px_0px_#7C3AED]"
                    >
                        <div className="w-5 h-5 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[11px] font-black text-white uppercase italic tracking-widest">
                            Injecting Style to Railway...
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  )
}