import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronDown, Check, Star, Mic, Image, Globe, Zap, Shield, Phone, ArrowRight } from 'lucide-react';

const FEATURES = [
  { icon: '🌾', title: 'Crop Advisory', titleHi: 'फसल सलाह', desc: 'Expert guidance on sowing, harvesting, seed selection, and yield optimization for 200+ crops.' },
  { icon: '🐛', title: 'Pest & Disease Detection', titleHi: 'कीट नियंत्रण', desc: 'Upload crop photos for instant AI-powered disease identification and treatment recommendations.' },
  { icon: '🌦️', title: 'Weather Intelligence', titleHi: 'मौसम पूर्वानुमान', desc: '7-day weather forecasts with farming-specific advice tailored to your location.' },
  { icon: '💰', title: 'Market Prices', titleHi: 'बाज़ार भाव', desc: 'Real-time mandi rates for 50+ crops. Know when to sell for maximum profit.' },
  { icon: '🏛️', title: 'Government Schemes', titleHi: 'सरकारी योजनाएं', desc: 'Complete guidance on PM-Kisan, PMFBY, KCC, and 100+ state & central schemes.' },
  { icon: '🎤', title: 'Voice in Your Language', titleHi: 'अपनी भाषा में', desc: 'Speak in Hindi, English, or 8 regional languages. AGRIFATHER understands you.' },
  { icon: '💧', title: 'Irrigation Planning', titleHi: 'सिंचाई योजना', desc: 'Water-saving drip and sprinkler recommendations. Reduce water use by up to 40%.' },
  { icon: '🐄', title: 'Livestock Care', titleHi: 'पशु देखभाल', desc: 'Expert advice on cattle, buffalo, goat, poultry health, feeding, and breeding.' },
];

const TESTIMONIALS = [
  { name: 'Ramsevak Yadav', location: 'Varanasi, UP', crop: 'Wheat Farmer', text: 'AGRIFATHER ने मेरी गेहूं की फसल में लगे रोग को पहचानकर सही इलाज बताया। इस बार 30% अधिक उत्पादन हुआ!', stars: 5, avatar: '👨‍🌾' },
  { name: 'Sunita Devi', location: 'Patna, Bihar', crop: 'Vegetable Farmer', text: 'Hindi mein puchh sakti hun, Hindi mein jawab milta hai. Meri bhasha mein sab kuch samajh aata hai.', stars: 5, avatar: '👩‍🌾' },
  { name: 'Harbhajan Singh', location: 'Ludhiana, Punjab', crop: 'Rice & Wheat', text: 'ਪੀਐਮ-ਕਿਸਾਨ ਸਕੀਮ ਲਈ ਕਿਵੇਂ ਅਰਜ਼ੀ ਦੇਣੀ ਹੈ, ਸਾਰੀ ਜਾਣਕਾਰੀ ਮਿਲੀ। ਹੁਣ ਸਰਕਾਰ ਦੀ ਮਦਦ ਆਸਾਨ ਹੋ ਗਈ ਹੈ।', stars: 5, avatar: '🧑‍🌾' },
  { name: 'Lakshmi Reddy', location: 'Guntur, Andhra Pradesh', crop: 'Cotton Farmer', text: 'పత్తిలో పురుగుల దాడి జరిగింది. ఫోటో పంపాను, వెంటనే పరిష్కారం ఇచ్చారు. 2 రోజుల్లో పురుగులు పోయాయి!', stars: 5, avatar: '👨‍🌾' },
];

const STATS = [
  { value: '50,000+', label: 'Farmers Helped', icon: '👨‍🌾' },
  { value: '10+', label: 'Languages Supported', icon: '🌐' },
  { value: '200+', label: 'Crops Covered', icon: '🌾' },
  { value: '24/7', label: 'Always Available', icon: '⏰' },
];

