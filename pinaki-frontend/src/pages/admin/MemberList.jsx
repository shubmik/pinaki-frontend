import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getMembers } from '../../api/scheme';
import toast from 'react-hot-toast';

const KYC_BADGE = {
  approved: <span className="badge-green">✓ KYC स्वीकृत</span>,
  submitted: <span className="badge-yellow">📋 जमा किया</span>,
  pending:  <span className="badge-yellow">⏳ प्रतीक्षारत</span>,
  rejected: <span className="badge-red">✗ अस्वीकृत</span>,
};
const SCHEME_BADGE = {
  active:    <span className="badge-green">सक्रिय</span>,
  inactive:  <span className="badge-yellow">निष्क्रिय</span>,
  completed: <span className="badge-blue">पूर्ण</span>,
  suspended: <span className="badge-red">निलंबित</span>,
};

export default function MemberList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState(searchParams.get('kyc_status') || '');
  const [schemeFilter, setSchemeFilter] = useState('');

  const fetchMembers = () => {
    setLoading(true);
    const params = { page };
    if (search) params.search = search;
    if (kycFilter) params.kyc_status = kycFilter;
    if (schemeFilter) params.scheme_status = schemeFilter;

    getMembers(params).then(res => {
      setMembers(res.data.results || []);
      setTotal(res.data.count || 0);
    }).catch(() => toast.error('सदस्य लोड नहीं हो सके')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchMembers(); }, [page, kycFilter, schemeFilter]);
  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchMembers(); };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-navy-500 text-white sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="text-slate-400 hover:text-white text-sm">← Admin</button>
          <h1 className="font-semibold hindi">सदस्य सूची / Members</h1>
          <span className="text-xs bg-white/10 px-2 py-1 rounded-lg">{total} सदस्य</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {/* Filters */}
        <div className="card">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="input flex-1 min-w-48 text-sm" placeholder="नाम, मोबाइल, सदस्य ID खोजें..." />
            <select value={kycFilter} onChange={e => { setKycFilter(e.target.value); setPage(1); }} className="input w-auto text-sm">
              <option value="">सभी KYC</option>
              <option value="pending">प्रतीक्षारत</option>
              <option value="submitted">जमा किया</option>
              <option value="approved">स्वीकृत</option>
              <option value="rejected">अस्वीकृत</option>
            </select>
            <select value={schemeFilter} onChange={e => { setSchemeFilter(e.target.value); setPage(1); }} className="input w-auto text-sm">
              <option value="">सभी स्थिति</option>
              <option value="active">सक्रिय</option>
              <option value="inactive">निष्क्रिय</option>
              <option value="completed">पूर्ण</option>
            </select>
            <button type="submit" className="btn-primary text-sm">खोजें</button>
          </form>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : members.length === 0 ? (
          <div className="card text-center py-12 hindi text-gray-500">कोई सदस्य नहीं मिला।</div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-gray-100">
                  <tr>
                    {['सदस्य ID','नाम / Mobile','KYC','योजना','कुल बचत','माह','सहायता','कार्रवाई'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 hindi whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {members.map(m => (
                    <tr key={m.member_id} className="hover:bg-saffron-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-medium text-navy-500">{m.member_id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-navy-500">{m.full_name}</p>
                        <p className="text-xs text-gray-400">{m.mobile}</p>
                      </td>
                      <td className="px-4 py-3">{KYC_BADGE[m.kyc_status]}</td>
                      <td className="px-4 py-3">{SCHEME_BADGE[m.scheme_status]}</td>
                      <td className="px-4 py-3 font-medium">₹{Number(m.total_saved).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-center">{m.months_paid}/36</td>
                      <td className="px-4 py-3">
                        {m.has_active_loan ? <span className="badge-blue">सक्रिय</span> : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => navigate(`/admin/members/${m.member_id}`)}
                          className="text-xs text-saffron-600 hover:underline font-medium">विवरण →</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="flex justify-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">← पिछला</button>
            <span className="text-sm text-gray-500 py-1.5 px-3">पृष्ठ {page} / {Math.ceil(total/20)}</span>
            <button onClick={() => setPage(p => p+1)} disabled={members.length<20} className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">अगला →</button>
          </div>
        )}
      </main>
    </div>
  );
}
