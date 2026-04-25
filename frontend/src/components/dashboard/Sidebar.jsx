import { Wallet, LogIn, Activity, Tv, LogOut, User, Moon, Zap, ChevronRight, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import Swal from 'sweetalert2'
import { skuyAlert } from '../../utils/alerts' // 1. IMPORT ALERT PROFESIONAL KITA

function Sidebar({ activeMenu, setActiveMenu, user, navigate }) {
  const isCreator = user?.role === 'creator';

  // --- LOGIC TIPS MASUK (DIPERBARUI KE SKUYALERT) ---
  const handleShowTips = () => {
    const tipsData = [
      "🛡️ <b>Protokol 2FA:</b> Aktifkan keamanan ganda untuk menjaga saldo dari pembajakan.",
      "💰 <b>Strategi Cuan:</b> Pasang link donasi di deskripsi stream agar pendukung mudah nyawer.",
      "⏰ <b>Jam Otomatis:</b> Pastikan waktu di HP mode 'Otomatis' agar kode OTP tidak error.",
      "🏦 <b>Withdrawal:</b> Pencairan dana diproses 1-3 hari kerja. Sabar adalah kunci!"
    ];
    
    const randomTip = tipsData[Math.floor(Math.random() * tipsData.length)];

    // Menggunakan skuyAlert agar konsisten di Top-End
    skuyAlert('SKUY TIPS 💡', randomTip, 'info');
  };

  // --- LOGIC LOGOUT (PERSONAL & PROFESIONAL) ---
 const logout = async () => {
  const result = await Swal.fire({
    title: 'KELUAR SESI?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Keluar',
    cancelButtonText: 'Batal',
    width: '300px', // Ukuran mungil, sangat elegan
    buttonsStyling: false,
    customClass: {
      popup: 'rounded-[24px] p-6 border border-slate-100',
      title: 'text-xs font-black uppercase tracking-widest',
      confirmButton: 'bg-slate-950 text-white text-[9px] font-black px-5 py-2 rounded-lg mx-1',
      cancelButton: 'bg-slate-100 text-slate-400 text-[9px] font-black px-5 py-2 rounded-lg mx-1'
    }
  });

  if (result.isConfirmed) {
    const name = user?.full_name?.split(' ')[0] || "User";
    await skuyAlert("SELESAI", `Sampai jumpa, ${name}!`, "info");
    
    localStorage.clear();
    navigate('/auth');
  }
};

  const NavButton = ({ id, icon: Icon, label, badge, disabled, onClickCustom }) => {
    const isActive = activeMenu === id;
    const isLocked = disabled;
    
    return (
      <button 
        onClick={() => {
          if (isLocked) return;
          if (onClickCustom) {
            onClickCustom();
          } else {
            setActiveMenu(id);
          }
        }}
        disabled={isLocked}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 relative group ${
          isActive 
            ? 'text-violet-600' 
            : isLocked ? 'opacity-30 cursor-not-allowed grayscale' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        {isActive && (
          <motion.div 
            layoutId="activeIndicator"
            className="absolute left-0 w-1 h-5 bg-violet-600 rounded-r-full z-20"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}

        {isActive && (
          <motion.div 
            layoutId="activePill"
            className="absolute inset-0 bg-violet-50/50 rounded-2xl -z-0"
            transition={{ duration: 0.2 }}
          />
        )}

        <div className="flex items-center gap-3.5 relative z-10">
          <div className={`p-1 rounded-lg transition-colors ${isActive ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
            <Icon size={19} strokeWidth={isActive ? 3 : 2.5} />
          </div>
          <span className={`text-[12.5px] font-black uppercase tracking-tight ${isActive ? 'italic' : ''}`}>
            {label}
          </span>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          {badge && !isActive && !isLocked && (
            <span className="text-[8px] bg-green-100 text-green-600 px-2 py-0.5 rounded-md font-black tracking-widest animate-pulse">
              {badge}
            </span>
          )}
          {isActive && (
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
      
      <div className="p-8">
        <div className="flex items-center gap-3.5 group cursor-default">
          <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-violet-100 group-hover:rotate-12 transition-all duration-500">
            <Zap size={18} fill="currentColor" />
          </div>
          <span className="font-black italic text-xl tracking-tighter text-slate-950 uppercase select-none">
            SKUY<span className="text-violet-600">.GG</span>
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-8 custom-scrollbar">
        <div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em] mb-4 px-4 italic select-none">Revenue Control</p>
          <nav className="space-y-1">
            <NavButton id="wallet" icon={Wallet} label="My Wallet" disabled={!isCreator} />
            <NavButton id="tips" icon={LogIn} label="Tips Masuk" onClickCustom={handleShowTips} />
          </nav>
        </div>

        <div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em] mb-4 px-4 italic select-none">Live Tools</p>
          <nav className="space-y-1">
            <NavButton id="activity" icon={Activity} label="Activity Feed" badge="LIVE" disabled={!isCreator} />
            <NavButton id="overlay" icon={Tv} label="Overlay Setup" />
          </nav>
        </div>

        <div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em] mb-4 px-4 italic select-none">Preferences</p>
          <nav className="space-y-1">
            <NavButton id="profile" icon={User} label="Profile Edit" />
            <NavButton id="security" icon={ShieldCheck} label="Security (2FA)" />
            <NavButton id="appearance" icon={Moon} label="Appearance" />
          </nav>
        </div>
      </div>

      <div className="p-6 mt-auto border-t border-slate-50 bg-slate-50/50">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm mb-4 group cursor-pointer hover:border-violet-200 transition-all" onClick={() => setActiveMenu('profile')}>
          <div className="w-10 h-10 rounded-xl bg-violet-50 overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
             <img 
              src={user?.profile_picture} 
              alt="Avatar" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => { 
                e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}` 
              }}
             />
          </div>
          <div className="overflow-hidden">
            <p className="text-[11px] font-black text-slate-900 truncate uppercase leading-tight">
              {user?.full_name || user?.username}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 ${isCreator ? 'bg-green-500' : 'bg-slate-300'} rounded-full animate-pulse`} />
              <p className="text-[8px] text-violet-500 font-black uppercase tracking-widest italic">
                {isCreator ? 'Live Creator' : 'Member'}
              </p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={logout} 
          className="w-full flex items-center gap-2 text-slate-400 hover:text-red-500 font-black text-[10px] uppercase transition-all px-3 group"
        >
          <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          Sign Out System
        </button>
      </div>
    </aside>
  )
}

export default Sidebar;