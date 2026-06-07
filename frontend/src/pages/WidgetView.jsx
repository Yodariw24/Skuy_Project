import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import DonationAlert from '../components/dashboard/DonationAlert';

export default function WidgetView() {
  // Tangkap parameter dari URL (misal: /widget/ariwirayuda/tip)
  const { username, type } = useParams();
  const [streamerData, setStreamerData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // 🌐 SULTAN OBS HACK: Bikin body HTML jadi transparan penuh biar di OBS gak ada background putih
    document.body.style.backgroundColor = 'transparent';
    document.body.style.backgroundImage = 'none'; // Kalo lo pake background image di index.css
    
    const initWidget = async () => {
      try {
        // Panggil endpoint public untuk nyari streamer_id dari username di URL
        const res = await api.get(`/donations/profile/${username}`);
        
        if (res.data.success) {
          setStreamerData(res.data.data);
        } else {
          setError('Sultan Node tidak ditemukan.');
        }
      } catch (err) {
        setError('Gagal sinkronisasi dengan Server Railway.');
      }
    };
    
    initWidget();

    return () => {
       // Cleanup kembalikan background jika komponen unmount (jarang terjadi di OBS)
       document.body.style.backgroundColor = '';
       document.body.style.backgroundImage = '';
    };
  }, [username]);

  // --- RENDER ERROR ---
  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-transparent">
        <div className="bg-rose-500 text-white p-5 rounded-2xl border-4 border-slate-950 font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0px_0px_#000]">
          {error}
        </div>
      </div>
    );
  }

  // --- RENDER LOADING (WHITESCREEN TRANSPARAN) ---
  // Sengaja dibikin null/transparan biar pas OBS baru loading gak muncul kedip putih
  if (!streamerData) {
    return <div className="w-screen h-screen bg-transparent" />;
  }

  // --- RENDER ENGINE BERDASARKAN TIPE WIDGET ---
  return (
    <div className="w-screen h-screen bg-transparent overflow-hidden relative font-sans">
      {/* 1. Tipe: Tip Alert */}
      {type === 'tip' && (
        <DonationAlert streamerId={streamerData.id} />
      )}
      
      {/* 2. Tipe: Milestone (Coming Soon) */}
      {type === 'milestone' && (
         <div className="absolute bottom-5 right-5 text-white/50 text-[10px] font-black uppercase tracking-widest bg-black/40 px-4 py-2 rounded-xl backdrop-blur-md">
            Milestone Tracker Standby...
         </div>
      )}
    </div>
  );
}