import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Zap, X, Check, Lock, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { SubscriptionPlanId } from '../../types';
import { SUBSCRIPTION_PLANS } from '../../data/pricingData';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlanId?: SubscriptionPlanId;
  initialBillingCycle?: 'monthly' | 'annual';
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  initialPlanId = 'pro',
  initialBillingCycle = 'monthly'
}) => {
  const { user } = useAuth();
  const { changePlan } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>(initialPlanId);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(initialBillingCycle);
  const [gateway, setGateway] = useState<'2checkout' | 'dodopay'>('2checkout');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const plan = SUBSCRIPTION_PLANS[selectedPlan] || SUBSCRIPTION_PLANS.pro;
  const price = billingCycle === 'annual' ? plan.annualBillingTotal : plan.priceMonthly;

  const handleStartCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          billingCycle,
          gateway,
          userId: user?.uid || 'guest_user',
          userEmail: user?.email || 'guest@catalystlab.tech'
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to initialize checkout session');
      }

      setCheckoutUrl(data.checkoutUrl);
      
      // Simulate successful payment confirmation after 2.5s for seamless testing preview experience
      setTimeout(async () => {
        await changePlan(selectedPlan, billingCycle);
        setSuccess(true);
        setLoading(false);
        setTimeout(() => {
          setSuccess(false);
          setCheckoutUrl(null);
          onClose();
        }, 2000);
      }, 2500);

    } catch (err: any) {
      setError(err.message || 'Payment processing error');
      setLoading(false);
    }
  };

  const paidTiers: SubscriptionPlanId[] = ['starter', 'pro', 'team', 'enterprise'];

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        id="payment-checkout-modal-card"
        className="relative w-full max-w-2xl bg-gray-100 border border-gray-200 rounded-2xl shadow-2xl overflow-hidden text-black animate-scaleUp"
      >
        {/* Top Header Gradient Bar */}
        <div className={`h-2 bg-gradient-to-r ${gateway === '2checkout' ? 'from-cyan-500 via-blue-600 to-indigo-500' : 'from-purple-500 via-pink-500 to-amber-500'} transition-all duration-300`} />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-600 hover:text-white rounded-lg hover:bg-black/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
          aria-label="Close Checkout"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header Badge & Title */}
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider rounded-full bg-cyan-950/40 text-accent-cyan border border-accent-cyan/30">
              <Lock className="w-3.5 h-3.5" /> Secure Checkout
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-emerald" /> 256-Bit Encrypted
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-black mt-1">
            Upgrade to <span className="text-accent-cyan">{plan.name}</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
            Choose your preferred global payment gateway below for secure instant access.
          </p>

          {/* Gateway Selector */}
          <div className="mt-6">
            <div className="text-xs font-mono font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Select Payment Gateway:
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGateway('2checkout')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                  gateway === '2checkout'
                    ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-lg'
                    : 'bg-surface-panel border-gray-200 text-gray-600 hover:border-gray-200'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-accent-cyan" /> 2Checkout (Verifone)
                  </div>
                  <div className="text-[11px] text-gray-600 mt-0.5">Global Primary Gateway</div>
                </div>
                {gateway === '2checkout' && <Check className="w-4 h-4 text-accent-cyan shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => setGateway('dodopay')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                  gateway === 'dodopay'
                    ? 'bg-purple-950/40 border-purple-500 text-white shadow-lg'
                    : 'bg-surface-panel border-gray-200 text-gray-600 hover:border-gray-200'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-purple-400" /> Dodo Payments
                  </div>
                  <div className="text-[11px] text-gray-600 mt-0.5">Secure Backup Gateway</div>
                </div>
                {gateway === 'dodopay' && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
              </button>
            </div>
          </div>

          {/* Tier Selector */}
          <div className="mt-5">
            <div className="text-xs font-mono font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Subscription Plan:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {paidTiers.map((tierKey) => {
                const tierItem = SUBSCRIPTION_PLANS[tierKey];
                const isSelected = selectedPlan === tierKey;
                const tierPrice = billingCycle === 'annual' ? tierItem.annualBillingTotal : tierItem.priceMonthly;
                return (
                  <button
                    key={tierKey}
                    type="button"
                    onClick={() => setSelectedPlan(tierKey)}
                    className={`relative p-3 rounded-xl text-left border transition-all ${
                      isSelected 
                        ? 'bg-black/40 border-accent-cyan text-white shadow-md' 
                        : 'bg-surface-panel border-gray-200 text-gray-600 hover:border-gray-200'
                    }`}
                  >
                    {tierItem.popular && (
                      <span className="absolute -top-2 right-2 px-1.5 py-0.5 text-[9px] font-bold rounded bg-accent-cyan text-brand-navy">
                        POPULAR
                      </span>
                    )}
                    <div className="text-xs font-medium text-gray-600">{tierItem.name}</div>
                    <div className="text-lg font-bold text-white mt-0.5 font-mono">
                      ${tierPrice}<span className="text-[11px] text-gray-600 font-normal">/{billingCycle === 'annual' ? 'yr' : 'mo'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Billing Cycle Selector */}
          <div className="mt-5 flex items-center justify-between p-3 rounded-xl bg-surface-panel border border-gray-200">
            <span className="text-xs font-bold text-black">Billing Cycle</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  billingCycle === 'monthly' ? 'bg-black text-white shadow' : 'text-gray-600 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'annual' ? 'bg-black text-white shadow' : 'text-gray-600 hover:text-white'
                }`}
              >
                <span>Annual</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-accent-emerald/20 text-accent-emerald font-mono">Save 15%</span>
              </button>
            </div>
          </div>

          {/* Summary Box */}
          <div className="mt-5 p-4 rounded-xl bg-white border border-gray-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
              <span>Selected Plan ({plan.name} - {billingCycle})</span>
              <span className="text-black font-mono font-bold">${price}.00</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
              <span>Gateway Engine</span>
              <span className="text-accent-cyan font-mono font-bold uppercase">{gateway === 'dodopay' ? 'Dodo Payments (Backup)' : '2Checkout (Verifone)'}</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-sm font-bold text-white">
              <span>Total Due Today</span>
              <span className="text-accent-cyan font-mono text-base">${price}.00 USD</span>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {checkoutUrl && loading && (
            <div className="mt-4 p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-accent-cyan" />
                <span>Redirecting to {gateway === 'dodopay' ? 'Dodo Payments' : '2Checkout'} Sandbox Gateway...</span>
              </span>
              <a href={checkoutUrl} target="_blank" rel="noreferrer" className="text-white underline flex items-center gap-1 font-mono">
                Open URL <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-600">
              {user ? <span>Account: <strong className="text-white">{user.email}</strong></span> : <span>Signed in as Guest</span>}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-white rounded-lg hover:bg-black/25 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartCheckout}
                disabled={loading || success}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 ${
                  success
                    ? 'bg-accent-emerald text-white'
                    : 'bg-black hover:bg-gray-800 text-white border border-gray-200'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-accent-cyan" />
                    <span>Processing Payment...</span>
                  </>
                ) : success ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Payment Confirmed!</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-accent-cyan" />
                    <span>Pay ${price} via {gateway === 'dodopay' ? 'DodoPay' : '2Checkout'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PaymentCheckoutModal;
