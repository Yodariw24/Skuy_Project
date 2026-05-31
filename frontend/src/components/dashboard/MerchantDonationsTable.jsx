import React from 'react';
import { Layers, CheckCircle } from 'lucide-react';

export default function MerchantDonationsTable({ donations, loading }) {
  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  };

  const renderPaymentMethodBadge = (method) => {
    const cleanMethod = method ? method.toUpperCase() : 'UNKNOWN';
    if (cleanMethod.includes('QRIS')) return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-300 rounded-md text-[10px] font-black tracking-wider uppercase">🟢 QRIS LIVE</span>;
    if (cleanMethod.includes('GOPAY')) return <span className="px-2.5 py-1 bg-sky-50 text-sky-600 border border-sky-300 rounded-md text-[10px] font-black tracking-wider uppercase">🔹 GOPAY</span>;
    if (cleanMethod.includes('BCA')) return <span className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-300 rounded-md text-[10px] font-black tracking-wider uppercase">🏦 VA BCA</span>;
    if (cleanMethod.includes('BNI') || cleanMethod.includes('BRI') || cleanMethod.includes('MANDIRI')) return <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 border border-indigo-300 rounded-md text-[10px] font-black tracking-wider uppercase">🏛️ BANK VA</span>;
    return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-300 rounded-md text-[10px] font-black tracking-wider uppercase">💳 {cleanMethod}</span>;
  };

  return (
    <div className="p-6 bg-white border-4 border-slate-950 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left">
      <div className="flex items-center gap-2 mb-4">
        <Layers size={14} className="text-violet-600" />
        <h3 className="text-xs font-black uppercase tracking-wider italic text-slate-800">Isolated Settlement Feed</h3>
      </div>

      <div className="overflow-x-auto rounded-xl border-2 border-slate-950">
        <table className="w-full text-left text-xs bg-white">
          <thead>
            <tr className="bg-slate-950 text-slate-400 font-black uppercase tracking-wider border-b-2 border-slate-950">
              <th className="p-3">Reference ID</th>
              <th className="p-3">Donatur</th>
              <th className="p-3">Gross Amount</th>
              <th className="p-3">Gateway Method</th>
              <th className="p-3">Platform Fee (5%)</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100 font-mono text-[11px]">
            {loading ? (
              <tr><td colSpan="6" className="p-6 text-center text-slate-400 font-black uppercase animate-pulse">Establishing secure data tunnel...</td></tr>
            ) : donations.length === 0 ? (
              <tr><td colSpan="6" className="p-6 text-center text-slate-400 font-black uppercase italic tracking-wider">Belum ada sirkuit finansial terdeteksi, Ri!</td></tr>
            ) : (
              donations.map((donation) => (
                <tr key={donation.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-slate-900 font-bold">#{donation.id}</td>
                  <td className="p-3 text-left font-sans font-black uppercase tracking-tight text-slate-700 truncate max-w-[120px]">{donation.donatur_name}</td>
                  <td className="p-3 text-slate-800 font-black">{formatIDR(donation.gross_amount)}</td>
                  <td className="p-3 font-sans font-bold">{renderPaymentMethodBadge(donation.payment_method)}</td>
                  <td className="p-3 text-rose-500">-{formatIDR(donation.fee_amount)}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 text-emerald-600 font-sans font-black text-[10px] tracking-wider uppercase">
                      <CheckCircle size={12} className="text-emerald-500" /> SUCCESS
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}