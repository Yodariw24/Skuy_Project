import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, ArrowRight, Mail } from 'lucide-react';
import { printDonaturReceipt } from '../utils/receiptPrinter';
import api from '../api/axios';

export default function DonationSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [donationData, setDonationData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ambil order_id dari URL parameter yang dilempar Midtrans/Frontend setelah payment
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const getTransactionDetail = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        // Tarik data rill transaksi dari database PostgreSQL Railway lo buat struk
        const res = await api.get(`/donations/status/${orderId}`);
        if (res.data.success) {
          setDonationData(res.data.data);
        }
      } catch (err) {
        console.error("🔥 Gagal memuat data kwitansi:", err.message);
      } finally {
        setLoading(false);
      }
    };

    getTransactionDetail();
  }, [orderId]);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black animate-pulse text-slate-600 uppercase tracking-wider">Verifying payment block status...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans antialiased">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center">
        
        {/* ICON BERKILAU SUCCESS */}
        <div className="flex justify-center mb-5 text-emerald-500">
          <CheckCircle size={64} strokeWidth={2.5} className="animate-bounce" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dukungan Berhasil Dikirim!</h1>
        <p className="text-sm text-slate-500 mt-2 px-4">
          Terima kasih banyak, Sultan! Kontribusi lo sudah tersalurkan dan langsung mengaktifkan alert live streamer.
        </p>

        {/* NOTIFIKASI EMAIL JALUR 2 INFO BOX */}
        <div className="mt-5 p-4 bg-violet-50 rounded-2xl border border-violet-100 flex items-center gap-3 text-left">
          <Mail size={20} className="text-violet-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-violet-900">Salinan Struk Telah Dikirim</p>
            <p className="text-[11px] text-violet-700 mt-0.5">Sistem otomatis mengirimkan kwitansi resmi ke email lo.</p>
          </div>
        </div>

        {/* REVENUE RINGKASAN MINI */}
        {donationData && (
          <div className="my-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-2">
            <div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Order ID</span><span className="font-mono font-bold text-slate-800">#{donationData.id}</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Donatur</span><span className="font-bold text-slate-800 uppercase text-[11px]">{donationData.donatur_name}</span></div>
            <div className="flex justify-between text-xs border-t pt-2 mt-2"><span className="text-slate-700 font-bold">Total Bayar</span><span className="font-mono font-extrabold text-emerald-600 text-sm">Rp {(donationData.gross_amount || donationData.amount)?.toLocaleString('id-ID')}</span></div>
          </div>
        )}

        {/* ACTION BUTTON CONTROLS */}
        <div className="space-y-3 mt-6">
          <button
            onClick={() => printDonaturReceipt(donationData)}
            disabled={!donationData}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3.5 px-6 rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            <Download size={16} /> Unduh Kwitansi Resmi (.PDF)
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-1.5 bg-transparent hover:bg-slate-100 text-slate-600 font-bold text-xs py-2.5 rounded-xl transition-all"
          >
            Kembali ke Beranda <ArrowRight size={12} />
          </button>
        </div>

      </div>
    </div>
  );
}