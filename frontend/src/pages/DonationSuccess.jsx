import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Printer, Home } from 'lucide-react';
import api from '../api/axios';
import { printDonaturReceipt } from '../utils/receiptPrinter';

function DonationSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    api.get(`/donations/status/${orderId}`)
      .then(res => {
        if (res.data.success) {
          setData(res.data.data);
        }
      })
      .catch(err => {
        console.error("Gagal menarik data struk:", err);
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFF]">
        <div className="w-16 h-16 border-8 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFF] text-center p-6">
        <h2 className="text-3xl font-black uppercase italic text-rose-500 mb-4">Struk Tidak Ditemukan</h2>
        <p className="text-slate-500 font-bold mb-8">Data transaksi tidak valid atau referensi ID struk terputus, Ri!</p>
        <Link to="/" className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:-translate-y-1 transition-all">Kembali ke Markas</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 font-sans flex flex-col items-center justify-center p-6 selection:bg-emerald-100">
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="max-w-xl w-full bg-white p-10 rounded-[3rem] border-4 border-slate-950 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] text-center relative overflow-hidden"
      >
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
          className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-slate-950 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
        >
          <CheckCircle2 size={48} strokeWidth={3} className="text-white" />
        </motion.div>

        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-950 mb-2">Transmisi Sukses!</h1>
        <p className="text-slate-500 font-bold mb-10">Energi dukungan berhasil masuk ke kantong Sultan.</p>

        <div className="bg-slate-50 rounded-[2rem] p-6 mb-10 border-2 border-slate-100 text-left space-y-4 shadow-inner">
          <div className="flex justify-between items-center border-b-2 border-slate-100 pb-4"><span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Order ID</span><span className="font-black text-slate-900 font-mono text-sm">#{data.id}</span></div>
          <div className="flex justify-between items-center border-b-2 border-slate-100 pb-4"><span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Nominal</span><span className="font-black text-emerald-500 text-xl">Rp {Number(data.gross_amount || data.amount).toLocaleString('id-ID')}</span></div>
          <div className="flex justify-between items-center"><span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Sender</span><span className="font-black text-slate-900">{data.donatur_name}</span></div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button onClick={() => printDonaturReceipt(data)} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-black py-5 px-6 rounded-2xl uppercase tracking-widest transition-all active:translate-y-1 active:shadow-none border-4 border-slate-950 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-3">
            <Printer size={20} strokeWidth={3} /> Cetak Struk
          </button>
          <Link to="/" className="flex-1 bg-slate-100 hover:bg-white text-slate-900 font-black py-5 px-6 rounded-2xl uppercase tracking-widest transition-all active:translate-y-1 active:shadow-none border-4 border-slate-950 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-3">
            <Home size={20} strokeWidth={3} /> Hub Utama
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default DonationSuccess;