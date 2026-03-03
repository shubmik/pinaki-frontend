import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../../api/scheme';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  approved: <span className="badge-green">✓ KYC स्वीकृत</span>,
  pending:  <span className="badge-yellow">⏳ KYC प्रतीक्षारत</span>,
  submitted:<span className="badge-blue">📋 KYC जमा किया</span>,
  rejected: <span className="badge-red">✗ KYC अस्वीकृत</span>,
};

function StatCard({ labelHi, label, value, sub, accent }) {
  return (
    <div className={`card relative overflow-hidden ${accent ? 'border-saffron-300' : ''}`}>
      {accent && <div className="absolute top-0 left-0 w-1 h-full bg-saffron-500 rounded-l-2xl" />}
      <p className="text-xs text-gray-500 hindi pl-2">{labelHi} <span className="text-gray-400">/ {label}</span></p>
      <p className="text-2xl font-display font-bold text-navy-500 mt-1 pl-2">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1 pl-2">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard().then(res => {
      if (res.data.success) setData(res.data.data);
    }).catch(() => toast.error('डेटा लोड नहीं हो सका')).finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-saffron-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 hindi text-sm">लोड हो रहा है...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card text-center">
        <p className="hindi text-gray-600 mb-4">प्रोफ़ाइल नहीं मिली।</p>
        <button onClick={() => navigate('/register')} className="btn-primary">पंजीकरण करें</button>
      </div>
    </div>
  );

  const savings = data.savings || {};
  const maxHelp = data.max_assistance_amount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-white to-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-orange-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-saffron-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-display font-bold">P</span>
            </div>
            <div>
              <p className="font-semibold text-navy-500 text-sm leading-none">{data.full_name}</p>
              <p className="text-xs text-gray-400">{data.member_id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/kyc')} className="btn-secondary text-xs py-1.5 px-3">KYC दस्तावेज़</button>
            <button onClick={() => navigate('/transactions')} className="btn-secondary text-xs py-1.5 px-3">इतिहास</button>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 text-xs px-2">लॉगआउट</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* KYC Alert */}
        {data.kyc_status !== 'approved' && (
          <div className={`rounded-2xl p-4 border text-sm ${
            data.kyc_status === 'rejected' ? 'bg-red-50 border-red-200 text-red-800' :
            data.kyc_status === 'submitted' ? 'bg-blue-50 border-blue-200 text-blue-800' :
            'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}>
            <p className="font-medium hindi">
              {data.kyc_status === 'rejected' ? '❌ KYC अस्वीकृत' :
               data.kyc_status === 'submitted' ? '📋 KYC समीक्षा में है' :
               '⚠️ KYC दस्तावेज़ अपलोड करें'}
            </p>
            <p className="text-xs mt-1">
              {data.kyc_status === 'rejected' ? data.kyc_rejection_reason || 'कृपया दस्तावेज़ पुनः अपलोड करें।' :
               data.kyc_status === 'submitted' ? '1-2 कार्यदिवस में अनुमोदन होगा।' :
               'योजना शुरू करने के लिए KYC जरूरी है।'}
            </p>
            {data.kyc_status === 'pending' && (
              <button onClick={() => navigate('/kyc')} className="mt-2 text-xs font-medium underline">दस्तावेज़ अपलोड करें →</button>
            )}
          </div>
        )}

        {/* Scheme Progress */}
        <div className="card border-saffron-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-navy-500 font-bold hindi text-lg">बचत योजना प्रगति</h2>
              <p className="text-xs text-gray-400">Savings Scheme Progress</p>
            </div>
            {STATUS_BADGE[data.kyc_status]}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-saffron-400 to-saffron-600 rounded-full transition-all duration-700"
                style={{ width: `${data.scheme_progress_percent}%` }} />
            </div>
            <span className="text-sm font-semibold text-saffron-600 min-w-[3rem] text-right">
              {data.scheme_progress_percent}%
            </span>
          </div>
          <p className="text-xs text-gray-500 hindi">
            {data.months_completed} माह पूर्ण / 36 माह कुल
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard labelHi="कुल बचत" label="Total Saved"
            value={`₹${(savings.total_saved || 0).toLocaleString('en-IN')}`}
            sub={`${savings.months_paid || 0} माह भुगतान`} accent />
          <StatCard labelHi="अगली देय तिथि" label="Next Due"
            value={savings.next_due_date ? new Date(savings.next_due_date).toLocaleDateString('en-IN') : '—'}
            sub="₹5,000 देय" />
          <StatCard labelHi="सहायता पात्रता" label="Assistance Eligible"
            value={data.is_assistance_eligible ? 'हाँ ✓' : `${Math.max(0, 2 - data.months_completed)} माह बाद`}
            sub={data.is_assistance_eligible ? `₹${maxHelp.toLocaleString('en-IN')} तक` : 'अभी नहीं'} />
          <StatCard labelHi="कल्याण लाभ" label="Welfare Benefit"
            value={`₹${(savings.welfare_benefit_accrued || 0).toLocaleString('en-IN')}`}
            sub="समिति विवेकाधिकार पर" />
        </div>

        {/* Assistance Section */}
        {data.is_assistance_eligible && !data.active_loan && (
          <div className="card border-green-200 bg-green-50">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-semibold text-green-800 hindi">सहायता राशि के लिए पात्र हैं!</h3>
                <p className="text-sm text-green-700">आप ₹{maxHelp.toLocaleString('en-IN')} तक की सहायता राशि ले सकते हैं।</p>
              </div>
              <button onClick={() => navigate('/apply-assistance')} className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-xl">
                आवेदन करें →
              </button>
            </div>
          </div>
        )}

        {/* Active Loan Card */}
        {data.active_loan && (
          <div className="card border-navy-200">
            <h3 className="font-display font-bold text-navy-500 hindi mb-4">सक्रिय सहायता राशि</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div><p className="text-xs text-gray-400 hindi">मूल राशि</p><p className="font-bold text-lg">₹{data.active_loan.principal_amount.toLocaleString('en-IN')}</p></div>
              <div><p className="text-xs text-gray-400 hindi">बकाया</p><p className="font-bold text-lg text-red-600">₹{data.active_loan.outstanding_amount.toLocaleString('en-IN')}</p></div>
              <div><p className="text-xs text-gray-400 hindi">मासिक EMI</p><p className="font-bold text-lg">₹{data.active_loan.monthly_emi.toLocaleString('en-IN')}</p></div>
              <div><p className="text-xs text-gray-400 hindi">पूर्ण EMI</p><p className="font-bold text-lg">{data.active_loan.emis_paid}/{data.active_loan.emi_tenure_months}</p></div>
            </div>
            {data.active_loan.next_emi && (
              <div className="mt-4 bg-saffron-50 rounded-xl p-3 text-sm text-center">
                <span className="hindi text-saffron-800">अगली EMI: </span>
                <span className="font-semibold text-saffron-700">
                  ₹{data.active_loan.next_emi.amount.toLocaleString('en-IN')} — {new Date(data.active_loan.next_emi.due_date).toLocaleDateString('en-IN')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => navigate('/transactions')} className="card text-left hover:border-saffron-300 hover:shadow-md transition-all cursor-pointer group">
            <div className="text-2xl mb-2">📋</div>
            <p className="font-medium text-navy-500 hindi group-hover:text-saffron-600">लेनदेन इतिहास</p>
            <p className="text-xs text-gray-400">Transaction History</p>
          </button>
          <button onClick={() => navigate('/kyc')} className="card text-left hover:border-saffron-300 hover:shadow-md transition-all cursor-pointer group">
            <div className="text-2xl mb-2">🪪</div>
            <p className="font-medium text-navy-500 hindi group-hover:text-saffron-600">KYC दस्तावेज़</p>
            <p className="text-xs text-gray-400">Upload Documents</p>
          </button>
        </div>
      </main>
    </div>
  );
}
