import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Wallet, LogIn, Activity, Tv, LogOut, User, Zap, 
  ChevronRight, ShieldCheck, Bell, Target, Video, 
  Trophy, Palette, MessageSquare 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

function Sidebar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ SYNC LOGIC PATH ROUTING: Ambil segmen rute URL secara akurat
  const pathSegments = location.pathname.split('/');
  const activeId = pathSegments[2] || 'wallet';

  const role = user?.role?.toLowerCase();
  const isCreator = role === 'creator' || role === 'streamer' || role === 'admin';
  const isSecured = user?.is_two_fa_enabled; 
  
  const overlayTabs = ['tip', 'mediashare', 'milestone', 'leaderboard'];
  const [isOverlayOpen, setIsOverlayOpen] = useState(overlayTabs.includes(activeId));

  // Otomatis buka accordion overlay jika user merefresh halaman saat berada di sub-menu
  useEffect(() => {
    if (overlayTabs.includes(activeId)) {
      setIsOverlayOpen(true);
    }
  }, [activeId]);

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
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-[2rem] border-4 border-slate-950 bg-white shadow-[8px_8px_0px_0px_#000]',
        confirmButton: 'bg-violet-600 text-white px-8 py-3 rounded-xl font-black uppercase italic border-2 border-slate-950'
      }
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
        popup: 'rounded-[2rem] border-4 border-slate-950 bg-white shadow-[8px_8px_0px_0px_#000]',
        confirmButton: 'bg-rose-500 text-white text-[10px] font-black px-8 py-3 rounded-xl mx-2 uppercase italic border-2 border-slate-950',
        cancelButton: 'bg-slate-100 text-slate-400 text-[10px] font-black px-8 py-3 rounded-xl mx-2 uppercase italic border-2 border-transparent'
      }
    });

    if (result.isConfirmed) {
      localStorage.clear(); 
      navigate('/auth');
    }
  };

  const NavButton = ({ id, icon: Icon, label, badge, disabled, onClickCustom, isSub }) => {
    const isActive = activeId === id;
    const isLocked = disabled; 
    
    return (
      <button 
        type="button"
        disabled={isLocked}
        onClick={() => {
          if (isLocked) return;
          if (onClickCustom) onClickCustom();
          else navigate(`/dashboard/${id}`); 
        }}
        className={`w-full flex items-center justify-between transition-all duration-300 relative group ${
          isSub ? 'px-6 py-2.5 my-0.5 rounded-xl' : 'px-4 py-3 rounded-2xl'
        } ${
          isActive 
            ? 'text-violet-600 bg-violet-50/60' 
            : isLocked ? 'opacity-30 cursor-not-allowed' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
        }`}
      >
        <div className="flex items-center gap-3.5 relative z-10">
          <div className={`p-1 rounded-lg ${isActive ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
            <Icon size={isSub ? 16 : 19} strokeWidth={isActive ? 3 : 2.5} />
          </div>
          <span className={`${isSub ? 'text-[11px]' : 'text-[12.5px]'} font-black uppercase tracking-tight ${isActive ? 'italic' : ''}`}>
            {label}
          </span>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          {badge && !isActive && (
            <span className="text-[8px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-md font-black tracking-widest animate-pulse border border-emerald-200">
              {badge}
            </span>
          )}
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
      <div className="p-8 flex items-center gap-3.5 group cursor-pointer" onClick={() => navigate('/dashboard')}>
        <div className="w-10 h-10 bg-violet-600 border-2 border-slate-950 rounded-xl flex items-center justify-center text-white shadow-[4px_4px_0px_0px_#000] group-hover:rotate-6 transition-all duration-300">
          <Zap size={20} fill="currentColor" />
        </div>
        <span className="font-black italic text-2xl tracking-tighter text-slate-950 uppercase">SKUY<span className="text-violet-600">.GG</span></span>
      </div>

      {/* NAVIGATION SECTION */}
      <div className="flex-1 overflow-y-auto px-4 space-y-7 pt-4 text-left custom-scrollbar">
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
            <NavButton 
              id="overlay" 
              icon={Tv} 
              label="Overlay Setup" 
              disabled={!isCreator} 
              onClickCustom={() => setIsOverlayOpen(!isOverlayOpen)} 
            />
            <AnimatePresence initial={false}>
              {isOverlayOpen && isCreator && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }} 
                  className="overflow-hidden ml-4 border-l-4 border-slate-100 mt-1 pl-1"
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
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em] mb-4 px-4 italic">Settings</p>
          <nav className="space-y-1">
            <NavButton id="profile" icon={User} label="Profile Edit" />
            <NavButton id="security" icon={isSecured ? ShieldCheck : MessageSquare} label={isSecured ? "Security Active" : "Security (WA)"} />
            <NavButton id="appearance" icon={Palette} label="Appearance" />
          </nav>
        </div>
      </div>

      {/* USER PROFILE CARD */}
      <div className="p-5 mt-auto border-t-4 border-slate-100 bg-slate-50/50">
        <div 
          className={`flex items-center gap-3 p-3 rounded-2xl border-4 border-slate-950 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-4 group cursor-pointer transition-all active:translate-y-1 active:shadow-none ${
            isSecured ? 'bg-emerald-50/60 border-emerald-500 shadow-emerald-500/10' : 'bg-white'
          }`}
          onClick={() => navigate('/dashboard/profile')}
        >
          <div className="w-11 h-11 rounded-xl bg-violet-100 overflow-hidden border-2 border-slate-950 flex-shrink-0 transition-transform group-hover:scale-105">
             <img 
               src={user?.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'Sultan'}`} 
               alt="Avatar" 
               className="w-full h-full object-cover" 
               onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'Sultan'}` }} 
             />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black text-slate-900 truncate uppercase italic tracking-tight">
              {user?.display_name || user?.full_name || user?.username || 'Sultan User'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isSecured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <p className={`text-[8px] font-black uppercase tracking-widest italic truncate ${isSecured ? 'text-emerald-600' : 'text-slate-400'}`}>
                {isSecured ? 'SECURED SULTAN' : 'UNSECURED'}
              </p>
            </div>
          </div>
        </div>
        
        <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-rose-500 font-black text-[9px] uppercase transition-all group py-1.5 tracking-widest">
          <LogOut size={12} className="group-hover:-translate-x-1 transition-transform" /> Sign Out Protocol
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;