import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, QrCode, ShieldCheck, Zap, Copy, CheckCircle2 } from 'lucide-react'
import Swal from 'sweetalert2'

function PaymentPage() {
  const { donationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  // 📡 PARSING MIDTRANS DATA: Mengambil lemparan data state dari penembakan form awal
  const donationData = location.state?.donationData;
  const qrImageUrl = donationData?.qrCodeUrl || donationData?.qr_code_url;
  const amount = donationData?.gross_amount || donationData?.amount || 0;

  useEffect(() => {
    // Jalur pengaman: Jika halaman diakses langsung tanpa data transaksi riil, tendang balik
    if (!donationData) {
      Swal.fire({
        title: 'PAYLOAD KOSONG',
        text: 'Data transaksi tidak ditemukan dalam pangkalan, Ri!',
        icon: 'error',
        confirmButtonColor: '#7C3AED'
      }).then(() => navigate(-1));
    }
  }, [donationData, navigate]);

  const handleCopyOrderId = () => {
    if (!donationId) return;
    navigator.clipboard.writeText(donationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-6 font-sans text-left selection:bg-violet-600 selection:text-white">
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
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] italic">Midtrans QRIS Engine Connection</p>
        </div>
        
        {/* REAL QRIS CANVAS FROM MIDTRANS */}
        <div className="bg-white p-6 rounded-[3rem] mb-6 border-4 border-slate-950 shadow-[10px_10px_0px_0px_#F1F5F9] relative group">
           {qrImageUrl ? (
             <img 
              src={qrImageUrl} 
              alt="Midtrans Official QRIS" 
              className="w-full aspect-square object-contain rounded-2xl group-hover:scale-102 transition-transform duration-500"
             />
           ) : (
             <div className="w-full aspect-square bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 font-mono text-[10px] uppercase font-black">Broken Node Payload</div>
           )}
        </div>

        {/* ORDER TOKEN MONITOR */}
        <div className="w-full bg-slate-950 text-white p-4 rounded-2xl border-2 border-slate-950 flex items-center justify-between font-mono text-[11px] mb-6">
            <div className="min-w-0 flex-1 text-left px-1">
                <span className="text-white/30 text-[9px] block uppercase font-sans font-black tracking-widest mb-0.5">Order Token ID</span>
                <span className="text-violet-400 font-bold tracking-tight block truncate select-all">{donationId || 'NULL'}</span>
            </div>
            <button 
                type="button"
                onClick={handleCopyOrderId}
                className={`p-2.5 rounded-xl border transition-all shrink-0 ml-3 flex items-center justify-center ${copied ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}
            >
                {copied ? <CheckCircle2 size={14} strokeWidth={3} /> : <Copy size={14} />}
            </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Total Amount</p>
              <p className="text-4xl font-black text-slate-950 tracking-tighter italic">
                  Rp {Number(amount).toLocaleString('id-ID')}
              </p>
          </div>

          {/* SIMULATOR SHORTCUT BUTTON */}
          <a 
            href="https://dashboard.sandbox.midtrans.com/welcome/simulator" 
            target="_blank" 
            rel="noreferrer"
            className="w-full bg-slate-950 text-white font-black py-5 rounded-[2rem] shadow-[0_8px_0_0_#475569] hover:bg-violet-600 transition-all flex items-center justify-center gap-3 active:translate-y-2 active:shadow-none text-xs uppercase italic tracking-[0.15em] border-2 border-white/10 text-center"
          >
            Buka Simulator Pembayaran <Zap size={16} fill="currentColor" />
          </a>
          
          <button 
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-950 transition-colors italic pt-2"
          >
            <ArrowLeft size={12} strokeWidth={4} /> Kembali ke Profil
          </button>
        </div>

        {/* Security Footer */}
        <div className="mt-10 pt-6 border-t-2 border-slate-100 flex items-center justify-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Single Source Verification Active</span>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage;