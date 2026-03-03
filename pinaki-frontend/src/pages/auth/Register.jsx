import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOTP, verifyOTP, registerMember } from '../../api/auth';
import { uploadKYC } from '../../api/scheme';
import toast from 'react-hot-toast';

const STATES = ['Rajasthan','Maharashtra','Gujarat','Uttar Pradesh','Madhya Pradesh','Bihar','Karnataka','Tamil Nadu','Andhra Pradesh','Telangana','West Bengal','Odisha','Punjab','Haryana','Other'];

const DOCS = [
  { type: 'aadhaar_front', labelHi: 'आधार कार्ड (आगे)', label: 'Aadhaar Front', icon: '🪪' },
  { type: 'aadhaar_back',  labelHi: 'आधार कार्ड (पीछे)', label: 'Aadhaar Back',  icon: '🪪' },
  { type: 'pan',           labelHi: 'PAN कार्ड',          label: 'PAN Card',      icon: '💳' },
  { type: 'photo',         labelHi: 'पासपोर्ट फोटो',     label: 'Passport Photo', icon: '🖼️' },
];

const STEPS = ['मोबाइल OTP', 'व्यक्तिगत विवरण', 'बैंक विवरण', 'KYC दस्तावेज़'];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=OTP, 2=Profile, 3=Bank, 4=KYC, 5=Done
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [accessToken, setAccessToken] = useState(null); // token after OTP verify

  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [uploaded, setUploaded] = useState({});
  const [uploading, setUploading] = useState({});

  const [form, setForm] = useState({
    full_name: '', email: '', date_of_birth: '',
    address: '', city: '', state: 'Rajasthan', pincode: '',
    aadhaar_number: '', pan_number: '',
    bank_name: '', bank_account_number: '', bank_ifsc: '', bank_account_holder_name: '',
  });

  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  // ── STEP 1: Send OTP ──
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (mobile.length !== 10) return toast.error('10 अंकों का मोबाइल नंबर दर्ज करें');
    setLoading(true);
    try {
      const res = await sendOTP(mobile);
      if (res.data.success) {
        setOtpSent(true);
        toast.success('OTP भेजा गया!');
        if (res.data.debug_otp) toast('Dev OTP: ' + res.data.debug_otp, { icon: '🔧' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP भेजने में त्रुटि');
    } finally { setLoading(false); }
  };

  // ── STEP 1: Verify OTP ──
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await verifyOTP(mobile, otp);
      if (res.data.success) {
        // Save token for subsequent calls
        localStorage.setItem('access_token', res.data.tokens.access);
        localStorage.setItem('refresh_token', res.data.tokens.refresh);
        setAccessToken(res.data.tokens.access);

        if (res.data.has_profile) {
          toast('आप पहले से पंजीकृत हैं!', { icon: 'ℹ️' });
          navigate('/dashboard');
          return;
        }
        toast.success('मोबाइल सत्यापित!');
        setStep(2);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP गलत है');
    } finally { setLoading(false); }
  };

  // ── STEP 2+3: Submit profile + bank ──
  const handleProfileSubmit = async () => {
    if (!form.full_name.trim()) return toast.error('पूरा नाम दर्ज करें');
    setLoading(true);
    try {
      const res = await registerMember({ ...form, mobile });
      if (res.data.success) {
        toast.success('विवरण सहेजा गया!');
        setStep(4);
      }
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) Object.values(errors).flat().forEach(e => toast.error(e));
      else toast.error(err.response?.data?.message || 'त्रुटि हुई');
    } finally { setLoading(false); }
  };

  // ── STEP 4: Upload KYC doc ──
  const handleUpload = async (docType, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('फ़ाइल 5MB से छोटी होनी चाहिए');
    setUploading(u => ({...u, [docType]: true}));
    const formData = new FormData();
    formData.append('doc_type', docType);
    formData.append('file', file);
    try {
      const res = await uploadKYC(formData);
      if (res.data.success) {
        toast.success('दस्तावेज़ अपलोड हो गया!');
        setUploaded(u => ({...u, [docType]: true}));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'अपलोड विफल');
    } finally { setUploading(u => ({...u, [docType]: false})); }
  };

  const allDocsUploaded = DOCS.every(d => uploaded[d.type]);

  const Field = ({ label, labelHi, name, type='text', ...rest }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        <span className="hindi">{labelHi}</span> <span className="text-gray-400 text-xs">/ {label}</span>
      </label>
      <input type={type} value={form[name]} onChange={e => set(name, e.target.value)} className="input" {...rest} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-white to-slate-50 py-8 px-4">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-saffron-600 rounded-xl flex items-center justify-center shadow">
              <span className="text-white font-display font-bold">P</span>
            </div>
            <div className="text-left">
              <p className="font-display font-bold text-navy-500 text-sm hindi">पिनाकी सोशियो केयर</p>
            </div>
          </button>
          <h1 className="font-display text-xl font-bold text-navy-500 hindi">सदस्यता पंजीकरण</h1>
          <p className="text-sm text-gray-400">Member Registration</p>
        </div>

        {/* Progress Steps — only show for steps 1-4 */}
        {step <= 4 && (
          <div className="flex items-center justify-between mb-8 px-2">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                    ${step === i+1 ? 'bg-saffron-600 text-white ring-4 ring-saffron-100' :
                      step > i+1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {step > i+1 ? '✓' : i+1}
                  </div>
                  <span className={`text-xs mt-1 hindi text-center hidden sm:block leading-tight
                    ${step === i+1 ? 'text-saffron-600 font-medium' : 'text-gray-400'}`}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 transition-colors ${step > i+1 ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 1: Mobile OTP ── */}
        {step === 1 && (
          <div className="card shadow-lg">
            <h2 className="font-semibold text-navy-500 hindi mb-1">मोबाइल सत्यापन</h2>
            <p className="text-sm text-gray-400 mb-6">Mobile Verification</p>

            {!otpSent ? (
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
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? 'भेज रहे हैं...' : 'OTP भेजें'}
                </button>
                <p className="text-center text-sm text-gray-400">
                  पहले से सदस्य हैं?{' '}
                  <button type="button" onClick={() => navigate('/login')} className="text-saffron-600 font-medium hover:underline">लॉगिन करें</button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <p className="text-sm text-gray-600 hindi bg-saffron-50 rounded-xl p-3">
                  📱 <strong>+91 {mobile}</strong> पर OTP भेजा गया
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 hindi">6 अंकों का OTP</label>
                  <input type="text" maxLength={6} value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="input text-center text-2xl tracking-[0.5em] font-mono" placeholder="------" required />
                </div>
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? 'जांच रहे हैं...' : 'OTP सत्यापित करें'}
                </button>
                <button type="button" onClick={() => setOtpSent(false)}
                  className="w-full text-sm text-saffron-600 hover:underline text-center">
                  मोबाइल नंबर बदलें
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── STEP 2: Personal Details ── */}
        {step === 2 && (
          <div className="card shadow-lg space-y-4">
            <div>
              <h2 className="font-semibold text-navy-500 hindi">व्यक्तिगत विवरण</h2>
              <p className="text-sm text-gray-400">Personal Details</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Full Name" labelHi="पूरा नाम *" name="full_name" placeholder="Ramesh Kumar Sharma" required />
              </div>
              <Field label="Email (optional)" labelHi="ईमेल" name="email" type="email" placeholder="example@gmail.com" />
              <Field label="Date of Birth" labelHi="जन्म तिथि" name="date_of_birth" type="date" />
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1"><span className="hindi">पता *</span> / Address</label>
                <textarea value={form.address} onChange={e => set('address', e.target.value)}
                  className="input h-20 resize-none" placeholder="घर का पूरा पता..." required />
              </div>
              <Field label="City" labelHi="शहर *" name="city" placeholder="Kankroli" required />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"><span className="hindi">राज्य</span> / State</label>
                <select value={form.state} onChange={e => set('state', e.target.value)} className="input">
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <Field label="Pincode" labelHi="पिनकोड" name="pincode" placeholder="313324" maxLength="6" />
              <Field label="Aadhaar Number" labelHi="आधार संख्या *" name="aadhaar_number" placeholder="123456789012" maxLength="12" />
              <Field label="PAN Number" labelHi="PAN नंबर *" name="pan_number" placeholder="ABCDE1234F" maxLength="10" />
            </div>
            <div className="flex justify-between pt-2">
              <button onClick={() => setStep(1)} className="btn-secondary">← वापस</button>
              <button onClick={() => {
                if (!form.full_name || !form.city || !form.aadhaar_number || !form.pan_number)
                  return toast.error('सभी * फ़ील्ड भरें');
                setStep(3);
              }} className="btn-primary">अगला →</button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Bank Details ── */}
        {step === 3 && (
          <div className="card shadow-lg space-y-4">
            <div>
              <h2 className="font-semibold text-navy-500 hindi">बैंक विवरण</h2>
              <p className="text-sm text-gray-400">Bank Details — for eNACH auto-debit & assistance disbursement</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Bank Name" labelHi="बैंक का नाम *" name="bank_name" placeholder="State Bank of India" />
              </div>
              <div className="sm:col-span-2">
                <Field label="Account Holder Name" labelHi="खाताधारक का नाम *" name="bank_account_holder_name" placeholder="Ramesh Kumar Sharma" />
              </div>
              <Field label="Account Number" labelHi="खाता संख्या *" name="bank_account_number" placeholder="1234567890123" />
              <Field label="IFSC Code" labelHi="IFSC कोड *" name="bank_ifsc" placeholder="SBIN0001234" maxLength="11" />
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 hindi">
              🔒 आपका बैंक विवरण सुरक्षित है। इसका उपयोग केवल eNACH और सहायता राशि हस्तांतरण के लिए होगा।
            </div>
            <div className="flex justify-between pt-2">
              <button onClick={() => setStep(2)} className="btn-secondary">← वापस</button>
              <button onClick={() => {
                if (!form.bank_name || !form.bank_account_number || !form.bank_ifsc)
                  return toast.error('बैंक विवरण भरें');
                handleProfileSubmit();
              }} className="btn-primary" disabled={loading}>
                {loading ? 'सहेज रहे हैं...' : 'अगला →'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: KYC Upload ── */}
        {step === 4 && (
          <div className="card shadow-lg space-y-4">
            <div>
              <h2 className="font-semibold text-navy-500 hindi">KYC दस्तावेज़ अपलोड करें</h2>
              <p className="text-sm text-gray-400">Upload KYC Documents</p>
            </div>
            <div className="space-y-3">
              {DOCS.map(doc => (
                <div key={doc.type} className={`flex items-center gap-4 p-4 rounded-xl border transition-all
                  ${uploaded[doc.type] ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="text-2xl">{doc.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-navy-500 hindi">{doc.labelHi}</p>
                    <p className="text-xs text-gray-400">{doc.label}</p>
                    {uploaded[doc.type] && <p className="text-xs text-green-600 mt-0.5">✓ अपलोड हो गया</p>}
                  </div>
                  <label className="cursor-pointer flex-shrink-0">
                    <span className={`text-xs font-medium px-3 py-2 rounded-xl border transition-colors inline-block
                      ${uploading[doc.type] ? 'opacity-50 cursor-wait' :
                        uploaded[doc.type] ? 'bg-green-100 text-green-700 border-green-300' :
                        'bg-saffron-600 text-white border-saffron-600 hover:bg-saffron-700'}`}>
                      {uploading[doc.type] ? '⏳' : uploaded[doc.type] ? '🔄 बदलें' : '📤 अपलोड'}
                    </span>
                    <input type="file" className="hidden" accept="image/*,.pdf"
                      onChange={e => handleUpload(doc.type, e.target.files[0])}
                      disabled={uploading[doc.type]} />
                  </label>
                </div>
              ))}
            </div>

            {!allDocsUploaded && (
              <p className="text-xs text-gray-400 text-center hindi">
                सभी 4 दस्तावेज़ अपलोड करें — JPG, PNG या PDF (max 5MB)
              </p>
            )}

            <div className="flex justify-between pt-2 gap-3">
              <button onClick={() => setStep(5)} className="btn-secondary flex-1 text-sm">
                बाद में अपलोड करूंगा
              </button>
              <button onClick={() => setStep(5)} disabled={!allDocsUploaded}
                className="btn-primary flex-1 disabled:opacity-40">
                पंजीकरण पूर्ण करें ✓
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: Success ── */}
        {step === 5 && (
          <div className="card shadow-lg text-center py-10">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="font-display text-2xl font-bold text-navy-500 hindi mb-2">
              आवेदन जमा हो गया!
            </h2>
            <p className="text-gray-500 hindi mb-2">Application Submitted Successfully</p>
            <div className="bg-saffron-50 border border-saffron-100 rounded-xl p-4 text-sm text-saffron-800 hindi my-6 text-left space-y-2">
              <p>✅ आपका पंजीकरण पूर्ण हो गया।</p>
              <p>📋 फाउंडेशन आपकी KYC की समीक्षा करेगा (1-2 कार्यदिवस)।</p>
              <p>📱 KYC स्वीकृत होने पर आपको SMS मिलेगा।</p>
              <p>💰 इसके बाद आप ₹5,000 पहला बचत योगदान कर सकते हैं।</p>
            </div>
            <button onClick={() => navigate('/dashboard')} className="btn-primary w-full text-base py-3">
              डैशबोर्ड देखें →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
