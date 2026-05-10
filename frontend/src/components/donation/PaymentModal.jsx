import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import Swal from 'sweetalert2';
import { QrCode, X, ShieldCheck, Zap } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, donationData }) {
    if (!isOpen || !donationData) return null;

    const handleSimulateSuccess = async () => {
        try {
            // 🎯 TRIGGER PROTOKOL: Simulasi Pembayaran Sukses
            const res = await api.put(`/donations/status/${donationData.id}`, { 
                status: 'SUCCESS' 
            });
            
            if (res.data.success) {
                Swal.fire({
                    title: 'TRANSMISI BERHASIL! 🚀',
                    text: 'Energi donasi sudah terkirim. Cek Dashboard lo, Ri!',
                    icon: 'success',
                    timer: 2500,
                    showConfirmButton: false,
                    background: '#fff',
                    color: '#000',
                    iconColor: '#7C3AED',
                    customClass: {
                        popup: 'rounded-[2rem] border-4 border-slate-950'
                    }
                });
                onClose(); // Tutup modal setelah sukses
            }
        } catch (err) {
            console.error("Payment Simulation Error:", err);
            Swal.fire("Gagal", "Node Railway tidak merespon.", "error");
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white rounded-[3.5rem] p-10 max-w-sm w-full text-center shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-4 border-slate-950 relative overflow-hidden"
                >
                    {/* Aksesoris Sultan */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600"></div>
                    
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-950 transition-colors"
                    >
                        <X size={24} strokeWidth={3} />
                    </button>

                    <div className="flex justify-center mb-6">
                        <div className="bg-violet-50 p-4 rounded-3xl text-violet-600 border-2 border-violet-100">
                            <QrCode size={32} strokeWidth={2.5} />
                        </div>
                    </div>

                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2 italic">Secure Payment Node</h2>
                    <h1 className="text-2xl font-black italic uppercase mb-2 text-slate-950 tracking-tighter">
                        {donationData.donatur_name}
                    </h1>
                    <p className="text-slate-400 text-xs font-bold mb-8">@{donationData.donatur_email}</p>

                    {/* 📸 QR CODE SIMULATOR INTERACTIVE */}
                    <div 
                        onClick={handleSimulateSuccess}
                        className="group relative cursor-pointer"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[3rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        
                        <div className="relative bg-white p-6 rounded-[2.5rem] border-4 border-slate-100 group-hover:border-slate-950 transition-all duration-300 shadow-inner">
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=SKUYGG-${donationData.id}`} 
                                alt="QR Code"
                                className="w-full aspect-square rounded-2xl grayscale group-hover:grayscale-0 transition-all duration-500"
                            />
                            
                            {/* Overlay Hover */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[2.2rem] p-6">
                                <Zap size={40} className="text-violet-400 mb-2 animate-bounce" fill="currentColor" />
                                <p className="text-white font-black text-xs uppercase tracking-widest italic">Klik untuk Konfirmasi</p>
                                <p className="text-violet-400 font-bold text-[9px] mt-1 uppercase tracking-tighter">Simulasi Bayar Sultan</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 space-y-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Total Amount</p>
                            <p className="text-4xl font-black text-slate-950 tracking-tighter italic">
                                Rp {Number(donationData.amount).toLocaleString('id-ID')}
                            </p>
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 py-3 px-6 bg-emerald-50 text-emerald-600 rounded-2xl border-2 border-emerald-100 w-fit mx-auto">
                            <ShieldCheck size={16} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Encrypted SSL Connection</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}