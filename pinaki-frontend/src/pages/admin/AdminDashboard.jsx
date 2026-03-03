import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStats } from '../../api/scheme';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

function StatCard({ icon, labelHi, label, value, color }) {
  return (
    <div className={`card border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 hindi">{labelHi}</p>
          <p className="text-xs text-gray-300">{label}</p>
          <p className="text-2xl font-display font-bold text-navy-500 mt-1">{value}</p>
        </div>
        <div className="text-3xl opacity-20">{icon}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getAdminStats().then(res => {
      if (res.data.success) setStats(res.data.data);
    }).catch(() => toast.error('Stats load failed'));
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <header className="bg-navy-500 text-white sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-saffron-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-display font-bold">P</span>
            </div>
            <div>
              <p className="font-semibold text-sm">Pinaki Admin Panel</p>
              <p className="text-xs text-slate-400 hindi">{user?.full_name} · {user?.role === 'super_admin' ? 'सुपर एडमिन' : 'स्टाफ एडमिन'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/admin/members')} className="text-xs bg-saffron-600 hover:bg-saffron-700 px-3 py-1.5 rounded-lg transition">सदस्य सूची</button>
            <button onClick={() => navigate('/admin/payment')} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition">भुगतान दर्ज करें</button>
            <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-red-400 px-2">लॉगआउट</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h2 className="font-display text-xl font-bold text-navy-500 hindi">अवलोकन / Overview</h2>
          <p className="text-sm text-gray-400">पिनाकी सदस्य कल्याण योजना</p>
        </div>

        {stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard icon="👥" labelHi="कुल सदस्य" label="Total Members" value={stats.total_members} color="border-blue-400" />
            <StatCard icon="✅" labelHi="सक्रिय सदस्य" label="Active Members" value={stats.active_members} color="border-green-400" />
            <StatCard icon="⏳" labelHi="KYC प्रतीक्षारत" label="Pending KYC" value={stats.pending_kyc} color="border-yellow-400" />
            <StatCard icon="🏦" labelHi="सक्रिय सहायता" label="Active Loans" value={stats.active_loans} color="border-purple-400" />
            <StatCard icon="💰" labelHi="कुल संग्रह" label="Total Corpus" value={`₹${Number(stats.total_corpus).toLocaleString('en-IN')}`} color="border-saffron-400" />
            <StatCard icon="🏛️" labelHi="बचत पूल" label="Savings Pool" value={`₹${Number(stats.savings_pool_balance).toLocaleString('en-IN')}`} color="border-orange-400" />
          </div>
        ) : (
          <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" /></div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onClick={() => navigate('/admin/members?kyc_status=submitted')} className="card text-left hover:border-yellow-300 hover:shadow-md transition-all cursor-pointer group">
            <div className="text-2xl mb-2">📋</div>
            <p className="font-semibold text-navy-500 hindi group-hover:text-yellow-600">KYC अनुमोदन करें</p>
            <p className="text-xs text-gray-400">Approve pending KYC requests</p>
            {stats?.pending_kyc > 0 && <span className="mt-2 inline-block badge-yellow">{stats.pending_kyc} प्रतीक्षारत</span>}
          </button>
          <button onClick={() => navigate('/admin/payment')} className="card text-left hover:border-saffron-300 hover:shadow-md transition-all cursor-pointer group">
            <div className="text-2xl mb-2">💵</div>
            <p className="font-semibold text-navy-500 hindi group-hover:text-saffron-600">भुगतान दर्ज करें</p>
            <p className="text-xs text-gray-400">Record manual cash/online payment</p>
          </button>
          <button onClick={() => navigate('/admin/members')} className="card text-left hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group">
            <div className="text-2xl mb-2">👥</div>
            <p className="font-semibold text-navy-500 hindi group-hover:text-blue-600">सदस्य सूची</p>
            <p className="text-xs text-gray-400">View all members</p>
          </button>
        </div>
      </main>
    </div>
  );
}
