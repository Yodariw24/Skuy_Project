import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Shield, RefreshCw, Search, SlidersHorizontal, ChevronRight, ArrowLeft, Layers, Landmark, FileText, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

import DashboardStats from '../components/dashboard/DashboardStats';
import MerchantDonationsTable from '../components/dashboard/MerchantDonationsTable';
import { printFinancialStatement } from '../utils/reportPrinter';

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  const [globalStats, setGlobalStats] = useState({ total_users: 0, total_revenue: 0, pending_withdrawals: 0 });
  const [streamersList, setStreamersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStreamerId, setSelectedStreamerId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [streamerDonations, setStreamerDonations] = useState([]);
  const [loadingStreamerData, setLoadingStreamerData] = useState(false);

  const initializeHQData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/user/admin/platform-stats');
      if (statsRes.data.success) setGlobalStats(statsRes.data.stats);

      const streamersRes = await api.get('/user/list');
      if (streamersRes.data.success) setStreamersList(streamersRes.data.streamers || []);
    } catch (err) {
      console.error("🔥 Error Data Backbone:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMassSync = async () => {
    Swal.fire({
      title: 'SYNCHRONIZING...',
      text: 'Menghubungkan database Railway ke hulu server Sandbox Midtrans...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });
    try {
      const res = await api.post('/donations/admin/transactions/sync');
      if (res.data.success) {
        Swal.fire('SINKRONISASI SUKSES!', res.data.message, 'success');
        initializeHQData();
        if (selectedStreamerId !== 'ALL') fetchSelectedStreamerDonations(selectedStreamerId);
      }
    } catch (err) {
      Swal.fire('TIMEOUT!', 'Gagal sinkronisasi otomatis: ' + err.message, 'error');
    }
  };

  useEffect(() => { initializeHQData(); }, []);
  useEffect(() => { fetchSelectedStreamerDonations(selectedStreamerId); }, [selectedStreamerId]);

  const fetchSelectedStreamerDonations = async (id) => {
    if (id === 'ALL') { setStreamerDonations([]); return; }
    setLoadingStreamerData(true);
    try {
      const res = await api.get(`/donations/list-internal/${id}`);
      if (res.data.success) setStreamerDonations(res.data.data || []);
    } catch (err) {
      console.error("🔥 Error fetching internal notes:", err.message);
    } finally {
      setLoadingStreamerData(false);
    }
  };

  const filteredStreamers = useMemo(() => {
    return streamersList.filter(s => 
      s.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  };

  if (loading) return <div className="p-10 font-black text-center animate-pulse">BOOTING MASTER HQ CONSOLE...</div>;

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="min-h-screen bg-[#F1F5F9] text-slate-900 p-4 md:p-10 text-left">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between p-8 bg-white border-4 border-slate-950 rounded-[2rem] shadow-[8px_8px_0px_0px_#000] border-t-violet-600 gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-violet-600 border-4 border-slate-950 rounded-2xl text-white"><Shield size={36} /></div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight italic">SKUYGG MANAGEMENT CORE</h1>
              <p className="text-xs text-slate-500 font-bold uppercase mt-1">Multi-Tenant Financial Clearing Dashboard</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => navigate('/dashboard')} className="bg-slate-100 font-black text-xs px-6 py-4 border-4 border-slate-950 rounded-2xl shadow-[4px_4px_0px_0px_#000] uppercase cursor-pointer italic"><ArrowLeft size={14} className="inline mr-2" /> Return</button>
            <button onClick={handleMassSync} className="bg-[#10B981] font-black text-xs px-6 py-4 border-4 border-slate-950 rounded-2xl shadow-[4px_4px_0px_0px_#000] uppercase cursor-pointer text-white italic"><RefreshCw size={14} className="inline mr-2" /> Sync Cores</button>
            <button onClick={() => printFinancialStatement(streamerDonations, selectedStreamerStats)} disabled={selectedStreamerId === 'ALL' || streamerDonations.length === 0} className="bg-violet-600 text-white font-black text-xs px-6 py-4 border-4 border-slate-950 rounded-2xl shadow-[4px_4px_0px_0px_#000] uppercase cursor-pointer disabled:opacity-50 italic"><FileText size={14} className="inline mr-2" /> Export (.PDF)</button>
          </div>
        </div>

        <div className="bg-slate-900 border-4 border-slate-950 rounded-xl p-4 flex justify-between text-white text-xs font-mono">
          <div className="flex items-center gap-2"><Activity size={16} className="text-emerald-400 animate-pulse" /> <span>Ecosystem Health Index: <b className="text-emerald-400">[99.87% STABLE]</b></span></div>
          <div className="hidden md:flex gap-4 text-[10px] text-slate-400 font-bold"><span>Railway: ON</span> <span>Midtrans: OPERATIONAL</span></div>
        </div>

        <DashboardStats globalStats={globalStats} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-4 bg-white border-4 border-slate-950 p-6 rounded-3xl shadow-[6px_6px_0px_0px_#000] space-y-6">
            <div className="flex items-center gap-2 border-b-2 pb-4"><SlidersHorizontal size={16} className="text-violet-600" /> <h2 className="text-xs font-black uppercase italic">Merchant Filter</h2></div>
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Cari Merchant ID / Nama..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#F8FAFF] border-2 border-slate-200 rounded-xl py-3 pl-11 pr-4 text-xs font-bold" />
            </div>
            <div className="space-y-1.5 max-h-[320px] overflow-y-auto">
              <button onClick={() => setSelectedStreamerId('ALL')} className={`w-full text-left px-4 py-3 rounded-xl border-2 text-xs font-black uppercase ${selectedStreamerId === 'ALL' ? 'bg-violet-50 border-violet-500 text-violet-600' : 'bg-[#F8FAFF]'}`}><Layers size={14} className="inline mr-2" /> All Operational Merchants</button>
              {filteredStreamers.map(s => (
                <button key={s.id} onClick={() => setSelectedStreamerId(s.id)} className={`w-full text-left px-4 py-3 rounded-xl border-2 text-xs font-black uppercase flex items-center justify-between ${parseInt(selectedStreamerId, 10) === parseInt(s.id, 10) ? 'bg-violet-50 border-violet-500 text-violet-600' : 'bg-[#F8FAFF]'}`}>
                  <span className="truncate">{s.display_name || s.username}</span> <ChevronRight size={12} />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8">
            {selectedStreamerId === 'ALL' ? (
              <div className="p-16 bg-white border-4 border-slate-950 rounded-3xl shadow-[6px_6px_0px_0px_#000] text-center border-dashed font-bold text-sm text-slate-400">Silakan pilih salah satu merchant creator di panel kiri untuk membuka data finansial sandbox Midtrans, Ri!</div>
            ) : (
              <div className="space-y-6">
                <div className="p-6 bg-white border-4 border-slate-950 rounded-3xl shadow-[6px_6px_0px_0px_#000] flex flex-col md:flex-row justify-between gap-6">
                  <div>
                    <span className="text-[8px] bg-violet-100 text-violet-600 border px-2 py-0.5 rounded font-black">RECORD SECURED</span>
                    <h2 className="text-xl font-black uppercase mt-1">{selectedStreamerStats?.profile?.display_name || selectedStreamerStats?.profile?.username}</h2>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">UID: #{selectedStreamerStats?.profile?.id}</p>
                  </div>
                  <div className="p-4 bg-[#F8FAFF] border-2 rounded-xl flex items-center gap-3 w-full md:w-64">
                    <Landmark size={18} className="text-amber-600" />
                    <div className="truncate"><p className="text-[9px] font-black text-slate-400">Payout Destination</p><p className="text-xs font-black truncate">{selectedStreamerStats?.profile?.bank_name || 'NOT SET'}</p></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="p-4 bg-white border-4 border-slate-950 rounded-2xl shadow-[4px_4px_0px_0px_#000]"><p className="text-[9px] font-black text-slate-400 uppercase">Gross Turnaround</p><p className="text-lg font-black text-slate-900 font-mono mt-1">{formatIDR(selectedStreamerStats?.totalGross)}</p></div>
                  <div className="p-4 bg-white border-4 border-slate-950 rounded-2xl shadow-[4px_4px_0px_0px_#000]"><p className="text-[9px] font-black text-slate-400 uppercase">Net Revenue (95%)</p><p className="text-lg font-black text-violet-600 font-mono mt-1">{formatIDR(selectedStreamerStats?.totalNetEarnings)}</p></div>
                  <div className="p-4 bg-white border-4 border-slate-950 rounded-2xl shadow-[4px_4px_0px_0px_#000]"><p className="text-[9px] font-black text-slate-400 uppercase">Royalty Fee (5%)</p><p className="text-lg font-black text-emerald-500 font-mono mt-1">{formatIDR(selectedStreamerStats?.totalFeePlatform)}</p></div>
                </div>

                <MerchantDonationsTable donations={streamerDonations} loading={loadingStreamerData} />
              </div>
            )}
          </div>

        </div>

      </div>
    </motion.div>
  );
}