import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransactions } from '../../api/scheme';
import toast from 'react-hot-toast';

const MODE_LABEL = { enach: 'eNACH', manual: 'मैनुअल', online: 'ऑनलाइन' };
const STATUS_COLOR = { success: 'badge-green', failed: 'badge-red', pending: 'badge-yellow' };
const STATUS_LABEL = { success: 'सफल', failed: 'विफल', pending: 'प्रतीक्षारत' };

export default function Transactions() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTransactions(page).then(res => {
      setData(res.data.results || []);
      setTotal(res.data.count || 0);
    }).catch(() => toast.error('डेटा लोड नहीं हो सका')).finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-white to-slate-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-saffron-600">← वापस</button>
          <div>
            <h1 className="font-display font-bold text-navy-500 text-lg hindi">लेनदेन इतिहास</h1>
            <p className="text-xs text-gray-400">Transaction History ({total} कुल)</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : data.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <p className="hindi text-gray-500">अभी कोई लेनदेन नहीं है।</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map(txn => (
              <div key={txn.id} className="card flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${txn.status === 'success' ? 'bg-green-100' : txn.status === 'failed' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                  {txn.status === 'success' ? '✓' : txn.status === 'failed' ? '✗' : '⏳'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-navy-500 hindi">
                      माह {txn.month_number || '—'} — बचत योगदान
                    </p>
                    <span className={STATUS_COLOR[txn.status] + ' text-xs'}>{STATUS_LABEL[txn.status]}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(txn.transaction_date).toLocaleDateString('en-IN')} · {MODE_LABEL[txn.payment_mode] || txn.payment_mode}
                    {txn.notes && ` · ${txn.notes}`}
                  </p>
                </div>
                <div className={`font-bold text-lg ${txn.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                  {txn.transaction_type === 'credit' ? '+' : '-'}₹{Number(txn.amount).toLocaleString('en-IN')}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {total > 12 && (
              <div className="flex justify-center gap-2 pt-4">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">← पिछला</button>
                <span className="text-sm text-gray-500 py-1.5 px-2">पृष्ठ {page}</span>
                <button onClick={() => setPage(p => p+1)} disabled={data.length < 12} className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">अगला →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
