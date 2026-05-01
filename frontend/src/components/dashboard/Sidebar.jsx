import React, { useState } from 'react';
import { Wallet, LogIn, Activity, Tv, LogOut, User, Moon, Zap, ChevronRight, ShieldCheck, Bell, Target, Video, Trophy, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

function Sidebar({ activeMenu, setActiveMenu, activeSubMenu, setActiveSubMenu, user, navigate }) {
  const isCreator = user?.role === 'creator' || user?.role === 'streamer';
  const overlayTabs = ['tip', 'mediashare', 'milestone', 'leaderboard'];
  
  const [isOverlayOpen, setIsOverlayOpen] = useState(overlayTabs.includes(activeSubMenu));

  const handleShowTips = () => {
    const tipsData = [
      "🛡️ <b>Protokol 2FA:</b> Jaga saldo dari pembajakan sekarang.",
      "💰 <b>Strategi Cuan:</b> Pasang link donasi di deskripsi stream.",
      "⏰ <b>Jam Otomatis:</b> Mode 'Otomatis' agar OTP tidak error.",
      "🏦 <b>Withdrawal:</b> Pencairan dana 1-3 hari kerja."
    ];
    const randomTip = tipsData[Math.floor(Math.random() * tipsData.length)];
    
    // Pakai Swal langsung biar konsisten pro
    Swal.fire({
      title: 'SKUY TIPS 💡',
      html: `<div className="text-left font-bold italic text-slate-600">${randomTip}</div>`,
      icon: 'info',
      customClass: {
        popup: 'rounded-[2rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]',
        confirmButton: 'bg-violet-600 text-white px-8 py-3 rounded-xl font-black uppercase italic'
      },
      buttonsStyling: false
    });
  };

  // --- PERBAIKAN: Logout Bersih Tanpa Supabase ---
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
        popup: 'rounded-[2rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]',
        title: 'text-xl font-black italic uppercase tracking-tighter',
        confirmButton: 'bg-red-500 text-white text-[10px] font-black px-8 py-3 rounded-xl mx-2 uppercase italic',
        cancelButton: 'bg-slate-100 text-slate-400 text-[10px] font-black px-8 py-3 rounded-xl mx-2 uppercase italic'
      }
    });

    if (result.isConfirmed) {
      // Bersihkan semua jejak login dari Railway
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.clear(); 
      
      navigate('/auth');
    }
  };

  const NavButton = ({ id, icon: Icon, label, badge, disabled, onClickCustom, isSub }) => {
    const isActive = isSub ? activeSubMenu === id : activeMenu === id;
    const isLocked = disabled;
    
    return (
      <button 
        onClick={() => {
          if (isLocked) return;
          if (onClickCustom) onClickCustom();
          else {
            if (isSub) setActiveSubMenu(id);
            else setActiveMenu(id);
          }
        }}
        disabled={isLocked}
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
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 overflow-hidden font-sans shadow-sm">
      <div className="p-8 flex items-center gap-3.5 group cursor-default">
        <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-violet-100 group-hover:rotate-12 transition-all duration-500">
          <Zap size={18} fill="currentColor" />
        </div>
        <span className="font-black italic text-xl tracking-tighter text-slate-950 uppercase">SKUY<span className="text-violet-600">.GG</span></span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-7 custom-scrollbar">
        <div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em] mb-3 px-4 italic select-none">Revenue Control</p>
          <nav className="space-y-1">
            <NavButton id="wallet" icon={Wallet} label="My Wallet" disabled={!isCreator} />
            <NavButton id="tips" icon={LogIn} label="Tips Masuk" onClickCustom={handleShowTips} />
          </nav>
        </div>

        <div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em] mb-3 px-4 italic select-none">Live Tools</p>
          <nav className="space-y-1">
            <NavButton id="activity" icon={Activity} label="Activity Feed" badge="LIVE" disabled={!isCreator} />
            <NavButton 
              id="overlay" 
              icon={Tv} 
              label="Overlay Setup" 
              onClickCustom={() => {
                setIsOverlayOpen(!isOverlayOpen);
                setActiveMenu('overlay');
                if (!overlayTabs.includes(activeSubMenu)) setActiveSubMenu('tip');
              }} 
            />
            <AnimatePresence>
              {isOverlayOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden ml-6 border-l-2 border-slate-50 mt-1"
                >
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
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em] mb-3 px-4 italic select-none">Preferences</p>
          <nav className="space-y-1">
            <NavButton id="profile" icon={User} label="Profile Edit" />
            <NavButton id="security" icon={ShieldCheck} label="Security (2FA)" />
            <NavButton id="appearance" icon={Palette} label="Appearance" />
          </nav>
        </div>
      </div>

      <div className="p-6 mt-auto border-t border-slate-100 bg-slate-50/30">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm mb-4 group cursor-pointer hover:border-violet-200 transition-all" onClick={() => setActiveMenu('profile')}>
          <div className="w-10 h-10 rounded-xl bg-violet-50 overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
             <img 
              src={user?.profile_picture} 
              alt="Avatar" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}` }}
             />
          </div>
          <div className="overflow-hidden">
            <p className="text-[11px] font-black text-slate-900 truncate uppercase leading-tight">{user?.full_name || user?.username}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 ${isCreator ? 'bg-green-500' : 'bg-slate-300'} rounded-full animate-pulse`} />
              <p className="text-[8px] text-violet-500 font-black uppercase tracking-widest italic">{isCreator ? 'Live Creator' : 'Member'}</p>
            </div>
          </div>
        </div>
        
        <button onClick={logout} className="w-full flex items-center gap-2 text-slate-400 hover:text-red-500 font-black text-[10px] uppercase transition-all px-3 group">
          <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" /> Sign Out System
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;