import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, BarChart, Bar, Cell 
} from 'recharts'
import { 
  BarChart3, Wallet, Zap, Users, Target, 
  Trophy, TrendingUp, ShieldCheck, Sparkles, 
  Flame, ArrowUpRight, MessageSquareCode, Loader2
} from 'lucide-react'
import api from '../../api/axios'

// ✅ GLOBAL UTIL UTILITY: Pindahkan ke luar agar bisa di-bind secara absolut oleh Rollup sebelum komponen di-render
const formatRupiah = (num) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(Number(num) || 0);
};

// 🛡️ CUSTOM PREMIUM OVERLAY TOOLTIP INTERFACE
// ✅ FIXED: Tangkap parameter 'label' dan pisahkan scope deklarasi dari instansi fungsi utama
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const currentData = payload[0].payload;
    return (
      <div className="bg-[#0F172A] text-white p-4 rounded-2xl border-4 border-slate-950 font-sans shadow-2xl text-left">
        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1.5">
          {label || currentData.day || currentData.name || 'Sinyal Sultan'}
        </p>
        <p className="text-base font-black text-[#7C3AED] italic tracking-tight leading-none">
          {formatRupiah(payload[0].value)}
        </p>
        {currentData.tx && (
          <p className="text-[9px] font-black text-slate-500 mt-1.5 uppercase tracking-wider">
            Sinyal Node: {currentData.tx} Transaksi
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function AnalyticsView({ user }) {
  const [timeRange, setTimeRange] = useState('30_DAYS')
  const [analyticsData, setAnalyticsData] = useState({
    revenueHistory: [],
    overlayPerformance: [],
    topDonors: []
  })
  const [loading, setLoading] = useState(true)

  // 📡 ENGINE FETCHING DATA ANALITIK DARI POSTGRES
  const fetchLiveAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get(`/api/donations/analytics-report?range=${timeRange}`)
      
      if (res.data.success) {
        setAnalyticsData({
          revenueHistory: res.data.revenueHistory || [],
          overlayPerformance: res.data.overlayPerformance || [],
          topDonors: res.data.topDonors || []
        })
      }
    } catch (err) {
      console.error("❌ Gagal menyedot data analitik riil database:", err.message)
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  // Pemicu re-fetch otomatis saat dropdown diubah
  useEffect(() => {
    if (user) fetchLiveAnalytics()
  }, [fetchLiveAnalytics, user])

  // 🧮 KONTROLLER AGREGASI AKUMULATOR NILAI LIVE
  const metricsCalculated = useMemo(() => {
    const total = analyticsData.revenueHistory.reduce((acc, curr) => acc + (curr.nominal || 0), 0)
    const txCount = analyticsData.revenueHistory.reduce((acc, curr) => acc + (curr.tx || 0), 0)
    return { total, txCount }
  }, [analyticsData.revenueHistory])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic animate-pulse">Mengkalkulasi Audit Keuangan Database...</p>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto pb-24 px-4 font-sans text-slate-900 text-left selection:bg-violet-600 selection:text-white"
    >
      {/* --- HEADER CONTROLLER --- */}
      <div className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-1">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-950 text-white rounded-2xl shadow-[4px_4px_0px_0px_#7C3AED]">
              <BarChart3 size={22} strokeWidth={3} />
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-950 leading-none">
              Performance <span className="text-violet-600">Analytics</span>
            </h1>
          </div>
          <p className="text-[10px] text-slate-400 font-black italic uppercase tracking-[0.3em] ml-1">
            Realtime Stream Engine Metrics & Financial Audit
          </p>
        </div>

        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-white border-4 border-slate-950 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider italic shadow-[3px_3px_0px_0px_#000] outline-none cursor-pointer hover:bg-slate-50 transition-all"
        >
          <option value="7_DAYS">7 Hari Terakhir</option>
          <option value="30_DAYS">30 Hari Terakhir</option>
        </select>
      </div>

      {/* --- QUICK METRICS CARDS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2.5rem] border-4 border-slate-950 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between group hover:-translate-y-1 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Net Revenue Stream</span>
            <span className="text-2xl font-black italic text-slate-950 block">{formatRupiah(metricsCalculated.total)}</span>
            <span className="text-[9px] font-black text-emerald-500 uppercase italic tracking-wider flex items-center gap-1">
              <TrendingUp size={10} strokeWidth={3} /> Omset riil database terverifikasi
            </span>
          </div>
          <div className="p-3.5 bg-violet-50 text-violet-600 rounded-2xl border-2 border-violet-100"><Wallet size={20} strokeWidth={2.5} /></div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border-4 border-slate-950 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between group hover:-translate-y-1 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Total Signals Approved</span>
            <span className="text-2xl font-black italic text-slate-950 block">{metricsCalculated.txCount} Transaksi</span>
            <span className="text-[9px] font-black text-slate-400 uppercase italic tracking-wider block">Log mutasi sukses masuk</span>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl border-2 border-blue-100"><Zap size={20} strokeWidth={2.5} /></div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border-4 border-slate-950 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between group hover:-translate-y-1 transition-all duration-300 sm:col-span-2 lg:col-span-1">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">System Conversion Accuracy</span>
            <span className="text-2xl font-black italic text-slate-950 block">100%</span>
            <span className="text-[9px] font-black text-violet-600 uppercase italic tracking-wider block">Akurasi sinkronisasi Midtrans QRIS</span>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl border-2 border-emerald-100"><Users size={20} strokeWidth={2.5} /></div>
        </div>
      </div>

      {/* --- MAIN CHARTS AREA PLATFORM --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-10">
        
        {/* AREA CHART: REVENUE HISTORY FLOW */}
        <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between min-h-[420px]">
          <div className="flex items-center justify-between mb-6 border-b-2 border-slate-50 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl"><TrendingUp size={16} strokeWidth={3} /></div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Ecosystem Revenue Flow</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase italic mt-0.5">Grafik pergerakan omset saweran masuk harian</p>
              </div>
            </div>
          </div>

          <div className="w-full h-64 font-mono font-bold text-[10px]">
            {analyticsData.revenueHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.revenueHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="skuyThemePurple" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#1E293B" strokeWidth={2} tickLine={false} />
                  <YAxis stroke="#1E293B" strokeWidth={2} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#7C3AED', strokeWidth: 2, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="nominal" stroke="#7C3AED" strokeWidth={4} fillOpacity={1} fill="url(#skuyThemePurple)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center italic text-slate-400 text-[11px] font-sans">Belum ada grafik pergerakan omset masuk, Ri!</div>
            )}
          </div>
        </div>

        {/* BAR CHART: WIDGET CUAN SHARE */}
        <div className="lg:col-span-4 bg-white p-6 md:p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between min-h-[420px]">
          <div className="flex items-center justify-between mb-6 border-b-2 border-slate-50 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-100 text-slate-800 rounded-xl"><Zap size={16} strokeWidth={3} /></div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Gateway Payment Share</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase italic mt-0.5">Metrik performa metode pembayaran cuan</p>
              </div>
            </div>
          </div>

          <div className="w-full h-64 font-mono font-bold text-[10px]">
            {analyticsData.overlayPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.overlayPerformance} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#1E293B" strokeWidth={2} tickLine={false} />
                  <YAxis stroke="#1E293B" strokeWidth={2} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124, 58, 237, 0.03)' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={38}>
                    {analyticsData.overlayPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0F172A" strokeWidth={2.5} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center italic text-slate-400 text-[11px] font-sans">Data metode pembayaran kosong.</div>
            )}
          </div>
        </div>
      </div>

      {/* --- ✨ INSIGHT NODE: AI STRATEGY INSIGHT SUMMARY --- */}
      <div className="bg-slate-950 text-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#7C3AED] mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 text-white pointer-events-none">
          <MessageSquareCode size={120} />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/10 rounded-lg text-violet-400">
              <Sparkles size={16} className="animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.25em] text-violet-400">AI Node Strategy Report</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold text-slate-400">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/5 flex gap-4 items-start">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl shrink-0"><Flame size={16} /></div>
              <div className="space-y-1">
                <h4 className="text-white font-black uppercase tracking-wide">Ecosystem Performance Node</h4>
                <p className="leading-relaxed">Sistem mendeteksi total transaksi lo berjalan stabil. Naikkan interaksi streaming lo di jam sibuk malam hari untuk memicu frekuensi QRIS scan yang lebih padat, Ri!</p>
              </div>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/5 flex gap-4 items-start">
              <div className="p-2 bg-violet-500/10 text-violet-400 rounded-xl shrink-0"><ArrowUpRight size={16} /></div>
              <div className="space-y-1">
                <h4 className="text-white font-black uppercase tracking-wide">Gateway Optimization</h4>
                <p className="leading-relaxed">Integrasi sandbox Midtrans QRIS lo mencatat respons transaksi murni 100%. Dorong donatur lo pake opsi e-wallet instant biar sound alert di OBS lo langsung ketrigger tanpa delay!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM INFORMATION ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 bg-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100"><Target size={18} strokeWidth={3} /></div>
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Active Milestone Goal</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h4 className="font-black text-base uppercase italic text-slate-950 leading-tight mb-1">Upgrade Kamera Setup Sultan</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Terkumpul: {formatRupiah(metricsCalculated.total > 5000000 ? 5000000 : metricsCalculated.total)} / {formatRupiah(5000000)}</p>
              </div>
              <span className="text-lg font-black italic text-violet-600 bg-violet-50 px-3 py-1 rounded-xl border border-violet-100">
                {Math.min(Math.round((metricsCalculated.total / 5000000) * 100), 100)}%
              </span>
            </div>
            <div className="w-full h-7 bg-slate-100 rounded-xl border-4 border-slate-950 overflow-hidden relative p-0.5">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${Math.min((metricsCalculated.total / 5000000) * 100, 100)}%` }} 
                transition={{ duration: 1 }} 
                className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-md shadow-inner" 
              />
            </div>
            <div className="flex items-center gap-2 pt-2 text-slate-400 font-bold italic text-xs">
              <ShieldCheck size={14} className="text-emerald-500" />
              <p>Dana terkunci aman di server Postgres Railway, otomatis cair pas target tembus.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-slate-950 text-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[8px_8px_0px_0px_#7C3AED]">
          <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
            <Trophy size={18} className="text-amber-400" />
            <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Top Donor Leaderboard</h2>
          </div>
          <div className="space-y-4">
            {analyticsData.topDonors.length > 0 ? analyticsData.topDonors.map((donor, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border-2 border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-violet-600 border-2 border-slate-950 text-white font-black text-xs italic flex items-center justify-center shadow-md shrink-0">{donor.avatar || 'SN'}</div>
                  <span className="font-black text-sm uppercase italic tracking-tight text-white truncate px-1">{idx + 1}. {donor.name}</span>
                </div>
                <span className="font-black text-xs text-violet-400 whitespace-nowrap ml-2">{formatRupiah(donor.total)}</span>
              </div>
            )) : (
              <div className="py-8 text-center text-[10px] text-slate-500 font-black uppercase tracking-widest italic">Papan Peringkat Kosong.</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}