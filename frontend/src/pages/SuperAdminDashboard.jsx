import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Shield, Users, DollarSign, RefreshCw, Terminal } from 'lucide-react';
import Swal from 'sweetalert2';

function SuperAdminDashboard() {
  const [stats, setStats] = useState({ total_users: 0, total_revenue: 0, pending_withdrawals: 0 });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Ambil data statistik global platform fee 5% dari endpoint tepercaya kita
      const statsRes = await api.get('/user/admin/platform-stats');
      if (statsRes.data.success) setStats(statsRes.data.stats);

      // 2. Ambil data rill deep jsonb audit logs
      const logsRes = await api.get('/donations/super-admin/audit-logs');
      if (logsRes.data.success) setLogs(logsRes.data.logs);

    } catch (err) {
      console.error("🔥 HQ Engine Ngadat:", err.message);
      Swal.fire("SISTEM ERROR", "Gagal kontak pipa data kasta tertinggi, Ri!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-violet-500 mx-auto mb-4" />
          <p className="font-black tracking-widest uppercase italic text-sm">LOADING MAIN HQ DATABASE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-6 md:p-12 font-sans text-left">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* --- HEADER DASHBOARD GOVERNANCE --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-8 bg-slate-800 border-4 border-slate-950 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-violet-600 border-2 border-slate-950 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white">
              <Shield size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight italic">SKUYGG CENTRAL HQ CONTROL</h1>
              <p className="text-xs text-violet-400 font-bold uppercase tracking-wider">Owner Area Protocol: ariwirayuda24</p>
            </div>
          </div>
          <button 
            onClick={fetchAdminData}
            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs px-6 py-3 border-2 border-slate-950 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all uppercase cursor-pointer"
          >
            <RefreshCw size={14} className="font-bold" /> Synchronize Cores
          </button>
        </div>

        {/* --- KARTU STATISTIK METRIK --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white text-slate-900 border-4 border-slate-950 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Users Registered</p>
              <h3 className="text-3xl font-black italic mt-1">{stats?.total_users || 0} Account</h3>
            </div>
            <div className="p-3 bg-violet-100 rounded-xl border-2 border-slate-950 text-violet-600"><Users size={24} /></div>
          </div>

          <div className="p-6 bg-white text-slate-900 border-4 border-slate-950 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Revenue (Fee 5%)</p>
              <h3 className="text-3xl font-black italic mt-1 text-emerald-600">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stats?.total_revenue || 0)}
              </h3>
            </div>
            <div className="p-3 bg-emerald-100 rounded-xl border-2 border-slate-950 text-emerald-600"><DollarSign size={24} /></div>
          </div>

          <div className="p-6 bg-white text-slate-900 border-4 border-slate-950 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending Withdrawals Queue</p>
              <h3 className="text-3xl font-black italic mt-1 text-amber-500">{stats?.pending_withdrawals || 0} Antrean</h3>
            </div>
            <div className="p-3 bg-amber-100 rounded-xl border-2 border-slate-950 text-amber-500"><Terminal size={24} /></div>
          </div>
        </div>

        {/* --- DEEP DATA SYSTEM AUDIT LOG TABLE --- */}
        <div className="p-6 bg-slate-800 border-4 border-slate-950 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 mb-6">
            <Terminal size={18} className="text-violet-400" />
            <h2 className="text-sm font-black uppercase tracking-wider italic">System Central Audit Logs (JSONB Streams)</h2>
          </div>
          
          <div className="overflow-x-auto rounded-xl border-2 border-slate-950">
            <table className="w-full text-left text-xs bg-slate-900/40">
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
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500 font-black uppercase tracking-widest italic">Stream data kosong murni, Ri!</td>
                  </tr>
                ) : (
                  logs.map((log) => (
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