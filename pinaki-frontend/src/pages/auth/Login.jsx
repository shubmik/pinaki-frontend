import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { sendOTP, verifyOTP } from '../../api/auth';
import toast from 'react-hot-toast';

export default function Login() {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (mobile.length !== 10) return toast.error('10 अंकों का मोबाइल नंबर दर्ज करें');
    setLoading(true);
    try {
      const res = await sendOTP(mobile);
      if (res.data.success) {
        toast.success('OTP भेजा गया!');
        if (res.data.debug_otp) toast('Dev OTP: ' + res.data.debug_otp, { icon: '🔧' });
        setStep(2);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP भेजने में त्रुटि');
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await verifyOTP(mobile, otp);
      if (res.data.success) {
        login(res.data.tokens, res.data.user);
        toast.success('लॉगिन सफल!');
        const role = res.data.user.role;
        if (role === 'super_admin' || role === 'staff_admin') {
          navigate('/admin');
        } else if (!res.data.has_profile) {
          // Member exists but no profile — send to register to complete
          navigate('/register');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP गलत है');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-white to-navy-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <button onClick={() => navigate('/')} className="inline-block">
            <div className="w-14 h-14 bg-saffron-600 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-display font-bold">P</span>
            </div>
          </button>
          <h1 className="font-display text-2xl text-navy-500 font-bold hindi">पिनाकी सोशियो केयर</h1>
          <p className="text-gray-400 text-sm mt-1">Pinaki Socio Care Foundation</p>
        </div>

        <div className="card shadow-lg">
          <h2 className="text-lg font-semibold text-navy-500 hindi mb-1">
            {step === 1 ? 'लॉगिन करें' : 'OTP दर्ज करें'}
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            {step === 1 ? 'अपना पंजीकृत मोबाइल नंबर दर्ज करें' : `+91 ${mobile} पर OTP भेजा गया`}
          </p>

          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 hindi">मोबाइल नंबर</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">+91</span>
                  <input type="tel" maxLength={10} value={mobile}
                    onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                    className="input rounded-l-none" placeholder="9876543210" required />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                {loading ? 'भेज रहे हैं...' : 'OTP भेजें'}
              </button>
              <p className="text-center text-sm text-gray-400">
                नए सदस्य हैं?{' '}
                <button type="button" onClick={() => navigate('/register')}
                  className="text-saffron-600 font-medium hover:underline">
                  अभी जुड़ें
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <input type="text" maxLength={6} value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                className="input text-center text-3xl tracking-[0.6em] font-mono py-4"
                placeholder="——————" autoFocus required />
              <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                {loading ? 'जांच रहे हैं...' : 'लॉगिन करें'}
              </button>
              <button type="button" onClick={() => { setStep(1); setOtp(''); }}
                className="w-full text-sm text-saffron-600 hover:underline text-center">
                ← नंबर बदलें / Resend OTP
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">
          © 2025 Pinaki Socio Care Foundation
        </p>
      </div>
    </div>
  );
}
