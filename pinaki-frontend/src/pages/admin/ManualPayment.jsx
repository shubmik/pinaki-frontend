import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recordPayment } from '../../api/scheme';
import toast from 'react-hot-toast';

export default function ManualPayment() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    member_id: '', amount: '5000', payment_mode: 'manual',
    transaction_date: new Date().toISOString().split('T')[0], notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.member_id.trim()) return toast.error('सदस्य ID दर्ज करें');
    setLoading(true);
    try {
      const res = await recordPayment({...form, amount: parseFloat(form.amount)});
      if (res.data.success) {
        toast.success('भुगतान दर्ज हो गया!');
        setResult(res.data);
      }
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) Object.values(errors).flat().forEach(e => toast.error(e));
      else toast.error(err.response?.data?.message || 'त्रुटि हुई');
    } finally { setLoading(false); }
  };

  const handleReset = () => {
    setResult(null);
    setForm({ member_id: '', amount: '5000', payment_mode: 'manual',
      transaction_date: new Date().toISOString().split('T')[0], notes: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-navy-500 text-white sticky top-0 z-10 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="text-slate-400 hover:text-white text-sm">← Admin</button>
          <div>
            <p className="font-semibold hindi">भुगतान दर्ज करें</p>
            <p className="text-xs text-slate-400">Record Manual Payment</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {result ? (
          <div className="card border-green-300 bg-green-50 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="font-display font-bold text-green-800 text-xl hindi mb-2">भुगतान सफलतापूर्वक दर्ज!</h2>
            <p className="text-green-700 hindi mb-4">{result.message}</p>
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="bg-white rounded-xl p-3">
                <p className="text-gray-400 hindi text-xs">कुल बचत</p>
                <p className="font-bold text-navy-500 text-lg">₹{Number(result.total_saved).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-gray-400 hindi text-xs">माह पूर्ण</p>
                <p className="font-bold text-navy-500 text-lg">{result.months_paid}/36</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleReset} className="btn-primary flex-1">नया भुगतान दर्ज करें</button>
              <button onClick={() => navigate('/admin/members')} className="btn-secondary flex-1">सदस्य सूची</button>
            </div>
          </div>
        ) : (
          <div className="card shadow-lg">
            <h2 className="font-display font-bold text-navy-500 text-lg hindi mb-1">मैनुअल भुगतान</h2>
            <p className="text-sm text-gray-400 mb-6">नकद / ऑनलाइन भुगतान दर्ज करें</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 hindi">सदस्य ID <span className="text-red-500">*</span></label>
                <input value={form.member_id} onChange={e => set('member_id', e.target.value.toUpperCase())}
                  className="input font-mono" placeholder="PCF-2025-0001" required />
                <p className="text-xs text-gray-400 mt-1">सदस्य ID सदस्यता कार्ड पर मिलेगी</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 hindi">राशि (₹)</label>
                  <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)}
                    className="input" min="100" max="180000" step="100" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 hindi">भुगतान विधि</label>
                  <select value={form.payment_mode} onChange={e => set('payment_mode', e.target.value)} className="input">
                    <option value="manual">नकद / Manual</option>
                    <option value="online">ऑनलाइन / Online</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 hindi">भुगतान तारीख</label>
                <input type="date" value={form.transaction_date} onChange={e => set('transaction_date', e.target.value)}
                  className="input" max={new Date().toISOString().split('T')[0]} required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 hindi">नोट (वैकल्पिक)</label>
                <input value={form.notes} onChange={e => set('notes', e.target.value)}
                  className="input" placeholder="कोई विशेष नोट..." />
              </div>

              <div className="bg-saffron-50 border border-saffron-200 rounded-xl p-4 text-sm text-saffron-800">
                <p className="font-medium hindi">✅ पुष्टि करें</p>
                <p>सदस्य <strong>{form.member_id || '—'}</strong> के लिए <strong>₹{Number(form.amount||0).toLocaleString('en-IN')}</strong> का भुगतान दर्ज किया जाएगा।</p>
              </div>

              <button type="submit" className="btn-primary w-full text-base py-3" disabled={loading}>
                {loading ? '⏳ दर्ज हो रहा है...' : '✓ भुगतान दर्ज करें'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
