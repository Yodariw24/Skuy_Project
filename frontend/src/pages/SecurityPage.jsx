import React, { useState } from 'react';
import axios from 'axios';
import SecurityView from '../components/SecurityView'; // Sesuaikan path-nya
import { useAuth } from '../context/AuthContext'; 

const SecurityPage = () => {
  const { user, setUser, API_URL } = useAuth();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handleGenerateOTP = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/setup-2fa`, { userId: user.id });
      if (res.data.success) setOtpSent(true);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-2fa`, { userId: user.id, token: otp });
      if (res.data.success) {
        setUser(res.data.data);
        window.location.reload(); 
      }
    } catch (err) { alert("Kode Salah!"); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24">
      <SecurityView 
        user={user}
        otpSent={otpSent}
        otp={otp}
        setOtp={setOtp}
        loading={loading}
        onGenerateQR={handleGenerateOTP}
        onVerify={handleVerifyOTP}
      />
    </div>
  );
};

export default SecurityPage;