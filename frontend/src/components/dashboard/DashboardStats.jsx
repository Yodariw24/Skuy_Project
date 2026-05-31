import React from 'react';
import { Users, DollarSign, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "backOut" } }
};

export default function DashboardStats({ globalStats }) {
  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <motion.div variants={cardVariants} className="p-6 bg-white border-4 border-slate-950 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-b-violet-600 flex items-center justify-between group">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Merchant Nodes</p>
          <h3 className="text-4xl font-black italic mt-1 text-slate-900">{globalStats?.total_users || 0} <span className="text-xs text-slate-400 font-bold not-italic">Accounts</span></h3>
        </div>
        <div className="p-4 bg-violet-50 rounded-xl border-2 border-slate-950 text-violet-600 shadow-[2px_2px_0px_0px_#000]"><Users size={24} strokeWidth={2.5} /></div>
      </motion.div>

      <motion.div variants={cardVariants} className="p-6 bg-white border-4 border-slate-950 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-b-emerald-600 flex items-center justify-between group">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Net Gross Platform Margin (5%)</p>
          <h3 className="text-4xl font-black italic mt-1 text-emerald-600">{formatIDR(globalStats?.total_revenue)}</h3>
        </div>
        <div className="p-4 bg-emerald-50 rounded-xl border-2 border-slate-950 text-emerald-600 shadow-[2px_2px_0px_0px_#000]"><DollarSign size={24} strokeWidth={2.5} /></div>
      </motion.div>

      <motion.div variants={cardVariants} className="p-6 bg-white border-4 border-slate-950 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-b-amber-600 flex items-center justify-between group">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Liquidity Payout Queue</p>
          <h3 className="text-4xl font-black italic mt-1 text-amber-400">{globalStats?.pending_withdrawals || 0} <span className="text-xs text-slate-400 font-bold not-italic">Requests</span></h3>
        </div>
        <div className="p-4 bg-amber-50 rounded-xl border-2 border-slate-950 text-amber-600 shadow-[2px_2px_0px_0px_#000]"><Landmark size={24} strokeWidth={2.5} /></div>
      </motion.div>
    </div>
  );
}