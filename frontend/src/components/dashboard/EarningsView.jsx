import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios' 
import { 
  Copy, ExternalLink, Eye, EyeOff, Edit3, Landmark, ChevronDown, 
  Wallet, ArrowUpRight, Clock, Link as LinkIcon, 
  History, ArrowDownLeft, Info, AlertCircle, RefreshCw, Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'

function EarningsView({ user, balance, showBalance, setShowBalance, bankData, openEditModal }) {
  const [filter, setFilter] = useState('Semua')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await api.get(`/wallet/history/${user.id}`);
      
      if (res.data && Array.isArray(res.data.history)) {
        setTransactions(res.data.history);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.warn("History empty or node sync issues, Ri.");
      setTransactions([]); 
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchHistory(); }, [user?.id]);

  const filteredTransactions = (Array.isArray(transactions) ? transactions : []).filter(tx => {
    if (filter === 'Semua') return true;
    if (filter === 'Donasi Masuk') return tx.type === 'IN' || tx.type === 'donation';
    if (filter === 'Penarikan Saldo') return tx.type === 'OUT' || tx.type === 'withdrawal';
    return true;
  });

  const handleWithdraw = async () => {
    if (!withdrawAmount || withdrawAmount < 10000) {
      return Swal.fire({
        title: 'DITOLAK',
        text: 'Minimal penarikan Rp 10.000, Ri!',
        icon: 'error',
        customClass: { popup: 'rounded-[2rem] border-4 border-slate-950 shadow-[8px_8px_0px_0px_#EF4444]' }
      });
    }
    if (Number(withdrawAmount) > Number(balance)) {
      return Swal.fire({
        title: 'SALDO KURANG',
        text: 'Saldo lo gak cukup buat ditarik segitu!',
        icon: 'warning',
        customClass: { popup: 'rounded-[2rem] border-4 border-slate-950 shadow-[8px_8px_0px_0px_#F59E0B]' }
      });
    }

    try {
      await api.post('/wallet/withdraw', { userId: user.id, amount: parseInt(withdrawAmount), bank: bankData });
      Swal.fire({ 
        title: 'GACOR!', 
        text: 'Permintaan tarik saldo dikirim ke admin!', 
        icon: 'success',
        customClass: { popup: 'rounded-[2rem] border-4 border-slate-950 shadow-[8px_8px_0px_0px_#10B981]' }
      });
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      fetchHistory(); 
    } catch (err) { 
      Swal.fire('ERROR', 'Engine gagal proses penarikan.', 'error'); 
    }
  };

  const copyToClipboard = (text, message) => {
    navigator.clipboard.writeText(text);
    Swal.fire({ 
        title: 'DISALIN!', 
        text: message, 
        icon: 'success', 
        timer: 1500, 
        showConfirmButton: false,
        customClass: { popup: 'rounded-[2rem] border-4 border-slate-950 shadow-[8px_8px_0px_0px_#7C3AED]' }
    });
  };

  return (
    <div className="animate-in fade-in duration-700 max-w-5xl mx-auto pb-24 px-2 font-sans text-left">
      
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 px-2">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <Zap size={16} className="text-violet-600 animate-pulse" fill="currentColor" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Financial Node Controller</p>
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-slate-950 leading-none">My <span className="text-violet-600">Wallet</span></h1>
        </div>
        <button 
          onClick={() => setIsWithdrawModalOpen(true)} 
          className="w-full md:w-auto bg-slate-950 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase italic tracking-widest hover:bg-violet-600 shadow-[8px_8px_0px_0px_rgba(124,58,237,0.3)] transition-all flex items-center justify-center gap-3 active:translate-y-1"
        >
          Withdraw Funds <ArrowUpRight size={18} strokeWidth={3} />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* CARD SALDO NEO-BRUTALISM */}
          <div className="bg-violet-600 border-4 border-slate-950 rounded-[3.5rem] p-10 text-white relative overflow-hidden shadow-[12px_12px_0px_0px_#000] group">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
               <Wallet size={180} />
            </div>
            
            <div className="relative z-10 flex flex-col justify-between min-h-[200px]">
              <div className="flex justify-between items-start">
                <div className="p-4 bg-slate-950 text-white rounded-2xl border-2 border-white/10 shadow-xl"><Wallet size={32} /></div>
                <button 
                  onClick={() => setShowBalance(!showBalance)} 
                  className="bg-slate-950/40 hover:bg-slate-950/60 backdrop-blur-md px-6 py-3 rounded-xl border-2 border-white/20 text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  {showBalance ? 'Hide Balance' : 'Show Balance'}
                </button>
              </div>
              
              <div className="mt-8">
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-violet-200 mb-3 italic">Total Available Sultan Balance</p>
                <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none">
                  {showBalance ? `Rp ${Number(balance).toLocaleString('id-ID')}` : '••••••••••'}
                </h2>
              </div>
            </div>
          </div>

          {/* HISTORY SECTION */}
          <div className="bg-white rounded-[3.5rem] border-4 border-slate-950 shadow-[12px_12px_0px_0px_#F1F5F9] overflow-hidden">
            <div className="p-8 md:p-12 border-b-4 border-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-50/50">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-slate-950 text-white rounded-2xl shadow-lg"><History size={24} /></div>
                <div>
                  <h3 className="font-black text-slate-950 text-2xl uppercase italic tracking-tighter leading-none mb-2">Transaction Logs</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Real-time cloud flow monitoring</p>
                </div>
              </div>

              <div className="relative">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)} 
                  className="w-full md:w-56 flex items-center justify-between gap-3 bg-white border-4 border-slate-950 px-6 py-4 rounded-2xl text-[11px] font-black text-slate-950 uppercase transition-all hover:bg-slate-50 shadow-[4px_4px_0px_0px_#000]"
                >
                  {filter} <ChevronDown size={18} strokeWidth={3} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isFilterOpen && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-4 w-full bg-white border-4 border-slate-950 rounded-[2rem] shadow-[8px_8px_0px_0px_#000] z-50 p-3">
                      {['Semua', 'Donasi Masuk', 'Penarikan Saldo'].map((item) => (
                        <button key={item} onClick={() => { setFilter(item); setIsFilterOpen(false); }} className={`w-full text-left px-5 py-4 text-[10px] font-black uppercase rounded-xl mb-1 transition-colors ${filter === item ? 'bg-violet-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
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
                <div className="py-24 flex flex-col items-center gap-5 text-slate-300">
                  <RefreshCw size={40} className="animate-spin text-violet-600" />
                  <p className="text-[11px] font-black uppercase italic tracking-widest animate-pulse text-slate-400">Syncing with Railway...</p>
                </div>
              ) : filteredTransactions.length > 0 ? (
                <div className="space-y-6">
                  {filteredTransactions.map((tx) => (
                    <div key={tx.id} className="group flex flex-col md:flex-row md:items-center justify-between p-8 rounded-[2.5rem] bg-white border-4 border-transparent hover:border-slate-950 hover:shadow-[8px_8px_0px_0px_#F1F5F9] transition-all">
                      <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-2xl shadow-lg border-2 border-slate-950 ${tx.type === 'IN' || tx.type === 'donation' ? 'bg-emerald-500' : 'bg-rose-500'} text-white`}>
                          {tx.type === 'IN' || tx.type === 'donation' ? <ArrowDownLeft size={22} strokeWidth={3} /> : <ArrowUpRight size={22} strokeWidth={3} />}
                        </div>
                        <div>
                          <p className="font-black text-slate-950 uppercase italic tracking-tighter text-base mb-1">{tx.description || tx.message || 'System Entry'}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-2 italic tracking-widest"><Clock size={12} /> {new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="text-right mt-5 md:mt-0">
                         <p className={`text-3xl font-black italic tracking-tighter ${tx.type === 'IN' || tx.type === 'donation' ? 'text-emerald-600' : 'text-slate-950'}`}>
                           {tx.type === 'IN' || tx.type === 'donation' ? '+' : '-'} Rp {Number(tx.amount).toLocaleString('id-ID')}
                         </p>
                         <p className="text-[8px] font-black uppercase text-slate-300 tracking-[0.2em] mt-1">Transaction Verified</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-32 text-center opacity-40 flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center border-4 border-dashed border-slate-200"><History size={32} className="text-slate-300" /></div>
                  <p className="text-[11px] font-black uppercase tracking-[0.5em] italic">No Transactions Recorded</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SIDEBAR RIGHT */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* PUBLIC LINK CARD */}
          <div className="bg-white rounded-[3rem] p-10 border-4 border-slate-950 shadow-[12px_12px_0px_0px_#7C3AED]">
            <h4 className="text-[11px] font-black uppercase text-slate-400 mb-8 tracking-[0.3em] flex items-center gap-3 italic">
              <LinkIcon size={16} className="text-violet-600" /> Support Node
            </h4>
            <div className="bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl mb-8 text-sm font-black text-slate-500 truncate tracking-tight uppercase italic">
              skuy.gg/<span className="text-violet-600">{user?.username}</span>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => copyToClipboard(`https://skuy-project.vercel.app/${user?.username}`, "Link Donasi Sultan Siap Disebar!")} className="w-full py-5 bg-violet-50 text-violet-600 border-2 border-violet-100 rounded-2xl text-[10px] font-black uppercase italic tracking-widest hover:bg-violet-100 transition-all">Copy Link</button>
              <a href={`/${user?.username}`} target="_blank" rel="noreferrer" className="w-full py-5 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase text-center flex items-center justify-center gap-2 shadow-xl italic tracking-widest hover:translate-y-[-2px] transition-all">Visit Page <ExternalLink size={14}/></a>
            </div>
          </div>

          {/* BANK ACCOUNT CARD */}
          <div className="bg-white rounded-[3rem] p-10 border-4 border-slate-950 shadow-[12px_12px_0px_0px_#F1F5F9] relative overflow-hidden group">
            <div className="flex justify-between items-start mb-10 relative z-10">
              <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] italic flex items-center gap-3"><Landmark size={18} className="text-violet-600" /> Payout Dest</h4>
              <button onClick={openEditModal} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-violet-600 hover:bg-violet-50 transition-all border border-transparent hover:border-violet-100 shadow-sm"><Edit3 size={16} /></button>
            </div>
            
            <div className="p-10 bg-slate-50 border-4 border-dashed border-slate-200 rounded-[2.5rem] text-center relative z-10 group-hover:bg-white group-hover:border-violet-200 transition-all">
              {bankData?.bank_name !== 'Belum Diatur' ? (
                <div className="space-y-4">
                  <div className="bg-violet-600 inline-block px-4 py-1.5 rounded-full"><p className="text-[9px] font-black text-white uppercase italic tracking-widest">{bankData.bank_name}</p></div>
                  <p className="text-3xl font-black text-slate-950 tracking-tighter">{bankData.account_number}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase italic tracking-widest border-t border-slate-100 pt-4">{bankData.account_name}</p>
                </div>
              ) : (
                <div className="py-6"><AlertCircle size={40} className="mx-auto text-slate-200 mb-5" /><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank Details Required</p></div>
              )}
            </div>
          </div>
          
        </div>
      </div>

      {/* WITHDRAW MODAL SULTAN */}
      <AnimatePresence>
        {isWithdrawModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white rounded-[4rem] p-12 max-w-md w-full border-4 border-slate-950 shadow-[20px_20px_0px_0px_#7C3AED]">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl border-2 border-violet-100"><ArrowUpRight size={24} strokeWidth={3} /></div>
                <h3 className="text-4xl font-black italic uppercase tracking-tighter text-slate-950 leading-none">Withdraw</h3>
              </div>

              <div className="bg-slate-50 p-10 rounded-[3rem] border-4 border-slate-950 mb-10 shadow-inner">
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-4 tracking-widest italic">Input Nominal (IDR)</label>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-black text-slate-300">Rp</span>
                  <input type="number" className="bg-transparent border-none w-full text-5xl font-black text-slate-950 outline-none placeholder:text-slate-200 tracking-tighter" placeholder="0" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
                </div>
              </div>

              <div className="space-y-4">
                <button onClick={handleWithdraw} className="w-full py-6 bg-slate-950 text-white rounded-[2rem] font-black uppercase italic text-xs tracking-[0.2em] shadow-2xl hover:bg-violet-600 transition-all border-4 border-slate-900 active:translate-y-1">Initialize Transfer</button>
                <button onClick={() => setIsWithdrawModalOpen(false)} className="w-full py-4 font-black uppercase text-[10px] text-slate-400 hover:text-rose-500 transition-colors italic tracking-widest">Abort Protocol</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
export default EarningsView;