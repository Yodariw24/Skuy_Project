import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion' // ✅ FIXED: Diimpor ke sini agar terbebas dari ReferenceError!
import api from '../../api/axios' 
import * as Icon from 'lucide-react' 
import EditBankModal from './EditBankModal' 
import Swal from 'sweetalert2'

const FormInput = ({ label, iconName, helpText, textArea, ...props }) => {
  const IconComp = Icon[iconName] || Icon.HelpCircle;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 px-1 text-left">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] block">{label}</label>
        {helpText && <span className="text-[9px] text-violet-500 font-bold italic uppercase tracking-tight">*{helpText}</span>}
      </div>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600 transition-colors">
          <IconComp size={16} strokeWidth={2.5} />
        </div>
        {textArea ? (
          <motion.textarea layout {...props} rows="4" className="w-full pl-12 pr-5 py-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 outline-none font-semibold text-slate-800 placeholder:text-slate-300 focus:border-slate-950 focus:bg-white transition-all text-sm resize-none" />
        ) : (
          <input {...props} className="w-full pl-12 pr-5 py-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 outline-none font-semibold text-slate-800 placeholder:text-slate-300 focus:border-slate-950 focus:bg-white transition-all text-sm" />
        )}
      </div>
    </div>
  );
}

export default function ProfileSettings({ user, setUser }) {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    username: '', display_name: '', bio: '', instagram: '', tiktok: '', youtube: '', profile_picture: '', phone_number: '', category_id: ''
  })
  
  const [categories, setCategories] = useState([]);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankFormData, setBankFormData] = useState({
    bank_name: '', bank_account_number: '', bank_account_name: ''
  });

  // 🚨 REAKTIF LOADING STATE TERPISAH
  const [loadingText, setLoadingText] = useState(false);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' })
  const currentUrl = window.location.origin;

  const API_BASE = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.split('/api')[0].replace(/\/$/, "")
    : 'https://skuyproject-production.up.railway.app';

  // 📡 FETCH LIST KATEGORI AKTIF
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/user/categories');
        if (res.data.success) setCategories(res.data.data);
      } catch (err) {
        console.warn("⚠️ Gagal sinkronisasi opsi kategori:", err.message);
      }
    };
    fetchCategories();
  }, []);

  // 📡 SINKRONISASI DATA DAN LOCK STATE PANGKALAN UTAMA
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        display_name: user.display_name || user.full_name || '',
        bio: user.bio || '',
        instagram: user.instagram || '',
        tiktok: user.tiktok || '',
        youtube: user.youtube || '', 
        profile_picture: user.profile_picture || '',
        phone_number: user.phone_number || '',
        category_id: user.category_id || '' 
      });

      setBankFormData({
        bank_name: user.bank_name || '',
        bank_account_number: user.bank_account_number || user.account_number || '',
        bank_account_name: user.bank_account_name || user.account_name || ''
      });
    }
  }, [user])

  const handlePhoneChange = (e) => {
    const cleanValue = e.target.value.replace(/\D/g, ''); 
    setFormData({ ...formData, phone_number: cleanValue });
  }

  const getDisplayPhoto = (photoPath) => {
    if (!photoPath) return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'Sultan'}`;
    if (/^(http|https):\/\//.test(photoPath)) return photoPath;
    return `${API_BASE}/uploads/${photoPath}`;
  };

  // ==========================================
  // 📸 ACTION HANDLING 1: GANTI FOTO PROFIL DENGAN EMBEDDED REALTIME LOCK
  // ==========================================
  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoadingPhoto(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      const res = await api.post('/user/upload-avatar', uploadFormData);
      if (res.data.success) {
        const updatedUser = { ...user, profile_picture: res.data.filename };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setFormData(prev => ({ ...prev, profile_picture: res.data.filename }));
        setStatus({ type: 'success', message: 'Avatar Updated Permanently! 📸' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Upload Failed.' });
    } finally { 
      setLoadingPhoto(false); 
      setTimeout(() => setStatus({ type: '', message: '' }), 3000); 
    }
  }

  // ==========================================
  // 🗑️ ACTION HANDLING 2: HAPUS FOTO PROFIL PERMANEN KEMBALI KE DICEBEAR
  // ==========================================
  const handleDeletePhoto = async () => {
    const confirm = await Swal.fire({
      title: 'HAPUS FOTO PROFIL?',
      text: "Avatar lo akan dikembalikan ke setelan default robot premium, Ri.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'YA, HAPUS',
      cancelButtonText: 'BATAL',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-[2rem] border-4 border-slate-950 bg-white shadow-[8px_8px_0px_0px_#000]',
        confirmButton: 'bg-red-500 text-white text-[10px] font-black px-6 py-3 rounded-xl mx-2 uppercase italic border-2 border-slate-950',
        cancelButton: 'bg-slate-100 text-slate-400 text-[10px] font-black px-6 py-3 rounded-xl mx-2 uppercase italic'
      }
    });

    if (!confirm.isConfirmed) return;

    setLoadingPhoto(true);
    try {
      const res = await api.put(`/user/update-profile`, { userId: user.id, ...formData, profile_picture: '' });
      if (res.data.success) {
        const updatedUser = { ...user, profile_picture: '' };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setFormData(prev => ({ ...prev, profile_picture: '' }));
        setStatus({ type: 'success', message: 'Avatar Removed Permanently! 🗑️' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Gagal menghapus avatar.' });
    } finally {
      setLoadingPhoto(false);
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    }
  }

  // ==========================================
  // 📝 ACTION HANDLING 3: UPDATE BIO DATA & TEXT DATA
  // ==========================================
  const handleUpdateTextData = async (e) => {
    e.preventDefault();
    setLoadingText(true);
    try {
      const res = await api.put(`/user/update-profile`, { userId: user.id, ...formData });
      if (res.data.success) {
        const finalUserData = { ...user, ...res.data.user };
        setUser(finalUserData);
        localStorage.setItem('user', JSON.stringify(finalUserData));
        setStatus({ type: 'success', message: 'Profile Info Synchronized! ✨' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Update Failed.' });
    } finally { 
      setLoadingText(false); 
      setTimeout(() => setStatus({ type: '', message: '' }), 3000); 
    }
  }

  // ==========================================
  // 🏦 ACTION HANDLING 4: UPDATE DATA LINK REKENING BANK SULTAN
  // ==========================================
  const handleUpdateBank = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/user/bank/${user.id}`, bankFormData);
      if (res.data.success) {
        const updatedUser = { ...user, ...res.data.data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsBankModalOpen(false);
        setStatus({ type: 'success', message: 'Bank Linked Successfully! 🚀' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Gagal update data bank.' });
    } finally { setTimeout(() => setStatus({ type: '', message: '' }), 3000); }
  }

  return (
    <div className="max-w-5xl mx-auto font-sans text-slate-900 pb-20 text-left">
      {/* Alert status rendering */}
      {status.message && (
        <div className={`fixed top-10 right-10 z-[100] px-8 py-4 rounded-[2rem] shadow-2xl animate-in slide-in-from-right border-4 border-slate-950 ${status.type === 'success' ? 'bg-slate-900 text-violet-400' : 'bg-red-500 text-white'} font-black text-[10px] uppercase italic tracking-widest flex items-center gap-3`}>
          <Icon.Zap size={14} className="animate-pulse" />
          <p>{status.message}</p>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-violet-600 text-white rounded-2xl shadow-lg shadow-violet-100"><Icon.User size={20} strokeWidth={3} /></div>
            <div>
              <h1 className="text-[11px] font-black uppercase text-slate-900 tracking-wider">Creator Node Link</h1>
              <p className="text-[10px] text-violet-600 font-bold italic lowercase">{currentUrl}/{user.username}</p>
            </div>
          </div>
          <button type="button" onClick={() => { navigator.clipboard.writeText(`${currentUrl}/${user.username}`); setStatus({ type: 'success', message: 'Link Copied!' }); }} className="px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase border border-slate-100 hover:bg-slate-100 transition-all flex items-center gap-2"><Icon.Copy size={14} /> Copy Link</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* PANEL MANAGEMENT FORM DATA INFRASTRUCTURE */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleUpdateTextData} className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl"><Icon.SquarePen size={18} strokeWidth={3}/></div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Profile Info</h2>
            </div>
            
            <FormInput label="Display Nickname" iconName="Tag" placeholder="Ari Wirayuda" value={formData.display_name} onChange={(e) => setFormData({...formData, display_name: e.target.value})} />
            <FormInput label="WhatsApp Number" iconName="Phone" helpText="REQUIRED FOR 2FA" placeholder="0812xxxxxxxx" value={formData.phone_number} onChange={handlePhoneChange} />
            
            {/* Opsi Seleksi Kategori Genre */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-2 px-1 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block">Kategori Konten Streaming 🎮</label>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600 transition-colors z-10 pointer-events-none">
                  <Icon.Compass size={16} strokeWidth={2.5} />
                </div>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full pl-12 pr-10 py-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 outline-none font-bold text-slate-700 focus:border-slate-950 focus:bg-white transition-all text-sm cursor-pointer appearance-none italic"
                >
                  <option value="">-- PILIH GENRE KONTEN STREAMER --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name.toUpperCase()}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Icon.ChevronDown size={16} strokeWidth={3} />
                </div>
              </div>
            </div>

            <FormInput label="Bio Description" iconName="FileText" textArea placeholder="Tell your donors about yourself..." value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />

            {/* 📝 SAVE TRIGGER TEKS PROFIL */}
            <button type="submit" disabled={loadingText} className="w-full py-4 bg-slate-950 text-white rounded-[1.5rem] font-black uppercase text-[11px] italic tracking-[0.2em] shadow-xl hover:bg-violet-600 transition-all flex items-center justify-center gap-3">
              {loadingText ? <Icon.Loader2 className="animate-spin" size={14} /> : <Icon.Save size={14} />}
              {loadingText ? 'SYNCHRONIZING INFO...' : 'SAVE PROFILE INFO'}
            </button>
          </form>

          {/* Infrastructure / Bank Node Card */}
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#f1f5f9] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-slate-950 text-white rounded-[1.5rem] shadow-xl"><Icon.Landmark size={24} /></div>
              <div className="text-left">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Payout Account</h3>
                <p className="text-[10px] text-slate-400 font-bold italic uppercase">{user.bank_name ? `${user.bank_name} • Linked` : 'NOT CONFIGURED'}</p>
              </div>
            </div>
            <button type="button" onClick={() => setIsBankModalOpen(true)} className="px-8 py-4 bg-white border-4 border-slate-950 text-slate-950 rounded-2xl font-black text-[10px] uppercase italic tracking-widest hover:bg-slate-950 hover:text-white transition-all active:translate-y-1 shadow-[4px_4px_0px_0px_#000]">
              {user.bank_name ? 'UPDATE REKENING' : 'SETUP BANK'}
            </button>
          </div>
        </div>

        {/* CONTAINER MEDIA INTERFACE (FOTO PROFIL) */}
        <div className="space-y-6 lg:sticky lg:top-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 italic">Identity Photo Node</h3>
            
            <div className="relative group w-36 h-36 mb-6">
              <div className="w-full h-full rounded-[3rem] p-1.5 bg-gradient-to-tr from-violet-600 to-fuchsia-500 shadow-2xl">
                <div className="w-full h-full rounded-[2.8rem] bg-white overflow-hidden border-4 border-white relative">
                  {loadingPhoto && (
                    <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center text-white z-20">
                      <Icon.Loader2 className="animate-spin" size={24} />
                    </div>
                  )}
                  <img src={getDisplayPhoto(formData.profile_picture)} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
              </div>
            </div>

            {/* MANAGEMENT FOTO CONTAINER */}
            <div className="w-full flex flex-col gap-2.5">
              <button type="button" disabled={loadingPhoto} onClick={() => fileInputRef.current.click()} className="w-full py-3 bg-slate-50 text-slate-700 rounded-xl font-black text-[10px] uppercase border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center justify-center gap-2">
                <Icon.Camera size={14}/> Change Photo
              </button>

              {formData.profile_picture && (
                <button type="button" disabled={loadingPhoto} onClick={handleDeletePhoto} className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase border border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all flex items-center justify-center gap-2">
                  <Icon.Trash2 size={14}/> Remove Current Photo
                </button>
              )}
            </div>

            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUploadPhoto} />
          </div>
        </div>
      </div>

      {/* BANNER EDIT REKENING */}
      <EditBankModal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} formData={bankFormData} setFormData={setBankFormData} onSave={handleUpdateBank} loading={loadingText} />
    </div>
  )
}