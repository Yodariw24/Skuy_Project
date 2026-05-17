import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Search, Compass, Tv, ChevronRight, Hash, Sparkles, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Explore() {
  const navigate = useNavigate();
  const [streamers, setStreamers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // 📡 RESOLVE API BASE URL UNTUK RENDERING ASSET LIVE DARI STORAGE RAILWAY CLOUD
  const API_BASE = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.split('/api')[0].replace(/\/$/, "")
    : 'https://skuyproject-production.up.railway.app';

  // 📡 BOOTING DATA STREAMER & KATEGORI FROM RAILWAY
  useEffect(() => {
    const fetchExploreData = async () => {
      try {
        setLoading(true);
        // Ambil data kategori untuk menu filter
        const catRes = await api.get('/user/categories');
        if (catRes.data.success) setCategories(catRes.data.data);

        // Ambil list semua streamer aktif (Gunakan endpoint terpadu /user/list)
        const url = selectedCategory === 'Semua' ? '/user/list' : `/user/list?category=${selectedCategory}`;
        const streamRes = await api.get(url);
        
        if (streamRes.data.success) {
          const data = streamRes.data.streamers || streamRes.data.data || [];
          setStreamers(data);
        }
      } catch (err) {
        console.error("⚠️ Gagal sync Explore Hub:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExploreData();
  }, [selectedCategory]);

  // 🔍 FILTER SEARCH ENGINE LOGIC
  const filteredStreamers = streamers.filter(st => 
    st.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFF] pb-32 font-sans text-left selection:bg-violet-600 selection:text-white">
      
      {/* --- HERO HEADER (FAANG CLEAN MINIMALIST STYLE) --- */}
      <div className="bg-white border-b-4 border-slate-950 py-20 px-6 relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        {/* Ornamen Watermark Kompas Premium */}
        <div className="absolute top-[-10%] right-[-5%] opacity-[0.03] rotate-45 text-slate-950 pointer-events-none hidden md:block">
          <Compass size={450} />
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Tombol Back Instan Ke Homepage Lu */}
          <button 
            onClick={() => navigate('/')}
            className="mb-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back To Base
          </button>

          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-1.5 bg-violet-50 rounded-lg text-violet-600 border border-violet-100 shadow-sm">
              <Sparkles size={14} className="animate-pulse" fill="currentColor" />
            </div>
            <p className="text-[10px] font-black uppercase {/api} tracking-[0.3em] text-slate-400 mt-0.5">Discovery Node Network</p>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-6 text-slate-950">
            EXPLORE <span className="text-white bg-violet-600 px-5 py-1.5 inline-block rounded-[1.5rem] border-4 border-slate-950 shadow-[5px_5px_0px_0px_#000] rotate-[-1deg]">CREATORS</span>
          </h1>
          <p className="text-xs md:text-sm font-bold text-slate-400 max-w-xl italic uppercase tracking-wide leading-relaxed">
            Pangkalan pencarian pahlawan streaming. Temukan node kreator favoritmu, pantau pencapaian milestone mereka, dan salurkan dukungan donasi terbaikmu secara langsung, Ri!
          </p>
        </div>
      </div>

      {/* --- CONTROL HUB: SEARCH & FILTERS --- */}
      <div className="max-w-6xl mx-auto px-6 mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Search Bar Neo-Brutalism Premium */}
        <div className="lg:col-span-4 relative group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600 z-10 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Cari Node Username / Nama Sultan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-4 border-slate-950 p-4 pl-12 rounded-[1.5rem] font-bold text-sm outline-none focus:shadow-[5px_5px_0px_0px_#7C3AED] transition-all placeholder:text-slate-300 italic text-slate-800"
          />
        </div>

        {/* Categories Chips Filter */}
        <div className="lg:col-span-8 flex items-center gap-3 overflow-x-auto pb-3 scrollbar-none w-full mask-gradient">
          <button
            onClick={() => setSelectedCategory('Semua')}
            className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider italic transition-all whitespace-nowrap border-4 border-slate-950 shadow-[4px_4px_0px_0px_#000] active:translate-y-0.5 active:shadow-none ${
              selectedCategory === 'Semua' ? 'bg-slate-950 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            🌟 Semua Kategori
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider italic transition-all whitespace-nowrap border-4 border-slate-950 shadow-[4px_4px_0px_0px_#000] active:translate-y-0.5 active:shadow-none ${
                selectedCategory === cat.id ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Hash size={12} className="inline mr-0.5" strokeWidth={3} /> {cat.name.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* --- GRID LIST PARA STREAMERS --- */}
      <div className="max-w-6xl mx-auto px-6 mt-12">
        {loading ? (
          <div className="py-40 text-center">
            <div className="w-14 h-14 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse italic">Scanning Network Grid Nodes...</p>
          </div>
        ) : filteredStreamers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredStreamers.map((st) => {
                // Resolving avatar secara real-time dari server cloud Railway lo, Ri!
                const finalAvatar = st.profile_picture 
                  ? `${API_BASE}/uploads/${st.profile_picture}`
                  : `https://api.dicebear.com/7.x/avataaars/svg?seed=${st.username}`;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    key={st.id}
                    onClick={() => navigate(`/${st.username}`)}
                    className="bg-white border-4 border-slate-950 rounded-[2.5rem] p-7 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_#7C3AED] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group flex flex-col justify-between min-h-[260px]"
                  >
                    <div>
                      {/* Top Section Card: Avatar Frame & Category Badge */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-20 h-20 rounded-[1.75rem] border-4 border-slate-950 overflow-hidden bg-violet-50 shadow-[4px_4px_0px_0px_#000] transition-transform group-hover:scale-105 duration-300 flex-shrink-0">
                          <img 
                            src={finalAvatar} 
                            alt={st.username} 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${st.username}`; }}
                          />
                        </div>
                        {st.category_name && (
                          <span className="text-[8px] font-black uppercase px-3 py-1.5 bg-violet-50 text-violet-600 border-2 border-violet-100 rounded-full tracking-widest italic shadow-sm">
                            🎮 {st.category_name}
                          </span>
                        )}
                      </div>

                      {/* Metadata Streamer */}
                      <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-950 group-hover:text-violet-600 transition-colors leading-none mb-1.5 truncate">
                        {st.display_name || st.full_name || st.username}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mb-4">@{st.username}</p>
                      <p className="text-xs font-bold text-slate-500 line-clamp-2 italic mb-6 leading-relaxed">
                        "{st.bio || "Sultan ini belum menuliskan enkripsi bio deskripsi pada pangkalan profilnya."}"
                      </p>
                    </div>

                    {/* Footer Action Card */}
                    <div className="pt-4 border-t-2 border-slate-100 flex items-center justify-between text-violet-600 font-sans">
                      <span className="text-[10px] font-black uppercase tracking-widest italic flex items-center gap-1.5">
                        <Tv size={14} strokeWidth={2.5} /> INSPECT NODE CHANNEL
                      </span>
                      <ChevronRight size={16} strokeWidth={3} className="transform group-hover:translate-x-1.5 transition-transform duration-300" />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty State Node */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[3rem] border-4 border-slate-950 py-28 text-center max-w-xl mx-auto shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] px-6"
          >
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-slate-200 mx-auto mb-6 text-slate-400">
              <Search size={28} />
            </div>
            <p className="text-2xl font-black uppercase italic text-slate-950 mb-2 tracking-tight">No Signals Found</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider max-w-sm mx-auto leading-relaxed">
              Tidak ada sinyal streamer yang terdeteksi atau cocok dengan kriteria pencarianmu saat ini, Ri.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Explore;