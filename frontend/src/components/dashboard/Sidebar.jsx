import React, { useState, useEffect } from 'react';
import { Wallet, LogIn, Activity, Tv, LogOut, User, Zap, ChevronRight, ShieldCheck, Bell, Target, Video, Trophy, Palette, ShieldAlert, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

function Sidebar({ activeMenu, setActiveMenu, activeSubMenu, setActiveSubMenu, user, navigate }) {
  const role = user?.role?.toLowerCase();
  const isCreator = role === 'creator' || role === 'streamer' || role === 'admin';
  const isSecured = user?.is_two_fa_enabled; 
  
  const overlayTabs = ['tip', 'mediashare', 'milestone', 'leaderboard'];
  const [isOverlayOpen, setIsOverlayOpen] = useState(overlayTabs.includes(activeSubMenu));

  const handleShowTips = () => {
    const tipsData = [
      "🛡️ <b>Dual-OTP:</b> Pastikan nomor WA lo aktif biar kode login lancar jaya.",
      "💰 <b>Strategi Cuan:</b> Pasang link donasi di deskripsi stream lo, Ri!",
      "🎨 <b>Appearance:</b> Ganti tema ke Violet-Pink biar dashboard makin Sultan.",
      "🏦 <b>Pencairan:</b> Saldo donasi sekarang bisa cair lebih cepet via E-Wallet."
    ];
    const randomTip = tipsData[Math.floor(Math.random() * tipsData.length)];
    
    Swal.fire({
      title: 'SKUY TIPS 💡',
      html: `<div class="text-left font-bold italic text-slate-600 leading-relaxed">${randomTip}</div>`,
      icon: 'info',
      customClass: {
        popup: 'rounded-[2rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#7C3AED]',
        confirmButton: 'bg-violet-600 text-white px-8 py-3 rounded-xl font-black uppercase italic'
      },
      buttonsStyling: false
    });
  };

  const logout = async () => {
    const result = await Swal.fire({
      title: 'KELUAR SESI?',
      text: "Sesi koding dan dashboard akan ditutup, Ri.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'KELUAR',
      cancelButtonText: 'BATAL',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-[2rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#FF1493]',
        title: 'text-xl font-black italic uppercase tracking-tighter',
        confirmButton: 'bg-red-500 text-white text-[10px] font-black px-8 py-3 rounded-xl mx-2 uppercase italic',
        cancelButton: 'bg-slate-100 text-slate-400 text-[10px] font-black px-8 py-3 rounded-xl mx-2 uppercase italic'
      }
    });

    if (result.isConfirmed) {
      localStorage.clear(); 
      navigate('/auth');
    }
  };

  const NavButton = ({ id, icon: Icon, label, badge, disabled, onClickCustom, isSub }) => {
    const isActive = isSub ? activeSubMenu === id : activeMenu === id;
    const isLocked = disabled; 
    
    return (
      <button 
        type="button"
        onClick={() => {
          if (isLocked) return;
          if (onClickCustom) onClickCustom();
          else {
            if (isSub) setActiveSubMenu(id);
            else setActiveMenu(id);
          }
        }}
        className={`w-full flex items-center justify-between transition-all duration-300 relative group ${
          isSub ? 'px-4 py-2 mt-1' : 'px-4 py-3 rounded-2xl'
        } ${
          isActive 
            ? 'text-violet-600' 
            : isLocked ? 'opacity-30 cursor-not-allowed' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        {isActive && !isSub && (
          <motion.div layoutId="activePill" className="absolute inset-0 bg-violet-50/50 rounded-2xl -z-0" />
        )}

        <div className="flex items-center gap-3.5 relative z-10">
          <div className={`p-1 rounded-lg ${isActive ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
            <Icon size={isSub ? 15 : 19} strokeWidth={isActive ? 3 : 2.5} />
          </div>
          <span className={`${isSub ? 'text-[10px]' : 'text-[12.5px]'} font-black uppercase tracking-tight ${isActive ? 'italic' : ''}`}>
            {label}
          </span>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          {badge && !isActive && <span className="text-[8px] bg-green-100 text-green-600 px-2 py-0.5 rounded-md font-black tracking-widest animate-pulse">{badge}</span>}
          {isActive && !isSub && (
             <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}>
               <ChevronRight size={14} strokeWidth={4} className="opacity-40" />
             </motion.div>
          )}
        </div>
      </button>
    );
  };

  return (
    <aside className="w-64 bg-white border-r-4 border-slate-950 flex flex-col h-screen sticky top-0 overflow-hidden font-sans text-left shadow-[4px_0px_0px_0px_rgba(0,0,0,0.05)]">
      {/* HEADER LOGO */}
      <div className="p-8 flex items-center gap-3.5 group cursor-default">
        <div className="w-10 h-10 bg-violet-600 border-2 border-slate-950 rounded-xl flex items-center justify-center text-white shadow-[4px_4px_0px_0px_#000] group-hover:rotate-6 transition-all duration-300">
          <Zap size={20} fill="currentColor" />
        </div>
        <span className="font-black italic text-2xl tracking-tighter text-slate-950 uppercase">SKUY<span className="text-violet-600">.GG</span></span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-7 custom-scrollbar pt-4 text-left">
        <div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em] mb-4 px-4 italic">Revenue Hub</p>
          <nav className="space-y-1">
            <NavButton id="wallet" icon={Wallet} label="My Wallet" disabled={!isCreator} />
            <NavButton id="tips" icon={LogIn} label="Tips Sultan" onClickCustom={handleShowTips} />
          </nav>
        </div>

        <div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em] mb-4 px-4 italic">Stream Ops</p>
          <nav className="space-y-1">
            <NavButton id="activity" icon={Activity} label="Activity Feed" badge="LIVE" disabled={!isCreator} />
            <NavButton id="overlay" icon={Tv} label="Overlay Setup" disabled={!isCreator} onClickCustom={() => { setIsOverlayOpen(!isOverlayOpen); setActiveMenu('overlay'); }} />
            <AnimatePresence>
              {isOverlayOpen && isCreator && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden ml-6 border-l-4 border-slate-100 mt-1 pl-2">
                  <NavButton id="tip" icon={Bell} label="Tip Alert" isSub />
                  <NavButton id="mediashare" icon={Video} label="Mediashare" isSub />
                  <NavButton id="milestone" icon={Target} label="Milestone" isSub />
                  <NavButton id="leaderboard" icon={Trophy} label="Leaderboard" isSub />
                </motion.div>
              )}
            </AnimatePresence>
          </nav>
        </div>

        <div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em] mb-4 px-4 italic">Settings</p>
          <nav className="space-y-1">
            <NavButton id="profile" icon={User} label="Profile Edit" />
            <NavButton id="security" icon={isSecured ? ShieldCheck : MessageSquare} label={isSecured ? "Security Active" : "Security (WA)"} />
            <NavButton id="appearance" icon={Palette} label="Appearance" />
          </nav>
        </div>
      </div>

      {/* USER PROFILE CARD - SULTAN POLISHED */}
      <div className="p-5 mt-auto border-t-4 border-slate-100 bg-slate-50/50">
        <div 
          className={`flex items-center gap-3 p-3 rounded-2xl border-4 border-slate-950 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-4 group cursor-pointer transition-all active:translate-y-1 active:shadow-none ${
            isSecured ? 'bg-emerald-50 border-emerald-500 shadow-emerald-500/20' : 'bg-white'
          }`}
          onClick={() => setActiveMenu('profile')}
        >
          <div className={`w-11 h-11 rounded-xl bg-violet-100 overflow-hidden border-2 border-slate-950 flex-shrink-0 transition-transform group-hover:scale-105`}>
             <img src={user?.profile_picture} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}` }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black text-slate-900 truncate uppercase italic tracking-tight">
              {user?.display_name || user?.full_name || user?.username}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isSecured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <p className={`text-[8px] font-black uppercase tracking-widest italic truncate ${isSecured ? 'text-emerald-600' : 'text-slate-400'}`}>
                {isSecured ? 'SECURED SULTAN' : 'UNSECURED'}
              </p>
            </div>
          </div>
        </div>
        
        <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-red-500 font-black text-[9px] uppercase transition-all group py-1.5 tracking-widest">
          <LogOut size={12} className="group-hover:-translate-x-1 transition-transform" /> Sign Out Protocol
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;