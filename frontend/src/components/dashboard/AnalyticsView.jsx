import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, BarChart, Bar, Cell 
} from 'recharts'
import { 
  BarChart3, Wallet, Zap, Users, Target, 
  Trophy, TrendingUp, ShieldCheck, Sparkles, 
  Flame, ArrowUpRight, MessageSquareCode
} from 'lucide-react'

export default function AnalyticsView({ user }) {
  const [timeRange, setTimeRange] = useState('30_DAYS')

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    )
  }

  // 📡 METRIK DATA WAKTU: LOG DATA DONASI MASUK SEMINGGU TERAKHIR
  const revenueHistory = [
    { day: 'Sen', nominal: 150000, tx: 3 },
    { day: 'Sel', nominal: 450000, tx: 8 },
    { day: 'Rab', nominal: 300000, tx: 5 },
    { day: 'Kam', nominal: 850000, tx: 12 },
    { day: 'Jum', nominal: 600000, tx: 9 },
    { day: 'Sab', nominal: 1200000, tx: 18 },
    { day: 'Min', nominal: 950000, tx: 14 },
  ]

  // 🎮 THEME COLOR LOCK: Mengikat warna pangkalan grafik dengan identitas Skuy.GG
  const overlayPerformance = [
    { name: 'Tip Alert', value: 1200000, color: '#7C3AED' }, // Skuy Violet
    { name: 'MediaShare', value: 650000, color: '#EF4444' }, // Neon Red
    { name: 'Milestone', value: 450000, color: '#F59E0B' },  // Amber Sultan
    { name: 'Leaderboard', value: 150000, color: '#10B981' }, // Emerald Stable
  ]

  const totalEarnings = revenueHistory.reduce((acc, curr) => acc + curr.nominal, 0)
  const totalTransactions = revenueHistory.reduce((acc, curr) => acc + curr.tx, 0)

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  // 🛡️ CUSTOM PREMIUM OVERLAY TOOLTIP INTERFACE
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0F172A] text-white p-4 rounded-2xl border-4 border-slate-950 font-sans shadow-2xl text-left">
          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1.5">{payload[0].payload.day || payload[0].payload.name}</p>
          <p className="text-base font-black text-[#7C3AED] italic tracking-tight leading-none">{formatRupiah(payload[0].value)}</p>
          {payload[0].payload.tx && <p className="text-[9px] font-black text-slate-500 mt-1.5 uppercase tracking-wider">Sinyal Node: {payload[0].payload.tx} Transaksi</p>}
        </div>
      );
    }
    return null;
  };

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
            <span className="text-2xl font-black italic text-slate-950 block">{formatRupiah(totalEarnings)}</span>
            <span className="text-[9px] font-black text-emerald-500 uppercase italic tracking-wider flex items-center gap-1">
              <TrendingUp size={10} strokeWidth={3} /> +18.5% dari minggu lalu
            </span>
          </div>
          <div className="p-3.5 bg-violet-50 text-violet-600 rounded-2xl border-2 border-violet-100"><Wallet size={20} strokeWidth={2.5} /></div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border-4 border-slate-950 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between group hover:-translate-y-1 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Total Signals Approved</span>
            <span className="text-2xl font-black italic text-slate-950 block">{totalTransactions} Transaksi</span>
            <span className="text-[9px] font-black text-slate-400 uppercase italic tracking-wider block">Verifikasi database stabil</span>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl border-2 border-blue-100"><Zap size={20} strokeWidth={2.5} /></div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border-4 border-slate-950 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between group hover:-translate-y-1 transition-all duration-300 sm:col-span-2 lg:col-span-1">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Conversion Interaction Rate</span>
            <span className="text-2xl font-black italic text-slate-950 block">12.4%</span>
            <span className="text-[9px] font-black text-violet-600 uppercase italic tracking-wider block">Akurasi deteksi widget overlay</span>
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
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          </div>
        </div>

        {/* BAR CHART: WIDGET CUAN SHARE */}
        <div className="lg:col-span-4 bg-white p-6 md:p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between min-h-[420px]">
          <div className="flex items-center justify-between mb-6 border-b-2 border-slate-50 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-100 text-slate-800 rounded-xl"><Zap size={16} strokeWidth={3} /></div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Widget Cuan Share</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase italic mt-0.5">Metrik performa sumber pendapatan widget</p>
              </div>
            </div>
          </div>

          <div className="w-full h-64 font-mono font-bold text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overlayPerformance} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#1E293B" strokeWidth={2} tickLine={false} />
                <YAxis stroke="#1E293B" strokeWidth={2} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124, 58, 237, 0.03)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={38}>
                  {overlayPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0F172A" strokeWidth={2.5} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- ✨ INSIGHT NODE: AI STRATEGY INSIGHT SUMMARY (YANG BIKIN USER TERKAGUM-KAGUM) --- */}
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
                <h4 className="text-white font-black uppercase tracking-wide">Prime Time Hotspot</h4>
                <p className="leading-relaxed">Grafik lo mendeteksi adanya lonjakan aktivitas donasi tertinggi di hari <span className="text-amber-400 italic">Sabtu Malam</span>. Maksimalkan durasi live streaming lo di jam tersebut untuk interaksi omset puncak, Ri!</p>
              </div>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/5 flex gap-4 items-start">
              <div className="p-2 bg-violet-500/10 text-violet-400 rounded-xl shrink-0"><ArrowUpRight size={16} /></div>
              <div className="space-y-1">
                <h4 className="text-white font-black uppercase tracking-wide">Widget Optimization</h4>
                <p className="leading-relaxed"><span className="text-violet-400 italic">Tip Alert</span> menyumbang kontribusi terbesar sebanyak 49% dari total cuan. Coba ganti sound effect alert lo dengan variasi sound meme premium baru biar donatur makin ketagihan sawer!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM INFORMATION ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 bg-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100"><Target size={18} strokeWidth={3} /></div>
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Active Milestone Goal</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h4 className="font-black text-base uppercase italic text-slate-950 leading-tight mb-1">Upgrade Kamera Setup Sultan</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Terkumpul: {formatRupiah(2450000)} / {formatRupiah(5000000)}</p>
              </div>
              <span className="text-lg font-black italic text-violet-600 bg-violet-50 px-3 py-1 rounded-xl border border-violet-100">49%</span>
            </div>
            <div className="w-full h-7 bg-slate-100 rounded-xl border-4 border-slate-950 overflow-hidden relative p-0.5">
              <motion.div initial={{ width: 0 }} animate={{ width: `49%` }} transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-md shadow-inner" />
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
            {[
              { name: 'Sultan Gibran', total: 1200000, avatar: 'SG' },
              { name: 'Wibu Karawang', total: 750000, avatar: 'WK' },
              { name: 'Anonim Elit', total: 500000, avatar: 'AE' }
            ].map((donor, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border-2 border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-violet-600 border-2 border-slate-950 text-white font-black text-xs italic flex items-center justify-center shadow-md shrink-0">{donor.avatar}</div>
                  <span className="font-black text-sm uppercase italic tracking-tight text-white truncate px-1">{idx + 1}. {donor.name}</span>
                </div>
                <span className="font-black text-xs text-violet-400 whitespace-nowrap ml-2">{formatRupiah(donor.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}