import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Zap, Star, Shield } from 'lucide-react';

export default function PricingPage({ embedded }) {
  const { user, isPro, refreshUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/payment/plans').then(({ data }) => setPlans(data.plans)).finally(() => setLoading(false));
  }, []);

  const handlePurchase = async (planId) => {
    if (!user) { navigate('/register'); return; }
    if (isPro) { toast.success('You already have Pro! 🎉'); return; }
    
    setProcessingPlan(planId);
    try {
      const { data } = await axios.post('/payment/create-order', { plan: planId });

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'AGRIFATHER',
        description: `Pro Plan - ${planId === 'monthly' ? 'Monthly' : 'Yearly'}`,
        image: '/favicon.svg',
        order_id: data.orderId,
        prefill: {
          name: data.userName,
          email: data.userEmail,
          contact: data.userPhone,
        },
        theme: { color: '#16a34a' },
        modal: {
          ondismiss: () => { setProcessingPlan(null); toast('Payment cancelled', { icon: '❌' }); }
        },
        handler: async (response) => {
          try {
            await axios.post('/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              plan: planId,
            });
            await refreshUser();
            toast.success('🎉 Welcome to AGRIFATHER Pro! Unlimited farming wisdom awaits!', { duration: 5000 });
            if (embedded) navigate('/dashboard');
          } catch (err) {
            toast.error(err.response?.data?.error || 'Payment verification failed');
          } finally { setProcessingPlan(null); }
        }
      };

      if (!window.Razorpay) {
        toast.error('Payment gateway not loaded. Please refresh the page.');
        setProcessingPlan(null);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.');
        setProcessingPlan(null);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to initiate payment');
      setProcessingPlan(null);
    }
  };

  const Container = embedded ? 'div' : 'div';

  return (
    <div className={`${embedded ? 'h-full overflow-y-auto bg-stone-50' : 'min-h-screen bg-gradient-to-b from-forest-950 via-forest-900 to-stone-900'}`}>
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          {!embedded && (
            <div className="inline-flex items-center gap-2 bg-forest-800 text-forest-200 text-xs px-4 py-2 rounded-full mb-4 border border-forest-700">
              <Zap size={12} className="text-amber-400" /> India's Most Advanced AI for Farmers
            </div>
          )}
          <h1 className={`text-3xl md:text-4xl font-display font-bold mb-3 ${embedded ? 'text-forest-900' : 'text-white'}`}>
            Upgrade to AGRIFATHER Pro
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${embedded ? 'text-stone-600' : 'text-forest-300'}`}>
            Get unlimited AI farming advice, voice support, disease detection, and more.
          </p>
          <p className={`font-devanagari mt-1 ${embedded ? 'text-forest-600' : 'text-forest-400'}`}>
            असीमित कृषि सहायता के लिए अपग्रेड करें 🌾
          </p>
        </div>

        {/* Plans */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">{Array(3).fill(0).map((_,i) => <div key={i} className="shimmer h-96 rounded-2xl"/>)}</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => {
              const isPopular = plan.badge === 'Most Popular';
              const isBestValue = plan.badge === 'Best Value';
              const isCurrentPlan = user?.plan === plan.id || (isPro && plan.id !== 'free');

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                    isPopular
                      ? 'ring-2 ring-forest-400 shadow-2xl shadow-forest-900/30 scale-105'
                      : isBestValue
                      ? 'ring-2 ring-amber-400 shadow-2xl shadow-amber-900/20'
                      : embedded ? 'border border-stone-200 bg-white shadow-sm' : 'border border-forest-800 bg-forest-950/50'
                  } ${embedded ? '' : 'bg-gradient-to-b'}`}
                >
                  {plan.badge && (
                    <div className={`absolute top-0 left-0 right-0 py-1.5 text-center text-xs font-bold tracking-wide ${
                      isPopular ? 'bg-forest-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {isPopular ? '⭐ ' : '💰 '}{plan.badge}
                    </div>
                  )}

                  <div className={`p-6 ${plan.badge ? 'pt-10' : ''} ${embedded ? 'bg-white' : 'bg-forest-950/60 backdrop-blur-sm'}`}>
                    <div className="mb-5">
                      <h3 className={`text-lg font-bold mb-1 ${embedded ? 'text-stone-800' : 'text-white'}`}>{plan.name}</h3>
                      <div className="flex items-end gap-1">
                        <span className={`text-4xl font-display font-black ${embedded ? 'text-forest-700' : 'text-white'}`}>
                          {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString('en-IN')}`}
                        </span>
                        {plan.period && (
                          <span className={`text-sm pb-1.5 ${embedded ? 'text-stone-500' : 'text-forest-400'}`}>/{plan.period}</span>
                        )}
                      </div>
                      {plan.savings && (
                        <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full mt-2">
                          💰 {plan.savings}
                        </span>
                      )}
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check size={15} className="text-forest-500 flex-shrink-0 mt-0.5" />
                          <span className={`text-sm ${embedded ? 'text-stone-700' : 'text-forest-200'}`}>{feat}</span>
                        </li>
                      ))}
                      {plan.limitations?.map((lim, i) => (
                        <li key={i} className="flex items-start gap-2.5 opacity-50">
                          <span className="text-stone-400 flex-shrink-0 mt-0.5 text-xs">✗</span>
                          <span className={`text-sm ${embedded ? 'text-stone-500' : 'text-forest-400'} line-through`}>{lim}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => plan.price > 0 ? handlePurchase(plan.id) : (user ? navigate('/dashboard') : navigate('/register'))}
                      disabled={processingPlan === plan.id || (isPro && plan.price > 0)}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                        plan.price === 0
                          ? embedded ? 'bg-stone-100 text-stone-700 hover:bg-stone-200' : 'bg-forest-800 text-forest-200 hover:bg-forest-700'
                          : isPopular
                          ? 'bg-forest-600 hover:bg-forest-500 text-white shadow-lg hover:shadow-xl active:scale-95'
                          : 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg hover:shadow-xl active:scale-95'
                      }`}
                    >
                      {processingPlan === plan.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full"/>
                          Processing...
                        </span>
                      ) : isPro && plan.price > 0 ? (
                        <span className="flex items-center justify-center gap-2"><Crown size={15}/> Current Plan</span>
                      ) : plan.price === 0 ? (
                        user ? 'Continue Free' : 'Get Started Free'
                      ) : (
                        <span className="flex items-center justify-center gap-2"><Crown size={15}/> Upgrade Now</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Trust signals */}
        <div className={`mt-12 grid md:grid-cols-3 gap-6 text-center ${embedded ? '' : ''}`}>
          {[
            { icon: <Shield size={24}/>, title: 'Secure Payments', desc: 'Powered by Razorpay. 100% safe & encrypted.' },
            { icon: <Star size={24}/>, title: 'Cancel Anytime', desc: 'No long-term commitment. Cancel when you want.' },
            { icon: <Zap size={24}/>, title: 'Instant Activation', desc: 'Pro features activate immediately after payment.' },
          ].map((t, i) => (
            <div key={i} className={`flex flex-col items-center gap-2 p-4 rounded-xl ${embedded ? 'bg-white border border-stone-200' : 'bg-forest-900/40 border border-forest-800'}`}>
              <div className={`p-2.5 rounded-xl ${embedded ? 'bg-forest-100 text-forest-600' : 'bg-forest-800 text-forest-400'}`}>{t.icon}</div>
              <h4 className={`font-semibold text-sm ${embedded ? 'text-stone-800' : 'text-white'}`}>{t.title}</h4>
              <p className={`text-xs ${embedded ? 'text-stone-500' : 'text-forest-400'}`}>{t.desc}</p>
            </div>
          ))}
        </div>

        {!embedded && (
          <p className="text-center text-forest-500 text-xs mt-8">
            Questions? Contact us at support@agrifather.in | Kisan Helpline: 1800-180-1551
          </p>
        )}
      </div>
    </div>
  );
}
