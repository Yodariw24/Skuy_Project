import { motion, AnimatePresence } from 'framer-motion'
import { X, Landmark, CreditCard, User, Save, ChevronDown } from 'lucide-react'

// Daftar Bank & E-Wallet (Tetap sesuai pilihanmu, Ri)
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

export default function EditBankModal({ isOpen, onClose, formData, setFormData, onSave }) {
  // Fungsi penangan submit agar tidak refresh halaman
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(e); // Memanggil fungsi onSave yang dikirim dari Dashboard (API call)
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* Background Overlay khas Skuy.gg */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" 
          />

          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 20 }} 
            className="bg-white w-full max-w-md rounded-[3rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.3)] relative z-10 overflow-hidden border-4 border-slate-950"
          >
            <div className="p-8 md:p-10">
              {/* Header Modal */}
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-violet-600 text-white rounded-xl shadow-lg">
                    <Landmark size={20} strokeWidth={3} />
                  </div>
                  <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-950 leading-none">Atur Rekening</h2>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <X size={24} strokeWidth={4} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. PILIHAN BANK (DROPDOWN) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 px-1 italic">
                    Penyedia Jasa Keuangan
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600 transition-colors pointer-events-none">
                      <Landmark size={18} />
                    </div>
                    <select 
                      required
                      className="w-full pl-12 pr-10 py-4 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none font-bold text-slate-800 focus:border-violet-600 focus:bg-white transition-all text-sm appearance-none cursor-pointer"
                      value={formData.bank_name} 
                      onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                    >
                      {BANK_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>

                {/* 2. NO REKENING */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 px-1 italic">
                    Nomor Rekening / Wallet ID
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600 transition-colors">
                      <CreditCard size={18} />
                    </div>
                    <input 
                      type="text" 
                      required 
                      placeholder="0812xxxx atau 1234xxxx" 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none font-bold text-slate-800 focus:border-violet-600 focus:bg-white transition-all text-sm" 
                      value={formData.account_number} 
                      onChange={(e) => setFormData({...formData, account_number: e.target.value})} 
                    />
                  </div>
                </div>

                {/* 3. NAMA PEMILIK */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 px-1 italic">
                    Nama Pemilik (Identitas Cloud)
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600 transition-colors">
                      <User size={18} />
                    </div>
                    <input 
                      type="text" 
                      required 
                      placeholder="Sesuai aplikasi / buku tabungan" 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none font-bold text-slate-800 focus:border-violet-600 focus:bg-white transition-all text-sm" 
                      value={formData.account_name} 
                      onChange={(e) => setFormData({...formData, account_name: e.target.value})} 
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="w-full bg-slate-950 text-white font-black py-5 rounded-[1.5rem] uppercase italic text-xs tracking-[0.2em] shadow-2xl hover:bg-violet-600 active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
                >
                  <Save size={18} /> Simpan Protokol Bank
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}