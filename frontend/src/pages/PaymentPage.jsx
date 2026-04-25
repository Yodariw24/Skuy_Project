import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { CheckCircle2, QrCode, ArrowRight } from 'lucide-react'

function PaymentPage() {
  const { donationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // Kita panggil fungsi update status yang sudah kita buat di backend tadi!
      await api.put(`/donations/${donationId}/status`, { status: 'SUCCESS' });
      alert("Pembayaran Berhasil! Saldo kreator akan bertambah. 🔥");
      navigate(-1); // Balik ke halaman kreator
    } catch (err) {
      alert("Gagal konfirmasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-violet-100 text-violet-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <QrCode size={40} />
        </div>
        <h2 className="text-2xl font-black italic uppercase italic mb-2">Selesaikan Pembayaran</h2>
        <p className="text-slate-400 text-sm mb-8">Silakan scan QRIS di bawah ini untuk mengirim dukungan.</p>
        
        {/* Simulasi Gambar QRIS */}
        <div className="bg-slate-100 aspect-square rounded-3xl mb-8 flex items-center justify-center border-4 border-dashed border-slate-200">
           <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SkuyGG-Payment" alt="QRIS" />
        </div>

        <button 
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-violet-600 text-white font-black py-5 rounded-2xl shadow-lg hover:bg-violet-700 transition-all flex items-center justify-center gap-3"
        >
          {loading ? 'Processing...' : 'SAYA SUDAH BAYAR'} <CheckCircle2 size={20} />
        </button>
      </div>
    </div>
  )
}

export default PaymentPage