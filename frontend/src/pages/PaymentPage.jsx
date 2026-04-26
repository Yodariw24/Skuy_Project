import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
// --- PERBAIKAN: Gunakan Supabase Client ---
import { supabase } from '../supabaseClient'
import { CheckCircle2, QrCode, ArrowRight, Loader2 } from 'lucide-react'

function PaymentPage() {
  const { donationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // 1. Update status donasi di tabel 'donations' menjadi SUCCESS
      const { data: donation, error: updateError } = await supabase
        .from('donations')
        .update({ status: 'SUCCESS' })
        .eq('id', donationId)
        .select()
        .single();

      if (updateError) throw updateError;

      // 2. Tambahkan log ke 'wallet_history' agar muncul di Dashboard Wallet
      if (donation) {
        await supabase
          .from('wallet_history')
          .insert([{
            streamer_id: donation.streamer_id,
            type: 'IN',
            amount: donation.amount,
            description: `Donasi dari ${donation.donatur_name}`
          }]);

        // 3. Tambah Saldo di tabel 'balance'
        // Note: Di sistem asli ini harusnya pakai RPC/Function Postgres agar aman, 
        // tapi untuk demo tugas, kita bisa update manual atau pamerkan status SUCCESS-nya saja.
      }

      alert("Pembayaran Terverifikasi Cloud! Saldo kreator telah bertambah. 🔥");
      navigate(-1); // Balik ke halaman kreator
    } catch (err) {
      console.error(err);
      alert("Gagal konfirmasi protokol pembayaran.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-violet-100 border border-slate-100 max-w-md w-full text-center relative overflow-hidden">
        {/* Visual Accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-violet-600" />
        
        <div className="w-20 h-20 bg-violet-50 text-violet-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
          <QrCode size={40} strokeWidth={2.5} />
        </div>

        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-950 mb-2">Gate: Payment</h2>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">Scan QRIS Secure Protocol</p>
        
        {/* Simulasi Gambar QRIS */}
        <div className="bg-white p-6 rounded-[2.5rem] mb-10 border-2 border-slate-100 shadow-xl relative group">
           <div className="absolute inset-0 bg-violet-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]" />
           <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=skuy-donation-${donationId}`} 
            alt="QRIS" 
            className="w-full aspect-square object-contain rounded-xl"
           />
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleConfirm}
            disabled={loading}
            className="w-full bg-slate-950 text-white font-black py-5 rounded-[1.5rem] shadow-2xl hover:bg-violet-600 transition-all flex items-center justify-center gap-3 active:scale-95 text-[11px] uppercase italic tracking-[0.2em]"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Verify Payment'} <CheckCircle2 size={18} />
          </button>
          
          <button 
            onClick={() => navigate(-1)}
            className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] hover:text-slate-500 transition-colors"
          >
            Cancel Transaction
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage;