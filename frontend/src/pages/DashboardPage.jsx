import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Sidebar from '../components/dashboard/Sidebar'
import SecurityView from '../components/dashboard/SecurityView'
import { Buffer } from 'buffer'
import { authenticator } from 'otplib'
import Swal from 'sweetalert2'

if (typeof window !== 'undefined') { window.Buffer = Buffer; }

function DashboardPage() {
  const [user, setUser] = useState(null)
  const [qrCodeData, setQrCodeData] = useState('') 
  const [otp, setOtp] = useState('')
  const [loading2FA, setLoading2FA] = useState(false)
  const navigate = useNavigate()

  // --- AMBIL DATA LANGSUNG DARI SUPABASE ---
  const fetchData = async (userId) => {
    // Ambil profile, saldo, dan payment sekaligus dari Supabase
    const { data: profile } = await supabase.from('streamers').select('*').eq('id', userId).single();
    if (profile) setUser(profile);
  }

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/auth');
      fetchData(session.user.id);
    };
    init();
  }, [navigate]);

  const handleGenerateQR = async () => {
    setLoading2FA(true);
    try {
      let secret = user.two_fa_secret;
      if (!secret) {
        secret = authenticator.generateSecret();
        // Simpan secret ke Supabase
        await supabase.from('streamers').update({ two_fa_secret: secret }).eq('id', user.id);
        setUser(prev => ({ ...prev, two_fa_secret: secret }));
      }

      const otpAuthUrl = authenticator.keyuri(user.username, "SkuyGG", secret);
      setQrCodeData(otpAuthUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading2FA(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!user.two_fa_secret) return;
    
    authenticator.options = { window: 1 };
    const isValid = authenticator.check(otp, user.two_fa_secret);

    if (isValid) {
      setLoading2FA(true);
      const { error } = await supabase.from('streamers').update({ is_two_fa_enabled: true }).eq('id', user.id);
      if (!error) {
        setUser(prev => ({ ...prev, is_two_fa_enabled: true }));
        Swal.fire('BERHASIL', '2FA Aktif lewat Supabase!', 'success');
        setQrCodeData(''); setOtp('');
      }
      setLoading2FA(false);
    } else {
      Swal.fire('GAGAL', 'OTP salah. Cek jam HP kamu!', 'error');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex font-sans">
      <Sidebar user={user} navigate={navigate} />
      <main className="flex-1 p-8">
        <SecurityView 
          user={user} 
          qrCode={qrCodeData} 
          onGenerateQR={handleGenerateQR} 
          onVerify={handleVerify2FA} 
          otp={otp} 
          setOtp={setOtp} 
          loading={loading2FA} 
        />
      </main>
    </div>
  )
}
export default DashboardPage;