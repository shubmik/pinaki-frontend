import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMemberDetail, approveKYC } from '../../api/scheme';
import toast from 'react-hot-toast';

export default function MemberDetail() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kycAction, setKycAction] = useState(null); // 'approve' | 'reject'
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = () => {
    setLoading(true);
    getMemberDetail(memberId).then(res => {
      if (res.data.success) setData(res.data.data);
    }).catch(() => toast.error('डेटा लोड नहीं हो सका')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [memberId]);

  const handleKYCAction = async () => {
    if (kycAction === 'reject' && !rejectionReason.trim()) return toast.error('अस्वीकृति कारण दर्ज करें');
    setSubmitting(true);
    try {
      const res = await approveKYC(memberId, { action: kycAction, rejection_reason: rejectionReason });
      if (res.data.success) {
        toast.success(kycAction === 'approve' ? 'KYC स्वीकृत!' : 'KYC अस्वीकृत');
        setKycAction(null);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'त्रुटि हुई');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="p-8 text-center text-gray-500 hindi">सदस्य नहीं मिला।</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-navy-500 text-white sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => navigate('/admin/members')} className="text-slate-400 hover:text-white text-sm">← सूची</button>
          <div>
            <p className="font-semibold">{data.full_name}</p>
            <p className="text-xs text-slate-400 font-mono">{data.member_id} · {data.mobile}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* KYC Approval Panel */}
        {['pending','submitted'].includes(data.kyc_status) && (
          <div className="card border-yellow-200 bg-yellow-50">
            <h3 className="font-semibold text-yellow-800 hindi mb-3">📋 KYC समीक्षा</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {(data.kyc_documents || []).map(doc => (
                <a key={doc.id} href={doc.file_url} target="_blank" rel="noreferrer"
                  className="bg-white border border-yellow-200 rounded-xl p-3 text-center hover:border-saffron-400 transition">
                  <div className="text-2xl mb-1">🪪</div>
                  <p className="text-xs font-medium text-navy-500 hindi">{
                    doc.doc_type === 'aadhaar_front' ? 'आधार (आगे)' :
                    doc.doc_type === 'aadhaar_back'  ? 'आधार (पीछे)' :
                    doc.doc_type === 'pan'           ? 'PAN कार्ड' : 'फोटो'
                  }</p>
                  <p className="text-xs text-saffron-600 underline mt-1">देखें →</p>
                </a>
              ))}
            </div>
            {!kycAction ? (
              <div className="flex gap-3">
                <button onClick={() => setKycAction('approve')} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-xl text-sm transition">✓ KYC स्वीकृत करें</button>
                <button onClick={() => setKycAction('reject')} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-xl text-sm transition">✗ अस्वीकृत करें</button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="font-medium hindi text-sm">
                  {kycAction === 'approve' ? '✓ KYC स्वीकृत करने की पुष्टि करें' : '✗ अस्वीकृति कारण दर्ज करें'}
                </p>
                {kycAction === 'reject' && (
                  <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
                    className="input h-20 resize-none text-sm" placeholder="अस्वीकृति का कारण..." />
                )}
                <div className="flex gap-2">
                  <button onClick={handleKYCAction} disabled={submitting}
                    className={`flex-1 text-white font-medium py-2 rounded-xl text-sm ${kycAction==='approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'}`}>
                    {submitting ? 'हो रहा है...' : kycAction === 'approve' ? 'पुष्टि करें' : 'अस्वीकृत करें'}
                  </button>
                  <button onClick={() => setKycAction(null)} className="btn-secondary text-sm">रद्द करें</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Member Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="font-semibold text-navy-500 hindi mb-3">व्यक्तिगत विवरण</h3>
            <dl className="space-y-2 text-sm">
              {[['नाम', data.full_name],['मोबाइल', data.mobile],['शहर', `${data.city}, ${data.state}`]].map(([k,v]) => (
                <div key={k} className="flex justify-between"><dt className="text-gray-400 hindi">{k}</dt><dd className="font-medium">{v||'—'}</dd></div>
              ))}
            </dl>
          </div>
          <div className="card">
            <h3 className="font-semibold text-navy-500 hindi mb-3">बचत विवरण</h3>
            <dl className="space-y-2 text-sm">
              {[
                ['कुल बचत', `₹${Number(data.savings?.total_saved||0).toLocaleString('en-IN')}`],
                ['माह पूर्ण', `${data.savings?.months_paid||0}/36`],
                ['अगली देय', data.savings?.next_due_date || '—'],
                ['योजना प्रारंभ', data.scheme_start_date || '—'],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between"><dt className="text-gray-400 hindi">{k}</dt><dd className="font-medium">{v}</dd></div>
              ))}
            </dl>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <h3 className="font-semibold text-navy-500 hindi mb-3">हालिया लेनदेन</h3>
          {(!data.recent_transactions || data.recent_transactions.length === 0) ? (
            <p className="text-gray-400 text-sm hindi">कोई लेनदेन नहीं</p>
          ) : (
            <div className="space-y-2">
              {data.recent_transactions.map(txn => (
                <div key={txn.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium hindi">माह {txn.month_number || '—'} — {txn.payment_mode === 'manual' ? 'मैनुअल' : txn.payment_mode}</p>
                    <p className="text-xs text-gray-400">{new Date(txn.transaction_date).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${txn.status==='success'?'text-green-600':'text-red-500'}`}>
                      ₹{Number(txn.amount).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-400 hindi">{txn.status === 'success' ? 'सफल' : 'विफल'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