export default function LandingPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [typedText, setTypedText] = useState('');
  const prompts = [
    'मेरी गेहूं की फसल में पीले पत्ते आ रहे हैं...',
    'Best fertilizer for cotton kharif season?',
    'PM-Kisan yojana ke liye kaise apply karein?',
    'My tomatoes have black spots - what to do?',
    'Drip irrigation kharche ke baare mein batao',
  ];
  const [promptIdx, setPromptIdx] = useState(0);

  useEffect(() => {
    let i = 0;
    let isDeleting = false;
    const currentPrompt = prompts[promptIdx];
    const interval = setInterval(() => {
      if (!isDeleting) {
        setTypedText(currentPrompt.slice(0, i + 1));
        i++;
        if (i >= currentPrompt.length) { isDeleting = true; setTimeout(() => {}, 2000); }
      } else {
        setTypedText(currentPrompt.slice(0, i - 1));
        i--;
        if (i === 0) {
          isDeleting = false;
          setPromptIdx(p => (p + 1) % prompts.length);
        }
      }
    }, isDeleting ? 40 : 80);
    return () => clearInterval(interval);
  }, [promptIdx]);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <span className="font-display font-bold text-xl text-forest-800">AGRIFATHER</span>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold hidden sm:inline">BETA</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/pricing" className="hidden md:block text-stone-600 hover:text-forest-700 font-medium text-sm">Pricing</Link>
            <Link to="/login" className="text-stone-600 hover:text-stone-800 font-medium text-sm">Login</Link>
            <Link to="/register" className="bg-forest-600 hover:bg-forest-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-sm">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 text-white">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          {['🌾','🌱','🌽','🍅','🥬','🌻','🐄','🌿','🏞️','💧'].map((e, i) => (
            <span key={i} className="absolute text-3xl md:text-5xl animate-float" style={{ left:`${5+i*10}%`, top:`${10+(i%4)*20}%`, animationDelay:`${i*0.9}s` }}>{e}</span>
          ))}
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-forest-800/60 border border-forest-600 text-forest-200 text-sm px-4 py-2 rounded-full mb-6">
              <Zap size={14} className="text-amber-400"/> India's #1 AI Agricultural Assistant
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black leading-tight mb-4">
              Your Farming
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-400 to-yellow-300">
                Father Figure
              </span>
            </h1>
            <p className="text-forest-200 font-devanagari text-2xl md:text-3xl mb-3">अग्रीफादर</p>
            <p className="text-forest-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
              AI-powered agricultural expert that speaks your language. Get instant advice on crops, pests, soil, weather, and government schemes — 24/7.
            </p>

            {/* Mock chat preview */}
            <div className="bg-forest-950/80 border border-forest-700 rounded-2xl p-4 max-w-lg mx-auto mb-8 text-left shadow-2xl backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-forest-800">
                <div className="w-7 h-7 bg-forest-600 rounded-lg flex items-center justify-center text-sm">🌾</div>
                <span className="text-sm font-semibold text-forest-300">AGRIFATHER AI</span>
                <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"/>Online
                </span>
              </div>
              <div className="bg-forest-900/60 rounded-xl p-3 mb-2 text-sm text-forest-200 italic min-h-[48px]">
                {typedText}<span className="animate-pulse text-forest-400">|</span>
              </div>
              <div className="flex items-center gap-2 bg-forest-900 rounded-xl px-3 py-2">
                <span className="text-xs text-forest-500 flex-1">Ask in Hindi, English or any language...</span>
                <Mic size={14} className="text-forest-400"/>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="flex items-center gap-2 bg-forest-500 hover:bg-forest-400 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all shadow-xl hover:shadow-2xl active:scale-95">
                🌾 Start for Free <ArrowRight size={20}/>
              </Link>
              <Link to="/pricing" className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all shadow-xl hover:shadow-2xl">
                <Star size={18}/> View Plans from ₹399
              </Link>
            </div>
            <p className="text-forest-400 text-sm mt-4">No credit card required • Free forever plan available</p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"/>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className="text-3xl font-display font-black text-forest-800">{s.value}</p>
                <p className="text-stone-500 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-stone-900 mb-3">
              Everything a Farmer Needs
            </h2>
            <p className="text-stone-500 text-lg max-w-2xl mx-auto">
              Complete agricultural intelligence in one platform. Smarter than any other AI for farming.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-stone-200 hover:border-forest-300 hover:shadow-agri transition-all duration-200 group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="font-bold text-stone-800 mb-0.5">{f.title}</h3>
                <p className="text-xs text-forest-600 font-devanagari mb-2">{f.titleHi}</p>
                <p className="text-sm text-stone-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Languages */}
      <section className="py-16 bg-gradient-to-r from-forest-800 to-forest-950 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Globe size={40} className="mx-auto mb-4 text-forest-300"/>
          <h2 className="text-3xl font-display font-bold mb-3">Speaks Your Language</h2>
          <p className="text-forest-300 text-lg mb-8">AGRIFATHER understands and responds in 10 Indian languages</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['हिंदी', 'English', 'Hinglish', 'मराठी', 'ગુજરાતી', 'ਪੰਜਾਬੀ', 'తెలుగు', 'தமிழ்', 'ಕನ್ನಡ', 'বাংলা'].map(lang => (
              <span key={lang} className="bg-forest-700/60 border border-forest-600 px-4 py-2 rounded-full text-sm font-medium text-forest-100">
                {lang}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold text-stone-900 mb-2">Farmers Love AGRIFATHER</h2>
            <p className="text-stone-500">किसानों की सच्ची आवाज़</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={`bg-stone-50 border rounded-2xl p-6 transition-all duration-300 ${activeTestimonial === i ? 'border-forest-400 shadow-agri' : 'border-stone-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  {Array(t.stars).fill(0).map((_, j) => <Star key={j} size={14} className="text-amber-400 fill-amber-400"/>)}
                </div>
                <p className="text-stone-700 text-sm leading-relaxed mb-4 font-devanagari">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{t.avatar}</span>
                  <div>
                    <p className="font-bold text-stone-800 text-sm">{t.name}</p>
                    <p className="text-xs text-stone-500">{t.location} • {t.crop}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-16 bg-gradient-to-br from-amber-50 to-forest-50 border-y border-stone-200">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold text-stone-900 mb-3">Start Free, Upgrade Anytime</h2>
          <p className="text-stone-600 mb-6">Pro plan starts at just ₹399/month • Unlimited AI farming advice</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-forest-600 hover:bg-forest-700 text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-md hover:shadow-lg">
              🌾 Start Free Today
            </Link>
            <Link to="/pricing" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-md hover:shadow-lg">
              👑 View Pro Plans
            </Link>
          </div>
          <p className="text-stone-400 text-sm mt-4">₹399/month or ₹4,199/year (save ₹1,589)</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-forest-950 text-forest-300 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌾</span>
              <span className="font-display font-bold text-white text-xl">AGRIFATHER</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link to="/register" className="hover:text-white transition-colors">Register</Link>
              <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            </div>
            <div className="text-sm text-forest-500 text-center">
              <p>Made with ❤️ for Indian Farmers</p>
              <p>Helpline: 1800-180-1551 | PM-Kisan: 155261</p>
            </div>
          </div>
          <div className="border-t border-forest-800 mt-6 pt-6 text-center text-xs text-forest-600">
            © 2026 AGRIFATHER. Empowering Indian farmers with AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
