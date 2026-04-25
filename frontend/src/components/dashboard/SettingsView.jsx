import { Moon } from 'lucide-react'
import ProfileSettings from './ProfileSettings'

export default function SettingsView({ user, setUser }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-5xl">
      <div className="mb-8 px-1">
        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Settings</h1>
        <p className="text-xs text-slate-400 font-medium italic uppercase tracking-tight">Atur profil publik dan preferensi aplikasi kamu</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KOLOM KIRI: FORM PROFILE */}
        <div className="lg:col-span-2">
          <ProfileSettings user={user} setUser={setUser} />
        </div>

        {/* KOLOM KANAN: DARK MODE */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Preferences</h3>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <Moon size={18} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-700">Dark Mode</span>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-violet-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
            
            <p className="text-[9px] text-slate-400 font-bold italic mt-4 px-1 uppercase tracking-tight">
              *Coming Soon: Full Dark Theme
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}