import React, { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';
import { 
  Shield, Users, DollarSign, RefreshCw, Terminal, 
  Search, SlidersHorizontal, ArrowUpRight, ArrowDownLeft, 
  User, Landmark, Layers, Landmark as BankIcon 
} from 'lucide-react';
import Swal from 'sweetalert2';

function SuperAdminDashboard() {
  // --- STATE MANAGEMENT PIPELINE ---
  const [globalStats, setGlobalStats] = useState({ total_users: 0, total_revenue: 0, pending_withdrawals: 0 });
  const [globalLogs, setGlobalLogs] = useState([]);
  const [streamersList, setStreamersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Selector State
  const [selectedStreamerId, setSelectedStreamerId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [streamerDonations, setStreamerDonations] = useState([]);
  const [loadingStreamerData, setLoadingStreamerData] = useState(false);

  // --- CORE ENGINE: FETCH ALL DATA ---
  const initializeHQData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Platform Stats Global (Fee 5%)
      const statsRes = await api.get('/user/admin/platform-stats');
      if (statsRes.data.success) setGlobalStats(statsRes.data.stats);

      // 2. Fetch System Audit Logs JSONB
      const logsRes = await api.get('/donations/super-admin/audit-logs');
      if (logsRes.data.success) setGlobalLogs(logsRes.data.logs);

      // 3. Fetch Master List Seluruh Streamer untuk Dropdown/Selector
      const streamersRes = await api.get('/user/list');
      if (streamersRes.data.success) {
        setStreamersList(streamersRes.data.streamers || []);
      }

    } catch (err) {
      console.error("🔥 HQ Backbone Engine Crash:", err.message);
      Swal.fire("SISTEM ERROR", "Gagal memancing data utama kasta tertinggi, Ri!", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- SUB-ENGINE: TRACK SPECIFIC STREAMER DONATIONS ---
  const fetchSelectedStreamerDonations = async (id) => {
    if (id === 'ALL') {
      setStreamerDonations([]);
      return;
    }
    setLoadingStreamerData(true);
    try {
      const res = await api.get(`/donations/list-internal/${id}`);
      if (res.data.success) {
        setStreamerDonations(res.data.data || []);
      }
    } catch (err) {
      console.error("🔥 Gagal melacak log transaksi internal streamer:", err.message);
    } finally {
      setLoadingStreamerData(false);
    }
  };

  useEffect(() => {
    initializeHQData();
  }, []);

  useEffect(() => {
    fetchSelectedStreamerDonations(selectedStreamerId);
  }, [selectedStreamerId]);

  // --- SEARCH FILTER MEMOIZATION ---
  const filteredStreamers = useMemo(() => {
    return streamersList.filter(s => 
      s.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [streamersList, searchQuery]);

  // --- LIVE AGGREGATOR MATH: HITUNG METRIK DATA STREAMER YANG DIPILIH ---
  const selectedStreamerStats = useMemo(() => {
    if (selectedStreamerId === 'ALL') return null;
    
    // Cari data profil streamer dari main array list
    const profile = streamersList.find(s => parseInt(s.id, 10) === parseInt(selectedStreamerId, 10));
    
    // Akumulasi data donasi sukses milik objek terkait
    const successDonations = streamerDonations.filter(d => d.status?.toUpperCase() === 'SUCCESS');
    const totalGross = successDonations.reduce((acc, curr) => acc + (Number(curr.gross_amount) || 0), 0);
    const totalNetEarnings = successDonations.reduce((acc, curr) => acc + (Number(curr.net_amount) || 0), 0);
    const totalFeePlatform = successDonations.reduce((acc, curr) => acc + (Number(curr.fee_amount) || 0), 0);

    return {
      profile,
      totalGross,
      totalNetEarnings,
      totalFeePlatform,
      count: successDonations.length
    };
  }, [selectedStreamerId, streamersList, streamerDonations]);

  // Currency Formatter Helper
  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-sans">
        <div className="text-center space-y-4">
          <RefreshCw className="w-16 h-16 animate-spin text-violet-500 mx-auto border-4 border-slate-900 p-2 bg-slate-900 rounded-full shadow-[4px_4px_0px_0px_#7C3AED]" />
          <p className="font-black tracking-widest uppercase italic text-sm text-slate-400 animate-pulse">LOADING CORES SAAS METRICS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D1A] text-slate-100 p-4 md:p-10 font-sans text-left selection:bg-violet-600 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* ========================================== */}
        {/* 1. HEADER DASHBOARD ENTERPRISE GOVERNANCE */}
        {/* ========================================== */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between p-8 bg-slate-900 border-4 border-slate-950 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(124,58,237,0.15)] border-t-violet-600 gap-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-slate-800 pointer-events-none opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Shield size={180} />
          </div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="p-4 bg-violet-600 border-4 border-slate-950 rounded-2xl shadow-[4px_4px_0px_0px_#000] text-white rotate-[-2deg]">
              <Shield size={36} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black uppercase tracking-tight italic bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">SKUYGG CENTRAL CONTROL</h1>
                <span className="text-[9px] bg-violet-500/20 text-violet-400 border border-violet-500/30 px-2 py-0.5 rounded-md font-black tracking-widest uppercase">PRO v4.0</span>
              </div>
              <p className="text-xs text-violet-400 font-bold uppercase tracking-wider mt-1">Platform Multi-Tenant Tracker Ecosystem • Owner Mode: ariwirayuda24</p>
            </div>
          </div>
          <button 
            onClick={initializeHQData}
            className="flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-slate-950 font-black text-xs px-8 py-4 border-4 border-slate-950 rounded-2xl shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all uppercase cursor-pointer tracking-wider relative z-10 italic"
          >
            <RefreshCw size={14} strokeWidth={3} /> Synchronize All Nodes
          </button>
        </div>

        {/* ========================================== */}
        {/* 2. STATISTIK METRIK GLOBAL PLATFORM        */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-900 border-4 border-slate-950 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-b-violet-500 flex items-center justify-between group hover:-translate-y-1 transition-transform duration-300">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Operational Users</p>
              <h3 className="text-4xl font-black italic mt-1 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">{globalStats?.total_users || 0} <span className="text-xs text-slate-500 font-bold not-italic">Sultans</span></h3>
            </div>
            <div className="p-4 bg-violet-600/10 rounded-xl border-2 border-slate-950 text-violet-400 shadow-[2px_2px_0px_0px_#000]"><Users size={24} /></div>
          </div>

          <div className="p-6 bg-slate-900 border-4 border-slate-950 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-b-emerald-500 flex items-center justify-between group hover:-translate-y-1 transition-transform duration-300">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Platform Fee Revenue (5%)</p>
              <h3 className="text-4xl font-black italic mt-1 text-emerald-400">
                {formatIDR(globalStats?.total_revenue)}
              </h3>
            </div>
            <div className="p-4 bg-emerald-600/10 rounded-xl border-2 border-slate-950 text-emerald-400 shadow-[2px_2px_0px_0px_#000]"><DollarSign size={24} /></div>
          </div>

          <div className="p-6 bg-slate-900 border-4 border-slate-950 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-b-amber-500 flex items-center justify-between group hover:-translate-y-1 transition-transform duration-300">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Withdrawals Request Queue</p>
              <h3 className="text-4xl font-black italic mt-1 text-amber-400">{globalStats?.pending_withdrawals || 0} <span className="text-xs text-slate-500 font-bold not-italic">Antrean</span></h3>
            </div>
            <div className="p-4 bg-amber-600/10 rounded-xl border-2 border-slate-950 text-amber-400 shadow-[2px_2px_0px_0px_#000]"><Terminal size={24} /></div>
          </div>
        </div>

        {/* ========================================== */}
        {/* 3. CORE ENGINE WORKSPACE: STREAMER TRACKER */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: IDENTITAS SELECTOR PANEL */}
          <div className="lg:col-span-4 bg-slate-900 border-4 border-slate-950 p-6 rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
            <div className="flex items-center gap-2 border-b-2 border-slate-800 pb-4">
              <SlidersHorizontal size={16} className="text-violet-400" />
              <h2 className="text-xs font-black uppercase tracking-wider italic">Streamer Multi-Tenant Filter</h2>
            </div>

            {/* Input Search Streamer */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Cari Username / Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl py-3 pl-11 pr-4 text-xs text-slate-200 focus:outline-none focus:border-violet-500 font-bold placeholder-slate-600"
              />
            </div>

            {/* List Array Item View Selector */}
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar text-left">
              <button
                onClick={() => setSelectedStreamerId('ALL')}
                className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-xs font-black uppercase transition-all flex items-center justify-between cursor-pointer ${
                  selectedStreamerId === 'ALL'
                    ? 'bg-violet-600/10 border-violet-500 text-violet-400 italic shadow-[2px_2px_0px_0px_rgba(124,58,237,0.3)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers size={14} />
                  <span>[Tampilkan Semua Streamer]</span>
                </div>
              </button>

              {filteredStreamers.map((streamer) => (
                <button
                  key={streamer.id}
                  onClick={() => setSelectedStreamerId(streamer.id)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-xs font-black uppercase transition-all flex items-center justify-between cursor-pointer group ${
                    parseInt(selectedStreamerId, 10) === parseInt(streamer.id, 10)
                      ? 'bg-violet-600/10 border-violet-500 text-violet-400 italic shadow-[2px_2px_0px_0px_rgba(124,58,237,0.3)]'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg overflow-hidden border-2 border-slate-950 flex-shrink-0 bg-slate-800">
                      <img 
                        src={streamer.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${streamer.username}`} 
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="truncate text-left">
                      <p className="font-black tracking-tight truncate">{streamer.display_name || streamer.username}</p>
                      <p className="text-[9px] font-bold text-slate-500 lowercase truncate tracking-normal group-hover:text-slate-400">{streamer.email}</p>
                    </div>
                  </div>
                  <ChevronRight size={12} className="opacity-40" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: DETAIL DEEP ANALYTICS TARGET REPORT */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* KONDISI A: JIKA BELUM MEMILIH STREAMER INDIVIDUAL (PERSPEKTIF KOSONG) */}
            {selectedStreamerId === 'ALL' ? (
              <div className="p-12 bg-slate-900 border-4 border-slate-950 rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center space-y-4 border-dashed border-slate-700">
                <div className="w-16 h-16 bg-slate-950 rounded-2xl border-2 border-slate-800 flex items-center justify-center mx-auto text-slate-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <User size={28} />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-wider text-sm italic">Multi-Tenant Node Idle</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-medium">Pilih salah satu identitas nama akun streamer di bilah kiri untuk mengaktifkan pemindaian dalam, grafik total omset bersih, data rekening bank, dan daftar log transaksi rill miliknya, Ri!</p>
                </div>
              </div>
            ) : (
              
              /* KONDISI B: STREAMER TARGET BERHASIL TERKUNCI (ISOLATED REAL-TIME REPORT) */
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                
                {/* SUB CARD 1: TARGET STREAMER METADATA PROFILE & REKENING BANK */}
                <div className="p-6 bg-slate-900 border-4 border-slate-950 rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-slate-950 bg-slate-950 shadow-[3px_3px_0px_0px_#7C3AED]">
                      <img 
                        src={selectedStreamerStats?.profile?.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStreamerStats?.profile?.username}`} 
                        alt="Avatar Target"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-[8px] bg-violet-500/10 text-violet-400 border border-violet-500/30 px-2 py-0.5 rounded font-black tracking-widest uppercase">TARGET LOCKED</span>
                      <h2 className="text-xl font-black uppercase text-slate-100 mt-0.5">{selectedStreamerStats?.profile?.display_name || selectedStreamerStats?.profile?.username}</h2>
                      <p className="text-xs font-medium text-slate-400 font-mono mt-0.5">Streamer ID: #{selectedStreamerStats?.profile?.streamer_id}</p>
                    </div>
                  </div>

                  {/* Kredensial Rekening Terkunci */}
                  <div className="p-4 bg-slate-950 border-2 border-slate-800 rounded-xl flex items-center gap-3.5 text-left">
                    <div className="p-2.5 bg-amber-500/10 border-2 border-slate-800 text-amber-500 rounded-lg"><BankIcon size={18} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Kredensial Rekening WD</p>
                      <p className="text-xs font-black text-slate-200 uppercase truncate mt-0.5">{selectedStreamerStats?.profile?.bank_name || 'BELUM SET BANK'}</p>
                      <p className="text-[11px] font-mono font-bold text-slate-400 truncate tracking-wide mt-0.5">{selectedStreamerStats?.profile?.bank_account_number || '• • • • •'}</p>
                    </div>
                  </div>
                </div>

                {/* SUB CARD 2: ISOLATED LIVE MATH STATISTICS ARRAY */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 bg-slate-900 border-4 border-slate-950 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Bruto Donasi Masuk</p>
                    <p className="text-2xl font-black text-slate-100 font-mono mt-1 flex items-center gap-1.5"><ArrowUpRight size={16} className="text-emerald-400" /> {formatIDR(selectedStreamerStats?.totalGross)}</p>
                  </div>
                  <div className="p-5 bg-slate-900 border-4 border-slate-950 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Saldo Bersih (Net Earnings)</p>
                    <p className="text-2xl font-black text-violet-400 font-mono mt-1 flex items-center gap-1.5"><User size={14} /> {formatIDR(selectedStreamerStats?.totalNetEarnings)}</p>
                  </div>
                  <div className="p-5 bg-slate-900 border-4 border-slate-950 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Akumulasi Fee Platform (5%)</p>
                    <p className="text-2xl font-black text-emerald-400 font-mono mt-1 flex items-center gap-1.5"><DollarSign size={14} /> {formatIDR(selectedStreamerStats?.totalFeePlatform)}</p>
                  </div>
                </div>

                {/* SUB CARD 3: TABEL TRANSAKSI INDIVIDUAL REAL-TIME METRICS */}
                <div className="p-6 bg-slate-900 border-4 border-slate-950 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left">
                  <div className="flex items-center gap-2 mb-4">
                    <Layers size={14} className="text-violet-400" />
                    <h3 className="text-xs font-black uppercase tracking-wider italic">Isolated Streamer Transaction Feed ({selectedStreamerStats?.count || 0} Sukses)</h3>
                  </div>

                  <div className="overflow-x-auto rounded-xl border-2 border-slate-950">
                    <table className="w-full text-left text-xs bg-slate-950/40">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 font-black uppercase tracking-wider border-b-2 border-slate-950">
                          <th className="p-3">Order ID</th>
                          <th className="p-3">Donatur Name</th>
                          <th className="p-3">Gross Amount</th>
                          <th className="p-3">Platform Fee (5%)</th>
                          <th className="p-3">Net Profit</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-slate-950 font-mono text-[11px]">
                        {loadingStreamerData ? (
                          <tr>
                            <td colSpan="6" className="p-6 text-center text-slate-500 font-black uppercase animate-pulse">Menghubungkan terowongan data API...</td>
                          </tr>
                        ) : streamerDonations.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="p-6 text-center text-slate-500 font-black uppercase italic tracking-wider">Streamer ini belum pernah menerima transaksi apa pun, Ri!</td>
                          </tr>
                        ) : (
                          streamerDonations.map((donation) => (
                            <tr key={donation.id} className="hover:bg-slate-900/60 transition-colors">
                              <td className="p-3 text-slate-300 font-bold">{donation.id}</td>
                              <td className="p-3 text-left font-sans font-black uppercase tracking-tight text-slate-400">{donation.donatur_name}</td>
                              <td className="p-3 text-slate-200">{formatIDR(donation.gross_amount)}</td>
                              <td className="p-3 text-emerald-500/80">-{formatIDR(donation.fee_amount)}</td>
                              <td className="p-3 text-violet-400 font-bold">{formatIDR(donation.net_amount)}</td>
                              <td className="p-3">
                                <span className={`text-[9px] px-2 py-0.5 rounded font-sans font-black tracking-widest ${
                                  donation.status?.toUpperCase() === 'SUCCESS' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                  {donation.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* ========================================== */}
        {/* 4. DEEP DATA SYSTEM AUDIT LOG TABLE       */}
        {/* ========================================== */}
        <div className="p-6 bg-slate-900 border-4 border-slate-950 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-left">
          <div className="flex items-center gap-2 mb-6">
            <Terminal size={18} className="text-violet-400" />
            <h2 className="text-sm font-black uppercase tracking-wider italic">System Central Audit Logs (JSONB Streams - Global Monitoring)</h2>
          </div>
          
          <div className="overflow-x-auto rounded-xl border-2 border-slate-950">
            <table className="w-full text-left text-xs bg-slate-950/40">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-black uppercase tracking-wider border-b-2 border-slate-950">
                  <th className="p-4">Action Type</th>
                  <th className="p-4">Entity ID</th>
                  <th className="p-4">IP Network</th>
                  <th className="p-4">Payload Metadata</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-950">
                {globalLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500 font-black uppercase tracking-widest italic">Stream data log kosong murni, Ri!</td>
                  </tr>
                ) : (
                  globalLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/80 transition-colors">
                      <td className="p-4 font-black text-violet-400 uppercase italic tracking-tight">{log.action_type}</td>
                      <td className="p-4 font-mono text-slate-400">{log.entity_id || 'NULL'}</td>
                      <td className="p-4 font-mono text-amber-500">{log.ip_address || '127.0.0.1'}</td>
                      <td className="p-4 max-w-xs truncate font-mono text-[10px] text-slate-500" title={JSON.stringify(log.metadata)}>
                        {JSON.stringify(log.metadata)}
                      </td>
                      <td className="p-4 text-slate-400 font-medium">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SuperAdminDashboard;