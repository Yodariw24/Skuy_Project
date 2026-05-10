import { motion, AnimatePresence } from 'framer-motion'
import { X, Landmark, CreditCard, User, Save, ChevronDown, Loader2, ShieldCheck } from 'lucide-react'

const BANK_OPTIONS = [
  { label: '-- Pilih Bank / E-Wallet --', value: '' },
  { label: 'BCA (Bank Central Asia)', value: 'BCA' },
  { label: 'Mandiri', value: 'MANDIRI' },
  { label: 'BNI (Bank Negara Indonesia)', value: 'BNI' },
  { label: 'BRI (Bank Rakyat Indonesia)', value: 'BRI' },
  { label: 'BSI (Bank Syariah Indonesia)', value: 'BSI' },
  { label: 'DANA', value: 'DANA' },
  { label: 'GoPay', value: 'GOPAY' },
  { label: 'OVO', value: 'OVO' },
  { label: 'ShopeePay', value: 'SHOPEEPAY' },
]

export default function EditBankModal({ isOpen, onClose, formData, setFormData, onSave, loading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.bank_name) return;
    onSave(e); 
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 font-sans">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={!loading ? onClose : null} 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" 
          />

          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 30 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 30 }} 
            className="bg-white w-full max-w-md rounded-[3.5rem] shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] relative z-10 overflow-hidden border-4 border-slate-950"
          >
            <div className="p-8 md:p-12 text-left">
              <div className="flex justify-between items-start mb-10">
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="text-violet-600" size={16} />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Secure Vault Protocol</p>
                  </div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-950 leading-none">Payout <span className="text-violet-600">Setup</span></h2>
                </div>
                <button 
                  onClick={onClose} 
                  disabled={loading}
                  className="p-3 text-slate-300 hover:text-slate-950 hover:bg-slate-50 rounded-2xl transition-all disabled:opacity-0"
                >
                  <X size={24} strokeWidth={4} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. PILIHAN BANK */}
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">
                    Financial Provider
                  </label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600 transition-colors pointer-events-none">
                      <Landmark size={20} strokeWidth={2.5} />
                    </div>
                    <select 
                      required
                      disabled={loading}
                      className="w-full pl-14 pr-12 py-5 bg-slate-50 border-4 border-slate-100 rounded-[1.8rem] outline-none font-bold text-slate-950 focus:border-slate-950 focus:bg-white transition-all text-sm appearance-none cursor-pointer"
                      value={formData.bank_name || ''} 
                      onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                    >
                      {BANK_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <ChevronDown size={18} strokeWidth={3} />
                    </div>
                  </div>
                </div>

                {/* 2. NO REKENING - ✅ FIX NAME */}
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">
                    Account / Wallet ID
                  </label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600 transition-colors">
                      <CreditCard size={20} strokeWidth={2.5} />
                    </div>
                    <input 
                      type="text" 
                      required 
                      disabled={loading}
                      placeholder="0812xxxx / 1234xxxx" 
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border-4 border-slate-100 rounded-[1.8rem] outline-none font-bold text-slate-950 focus:border-slate-950 focus:bg-white transition-all text-sm" 
                      value={formData.bank_account_number || ''} // ✅ SINKRON DENGAN DB
                      onChange={(e) => setFormData({...formData, bank_account_number: e.target.value.replace(/\D/g, '')})} 
                    />
                  </div>
                </div>

                {/* 3. NAMA PEMILIK - ✅ FIX NAME */}
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">
                    Account Holder Name
                  </label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600 transition-colors">
                      <User size={20} strokeWidth={2.5} />
                    </div>
                    <input 
                      type="text" 
                      required 
                      disabled={loading}
                      placeholder="NAMA SESUAI REKENING" 
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border-4 border-slate-100 rounded-[1.8rem] outline-none font-bold text-slate-950 focus:border-slate-950 focus:bg-white transition-all text-sm uppercase italic" 
                      value={formData.bank_account_name || ''} // ✅ SINKRON DENGAN DB
                      onChange={(e) => setFormData({...formData, bank_account_name: e.target.value.toUpperCase()})} 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-slate-950 text-white font-black py-6 rounded-[2rem] uppercase italic text-xs tracking-[0.25em] shadow-[0_8px_0_0_#475569] active:translate-y-1 active:shadow-none hover:bg-violet-600 transition-all flex items-center justify-center gap-4 mt-6"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                  {loading ? 'DEPLOYING DATA...' : 'SAVE BANK PROTOCOL'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}