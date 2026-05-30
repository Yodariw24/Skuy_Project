import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  Shield, Users, DollarSign, RefreshCw, Terminal, 
  Search, SlidersHorizontal, ArrowUpRight, ChevronRight, 
  User, ArrowLeft, ShieldCheck, ShieldAlert, Layers, Landmark as BankIcon, Eye
} from 'lucide-react';
import Swal from 'sweetalert2';

function SuperAdminDashboard() {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT PIPELINE ---
  const [globalStats, setGlobalStats] = useState({ total_users: 0, total_revenue: 0, pending_withdrawals: 0 });
  const [globalLogs, setGlobalLogs] = useState([]);
  const [streamersList, setStreamersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Main Tab Switcher ('overview' vs 'terminal')
  const [activeSubTab, setActiveSubTab] = useState('overview');

  // Filter & Selector State
  const [selectedStreamerId, setSelectedStreamerId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [streamerDonations, setStreamerDonations] = useState([]);
  const [loadingStreamerData, setLoadingStreamerData] = useState(false);

  // --- CORE ENGINE: FETCH ALL DATA ---
  const initializeHQData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/user/admin/platform-stats');
      if (statsRes.data.success) setGlobalStats(statsRes.data.stats);

      const logsRes = await api.get('/donations/super-admin/audit-logs');
      if (logsRes.data.success) setGlobalLogs(logsRes.data.logs);

      const streamersRes = await api.get('/user/list');
      if (streamersRes.data.success) {
        setStreamersList(streamersRes.data.streamers || []);
      }
    } catch (err) {
      console.error("🔥 HQ Backbone Engine Crash:", err.message);
      Swal.fire({
        title: 'SISTEM ENGADAT!',
        text: 'Gagal memancing data utama kasta tertinggi, Ri! Pastikan token LocalStorage sudah dibersihkan total.',
        icon: 'error',
        confirmButtonText: 'PAHAM, SULTAN',
        buttonsStyling: false,
        customClass: {
          popup: 'rounded-[2rem] border-4 border-slate-950 bg-[#F8FAFF] text-slate-900 shadow-[8px_8px_0px_0px_#000]',
          title: 'font-black italic text-rose-600 uppercase tracking-tight',
          confirmButton: 'bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black px-8 py-3 rounded-xl uppercase italic border-2 border-slate-950 shadow-[4px_4px_0px_0px_#000]'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeHQData();
  }, []);

  useEffect(() => {
    fetchSelectedStreamerDonations(selectedStreamerId);
  }, [selectedStreamerId]);

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

  const filteredStreamers = useMemo(() => {
    return streamersList.filter(s => 
      s.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [streamersList, searchQuery]);

  const selectedStreamerStats = useMemo(() => {
    if (selectedStreamerId === 'ALL') return null;
    const profile = streamersList.find(s => parseInt(s.id, 10) === parseInt(selectedStreamerId, 10));
    const successDonations = streamerDonations.filter(d => d.status?.toUpperCase() === 'SUCCESS');
    
    const totalGross = successDonations.reduce((acc, curr) => acc + (Number(curr.gross_amount) || 0), 0);
    const totalNetEarnings = successDonations.reduce((acc, curr) => acc + (Number(curr.net_amount) || 0), 0);
    const totalFeePlatform = successDonations.reduce((acc, curr) => acc + (Number(curr.fee_amount) || 0), 0);

    return { profile, totalGross, totalNetEarnings, totalFeePlatform, count: successDonations.length };
  }, [selectedStreamerId, streamersList, streamerDonations]);

  // ✅ PRO SASS LOGGER PARSER: Mengubah JSON mentah menjadi teks deskriptif yang profesional
  const parseAuditLogToHumanText = (log) => {
    try {
      const meta = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata;
      const body = meta?.request_body || {};
      const amountFormatted = body.amount ? `Rp ${Number(body.amount).toLocaleString('id-ID')}` : '';

      switch (log.action_type) {
        case 'DONATION_INITIATED':
          return `Donatur "${body.donatur_name || 'Anonim'}" menginisialisasi donasi ${amountFormatted} ke Streamer ID #${body.streamer_id} via ${body.payment_method || 'Gateway'}`;
        case 'PAYMENT_WEBHOOK_RECEIVED':
          return `Sinyal Webhook Midtrans diterima untuk Order ID #${log.entity_id || 'NULL'}. Status sinkronisasi aman.`;
        default:
          return `Aksi [${log.action_type}] berhasil dijalankan pada entitas #${log.entity_id || 'Global'}`;
      }
    } catch (e) {
      return `Menjalankan protokol operasi sistem [${log.action_type}]`;
    }
  };

  // ✅ PRO POP-UP INSPECTOR: Menampilkan raw JSONB murni dengan gaya code editor neobrutalism
  const openJsonModalInspector = (log) => {
    let formattedJson = "{}";
    try {
      const meta = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata;
      formattedJson = JSON.stringify(meta, null, 2);
    } catch (e) {
      formattedJson = JSON.stringify({ raw: log.metadata }, null, 2);
    }

    Swal.fire({
      title: `METADATA LOG #${log.id}`,
      html: `<pre style="text-align: left; background: #0F172A; color: #38BDF8; padding: 1.5rem; rounded: 1rem; font-family: monospace; font-size: 11px; overflow-x: auto; border: 2px solid #000; box-shadow: 4px 4px 0px 0px #000; max-height: 350px;">${formattedJson}</pre>`,
      confirmButtonText: 'CLOSE STREAM',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-[2rem] border-4 border-slate-950 bg-[#F8FAFF] shadow-[8px_8px_0px_0px_#000]',
        title: 'font-black text-sm text-slate-900 tracking-wider font-sans',
        confirmButton: 'bg-slate-900 text-white text-[10px] font-black px-8 py-3 rounded-xl uppercase border-2 border-slate-950 shadow-[4px_4px_0px_0px_#000]'
      }
    });
  };

  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center text-slate-900 font-sans">
        <div className="text-center space-y-4">
          <RefreshCw className="w-16 h-16 animate-spin text-violet-600 mx-auto border-4 border-slate-950 p-2 bg-white rounded-full shadow-[4px_4px_0px_0px_#000]" />
          <p className="font-black tracking-widest uppercase italic text-sm text-slate-700 animate-pulse">LOADING CORES SAAS METRICS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 p-4 md:p-10 font-sans text-left selection:bg-violet-600 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* ========================================== */}
        {/* 1. HEADER DASHBOARD ENTERPRISE GOVERNANCE */}
        {/* ========================================== */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between p-8 bg-white border-4 border-slate-950 rounded-[2rem] shadow-[8px_8px_0px_0px_#000] border-t-violet-600 gap-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-slate-200 pointer-events-none opacity-40 group-hover:scale-110 transition-transform duration-700">
            <Shield size={180} />
          </div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="p-4 bg-violet-600 border-4 border-slate-950 rounded-2xl shadow-[4px_4px_0px_0px_#000] text-white rotate-[-2deg]">
              <Shield size={36} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black uppercase tracking-tight italic text-slate-950">SKUYGG CENTRAL CONTROL</h1>
                <span className="text-[9px] bg-violet-100 text-violet-600 border border-violet-200 px-2 py-0.5 rounded-md font-black tracking-widest uppercase">PRO v4.0</span>
              </div>
              <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mt-1">Platform Multi-Tenant Tracker Ecosystem • Owner Mode: ariwirayuda24</p>
            </div>
          </div>

          {/* ACTION CONTROLS */}
          <div className="flex flex-wrap gap-4 relative z-10">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-xs px-6 py-4 border-4 border-slate-950 rounded-2xl shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all uppercase cursor-pointer tracking-wider italic font-sans"
            >
              <ArrowLeft size={14} strokeWidth={3} /> Back To Dashboard
            </button>
            <button 
              onClick={initializeHQData}
              className="flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-slate-950 font-black text-xs px-6 py-4 border-4 border-slate-950 rounded-2xl shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all uppercase cursor-pointer tracking-wider italic font-sans"
            >
              <RefreshCw size={14} strokeWidth={3} /> Synchronize All Nodes
            </button>
          </div>
        </div>

        {/* ========================================== */}
        {/* 2. STATISTIK METRIK GLOBAL PLATFORM        */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border-4 border-slate-950 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-b-violet-600 flex items-center justify-between group hover:-translate-y-1 transition-transform duration-300">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Operational Users</p>
              <h3 className="text-4xl font-black italic mt-1 text-slate-900">{globalStats?.total_users || 0} <span className="text-xs text-slate-400 font-bold not-italic">Sultans</span></h3>
            </div>
            <div className="p-4 bg-violet-50 rounded-xl border-2 border-slate-950 text-violet-600 shadow-[2px_2px_0px_0px_#000]"><Users size={24} strokeWidth={2.5} /></div>
          </div>

          <div className="p-6 bg-white border-4 border-slate-950 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-b-emerald-600 flex items-center justify-between group hover:-translate-y-1 transition-transform duration-300">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Platform Fee Revenue (5%)</p>
              <h3 className="text-4xl font-black italic mt-1 text-emerald-600">{formatIDR(globalStats?.total_revenue)}</h3>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border-2 border-slate-950 text-emerald-600 shadow-[2px_2px_0px_0px_#000]"><DollarSign size={24} strokeWidth={2.5} /></div>
          </div>

          <div className="p-6 bg-white border-4 border-slate-950 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-b-amber-600 flex items-center justify-between group hover:-translate-y-1 transition-transform duration-300">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Withdrawals Request Queue</p>
              <h3 className="text-4xl font-black italic mt-1 text-amber-400">{globalStats?.pending_withdrawals || 0} <span className="text-xs text-slate-400 font-bold not-italic">Antrean</span></h3>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border-2 border-slate-950 text-amber-600 shadow-[2px_2px_0px_0px_#000]"><Terminal size={24} strokeWidth={2.5} /></div>
          </div>
        </div>

        {/* ========================================== */}
        {/* 🚀 ENTERPRISE TAB SWITCHER CONTROL PROTOCOL */}
        {/* ========================================== */}
        <div className="flex gap-4 border-b-4 border-slate-950 pb-2">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all border-2 shadow-[2px_2px_0px_0px_#000] cursor-pointer italic font-sans ${
              activeSubTab === 'overview'
                ? 'bg-violet-600 text-white border-slate-950'
                : 'bg-white text-slate-500 border-slate-200 hover:text-slate-900'
            }`}
          >
            📊 Multi-Tenant Streamer Monitor
          </button>
          <button
            onClick={() => setActiveSubTab('terminal')}
            className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all border-2 shadow-[2px_2px_0px_0px_#000] cursor-pointer italic font-sans ${
              activeSubTab === 'terminal'
                ? 'bg-slate-900 text-amber-400 border-slate-950 font-mono'
                : 'bg-white text-slate-500 border-slate-200 hover:text-slate-900'
            }`}
          >
            ⚡ Core System Audit Logs ({globalLogs.length})
          </button>
        </div>

        {/* ========================================== */}
        {/* VIEW TAB A: STREAMER TRACKER HUB           */}
        {/* ========================================== */}
        {activeSubTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
            {/* LEFT COLUMN: IDENTITAS SELECTOR PANEL */}
            <div className="lg:col-span-4 bg-white border-4 border-slate-950 p-6 rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
              <div className="flex items-center gap-2 border-b-2 border-slate-100 pb-4">
                <SlidersHorizontal size={16} className="text-violet-600" />
                <h2 className="text-xs font-black uppercase tracking-wider italic">Streamer Multi-Tenant Filter</h2>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Cari Username / Email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-get-adem bg-[#F8FAFF] border-2 border-slate-200 rounded-xl py-3 pl-11 pr-4 text-xs text-slate-900 focus:outline-none focus:border-violet-500 font-bold placeholder-slate-400"
                />
              </div>

              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar text-left">
                <button
                  onClick={() => setSelectedStreamerId('ALL')}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-xs font-black uppercase transition-all flex items-center justify-between cursor-pointer ${
                    selectedStreamerId === 'ALL'
                      ? 'bg-violet-50 border-violet-500 text-violet-600 italic shadow-[2px_2px_0px_0px_rgba(124,58,237,0.1)]'
                      : 'bg-[#F8FAFF] border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-400'
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
                        ? 'bg-violet-50 border-violet-500 text-violet-600 italic shadow-[2px_2px_0px_0px_rgba(124,58,237,0.1)]'
                        : 'bg-[#F8FAFF] border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg overflow-hidden border-2 border-slate-950 flex-shrink-0 bg-slate-100">
                        <img 
                          src={streamer.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${streamer.username}`} 
                          alt="Avatar" className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="truncate text-left">
                        <p className="font-black tracking-tight truncate text-slate-900">{streamer.display_name || streamer.username}</p>
                        <p className="text-[9px] font-bold text-slate-400 lowercase truncate tracking-normal group-hover:text-slate-500">{streamer.email}</p>
                      </div>
                    </div>
                    <ChevronRight size={12} className="opacity-40" />
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: DETAIL DEEP ANALYTICS TARGET REPORT */}
            <div className="lg:col-span-8 space-y-6">
              {selectedStreamerId === 'ALL' ? (
                <div className="p-12 bg-white border-4 border-slate-950 rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center space-y-4 border-dashed border-slate-300">
                  <div className="w-16 h-16 bg-[#F8FAFF] rounded-2xl border-2 border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                    <User size={28} />
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-wider text-sm italic text-slate-800">Multi-Tenant Node Idle</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-medium">Pilih salah satu identitas nama akun streamer di bilah kiri untuk mengaktifkan pemindaian dalam, grafik total omset bersih, data rekening bank, dan daftar log transaksi rill miliknya, Ri!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* METADATA PROFILE */}
                  <div className="p-6 bg-white border-4 border-slate-950 rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-slate-950 bg-white shadow-[3px_3px_0px_0px_#7C3AED]">
                        <img 
                          src={selectedStreamerStats?.profile?.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStreamerStats?.profile?.username}`} 
                          alt="Avatar Target" className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[8px] bg-violet-100 text-violet-600 border border-violet-200 px-2 py-0.5 rounded font-black tracking-widest uppercase">TARGET LOCKED</span>
                        <h2 className="text-xl font-black uppercase text-slate-900 mt-0.5">{selectedStreamerStats?.profile?.display_name || selectedStreamerStats?.profile?.username}</h2>
                        <p className="text-xs font-medium text-slate-500 font-mono mt-0.5">Streamer ID: #{selectedStreamerStats?.profile?.streamer_id || selectedStreamerStats?.profile?.id}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                            selectedStreamerStats?.profile?.is_two_fa_enabled ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                          }`}>
                            {selectedStreamerStats?.profile?.is_two_fa_enabled ? <ShieldCheck size={10} /> : <ShieldAlert size={10} />}
                            {selectedStreamerStats?.profile?.is_two_fa_enabled ? '2FA SECURED' : '2FA DISABLED'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded uppercase bg-violet-50 text-violet-600 border border-violet-200">
                            ROLE: {selectedStreamerStats?.profile?.role || 'CREATOR'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-[#F8FAFF] border-2 border-slate-200 rounded-xl flex items-center gap-3.5 text-left w-full md:w-72">
                      <div className="p-2.5 bg-amber-50 border-2 border-amber-200 text-amber-600 rounded-lg"><BankIcon size={18} /></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Kredensial Rekening WD</p>
                        <p className="text-xs font-black text-slate-900 uppercase truncate mt-0.5">{selectedStreamerStats?.profile?.bank_name || 'BELUM SET BANK'}</p>
                        <p className="text-[11px] font-mono font-bold text-slate-500 truncate tracking-wide mt-0.5">{selectedStreamerStats?.profile?.bank_account_number || '• • • • •'}</p>
                      </div>
                    </div>
                  </div>

                  {/* LIVE MATH METRICS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 bg-white border-4 border-slate-950 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Bruto Donasi Masuk</p>
                      <p className="text-2xl font-black text-slate-900 font-mono mt-1 flex items-center gap-1.5"><ArrowUpRight size={16} className="text-emerald-500" /> {formatIDR(selectedStreamerStats?.totalGross)}</p>
                    </div>
                    <div className="p-5 bg-white border-4 border-slate-950 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Saldo Bersih (Net Earnings)</p>
                      <p className="text-2xl font-black text-violet-600 font-mono mt-1 flex items-center gap-1.5"><User size={14} /> {formatIDR(selectedStreamerStats?.totalNetEarnings)}</p>
                    </div>
                    <div className="p-5 bg-white border-4 border-slate-950 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Akumulasi Fee Platform (5%质量)</p>
                      <p className="text-2xl font-black text-emerald-500 font-mono mt-1 flex items-center gap-1.5"><DollarSign size={14} /> {formatIDR(selectedStreamerStats?.totalFeePlatform)}</p>
                    </div>
                  </div>

                  {/* ISOLATED TRANSACTION FEED TABLE */}
                  <div className="p-6 bg-white border-4 border-slate-950 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left">
                    <div className="flex items-center gap-2 mb-4">
                      <Layers size={14} className="text-violet-600" />
                      <h3 className="text-xs font-black uppercase tracking-wider italic text-slate-800">Isolated Streamer Transaction Feed ({selectedStreamerStats?.count || 0} Sukses)</h3>
                    </div>

                    <div className="overflow-x-auto rounded-xl border-2 border-slate-950">
                      <table className="w-full text-left text-xs bg-white">
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
                        <tbody className="divide-y-2 divide-slate-100 font-mono text-[11px]">
                          {loadingStreamerData ? (
                            <tr><td colSpan="6" className="p-6 text-center text-slate-400 font-black uppercase animate-pulse">Menghubungkan terowongan data API...</td></tr>
                          ) : streamerDonations.length === 0 ? (
                            <tr><td colSpan="6" className="p-6 text-center text-slate-400 font-black uppercase italic tracking-wider">Streamer ini belum pernah menerima transaksi apa pun, Ri!</td></tr>
                          ) : (
                            streamerDonations.map((donation) => (
                              <tr key={donation.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3 text-slate-700 font-bold">{donation.id}</td>
                                <td className="p-3 text-left font-sans font-black uppercase tracking-tight text-slate-800">{donation.donatur_name}</td>
                                <td className="p-3 text-slate-600">{formatIDR(donation.gross_amount)}</td>
                                <td className="p-3 text-rose-500">-{formatIDR(donation.fee_amount)}</td>
                                <td className="p-3 text-violet-600 font-bold">{formatIDR(donation.net_amount)}</td>
                                <td className="p-3">
                                  <span className={`text-[9px] px-2 py-0.5 rounded font-sans font-black tracking-widest ${
                                    donation.status?.toUpperCase() === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                                  }`}>{donation.status}</span>
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
        )}

        {/* ========================================== */}
        {/* VIEW TAB B: SYSTEM TERMINAL AUDIT LOGS     */}
        {/* ========================================== */}
        {activeSubTab === 'terminal' && (
          <div className="p-6 bg-white border-4 border-slate-950 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-left animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-2 mb-6 border-b-2 border-slate-100 pb-4">
              <Terminal size={18} className="text-slate-900" />
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider italic text-slate-900">System Enterprise Audit Logs Gateway</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Fungsi Parser Otomatis: Mengubah JSONB Streams menjadi kalimat aktivitas log manusiawi, Ri!</p>
              </div>
            </div>
            
            <div className="overflow-x-auto rounded-xl border-2 border-slate-950">
              <table className="w-full text-left text-xs bg-white">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-black uppercase tracking-wider border-b-2 border-slate-950">
                    <th className="p-4">Action Protocol</th>
                    <th className="p-4">Parsed Activity Description</th>
                    <th className="p-4">Network IP</th>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4 text-center">Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100 font-medium">
                  {globalLogs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-400 font-black uppercase tracking-widest italic">Stream data log kosong murni, Ri!</td>
                    </tr>
                  ) : (
                    globalLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <span className="text-[9px] font-black bg-slate-900 text-amber-400 px-2 py-1 rounded font-mono border border-slate-950 uppercase tracking-wider">
                            {log.action_type}
                          </span>
                        </td>
                        {/* ✅ MERENDER TEKS KALIMAT YANG SUDAH DIPARSE MANUSIAWI */}
                        <td className="p-4 font-sans font-bold text-slate-800 text-xs tracking-tight">
                          {parseAuditLogToHumanText(log)}
                        </td>
                        <td className="p-4 font-mono text-violet-600 font-bold">{log.ip_address || '127.0.0.1'}</td>
                        <td className="p-4 text-slate-500 text-xs font-semibold">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                        
                        {/* ✅ BUTTON MODAL INSPECTOR LOGS */}
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => openJsonModalInspector(log)}
                            className="p-2 bg-violet-50 hover:bg-violet-100 text-violet-600 border-2 border-slate-950 rounded-lg shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                            title="Inspect Metadata Payload JSONB"
                          >
                            <Eye size={14} strokeWidth={3} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default SuperAdminDashboard;