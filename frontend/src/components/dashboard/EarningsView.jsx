import { useState, useEffect } from 'react'
import { 
  Copy, ExternalLink, Eye, EyeOff, Edit3, Landmark, ChevronDown, 
  Wallet, ArrowUpRight, Clock, CheckCircle2, Link as LinkIcon, 
  History, ArrowDownLeft, ChevronRight, Info, AlertCircle, RefreshCw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api/axios'

function EarningsView({ user, balance, showBalance, setShowBalance, bankData, openEditModal }) {
  const [filter, setFilter] = useState('Semua')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  // --- FETCH DATA DARI DATABASE ---
  const fetchHistory = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await api.get(`/donations/${user.id}/wallet-history`);
      if (res.data.success) {
        setTransactions(res.data.data);
      }
    } catch (err) {
      console.error("Gagal load history:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory();
  }, [user?.id]);

  // --- LOGIKA FILTER (FIXED) ---
  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'Semua') return true;
    
    // Sesuaikan dengan data dari Backend (INCOME / OUTCOME)
    if (filter === 'Donasi Masuk') return tx.type === 'INCOME';
    if (filter === 'Penarikan Saldo') return tx.type === 'OUTCOME';
    
    // Filter status pending (Case Insensitive biar aman)
    if (filter === 'Pending') return tx.status?.toUpperCase() === 'PENDING';
    
    return true;
  });

  const handleWithdraw = async () => {
    if (!withdrawAmount || withdrawAmount < 10000) return alert("Minimal penarikan Rp 10.000");
    if (withdrawAmount > balance) return alert("Saldo tidak mencukupi!");

    try {
      const res = await api.post('/donations/withdraw', {
        streamer_id: user.id,
        amount: withdrawAmount,
        bank_info: `${bankData.bank_name} - ${bankData.account_number} (a.n ${bankData.account_name})`
      });

      if (res.data.success) {
        alert("Permintaan tarik saldo berhasil dikirim! 🚀");
        setIsWithdrawModalOpen(false);
        setWithdrawAmount('');
        fetchHistory(); 
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gagal tarik saldo ⚠️");
    }
  };

  const copyToClipboard = (text, message) => {
    navigator.clipboard.writeText(text);
    alert(message || "Berhasil disalin! 🚀");
  };

  return (
    <div className="animate-in fade-in duration-700 max-w-5xl mx-auto pb-20 px-2">
      
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-950 leading-none mb-3">
            My Wallet
          </h1>
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-8 h-[2px] bg-violet-600" />
            <p className="text-[10px] font-black uppercase tracking-widest italic">Revenue & Cashflow Control</p>
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setIsWithdrawModalOpen(true)}
          className="w-full md:w-auto bg-slate-950 text-white px-10 py-4 rounded-[2rem] font-black text-[11px] uppercase italic tracking-widest hover:bg-violet-600 shadow-2xl transition-all flex items-center justify-center gap-3"
        >
          Withdraw Funds <ArrowUpRight size={16} strokeWidth={3} />
        </motion.button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT SIDE: SALDO & HISTORY --- */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 rounded-[3.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-violet-200 border border-white/10 group">
            <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-white/10 rounded-full blur-[100px] group-hover:bg-white/20 transition-all duration-700" />
            
            <div className="relative z-10 flex flex-col justify-between min-h-[180px]">
              <div className="flex justify-between items-start">
                <div className="p-4 bg-white/10 backdrop-blur-2xl rounded-[1.5rem] border border-white/20 shadow-xl">
                  <Wallet size={28} />
                </div>
                <button onClick={() => setShowBalance(!showBalance)} className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-90">
                  {showBalance ? <EyeOff size={14} /> : <Eye size={14} />} {showBalance ? 'Hide' : 'Show'}
                </button>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-200/60 mb-2 italic">Total Available Balance</p>
                <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter truncate leading-none">
                  {showBalance ? `Rp ${Number(balance).toLocaleString('id-ID')}` : '••••••••••'}
                </h2>
              </div>
            </div>
          </div>

          {/* Transaction History Section */}
          <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="p-8 md:p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-950 text-white rounded-2xl shadow-lg"><History size={20} /></div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg uppercase italic tracking-tighter leading-none mb-1">Transaction History</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Tracking your cash flow</p>
                </div>
              </div>

              <div className="relative">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="w-full md:w-48 flex items-center justify-between gap-3 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-600 uppercase transition-all hover:bg-slate-100"
                >
                  {filter} <ChevronDown size={16} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isFilterOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-full bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-50 p-3"
                    >
                      {['Semua', 'Donasi Masuk', 'Penarikan Saldo', 'Pending'].map((item) => (
                        <button
                          key={item}
                          onClick={() => { setFilter(item); setIsFilterOpen(false); }}
                          className={`w-full text-left px-5 py-3.5 text-[10px] font-black uppercase rounded-2xl transition-all ${filter === item ? 'bg-violet-600 text-white shadow-lg shadow-violet-200' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
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
                  <p className="text-[10px] font-black uppercase tracking-widest italic">Syncing with server...</p>
                </div>
              ) : filteredTransactions.length > 0 ? (
                <div className="space-y-5">
                  {filteredTransactions.map((tx, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                      key={`${tx.type}-${tx.id}`} 
                      className="group flex flex-col md:flex-row md:items-center justify-between p-7 rounded-[2.5rem] bg-slate-50/50 border border-transparent hover:border-violet-100 hover:bg-white transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50"
                    >
                      <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-[1.5rem] shadow-lg ${tx.type === 'INCOME' ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-rose-500 text-white shadow-rose-100'}`}>
                          {tx.type === 'INCOME' ? <ArrowDownLeft size={20} strokeWidth={3} /> : <ArrowUpRight size={20} strokeWidth={3} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-black text-slate-950 uppercase italic tracking-tighter text-sm">{tx.detail || 'No Detail'}</p>
                            <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                              tx.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 
                              tx.status === 'PENDING' ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {tx.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-2">
                            <Clock size={10} /> 
                            {/* FIXED: Menggunakan created_date agar tidak Invalid Date */}
                            {tx.created_date ? new Date(tx.created_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No Date'} • {tx.type}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 text-right">
                        <p className={`text-2xl font-black tracking-tighter leading-none ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-950'}`}>
                          {tx.type === 'INCOME' ? '+' : '-'} Rp {Number(tx.amount).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center opacity-30 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200">
                    <History size={32} className="text-slate-300" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Transactions Found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: SIDEBAR --- */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 group">
            <h4 className="text-[10px] font-black uppercase text-slate-400 mb-6 tracking-widest flex items-center gap-2 italic">
              <LinkIcon size={14} className="text-violet-600" /> Public Page Link
            </h4>
            <div className="bg-slate-50 p-5 rounded-2xl mb-5 border border-slate-100 text-sm font-black text-slate-400 truncate tracking-tight">
              skuy.gg/<span className="text-violet-600">{user?.username}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => copyToClipboard(`https://skuy.gg/${user?.username}`)} className="py-4 bg-violet-50 text-violet-600 rounded-2xl text-[9px] font-black uppercase hover:bg-violet-600 hover:text-white transition-all italic tracking-widest">Copy</button>
              <a href={`/${user?.username}`} target="_blank" className="py-4 bg-slate-950 text-white rounded-2xl text-[9px] font-black uppercase text-center flex items-center justify-center gap-2 shadow-lg shadow-slate-200 transition-all hover:bg-violet-600 italic tracking-widest">Open <ExternalLink size={12}/></a>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:opacity-100 transition-all" />
            <div className="flex justify-between items-start mb-8 relative z-10">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 italic">
                <Landmark size={14} className="text-violet-600" /> Payout Destination
              </h4>
              <button onClick={openEditModal} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-violet-600 hover:bg-violet-100 transition-all border border-slate-100 active:scale-90 shadow-sm"><Edit3 size={14} /></button>
            </div>
            <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 group-hover:bg-white group-hover:border-violet-200 transition-all duration-500 relative z-10">
              {bankData.bank_name !== 'Belum Diatur' ? (
                <div className="text-center">
                  <div className="mb-4 inline-block bg-emerald-500 text-white text-[7px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-emerald-100">Ready for Payout</div>
                  <p className="text-[11px] font-black text-violet-600 uppercase mb-2 italic tracking-tighter">{bankData.bank_name}</p>
                  <p className="text-2xl font-black text-slate-950 tracking-tighter mb-2 leading-none">{bankData.account_number}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{bankData.account_name}</p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <AlertCircle size={32} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-[9px] font-black text-slate-400 uppercase leading-relaxed mb-4">No bank account<br/>set up yet</p>
                  <button onClick={openEditModal} className="text-[9px] font-black text-violet-600 uppercase tracking-widest hover:underline">Setup Now</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isWithdrawModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[4rem] p-12 max-w-md w-full shadow-[0_40px_100px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-600 to-fuchsia-600" />
              <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-950 mb-2 leading-none">Withdraw</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase mb-10 tracking-widest italic">Payout minimum: Rp 10.000</p>
              <div className="space-y-8">
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 group focus-within:border-violet-600 focus-within:bg-white transition-all shadow-inner">
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-3 tracking-widest italic">Nominal (IDR)</label>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-slate-300">Rp</span>
                    <input 
                      type="number" className="bg-transparent border-none w-full text-4xl font-black text-slate-950 outline-none placeholder:text-slate-200"
                      placeholder="0" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                  </div>
                </div>
                <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex gap-4">
                   <div className="bg-amber-500 text-white p-2.5 rounded-xl h-fit shadow-lg shadow-amber-200"><Info size={18}/></div>
                   <div>
                      <p className="text-[9px] font-black text-amber-800 uppercase tracking-widest mb-1 italic">Withdrawal Info</p>
                      <p className="text-[10px] text-slate-900 font-bold uppercase leading-relaxed">
                        Sent to: {bankData.bank_name} • {bankData.account_number} <br/>
                        <span className="text-slate-400">a.n {bankData.account_name}</span>
                      </p>
                   </div>
                </div>
                <div className="flex flex-col gap-3 pt-4">
                  <button onClick={handleWithdraw} className="w-full py-5 bg-slate-950 text-white rounded-[2rem] font-black uppercase italic text-[11px] shadow-2xl hover:bg-violet-600 transition-all active:scale-95 tracking-widest">Confirm Withdrawal</button>
                  <button onClick={() => setIsWithdrawModalOpen(false)} className="w-full py-4 font-black uppercase text-[9px] text-slate-400 hover:text-slate-600 transition-colors tracking-widest italic">Cancel</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EarningsView;