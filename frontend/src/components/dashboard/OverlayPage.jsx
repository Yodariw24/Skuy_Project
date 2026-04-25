import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, ExternalLink, Bell, BarChart3, Users, PlayCircle, Settings2, Sparkles } from 'lucide-react';
import Swal from 'sweetalert2';

const OverlayPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('alert');
  
  // State untuk Live Preview (Pembaruan)
  const [minDonation, setMinDonation] = useState(5000);
  const [goalTitle, setGoalTitle] = useState("Beli Mic Baru");

  const overlayUrl = `https://skuy.gg/widget/alert/${user?.id || 'id-rahasia'}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(overlayUrl);
    Swal.fire({
      title: 'URL COPIED!',
      text: 'Tempel link ini di Browser Source OBS kamu.',
      icon: 'success',
      confirmButtonColor: '#7c3aed',
      customClass: {
        popup: 'rounded-[2rem] border-4 border-slate-950 shadow-[8px_8px_0px_#0f172a]'
      }
    });
  };

  const tabs = [
    { id: 'alert', label: 'Alert Box', icon: Bell, desc: 'Notifikasi donasi real-time' },
    { id: 'milestone', label: 'Milestone', icon: BarChart3, desc: 'Target & Goal bar' },
    { id: 'mediashare', label: 'Media Share', icon: PlayCircle, desc: 'Request video dari penonton' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Users, desc: 'Top supporter di layar' },
  ];

  return (
    <div className="p-6 md:p-10 bg-white min-h-screen">
      {/* HEADER SECTION */}
      <header className="mb-10 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-violet-600 text-white rounded-lg shadow-[4px_4px_0px_#0f172a] border-2 border-slate-950">
              <Settings2 size={20} />
            </div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-950">
              Overlay <span className="text-violet-600">Command Center</span>
            </h1>
          </div>
          <p className="text-slate-500 font-bold text-sm max-w-2xl">
            Atur elemen visual streaming kamu dalam satu pusat kendali.
          </p>
        </div>
        {/* Update: Indikator Koneksi */}
        <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-full border-2 border-slate-950 shadow-[4px_4px_0px_#7c3aed]">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-[9px] font-black text-white uppercase italic tracking-widest">Socket Online</span>
        </div>
      </header>

      {/* ALERT URL BOX */}
      <section className="mb-12 bg-violet-50 border-4 border-slate-950 p-6 rounded-[2.5rem] shadow-[10px_10px_0px_#0f172a] relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] opacity-10 rotate-12">
          <Sparkles size={120} className="text-violet-600" />
        </div>
        
        <div className="relative z-10">
          <h3 className="text-sm font-black text-slate-950 uppercase italic mb-4 flex items-center gap-2">
            <ExternalLink size={16} /> OBS Browser Source URL
          </h3>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 bg-white border-2 border-slate-950 p-4 rounded-2xl font-mono text-xs text-slate-400 flex items-center justify-between overflow-hidden">
              <span className="truncate mr-4 italic">******************************************</span>
              <button onClick={copyToClipboard} className="bg-slate-950 text-white px-4 py-2 rounded-xl font-black text-[10px] hover:bg-violet-600 transition-colors flex items-center gap-2">
                <Copy size={12} /> COPY LINK
              </button>
            </div>
            <button className="bg-white border-2 border-slate-950 px-6 py-4 rounded-2xl font-black text-xs uppercase hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0px_#0f172a] active:translate-y-1 active:shadow-none">
              Launch Preview
            </button>
          </div>
          <p className="mt-4 text-[10px] text-violet-700 font-bold italic">
            * JANGAN PERNAH MEMBERIKAN LINK INI KEPADA SIAPAPUN.
          </p>
        </div>
      </section>

      {/* MODULAR WIDGET TABS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <nav className="lg:col-span-4 space-y-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left p-5 rounded-[1.8rem] border-4 transition-all flex items-center gap-4 ${
                activeTab === tab.id 
                ? 'bg-slate-950 border-slate-950 text-white shadow-[6px_6px_0px_#7c3aed] -translate-y-1' 
                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
              }`}
            >
              <div className={`p-3 rounded-xl ${activeTab === tab.id ? 'bg-violet-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                <tab.icon size={20} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase italic leading-none mb-1">{tab.label}</h4>
                <p className={`text-[9px] font-bold ${activeTab === tab.id ? 'text-violet-200' : 'text-slate-400'}`}>
                  {tab.desc}
                </p>
              </div>
            </button>
          ))}
        </nav>

        {/* TAB CONTENT AREA */}
        <main className="lg:col-span-8 bg-slate-50 border-4 border-slate-950 rounded-[2.5rem] p-8 flex flex-col xl:flex-row gap-8">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="h-full">
                {activeTab === 'alert' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-black italic uppercase text-slate-950">Konfigurasi Alert Box</h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Minimal Donasi Alert (Rp)</label>
                        <input 
                          type="number" 
                          value={minDonation}
                          onChange={(e) => setMinDonation(e.target.value)}
                          className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-violet-600 outline-none font-black text-sm" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'milestone' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-black italic uppercase text-slate-950">Goal Bar Settings</h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Judul Target</label>
                        <input 
                          type="text" 
                          value={goalTitle}
                          onChange={(e) => setGoalTitle(e.target.value)}
                          className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-violet-600 outline-none font-black text-sm" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(activeTab === 'mediashare' || activeTab === 'leaderboard') && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Sparkles size={40} className="text-slate-300 mb-4 animate-pulse" />
                    <h3 className="text-lg font-black italic uppercase text-slate-400">Next Roadmap</h3>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pembaruan: Mini Preview Side-by-Side */}
          <div className="w-full xl:w-64 bg-white border-2 border-slate-950 rounded-[1.5rem] p-6 flex flex-col items-center justify-center shadow-[4px_4px_0px_#0f172a] relative overflow-hidden">
            <span className="absolute top-2 left-3 text-[8px] font-black text-slate-300 italic uppercase">Preview</span>
            
            {activeTab === 'alert' && (
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-center">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-3 border border-violet-200">
                  <Sparkles size={20} className="text-violet-600" />
                </div>
                <p className="text-[10px] font-black italic uppercase leading-none">Dukungan Masuk</p>
                <p className="text-xs font-black text-violet-600 mt-1">Rp {Number(minDonation).toLocaleString('id-ID')}</p>
              </motion.div>
            )}

            {activeTab === 'milestone' && (
              <div className="w-full text-center">
                <p className="text-[10px] font-black italic uppercase mb-2 truncate px-2">{goalTitle}</p>
                <div className="w-full h-3 bg-slate-100 border border-slate-950 rounded-full overflow-hidden">
                  <div className="w-[60%] h-full bg-violet-600" />
                </div>
                <p className="text-[8px] font-black text-slate-400 mt-2 italic">60% COMPLETED</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default OverlayPage;