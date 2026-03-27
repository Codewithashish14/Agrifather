import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, Minus, ExternalLink, Info } from 'lucide-react';

const CATEGORIES = [
  { id: 'grains', label: 'Grains', labelHi: 'अनाज', icon: '🌾' },
  { id: 'pulses', label: 'Pulses', labelHi: 'दालें', icon: '🫘' },
  { id: 'oilseeds', label: 'Oilseeds', labelHi: 'तिलहन', icon: '🌻' },
  { id: 'vegetables', label: 'Vegetables', labelHi: 'सब्जियां', icon: '🥬' },
  { id: 'cotton_sugarcane', label: 'Cotton & Cane', labelHi: 'कपास व गन्ना', icon: '🏭' },
];

function PriceRow({ item }) {
  const isUp = item.trend === 'up';
  const isDown = item.trend === 'down';
  return (
    <div className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0 hover:bg-stone-50 px-2 rounded-lg transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-stone-800 truncate">{item.crop}</p>
        <p className="text-xs text-stone-400">{item.variety} {item.msp && <span className="text-forest-600">• MSP ₹{item.msp.toLocaleString('en-IN')}</span>}</p>
      </div>
      <div className="text-right flex-shrink-0 ml-4">
        <p className="font-bold text-stone-800">₹{item.price.toLocaleString('en-IN')}</p>
        <p className="text-xs text-stone-400">per {item.unit}</p>
      </div>
      <div className={`ml-4 flex items-center gap-1 text-xs font-semibold flex-shrink-0 w-16 justify-end ${
        isUp ? 'text-forest-600' : isDown ? 'text-red-500' : 'text-stone-400'
      }`}>
        {isUp ? <TrendingUp size={13}/> : isDown ? <TrendingDown size={13}/> : <Minus size={13}/>}
        {item.change !== 0 ? `${item.change > 0 ? '+' : ''}₹${item.change}` : 'Stable'}
      </div>
    </div>
  );
}

export default function MarketPage() {
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('prices');
  const [activeCategory, setActiveCategory] = useState('grains');

  useEffect(() => { fetchMarket(); }, []);

  const fetchMarket = async () => {
    try {
      const { data } = await axios.get('/market');
      setMarket(data);
    } catch { } finally { setLoading(false); }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center"><div className="text-5xl mb-3 animate-bounce">📊</div>
      <p className="text-stone-500">Loading market prices...</p></div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto bg-stone-50">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-display font-bold text-forest-900">Market Intelligence</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            बाज़ार जानकारी • Last updated: {market && new Date(market.lastUpdated).toLocaleString('en-IN')}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white border border-stone-200 rounded-xl p-1 w-fit">
          {[
            { id: 'prices', label: 'Mandi Prices', icon: '📊' },
            { id: 'schemes', label: 'Govt Schemes', icon: '🏛️' },
            { id: 'tips', label: 'Market Tips', icon: '💡' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id ? 'bg-forest-600 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Prices Tab */}
        {tab === 'prices' && market && (
          <>
            {/* Category filter */}
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all border ${
                    activeCategory === cat.id
                      ? 'bg-forest-600 text-white border-forest-700'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-forest-300 hover:bg-forest-50'
                  }`}
                >
                  <span>{cat.icon}</span> {cat.label}
                  <span className="text-xs opacity-60 font-devanagari">({cat.labelHi})</span>
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm">
              <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
                <h3 className="font-semibold text-stone-800">
                  {CATEGORIES.find(c => c.id === activeCategory)?.icon} {CATEGORIES.find(c => c.id === activeCategory)?.label} Prices
                </h3>
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <div className="flex items-center gap-1"><TrendingUp size={12} className="text-forest-500"/><span>Up</span></div>
                  <div className="flex items-center gap-1"><TrendingDown size={12} className="text-red-500"/><span>Down</span></div>
                </div>
              </div>
              <div className="p-2">
                {market.prices[activeCategory]?.map((item, i) => (
                  <PriceRow key={i} item={item} />
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex gap-2">
                <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">{market.disclaimer}</p>
              </div>
            </div>
          </>
        )}

        {/* Schemes Tab */}
        {tab === 'schemes' && (
          <SchemesList />
        )}

        {/* Tips Tab */}
        {tab === 'tips' && market && (
          <div className="space-y-3">
            <h2 className="font-semibold text-forest-800">Market Tips for Farmers</h2>
            {market.tips.map((tip, i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                <span className="text-2xl flex-shrink-0">{tip.icon}</span>
                <p className="text-sm text-stone-700">{tip.text}</p>
              </div>
            ))}
            <div className="bg-forest-50 border border-forest-200 rounded-xl p-4 mt-4">
              <h3 className="font-semibold text-forest-800 mb-2">🌐 Useful Links</h3>
              {[
                { name: 'eNAM - Online Mandi', url: 'https://enam.gov.in' },
                { name: 'Agmarknet - Mandi Prices', url: 'http://agmarknet.gov.in' },
                { name: 'PM-KISAN Portal', url: 'https://pmkisan.gov.in' },
                { name: 'Kisan Suvidha App', url: 'https://play.google.com/store/apps/details?id=in.mofpi.kisansuvidha' },
              ].map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between py-2.5 border-b border-forest-100 last:border-0 text-sm text-forest-700 hover:text-forest-900 group">
                  <span>{link.name}</span>
                  <ExternalLink size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SchemesList() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/market/schemes').then(({ data }) => setSchemes(data.schemes)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-8 text-stone-400">Loading schemes...</div>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-500">Key government schemes for Indian farmers • किसानों के लिए सरकारी योजनाएं</p>
      {schemes.map(scheme => (
        <div key={scheme.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-agri transition-all">
          <div className="flex items-start gap-4">
            <span className="text-3xl flex-shrink-0">{scheme.icon}</span>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="font-bold text-forest-800">{scheme.name}</h3>
                  <p className="text-xs text-stone-500">{scheme.fullName}</p>
                </div>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full flex-shrink-0">{scheme.benefit}</span>
              </div>
              <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">Eligibility</p>
                  <p className="text-stone-700">{scheme.eligibility}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">How to Apply</p>
                  <p className="text-stone-700">{scheme.howToApply}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                  📞 Helpline: {scheme.helpline}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
