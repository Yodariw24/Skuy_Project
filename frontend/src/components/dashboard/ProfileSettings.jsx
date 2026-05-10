import { useState, useEffect, useRef } from 'react'
import api from '../../api/axios' 
import * as Icon from 'lucide-react' 
import EditBankModal from './EditBankModal' // Pastikan path ini benar sesuai struktur folder lo

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
          <textarea {...props} rows="4" className="w-full pl-12 pr-5 py-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 outline-none font-semibold text-slate-800 placeholder:text-slate-300 focus:border-violet-200 focus:ring-4 focus:ring-violet-50/50 focus:bg-white transition-all text-sm resize-none" />
        ) : (
          <input {...props} className="w-full pl-12 pr-5 py-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 outline-none font-semibold text-slate-800 placeholder:text-slate-300 focus:border-violet-200 focus:ring-4 focus:ring-violet-50/50 focus:bg-white transition-all text-sm" />
        )}
      </div>
    </div>
  );
}

export default function ProfileSettings({ user, setUser }) {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    username: '', display_name: '', bio: '', instagram: '', tiktok: '', youtube: '', profile_picture: '', phone_number: ''
  })
  
  // ✅ STATE UNTUK BANK SULTAN
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankFormData, setBankFormData] = useState({
    bank_name: '',
    bank_account_number: '',
    bank_account_name: ''
  });

  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })
  const currentUrl = window.location.origin;

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
        phone_number: user.phone_number || '' 
      });
      // Sinkronkan data bank ke state modal
      setBankFormData({
        bank_name: user.bank_name || '',
        bank_account_number: user.bank_account_number || '',
        bank_account_name: user.bank_account_name || ''
      });
    }
  }, [user])

  const handlePhoneChange = (e) => {
    const cleanValue = e.target.value.replace(/\D/g, ''); 
    setFormData({ ...formData, phone_number: cleanValue });
  }

  const API_BASE = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.split('/api')[0].replace(/\/$/, "")
    : 'https://skuyproject-production.up.railway.app';

  const getDisplayPhoto = (photoPath) => {
    if (!photoPath) return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`;
    if (/^(http|https):\/\//.test(photoPath)) return photoPath;
    return `${API_BASE}/uploads/${photoPath}`;
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      const res = await api.post('/user/upload-avatar', uploadFormData);
      if (res.data.success) {
        const updatedUser = { ...user, profile_picture: res.data.filename };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setStatus({ type: 'success', message: 'Avatar Updated!' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Upload Failed.' });
    } finally { setLoading(false); setTimeout(() => setStatus({ type: '', message: '' }), 3000); }
  }

  // ✅ HANDLER SAVE BANK KE DATABASE RAILWAY
  const handleUpdateBank = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put(`/user/bank/${user.id}`, bankFormData);
      if (res.data.success) {
        // Sinkronkan ke Global State biar di Wallet muncul
        const updatedUser = { ...user, ...res.data.data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsBankModalOpen(false);
        setStatus({ type: 'success', message: 'Bank Linked Successfully! 🚀' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Gagal update data bank.' });
    } finally { setLoading(false); setTimeout(() => setStatus({ type: '', message: '' }), 3000); }
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put(`/user/update-profile`, { userId: user.id, ...formData });
      if (res.data.success) {
        const finalUserData = { ...user, ...res.data.user };
        setUser(finalUserData);
        localStorage.setItem('user', JSON.stringify(finalUserData));
        setStatus({ type: 'success', message: 'Profile Synchronized! ✨' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Update Failed.' });
    } finally { setLoading(false); setTimeout(() => setStatus({ type: '', message: '' }), 3000); }
  }

  return (
    <div className="max-w-5xl mx-auto font-sans text-slate-900 pb-20 text-left">
      {/* Top Alert Status */}
      {status.message && (
        <div className={`fixed top-10 right-10 z-[100] px-8 py-4 rounded-[2rem] shadow-2xl animate-in slide-in-from-right ${status.type === 'success' ? 'bg-slate-900 text-violet-400 border-2 border-violet-500/20' : 'bg-red-600 text-white'} font-black text-[10px] uppercase italic tracking-widest flex items-center gap-3`}>
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

      <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info */}
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl"><Icon.SquarePen size={18} strokeWidth={3}/></div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Profile Info</h2>
            </div>
            <FormInput label="Display Nickname" iconName="Tag" placeholder="Ari Wirayuda" value={formData.display_name} onChange={(e) => setFormData({...formData, display_name: e.target.value})} />
            <FormInput label="WhatsApp Number" iconName="Phone" helpText="REQUIRED FOR 2FA" placeholder="0812xxxxxxxx" value={formData.phone_number} onChange={handlePhoneChange} />
            <FormInput label="Bio Description" iconName="FileText" textArea placeholder="Tell your donors about yourself..." value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
          </div>

          {/* Infrastructure / Bank Node */}
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#f1f5f9] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-slate-950 text-white rounded-[1.5rem] shadow-xl"><Icon.Landmark size={24} /></div>
              <div className="text-left">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Payout Account</h3>
                <p className="text-[10px] text-slate-400 font-bold italic uppercase">{user.bank_name ? `${user.bank_name} • Linked` : 'NOT CONFIGURED'}</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setIsBankModalOpen(true)}
              className="px-8 py-4 bg-white border-4 border-slate-950 text-slate-950 rounded-2xl font-black text-[10px] uppercase italic tracking-widest hover:bg-slate-950 hover:text-white transition-all active:translate-y-1 shadow-[4px_4px_0px_0px_#000]"
            >
              {user.bank_name ? 'UPDATE REKENING' : 'SETUP BANK'}
            </button>
          </div>
        </div>

        {/* Sidebar Sticky */}
        <div className="space-y-6 lg:sticky lg:top-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 italic">Identity Photo</h3>
            <div className="relative group w-36 h-36 mb-6">
              <div className="w-full h-full rounded-[3rem] p-1.5 bg-gradient-to-tr from-violet-600 to-fuchsia-500 shadow-2xl">
                <div className="w-full h-full rounded-[2.8rem] bg-white overflow-hidden border-4 border-white">
                  <img src={getDisplayPhoto(user?.profile_picture)} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
              </div>
            </div>
            <button type="button" onClick={() => fileInputRef.current.click()} className="px-6 py-2.5 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase border border-slate-100 hover:bg-slate-100 transition-all flex items-center gap-2"><Icon.Camera size={14}/> Change Photo</button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUploadPhoto} />
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 bg-slate-950 text-white rounded-[1.5rem] font-black uppercase text-[11px] italic tracking-[0.2em] shadow-xl shadow-slate-100 active:scale-95 transition-all flex items-center justify-center gap-3">
            {loading ? <Icon.Loader2 className="animate-spin" size={16} /> : <Icon.Save size={16} />}
            {loading ? 'DEPLOYING...' : 'SAVE ALL CHANGES'}
          </button>
        </div>
      </form>

      {/* ✅ MODAL BANK SULTAN */}
      <EditBankModal 
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        formData={bankFormData}
        setFormData={setBankFormData}
        onSave={handleUpdateBank}
        loading={loading}
      />
    </div>
  )
}