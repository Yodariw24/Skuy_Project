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
        console.error("❌ Gagal sync Explore Hub Node:", err.message);
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
    <div className="min-h-screen bg-[#F8FAFF] pb-32 font-sans text-left selection:bg-violet-600 selection:text-white relative overflow-hidden">
      
      {/* --- HERO HEADER (SILICON VALLEY TYPOGRAPHY STYLE) --- */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-16 relative">
        {/* Ornamen Watermark Kompas Premium */}
        <div className="absolute top-0 right-5 opacity-[0.02] rotate-12 text-slate-950 pointer-events-none hidden lg:block">
          <Compass size={380} />
        </div>
        
        <div className="text-left relative z-10">
          <button 
            onClick={() => navigate('/')}
            className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back To Base
          </button>

          <div className="flex items-center gap-2.5 mb-6">
            <div className="p-2 bg-slate-950 text-violet-400 rounded-xl border border-white/10 shadow-md">
              <Sparkles size={14} className="animate-pulse" fill="currentColor" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-0.5">Discovery Node Network</p>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] mb-8 text-slate-950">
            EXPLORE <br />
            <span className="text-violet-600">CREATOR </span>
            <span className="text-transparent" style={{ WebkitTextStroke: '2px #0f172a' }}>SQUAD</span>
          </h1>
          <p className="text-sm md:text-lg text-slate-400 max-w-xl font-bold italic leading-relaxed">
            Pangkalan kendali penjelajahan. Cari creator favorit lo, cek kasta tiering ops mereka, dan kirim donasi instan murni tanpa delay, Ri!
          </p>
        </div>
      </div>

      {/* --- CONTROL HUB: SEARCH & FILTERS --- */}
      <div className="max-w-7xl mx-auto px-6 mb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Search Bar Neo-Brutalism Premium */}
        <div className="lg:col-span-4 relative group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600 z-10 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Cari Username / Nama Sultan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-4 border-slate-950 p-4 pl-12 rounded-[1.5rem] font-bold text-sm outline-none shadow-[4px_4px_0px_0px_#000] focus:shadow-[6px_6px_0px_0px_#7C3AED] focus:-translate-y-0.5 transition-all placeholder:text-slate-300 italic text-slate-800"
          />
        </div>

        {/* Categories Chips Filter */}
        <div className="lg:col-span-8 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none w-full">
          <button
            onClick={() => setSelectedCategory('Semua')}
            className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-wider italic transition-all whitespace-nowrap border-4 border-slate-950 shadow-[4px_4px_0px_0px_#000] active:translate-y-0.5 active:shadow-none ${
              selectedCategory === 'Semua' ? 'bg-slate-950 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            🌟 Semua Kategori
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}    
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-wider italic transition-all whitespace-nowrap border-4 border-slate-950 shadow-[4px_4px_0px_0px_#000] active:translate-y-0.5 active:shadow-none ${
                selectedCategory === cat.id ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Hash size={12} className="inline mr-0.5" strokeWidth={3} /> {cat.name.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* --- GRID LIST PARA STREAMERS (SQUARE BOX SULTAN CONCEPTS) --- */}
      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="py-40 text-center">
            <div className="w-14 h-14 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse italic">Scanning Network Grid Nodes...</p>
          </div>
        ) : filteredStreamers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredStreamers.map((st, idx) => {
                const finalAvatar = st.profile_picture 
                  ? `${API_BASE}/uploads/${st.profile_picture}`
                  : `https://api.dicebear.com/7.x/avataaars/svg?seed=${st.username}`;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    key={st.id || idx}
                    onClick={() => navigate(`/${st.username}`)}
                    className="w-full aspect-square bg-white border-4 border-slate-950 rounded-[2.5rem] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_#7C3AED] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group flex flex-col justify-between text-center items-center"
                  >
                    {/* Top Section: Round Avatar Live Frame */}
                    <div className="w-20 h-20 rounded-full border-4 border-slate-950 overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-violet-50 flex-shrink-0 transition-transform group-hover:scale-105 duration-300 relative">
                      <img 
                        src={finalAvatar} 
                        alt={st.username} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${st.username}`; }}
                      />
                    </div>

                    {/* Center Section: Metadata */}
                    <div className="w-full min-w-0 my-2">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <h4 className="font-black italic text-base uppercase tracking-tight truncate leading-none group-hover:text-violet-600 transition-colors">
                          {st.display_name || st.full_name || st.username}
                        </h4>
                        {st.category_name && (
                          <span className="text-[7px] font-black uppercase px-2 py-0.5 bg-violet-50 text-violet-600 border border-violet-100 rounded-md shrink-0">
                            {st.category_name}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase truncate">@{st.username}</p>
                    </div>

                    {/* Bottom Section: Action Trigger */}
                    <div className="text-violet-600 text-[10px] font-black uppercase tracking-widest italic flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      INSPECT NODE <ChevronRight size={12} strokeWidth={3} className="transform group-hover:translate-x-0.5 transition-transform" />
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
            className="bg-white rounded-[3rem] border-4 border-slate-950 py-24 text-center max-w-xl mx-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] px-6"
          >
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border-4 border-slate-950 mx-auto mb-6 text-slate-950 shadow-[3px_3px_0px_0px_#000]">
              <Search size={24} strokeWidth={3} />
            </div>
            <p className="text-2xl font-black uppercase italic text-slate-950 mb-2 tracking-tight">No Signals Found</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider max-w-sm mx-auto leading-relaxed">
              Tidak ada sinyal node creator yang terdeteksi cocok dalam pangkalan pencarian lo, Ri.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Explore;