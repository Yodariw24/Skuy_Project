import React from 'react';

export default function MerchantDonationsTable({ donations, loading }) {
  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  };

  const renderPaymentMethodBadge = (m) => {
    const method = m ? m.toUpperCase() : 'MIDTRANS_SNAP';
    if (method.includes('QRIS')) {
      return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-300 rounded-md text-[10px] font-black tracking-wider uppercase">🟢 QRIS</span>;
    }
    if (method.includes('GOPAY')) {
      return <span className="px-2.5 py-1 bg-sky-50 text-sky-600 border border-sky-300 rounded-md text-[10px] font-black tracking-wider uppercase">🔹 GOPAY</span>;
    }
    if (method.includes('ALFAMART')) {
      return <span className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-300 rounded-md text-[10px] font-black tracking-wider uppercase">🏪 ALFAMART</span>;
    }
    return <span className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-300 rounded-md text-[10px] font-black tracking-wider uppercase">🏦 BANK TRANSFER</span>;
  };

  const renderStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'SUCCESS' || s === 'SETTLEMENT') {
      return <span className="px-2 py-1 bg-emerald-100 text-emerald-800 border-2 border-emerald-800 font-sans font-black text-[9px] rounded-md uppercase tracking-wider shadow-[1px_1px_0px_0px_#1e4620]">Success</span>;
    }
    if (s === 'PENDING') {
      return <span className="px-2 py-1 bg-amber-100 text-amber-800 border-2 border-amber-800 font-sans font-black text-[9px] rounded-md uppercase tracking-wider shadow-[1px_1px_0px_0px_#78350f]">Pending</span>;
    }
    return <span className="px-2 py-1 bg-rose-100 text-rose-800 border-2 border-rose-800 font-sans font-black text-[9px] rounded-md uppercase tracking-wider shadow-[1px_1px_0px_0px_#4c0519]">{s || 'FAILED'}</span>;
  };

  return (
    <div className="p-6 bg-white border-4 border-slate-950 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="overflow-x-auto rounded-xl border-2 border-slate-950">
        <table className="w-full text-left text-xs bg-white">
          <thead>
            <tr className="bg-slate-950 text-slate-400 font-black uppercase border-b-2 border-slate-950 text-[10px] tracking-wider">
              <th className="p-3">Date & Time</th>
              <th className="p-3">Order ID</th>
              <th className="p-3">Transaction Type</th>
              <th className="p-3">Channel</th>
              <th className="p-3">Customer E-mail</th>
              <th className="p-3">Customer Name</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100 font-mono text-[11px]">
            {loading ? (
              <tr><td colSpan="8" className="p-6 text-center text-slate-400 font-black uppercase animate-pulse">Menghubungkan Radar Midtrans...</td></tr>
            ) : donations.length === 0 ? (
              <tr><td colSpan="8" className="p-6 text-center text-slate-400 font-black uppercase italic">Belum Ada Transaksi Tercatat!</td></tr>
            ) : (
              donations.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-sans text-slate-500 font-medium">
                    {new Date(tx.created_date || tx.created_at).toLocaleString('id-ID', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'})}
                  </td>
                  <td className="p-3 text-slate-900 font-bold">#{tx.id}</td>
                  <td className="p-3 font-sans font-bold text-slate-400 uppercase text-[10px]">Payment</td>
                  <td className="p-3 font-sans">{renderPaymentMethodBadge(tx.payment_method)}</td>
                  <td className="p-3 text-slate-600 truncate max-w-[130px] font-sans font-medium">{tx.donatur_email || 'donor@skuy.gg'}</td>
                  <td className="p-3 text-slate-800 font-bold font-sans uppercase truncate max-w-[130px]">{tx.donatur_name || 'Hamba Allah'}</td>
                  <td className="p-3">
                    {renderStatusBadge(tx.status)}
                  </td>
                  <td className="p-3 text-emerald-700 font-black text-right text-sm font-mono">{formatIDR(tx.gross_amount || tx.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}