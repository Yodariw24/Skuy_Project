import { useEffect, useState } from 'react';
import api from '../api/axios';
import { ShieldAlert, Terminal, RefreshCw, Search, Eye } from 'lucide-react';

function SuperAdminDashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('ALL');
  const [selectedJson, setSelectedJson] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/donations/super-admin/audit-logs');
      if (res.data.success) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.error("Gagal memuat pangkalan data log rill:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = filterAction === 'ALL' 
    ? logs 
    : logs.filter(log => log.action_type === filterAction);

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 p-8 md:p-12 font-sans selection:bg-slate-950 selection:text-white">
      
      {/* HEADER UTAMA PANEL PT */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 bg-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#000]">
        <div className="flex items-center gap-4">
          <div className="bg-slate-950 text-white p-4 rounded-2xl">
            <ShieldAlert size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-950">HQ Central Governance</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Sistem Pemantau Otoritas Tertinggi PT SkuyGG</p>
          </div>
        </div>
        <button onClick={fetchLogs} className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-950 font-black px-6 py-4 rounded-2xl border-4 border-slate-950 active:translate-y-1 transition-all shadow-[4px_4px_0px_0px_#000]">
          <RefreshCw size={18} strokeWidth={3} className={loading ? 'animate-spin' : ''} /> REFRESH LIVE FEED
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* TABEL DATA LOG UTAMA */}
        <main className="lg:col-span-8 bg-white p-8 rounded-[3rem] border-4 border-slate-950 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-3">
              <Terminal size={22} strokeWidth={2.5} /> Activity Stream Log
            </h2>
            {/* FILTER DROPDOWN NEOBRUTALISM */}
            <select 
              value={filterAction} 
              onChange={(e) => setFilterAction(e.target.value)}
              className="p-3 font-black bg-white border-4 border-slate-950 rounded-xl outline-none text-xs uppercase cursor-pointer"
            >
              <option value="ALL">Semua Aktivitas</option>
              <option value="DONATION_INITIATED">Inisialisasi Donasi (QRIS)</option>
              <option value="PAYMENT_WEBHOOK_RECEIVED">Sinyal Masuk Midtrans</option>
              <option value="WITHDRAW_REQUESTED">Permintaan Tarik Saldo</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-20 font-black italic text-slate-400 uppercase text-xs tracking-widest animate-pulse">Menghubungkan ke Black Box Railway...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-4 border-slate-950 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="pb-4">Waktu Event</th>
                    <th className="pb-4">Kategori Aksi</th>
                    <th className="pb-4">IP Address</th>
                    <th className="pb-4 text-right">Inspeksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-slate-100 divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="py-5 font-bold text-xs text-slate-500">
                        {new Date(log.created_at).toLocaleString('id-ID')}
                      </td>
                      <td className="py-5">
                        <span className={`px-3 py-1.5 rounded-lg border-2 border-slate-950 font-black text-[9px] uppercase tracking-tight
                          ${log.action_type === 'PAYMENT_WEBHOOK_RECEIVED' ? 'bg-emerald-100 text-emerald-800' : 
                            log.action_type === 'WITHDRAW_REQUESTED' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                          {log.action_type}
                        </span>
                      </td>
                      <td className="py-5 font-mono text-xs text-slate-600 font-bold">{log.ip_address || 'VORTEX'}</td>
                      <td className="py-5 text-right">
                        <button 
                          onClick={() => setSelectedJson(log.metadata)}
                          className="p-2 bg-slate-50 hover:bg-slate-950 hover:text-white rounded-xl border-2 border-slate-950 transition-all inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-tight"
                        >
                          <Eye size={12} strokeWidth={3} /> Metadata
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {/* SIDEBAR INSPEKTOR DETAIL METADATA */}
        <aside className="lg:col-span-4 bg-slate-950 text-emerald-400 p-8 rounded-[3rem] border-4 border-slate-900 shadow-[12px_12px_0px_0px_#000] min-h-[400px] sticky top-8 font-mono">
          <div className="flex items-center gap-2 text-white font-black uppercase italic tracking-tight text-sm mb-6 border-b border-white/10 pb-4">
            <Search size={16} strokeWidth={2.5} /> Real-Time Inspector
          </div>
          {selectedJson ? (
            <div className="text-xs space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
              <p className="text-white font-bold uppercase text-[10px] tracking-widest text-emerald-500">// Payload Object Detected:</p>
              <pre className="bg-black/40 p-5 rounded-2xl border border-white/5 overflow-x-auto whitespace-pre-wrap leading-relaxed text-emerald-300">
                {JSON.stringify(selectedJson, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-center py-24 text-slate-500 text-xs font-bold italic uppercase tracking-wider">
              Silakan klik tombol "Metadata" di tabel log untuk membedah data rill payload secara mendalam, Ri.
            </div>
          )}
        </aside>
      </div>

    </div>
  );
}

export default SuperAdminDashboard;