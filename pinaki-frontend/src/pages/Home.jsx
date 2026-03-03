import { useNavigate } from 'react-router-dom';

function Step({ n, hi, en }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-10 h-10 rounded-full bg-saffron-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-md">{n}</div>
      <div className="pt-1">
        <p className="font-semibold text-navy-500 hindi">{hi}</p>
        <p className="text-sm text-gray-500">{en}</p>
      </div>
    </div>
  );
}

function Benefit({ icon, hi, en }) {
  return (
    <div className="card text-center hover:border-saffron-300 hover:shadow-md transition-all">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="font-semibold text-navy-500 hindi">{hi}</p>
      <p className="text-xs text-gray-400 mt-1">{en}</p>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-white to-slate-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-orange-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-saffron-600 rounded-xl flex items-center justify-center shadow">
              <span className="text-white font-display font-bold">P</span>
            </div>
            <div>
              <p className="font-display font-bold text-navy-500 text-sm leading-none hindi">पिनाकी सोशियो केयर</p>
              <p className="text-xs text-gray-400">pinakiworld.com</p>
            </div>
          </div>
          <button onClick={() => navigate('/login')}
            className="btn-secondary text-sm py-2 px-4">
            लॉगिन करें / Login
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-14 text-center">
        <div className="inline-block bg-saffron-100 text-saffron-700 text-xs font-medium px-4 py-1.5 rounded-full mb-6 hindi border border-saffron-200">
          🌟 सदस्य बचत कल्याण योजना
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-navy-500 leading-tight mb-4">
          <span className="hindi">बचाएं, बढ़ाएं,</span><br />
          <span className="text-saffron-600 hindi">जरूरत में पाएं</span>
        </h1>
        <p className="text-gray-500 text-lg mb-3 hindi max-w-xl mx-auto">
          हर महीने ₹5,000 जमा करें — 36 महीनों तक।
          जरूरत पड़ने पर ₹1,80,000 तक की सहायता राशि पाएं।
        </p>
        <p className="text-gray-400 text-sm mb-10 max-w-xl mx-auto">
          Save ₹5,000/month for 36 months. Get up to ₹1,80,000 in member assistance when you need it most.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => navigate('/register')}
            className="btn-primary text-base py-3 px-8 shadow-lg">
            अभी जुड़ें / Join Now →
          </button>
          <button onClick={() => navigate('/login')}
            className="btn-secondary text-base py-3 px-8">
            पहले से सदस्य हैं? Login
          </button>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-navy-500 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
          {[
            ['₹5,000', 'मासिक योगदान', 'Monthly Contribution'],
            ['₹1,80,000', 'अधिकतम सहायता', 'Max Assistance'],
            ['36 माह', 'योजना अवधि', 'Scheme Duration'],
          ].map(([v, hi, en]) => (
            <div key={v}>
              <p className="font-display text-2xl sm:text-3xl font-bold text-saffron-400">{v}</p>
              <p className="text-xs text-slate-300 hindi mt-1">{hi}</p>
              <p className="text-xs text-slate-400">{en}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl font-bold text-navy-500 hindi">यह कैसे काम करता है?</h2>
          <p className="text-gray-400 text-sm mt-1">How does it work?</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Step n="1" hi="पंजीकरण करें" en="Register with mobile OTP + fill your details" />
          <Step n="2" hi="KYC दस्तावेज़ अपलोड करें" en="Upload Aadhaar, PAN & photo" />
          <Step n="3" hi="पहला योगदान दें" en="Pay ₹5,000 first monthly contribution" />
          <Step n="4" hi="हर महीने बचत करें" en="Auto-debit ₹5,000 every month" />
          <Step n="5" hi="2 माह बाद पात्र हों" en="Become eligible for assistance after 2 months" />
          <Step n="6" hi="सहायता राशि पाएं" en="Apply & receive up to ₹1,80,000" />
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-saffron-50 border-y border-saffron-100 py-14">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl font-bold text-navy-500 hindi">इस योजना के फायदे</h2>
            <p className="text-gray-400 text-sm mt-1">Benefits of this scheme</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Benefit icon="🏦" hi="कम सेवा शुल्क" en="Low admin service charge vs banks" />
            <Benefit icon="📱" hi="ऑनलाइन ट्रैकिंग" en="Track savings on web app anytime" />
            <Benefit icon="⚡" hi="जल्दी सहायता" en="Quick assistance approval" />
            <Benefit icon="🔒" hi="सुरक्षित बचत" en="Your savings are safe & tracked" />
          </div>
        </div>
      </section>

      {/* Important Disclaimer */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-sm text-amber-800">
          <p className="font-semibold hindi mb-2">⚠️ महत्वपूर्ण जानकारी</p>
          <p className="hindi">यह कोई बैंकिंग उत्पाद या सरकारी योजना नहीं है। यह पिनाकी सोशियो केयर फाउंडेशन के पंजीकृत सदस्यों के लिए एक समुदायिक कल्याण व्यवस्था है। सदस्य कल्याण लाभ फाउंडेशन की प्रबंध समिति के विवेकाधिकार पर निर्भर है।</p>
          <p className="mt-2 text-xs text-amber-600">This is not a banking product or government scheme. This is a community welfare arrangement for registered members of Pinaki Socio Care Foundation only.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-14 text-center">
        <div className="card border-saffron-200 bg-gradient-to-br from-saffron-50 to-white py-10">
          <h2 className="font-display text-2xl font-bold text-navy-500 hindi mb-3">आज ही शुरू करें</h2>
          <p className="text-gray-500 hindi mb-6">पिनाकी परिवार से जुड़ें और अपनी बचत को सुरक्षित करें।</p>
          <button onClick={() => navigate('/register')}
            className="btn-primary text-base py-3 px-10 shadow-lg">
            अभी जुड़ें / Join Now →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-500 text-white py-6 text-center">
        <p className="text-sm text-slate-400 hindi">© 2025 पिनाकी सोशियो केयर फाउंडेशन · <a href="https://pinakiworld.com" className="hover:text-saffron-400 transition">pinakiworld.com</a></p>
      </footer>
    </div>
  );
}
