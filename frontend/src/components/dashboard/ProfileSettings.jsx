import { useState, useEffect, useRef } from 'react'
import api from '../../api/axios' 
import * as Icon from 'lucide-react' 

const FormInput = ({ label, iconName, helpText, textArea, ...props }) => {
  const IconComp = Icon[iconName] || Icon.HelpCircle;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 px-1 text-left">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] block">{label}</label>
        {helpText && <span className="text-[9px] text-violet-500 font-bold italic uppercase tracking-tight">*{helpText}</span>}
      </div>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-500 transition-colors">
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
        phone_number: user.phone_number || '' // Ambil data awal nomor HP
      })
    }
  }, [user])

  // ✅ VALIDASI NOMOR HP (Only Numbers)
  const handlePhoneChange = (e) => {
    const cleanValue = e.target.value.replace(/\D/g, ''); // Hapus semua yang bukan angka
    setFormData({ ...formData, phone_number: cleanValue });
  }

  // REFINED CONFIG: Handle base URL
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
    if (file.size > 2 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'File kegedean, Ri! Max 2MB ya.' });
      return;
    }
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);
    uploadFormData.append('userId', user.id);
    setLoading(true);
    try {
      const res = await api.post('/user/upload-avatar', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        const updatedUser = { ...user, profile_picture: res.data.filename };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setStatus({ type: 'success', message: 'Avatar Berhasil Diperbarui! ✨' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Gagal upload.' });
    } finally {
      setLoading(false);
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ SINKRONISASI KE BACKEND (Termasuk phone_number buat 2FA)
      const res = await api.put('/user/update-profile', {
        userId: user.id,
        ...formData
      });

      if (res.data.success) {
        const updatedUser = { ...user, ...formData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setStatus({ type: 'success', message: 'Profil & WhatsApp Berhasil Disinkronkan! ✨' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Gagal update profil.' });
    } finally {
      setLoading(false);
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    }
  }

  if (!user) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto font-sans text-slate-900 pb-20 text-left">
      {/* Banner Link */}
      <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm mb-8 group">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-white rounded-2xl shadow-lg shadow-violet-200"><Icon.Link size={20} strokeWidth={3} /></div>
            <div>
              <h1 className="text-[11px] font-black uppercase text-slate-900 tracking-wider mb-0.5">Railway Donation Link</h1>
              <p className="text-[10px] text-violet-600 font-bold uppercase italic tracking-tighter bg-violet-50 px-2 py-0.5 rounded-md inline-block border border-violet-100">{currentUrl}/{user.username}</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button type="button" onClick={() => { navigator.clipboard.writeText(`${currentUrl}/${user.username}`); setStatus({ type: 'success', message: 'Copied!' }); setTimeout(()=>setStatus({type:'',message:''}),2000) }} className="flex-1 md:flex-none px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase border border-slate-100 hover:bg-slate-100 transition-all flex items-center justify-center gap-2"><Icon.Copy size={14} /> Copy</button>
          </div>
        </div>
      </div>

      {status.message && (
        <div className={`fixed top-10 right-10 z-[60] px-8 py-4 rounded-[2rem] shadow-2xl animate-in slide-in-from-right ${status.type === 'success' ? 'bg-slate-900 text-violet-400' : 'bg-red-600 text-white'} font-black text-[10px] uppercase italic tracking-widest flex items-center gap-3`}>
          <p className="tracking-tight">{status.message}</p>
        </div>
      )}

      <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 text-left">
                <div className="flex items-center gap-3 mb-2"><div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl"><Icon.SquarePen size={18} strokeWidth={3}/></div><h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Profile Info</h2></div>
                <FormInput label="Display Nickname" iconName="Tag" placeholder="Ari Wirayuda" value={formData.display_name} onChange={(e) => setFormData({...formData, display_name: e.target.value})} />
                
                {/* ✅ INPUT WHATSAPP BARU (Sultan 2FA Ready) */}
                <FormInput 
                  label="WhatsApp Number" 
                  iconName="Phone" 
                  helpText="Wajib untuk Dual-OTP" 
                  placeholder="0812xxxxxxxx" 
                  value={formData.phone_number} 
                  onChange={handlePhoneChange} 
                />

                <FormInput label="Bio Description" iconName="FileText" textArea placeholder="Tell your donors about yourself..." value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
            </div>
            
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6"><div className="p-2.5 bg-fuchsia-50 text-fuchsia-600 rounded-xl"><Icon.Share2 size={18} strokeWidth={3}/></div><h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Connections</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                    <FormInput label="Instagram URL" iconName="Instagram" type="text" placeholder="https://instagram.com/user" value={formData.instagram} onChange={(e) => setFormData({...formData, instagram: e.target.value})} />
                    <FormInput label="TikTok URL" iconName="Video" type="text" placeholder="https://tiktok.com/@user" value={formData.tiktok} onChange={(e) => setFormData({...formData, tiktok: e.target.value})} />
                </div>
            </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Profile Avatar</h3>
                <div className="relative group w-36 h-36 mb-6">
                    <div className="w-full h-full rounded-[3rem] p-1.5 bg-gradient-to-tr from-violet-600 to-fuchsia-500 shadow-2xl">
                        <div className="w-full h-full rounded-[2.8rem] bg-white overflow-hidden border-4 border-white">
                            <img 
                                src={getDisplayPhoto(user?.profile_picture)} 
                                alt="Profile" 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>
                <button type="button" onClick={() => fileInputRef.current.click()} className="px-6 py-2.5 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase border border-slate-100 hover:bg-slate-100 transition-all flex items-center gap-2"><Icon.Camera size={14}/> Change Photo</button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUploadPhoto} />
            </div>
            <button type="submit" disabled={loading} className="w-full py-5 bg-violet-600 text-white rounded-[1.5rem] font-black uppercase text-[11px] italic tracking-[0.2em] shadow-xl shadow-violet-100 active:scale-95 transition-all flex items-center justify-center gap-3">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Icon.Save size={16} strokeWidth={2.5} />}
                {loading ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
        </div>
      </form>
    </div>
  )
}