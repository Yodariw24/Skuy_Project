import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, ShieldCheck, Zap, Copy, CheckCircle2, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function PaymentModal({ isOpen, onClose, donationData }) {
    const [copied, setCopied] = useState(false);

    if (!isOpen || !donationData) return null;

    // 📡 PARSING VARIABLE: Ambil payload murni hasil cetak QRIS Midtrans dari Controller kita
    const qrImageUrl = donationData?.qrCodeUrl || donationData?.qr_code_url;
    const orderId = donationData?.id || donationData?.orderId;
    const amount = donationData?.gross_amount || donationData?.amount || 0;

    const handleCopyOrderId = () => {
        if (!orderId) return;
        navigator.clipboard.writeText(orderId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);

        // Notifikasi popup kecil premium biar user tahu token berhasil disalin
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });
        Toast.fire({
            icon: 'success',
            title: 'Order ID Berhasil Disalin, Ri!'
        });
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-sans">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white rounded-[3.5rem] p-10 max-w-sm w-full text-center shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-4 border-slate-950 relative overflow-hidden"
                >
                    {/* Aksesoris Sultan */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600"></div>
                    
                    {/* BUTTON CLOSE */}
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

                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2 italic">Secure Midtrans Gateway</h2>
                    <h1 className="text-2xl font-black italic uppercase mb-2 text-slate-950 tracking-tighter truncate px-2">
                        {donationData.donatur_name || 'Sultan User'}
                    </h1>
                    <p className="text-slate-400 text-xs font-bold mb-8 truncate px-4">
                        {donationData.donatur_email || 'donor@skuy.gg'}
                    </p>

                    {/* 📸 QR CODE RECHARTS CANVAS (SINKRON MIDTRANS URL) */}
                    <div className="group relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[3rem] blur-xl opacity-20 group-hover:opacity-30 transition duration-500"></div>
                        
                        <div className="relative bg-white p-6 rounded-[2.5rem] border-4 border-slate-100 shadow-inner overflow-hidden flex items-center justify-center min-h-[260px]">
                            {qrImageUrl ? (
                                <img 
                                    src={qrImageUrl} 
                                    alt="Midtrans QRIS Canvas"
                                    className="w-full aspect-square rounded-2xl transition-all duration-500"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-slate-300 py-12">
                                    <Loader2 className="animate-spin text-violet-600 mb-3" size={32} />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic animate-pulse">Generating Live QRIS...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 🔑 TOKEN COPIER LAYOUT (UNTUK INPUT SIMULATOR BAYAR SANDBOX) */}
                    <div className="w-full bg-slate-950 text-white p-4 rounded-2xl border-2 border-slate-950 flex items-center justify-between font-mono text-[11px] mt-6">
                        <div className="min-w-0 flex-1 text-left px-1">
                            <span className="text-white/30 text-[9px] block uppercase font-sans font-black tracking-widest mb-0.5">Order Token ID</span>
                            <span className="text-violet-400 font-bold tracking-tight block truncate select-all">{orderId || 'FETCHING_ID...'}</span>
                        </div>
                        <button 
                            type="button"
                            onClick={handleCopyOrderId}
                            disabled={!orderId}
                            className={`p-2.5 rounded-xl border transition-all shrink-0 ml-3 flex items-center justify-center ${copied ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}
                        >
                            {copied ? <CheckCircle2 size={14} strokeWidth={3} /> : <Copy size={14} />}
                        </button>
                    </div>

                    {/* METRIK NOMINAL UTAMA */}
                    <div className="mt-6 space-y-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Total Amount</p>
                            <p className="text-4xl font-black text-slate-950 tracking-tighter italic">
                                Rp {Number(amount).toLocaleString('id-ID')}
                            </p>
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 py-2.5 px-5 bg-emerald-50 text-emerald-600 rounded-2xl border-2 border-emerald-100 w-fit mx-auto">
                            <ShieldCheck size={14} strokeWidth={3} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Midtrans Sandbox Secured</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}