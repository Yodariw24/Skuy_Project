import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios' 
import { 
  Copy, ExternalLink, Eye, EyeOff, Edit3, Landmark, ChevronDown, 
  Wallet, ArrowUpRight, Clock, Link as LinkIcon, 
  History, ArrowDownLeft, Info, AlertCircle, RefreshCw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'

function EarningsView({ user, balance, showBalance, setShowBalance, bankData, openEditModal }) {
  const [filter, setFilter] = useState('Semua')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  // ✅ PROTEKSI 1: Inisialisasi sebagai Array kosong agar .filter tidak error saat render pertama
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate();

  const fetchHistory = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await api.get(`/wallet/history/${user.id}`);
      
      // ✅ PROTEKSI 2: Cek struktur res.data.history dari Railway
      if (res.data && Array.isArray(res.data.history)) {
        setTransactions(res.data.history);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.warn("Koneksi gagal atau Tabel Belum Ada, Ri.");
      setTransactions([]); 
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchHistory(); }, [user?.id]);

  // ✅ PROTEKSI 3: Pastikan transactions selalu Array sebelum difilter
  const filteredTransactions = (Array.isArray(transactions) ? transactions : []).filter(tx => {
    if (filter === 'Semua') return true;
    if (filter === 'Donasi Masuk') return tx.type === 'IN' || tx.type === 'donation';
    if (filter === 'Penarikan Saldo') return tx.type === 'OUT' || tx.type === 'withdrawal';
    return true;
  });

  const handleWithdraw = async () => {
    if (!withdrawAmount || withdrawAmount < 10000) return Swal.fire('DITOLAK', 'Minimal Rp 10.000!', 'error');
    if (Number(withdrawAmount) > Number(balance)) return Swal.fire('SALDO KURANG', 'Saldo gak cukup!', 'warning');

    try {
      await api.post('/wallet/withdraw', { userId: user.id, amount: parseInt(withdrawAmount), bank: bankData });
      Swal.fire({ title: 'SUCCESS', text: 'Permintaan tarik saldo dikirim!', icon: 'success' });
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      fetchHistory(); 
    } catch (err) { Swal.fire('ERROR', 'Gagal kirim permintaan.', 'error'); }
  };

  const copyToClipboard = (text, message) => {
    navigator.clipboard.writeText(text);
    Swal.fire({ title: 'COPIED', text: message, icon: 'success', timer: 1500, showConfirmButton: false });
  };

  return (
    <div className="animate-in fade-in duration-700 max-w-5xl mx-auto pb-20 px-2 font-sans text-left">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-950 leading-none mb-3">My Wallet</h1>
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-8 h-[2px] bg-violet-600" />
            <p className="text-[10px] font-black uppercase tracking-widest italic">Revenue Control</p>
          </div>
        </div>
        <button onClick={() => setIsWithdrawModalOpen(true)} className="w-full md:w-auto bg-slate-950 text-white px-10 py-4 rounded-[2rem] font-black text-[11px] uppercase italic tracking-widest hover:bg-violet-600 shadow-2xl transition-all flex items-center justify-center gap-3">
          Withdraw Funds <ArrowUpRight size={16} strokeWidth={3} />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* CARD SALDO */}
          <div className="bg-gradient-to-br from-violet-600 to-indigo-800 rounded-[3.5rem] p-10 text-white relative overflow-hidden shadow-2xl group">
            <div className="relative z-10 flex flex-col justify-between min-h-[180px]">
              <div className="flex justify-between items-start">
                <div className="p-4 bg-white/10 backdrop-blur-2xl rounded-[1.5rem] border border-white/20"><Wallet size={28} /></div>
                <button onClick={() => setShowBalance(!showBalance)} className="bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest">
                  {showBalance ? 'Hide' : 'Show'}
                </button>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-200/60 mb-2 italic">Total Available Balance</p>
                <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter">
                  {showBalance ? `Rp ${Number(balance).toLocaleString('id-ID')}` : '••••••••••'}
                </h2>
              </div>
            </div>
          </div>

          {/* HISTORY LIST */}
          <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-8 md:p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-950 text-white rounded-2xl shadow-lg"><History size={20} /></div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg uppercase italic tracking-tighter leading-none mb-1">History</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Tracking your cash flow</p>
                </div>
              </div>

              <div className="relative">
                <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="w-full md:w-48 flex items-center justify-between gap-3 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-600 uppercase transition-all hover:bg-slate-100">
                  {filter} <ChevronDown size={16} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isFilterOpen && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-3 w-full bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-50 p-3">
                      {['Semua', 'Donasi Masuk', 'Penarikan Saldo'].map((item) => (
                        <button key={item} onClick={() => { setFilter(item); setIsFilterOpen(false); }} className={`w-full text-left px-5 py-3.5 text-[10px] font-black uppercase rounded-2xl ${filter === item ? 'bg-violet-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                          {item}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="p-6 md:p-10">
              {loading ? (
                <div className="py-20 flex flex-col items-center gap-4 text-slate-300">
                  <RefreshCw size={32} className="animate-spin" />
                  <p className="text-[10px] font-black uppercase italic">Syncing Cloud...</p>
                </div>
              ) : filteredTransactions.length > 0 ? (
                <div className="space-y-5">
                  {filteredTransactions.map((tx) => (
                    <div key={tx.id} className="group flex flex-col md:flex-row md:items-center justify-between p-7 rounded-[2.5rem] bg-slate-50/50 border border-transparent hover:border-violet-100 transition-all">
                      <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-[1.5rem] shadow-lg ${tx.type === 'IN' || tx.type === 'donation' ? 'bg-emerald-500' : 'bg-rose-500'} text-white`}>
                          {tx.type === 'IN' || tx.type === 'donation' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                        </div>
                        <div>
                          <p className="font-black text-slate-950 uppercase italic tracking-tighter text-sm mb-1">{tx.description || tx.message || 'System Entry'}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-2"><Clock size={10} /> {new Date(tx.created_at).toLocaleDateString('id-ID')}</p>
                        </div>
                      </div>
                      <p className={`text-2xl font-black tracking-tighter mt-4 md:mt-0 ${tx.type === 'IN' || tx.type === 'donation' ? 'text-emerald-600' : 'text-slate-950'}`}>
                        {tx.type === 'IN' || tx.type === 'donation' ? '+' : '-'} Rp {Number(tx.amount).toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center opacity-30 flex flex-col items-center gap-4">
                  <History size={32} className="text-slate-300" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Empty Log</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SIDEBAR RIGHT (BANK & LINK) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl">
            <h4 className="text-[10px] font-black uppercase text-slate-400 mb-6 tracking-widest flex items-center gap-2 italic">
              <LinkIcon size={14} className="text-violet-600" /> Public Profile
            </h4>
            <div className="bg-slate-50 p-5 rounded-2xl mb-5 text-sm font-black text-slate-400 truncate tracking-tight uppercase italic">
              skuy.gg/<span className="text-violet-600">{user?.username}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => copyToClipboard(`https://skuy-project.vercel.app/${user?.username}`, "Disalin! 📋")} className="py-4 bg-violet-50 text-violet-600 rounded-2xl text-[9px] font-black uppercase italic tracking-widest">Copy</button>
              <a href={`/${user?.username}`} target="_blank" rel="noreferrer" className="py-4 bg-slate-950 text-white rounded-2xl text-[9px] font-black uppercase text-center flex items-center justify-center gap-2 shadow-lg italic tracking-widest">Visit <ExternalLink size={12}/></a>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl relative overflow-hidden group">
            <div className="flex justify-between items-start mb-8 relative z-10">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic"><Landmark size={14} className="inline mr-2 text-violet-600" /> Bank Account</h4>
              <button onClick={openEditModal} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-violet-600 transition-all shadow-sm"><Edit3 size={14} /></button>
            </div>
            <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 text-center relative z-10">
              {bankData?.bank_name !== 'Belum Diatur' ? (
                <div>
                  <p className="text-[11px] font-black text-violet-600 uppercase mb-2 italic">{bankData.bank_name}</p>
                  <p className="text-2xl font-black text-slate-950 tracking-tighter mb-2">{bankData.account_number}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase italic">{bankData.account_name}</p>
                </div>
              ) : (
                <div><AlertCircle size={32} className="mx-auto text-slate-200 mb-4" /><p className="text-[9px] font-black text-slate-400 uppercase">No bank account set</p></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* WITHDRAW MODAL */}
      <AnimatePresence>
        {isWithdrawModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[4rem] p-12 max-w-md w-full border-4 border-slate-950">
              <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-950 mb-10 text-left">Withdraw</h3>
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100 mb-8">
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-3 text-left">Nominal (IDR)</label>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-slate-300">Rp</span>
                  <input type="number" className="bg-transparent border-none w-full text-4xl font-black text-slate-950 outline-none" placeholder="0" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
                </div>
              </div>
              <button onClick={handleWithdraw} className="w-full py-5 bg-slate-950 text-white rounded-[2rem] font-black uppercase italic text-[11px] tracking-widest shadow-2xl hover:bg-violet-600 transition-all">Confirm Withdrawal</button>
              <button onClick={() => setIsWithdrawModalOpen(false)} className="w-full py-4 font-black uppercase text-[9px] text-slate-400 hover:text-slate-600 transition-colors mt-2 italic">Cancel</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
export default EarningsView;