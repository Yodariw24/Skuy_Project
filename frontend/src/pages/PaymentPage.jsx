import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios' 
import { CheckCircle2, QrCode, Loader2, ShieldCheck, Zap } from 'lucide-react'
import Swal from 'sweetalert2'

function PaymentPage() {
  const { donationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // --- LOGIKA VERIFIKASI SULTAN (Sync Railway) ---
  const handleConfirm = async () => {
    setLoading(true);
    try {
      // ✅ SINKRON: Update status donasi ke SUCCESS via backend
      const res = await api.put(`/api/donations/status/${donationId}`, {
        status: 'SUCCESS'
      });

      if (res.data.success) {
        Swal.fire({
          title: 'ENERGY RECEIVED! 🚀',
          text: 'Energi donasi berhasil disalurkan ke pangkalan data Sultan!',
          icon: 'success',
          customClass: {
            popup: 'rounded-[3rem] border-4 border-slate-950 shadow-[12px_12px_0px_0px_#10B981]',
            confirmButton: 'bg-slate-950 text-white px-10 py-4 rounded-2xl font-black uppercase italic text-xs tracking-widest'
          },
          buttonsStyling: false
        }).then(() => {
            navigate(-1); 
        });
      }
    } catch (err) {
      console.error("Verification error:", err);
      // Fallback untuk mode development
      Swal.fire({
        title: 'NODE SIMULATION',
        text: 'Backend tidak merespon, menyimulasikan transaksi sukses...',
        icon: 'info',
        confirmButtonColor: '#7C3AED'
      }).then(() => navigate(-1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-[20px_20px_0px_0px_#F1F5F9] border-4 border-slate-950 max-w-md w-full text-center relative overflow-hidden">
        
        {/* Sultan Header Decor */}
        <div className="absolute top-0 left-0 w-full h-4 bg-violet-600 border-b-4 border-slate-950" />
        
        <div className="flex justify-center mb-8">
            <div className="relative">
                <div className="w-24 h-24 bg-violet-50 text-violet-600 rounded-[2.5rem] flex items-center justify-center border-4 border-slate-950 shadow-[6px_6px_0px_0px_#000]">
                    <QrCode size={48} strokeWidth={2.5} />
                </div>
                <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-2 rounded-full border-4 border-slate-950">
                    <ShieldCheck size={18} strokeWidth={3} />
                </div>
            </div>
        </div>

        <div className="space-y-2 mb-10">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-950 leading-none">Gate: <span className="text-violet-600">Secure</span></h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] italic">Encrypted QRIS Protocol v2.3</p>
        </div>
        
        {/* QRIS Container Neo-Brutalism */}
        <div className="bg-white p-6 rounded-[3rem] mb-12 border-4 border-slate-950 shadow-[10px_10px_0px_0px_#F1F5F9] relative group">
           <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=skuy-donation-${donationId}&bgcolor=ffffff&color=0f172a`} 
            alt="QRIS Protocol" 
            className="w-full aspect-square object-contain rounded-2xl group-hover:scale-95 transition-transform duration-500"
           />
           <div className="mt-6 flex items-center justify-center gap-2">
              <Zap size={14} className="text-amber-500 animate-pulse" fill="currentColor" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Instant Node Activation</span>
           </div>
        </div>

        <div className="space-y-5">
          <button 
            onClick={handleConfirm}
            disabled={loading}
            className="w-full bg-slate-950 text-white font-black py-6 rounded-[2rem] shadow-[0_8px_0_0_#475569] hover:bg-violet-600 transition-all flex items-center justify-center gap-4 active:translate-y-2 active:shadow-none text-xs uppercase italic tracking-[0.2em] border-2 border-white/10"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Verify Payload <CheckCircle2 size={20} /></>}
          </button>
          
          <button 
            onClick={() => navigate(-1)}
            disabled={loading}
            className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] hover:text-rose-500 transition-colors italic"
          >
            Abort Transaction
          </button>
        </div>

        {/* Security Footer */}
        <div className="mt-10 pt-8 border-t-2 border-slate-100 flex items-center justify-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Secure Socket Layer Active</span>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage;