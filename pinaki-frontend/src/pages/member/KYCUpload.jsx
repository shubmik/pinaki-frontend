import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadKYC, getDashboard } from '../../api/scheme';
import toast from 'react-hot-toast';

const DOCS = [
  { type: 'aadhaar_front', labelHi: 'आधार कार्ड (आगे)', label: 'Aadhaar Front', icon: '🪪' },
  { type: 'aadhaar_back',  labelHi: 'आधार कार्ड (पीछे)', label: 'Aadhaar Back',  icon: '🪪' },
  { type: 'pan',           labelHi: 'PAN कार्ड',          label: 'PAN Card',      icon: '💳' },
  { type: 'photo',         labelHi: 'पासपोर्ट फोटो',     label: 'Passport Photo',icon: '🖼️' },
];

export default function KYCUpload() {
  const navigate = useNavigate();
  const [uploaded, setUploaded] = useState({});
  const [uploading, setUploading] = useState({});
  const [kycStatus, setKycStatus] = useState('pending');

  useEffect(() => {
    getDashboard().then(res => {
      if (res.data.success) {
        const docs = res.data.data.kyc_documents || [];
        const map = {};
        docs.forEach(d => map[d.doc_type] = d);
        setUploaded(map);
        setKycStatus(res.data.data.kyc_status);
      }
    }).catch(() => toast.error('डेटा लोड नहीं हो सका'));
  }, []);

  const handleUpload = async (docType, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('फ़ाइल 5MB से छोटी होनी चाहिए');
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(file.type)) return toast.error('केवल JPG, PNG, PDF फ़ाइलें');

    setUploading(u => ({...u, [docType]: true}));
    const formData = new FormData();
    formData.append('doc_type', docType);
    formData.append('file', file);

    try {
      const res = await uploadKYC(formData);
      if (res.data.success) {
        toast.success('दस्तावेज़ अपलोड हो गया!');
        setUploaded(u => ({...u, [docType]: res.data.document}));
        setKycStatus(res.data.kyc_status);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'अपलोड विफल');
    } finally {
      setUploading(u => ({...u, [docType]: false}));
    }
  };

  const allUploaded = DOCS.every(d => uploaded[d.type]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-white to-slate-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-saffron-600">← वापस</button>
          <div>
            <h1 className="font-display font-bold text-navy-500 text-lg hindi">KYC दस्तावेज़</h1>
            <p className="text-xs text-gray-400">Upload KYC Documents</p>
          </div>
        </div>

        {kycStatus === 'approved' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-green-800 text-sm hindi">
            ✅ आपकी KYC स्वीकृत हो चुकी है। कोई बदलाव आवश्यक नहीं।
          </div>
        )}

        {kycStatus === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-red-800 text-sm hindi">
            ❌ KYC अस्वीकृत। कृपया सही दस्तावेज़ पुनः अपलोड करें।
          </div>
        )}

        <div className="space-y-4">
          {DOCS.map(doc => (
            <div key={doc.type} className={`card flex items-center gap-4 ${uploaded[doc.type] ? 'border-green-300 bg-green-50' : ''}`}>
              <div className="text-3xl">{doc.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-navy-500 hindi">{doc.labelHi}</p>
                <p className="text-xs text-gray-400">{doc.label}</p>
                {uploaded[doc.type] && (
                  <p className="text-xs text-green-600 mt-1">✓ अपलोड हो गया</p>
                )}
              </div>
              {kycStatus !== 'approved' && (
                <label className={`cursor-pointer ${uploading[doc.type] ? 'opacity-50' : ''}`}>
                  <span className={`text-xs font-medium px-3 py-2 rounded-xl border transition-colors ${
                    uploaded[doc.type]
                      ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                      : 'bg-saffron-600 text-white border-saffron-600 hover:bg-saffron-700'
                  }`}>
                    {uploading[doc.type] ? '⏳ अपलोड...' : uploaded[doc.type] ? '🔄 बदलें' : '📤 अपलोड'}
                  </span>
                  <input type="file" className="hidden" accept="image/*,.pdf"
                    onChange={e => handleUpload(doc.type, e.target.files[0])}
                    disabled={uploading[doc.type]} />
                </label>
              )}
            </div>
          ))}
        </div>

        {allUploaded && kycStatus !== 'approved' && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4 text-blue-800 text-sm">
            <p className="font-medium hindi">📋 सभी दस्तावेज़ जमा हो गए!</p>
            <p>फाउंडेशन 1-2 कार्यदिवस में आपकी KYC की समीक्षा करेगा।</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            डैशबोर्ड पर जाएं
          </button>
        </div>
      </div>
    </div>
  );
}
