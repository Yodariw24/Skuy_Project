import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { Search, Compass, Tv, User, ChevronRight, Hash, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function Explore() {
  const navigate = useNavigate()
  const [streamers, setStreamers] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // 📡 BOOTING DATA STREAMER & KATEGORI FROM RAILWAY
  useEffect(() => {
    const fetchExploreData = async () => {
      try {
        setLoading(true)
        // Ambil data kategori untuk menu filter
        const catRes = await api.get('/user/categories')
        if (catRes.data.success) setCategories(catRes.data.data)

        // Ambil list semua streamer aktif
        const url = selectedCategory === 'Semua' ? '/user/list' : `/user/list?category=${selectedCategory}`
        const streamRes = await api.get(url)
        if (streamRes.data.success) setStreamers(streamRes.data.streamers || streamRes.data.data)
      } catch (err) {
        console.error("⚠️ Gagal sync Explore Hub:", err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchExploreData()
  }, [selectedCategory])

  // 🔍 FILTER SEARCH ENGINE LOGIC
  const filteredStreamers = streamers.filter(st => 
    st.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#F4F7FF] pb-24 font-sans text-left">
      {/* --- HERO HEADER --- */}
      <div className="bg-violet-600 border-b-4 border-slate-950 py-16 px-6 text-white relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] opacity-10 rotate-12 pointer-events-none">
          <Compass size={400} />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-amber-400 animate-pulse" fill="currentColor" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-violet-200">Discovery Node Network</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-6">
            Explore <span className="text-slate-950 bg-white px-4 py-1 inline-block rounded-2xl border-2 border-slate-950 shadow-[4px_4px_0px_0px_#000] rotate-[-1deg]">Creators</span>
          </h1>
          <p className="text-sm font-bold text-violet-100 max-w-md italic uppercase tracking-wider">
            Temukan streamer favoritmu, salurkan dukungan donasi terbaikmu secara langsung, Ri!
          </p>
        </div>
      </div>

      {/* --- CONTROL HUB: SEARCH & FILTERS --- */}
      <div className="max-w-6xl mx-auto px-4 mt-12 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Search Bar Neo-Brutalism */}
        <div className="md:col-span-4 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 z-10" size={18} />
          <input 
            type="text" 
            placeholder="Cari Username / Nama Streamer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-4 border-slate-950 p-4 pl-12 rounded-2xl font-bold text-sm outline-none focus:shadow-[4px_4px_0px_0px_#7C3AED] transition-all placeholder:text-slate-300 italic"
          />
        </div>

        {/* Categories Chips Filter */}
        <div className="md:col-span-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('Semua')}
            className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-wider italic transition-all whitespace-nowrap border-4 border-slate-950 shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none ${
              selectedCategory === 'Semua' ? 'bg-slate-950 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            🌟 Semua Kategori
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-wider italic transition-all whitespace-nowrap border-4 border-slate-950 shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none ${
                selectedCategory === cat.id ? 'bg-violet-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Hash size={12} className="inline mr-1" /> {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* --- GRID LIST PARA STREAMERS --- */}
      <div className="max-w-6xl mx-auto px-4 mt-12">
        {loading ? (
          <div className="py-32 text-center">
            <div className="w-16 h-16 border-8 border-slate-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Scanning Grid Nodes...</p>
          </div>
        ) : filteredStreamers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredStreamers.map((st) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={st.id}
                  onClick={() => navigate(`/${st.username}`)} // ✅ GAS LANGSUNG KE PAGE PROFILE UTMANYA
                  className="bg-white border-4 border-slate-950 rounded-[2.5rem] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_#7C3AED] hover:translate-y-[-4px] hover:translate-x-[-4px] transition-all cursor-pointer group flex flex-col justify-between min-h-[240px]"
                >
                  <div>
                    {/* Top Section Card: Avatar & Category Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 rounded-2xl border-2 border-slate-950 overflow-hidden bg-violet-100 shadow-[4px_4px_0px_0px_#000]">
                        <img 
                          src={st.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${st.username}`} 
                          alt={st.display_name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {st.category_name && (
                        <span className="text-[9px] font-black uppercase px-3 py-1 bg-violet-50 text-violet-600 border-2 border-violet-100 rounded-full tracking-widest italic">
                          🎮 {st.category_name}
                        </span>
                      )}
                    </div>

                    {/* Metadata Streamer */}
                    <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-950 group-hover:text-violet-600 transition-colors leading-none mb-1">
                      {st.display_name || st.username}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-3">@{st.username}</p>
                    <p className="text-xs font-bold text-slate-600 line-clamp-2 italic mb-4">
                      {st.bio || "Sultan ini belum menuliskan bio deskripsi profilnya."}
                    </p>
                  </div>

                  {/* Footer Action Card */}
                  <div className="pt-4 border-t-2 border-slate-100 flex items-center justify-between text-violet-600">
                    <span className="text-[10px] font-black uppercase tracking-wider italic flex items-center gap-1">
                      <Tv size={14} /> Visit Channel
                    </span>
                    <ChevronRight size={16} strokeWidth={3} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-[3rem] border-4 border-slate-950 py-24 text-center max-w-xl mx-auto shadow-[12px_12px_0px_0px_#f1f5f9]">
            <p className="text-2xl font-black uppercase italic text-slate-400 mb-2">No Signals Found</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tidak ada streamer yang cocok dengan pencarianmu, Ri.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Explore