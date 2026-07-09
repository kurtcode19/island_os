import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { UilCreditCard, UilTimes, UilRefresh, UilCheckCircle, UilExclamationCircle } from '@/icons';
import { createPaymentIntent, getStripePublishableKey } from '../../lib/paymentUtils';

interface StripePaymentModalProps {
  bookingId: string;
  bookingName: string;
  amount: number;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
}

export default function StripePaymentModal({ bookingId, bookingName, amount, onClose, onSuccess }: StripePaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const handleStripePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const { clientSecret } = await createPaymentIntent(bookingId);
      const stripeKey = getStripePublishableKey();
      if (!stripeKey) {
        setError('Stripe is not configured');
        setLoading(false);
        return;
      }

      const stripe = await loadStripe(stripeKey);
      if (!stripe) {
        setError('Failed to load Stripe');
        setLoading(false);
        return;
      }

      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: await getCardElement(stripe),
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
      } else {
        onSuccess(bookingId);
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymongoPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const { createPaymongoPayment } = await import('../../lib/paymentUtils');
      const { checkoutUrl } = await createPaymongoPayment(bookingId);
      setCheckoutUrl(checkoutUrl);
      window.open(checkoutUrl, '_blank');
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (checkoutUrl) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-island-volcanic/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl text-center">
          <UilCheckCircle size="48" className="text-island-emerald mx-auto mb-4" />
          <h3 className="text-xl font-bold text-island-volcanic mb-2">Checkout Opened</h3>
          <p className="text-sm text-slate-500 mb-6">Complete your payment in the new tab. If the tab didn't open, click the button below.</p>
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-island-emerald text-white py-5 rounded-2xl font-bold text-sm mb-3 text-center hover:bg-island-green transition-all"
          >
            Open Checkout
          </a>
          <button onClick={onClose} className="text-sm text-slate-400 hover:text-slate-600 font-semibold">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-island-volcanic/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-island-volcanic">Pay Online</h3>
          <button onClick={onClose} className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-island-coral transition-all">
            <UilTimes size="16" />
          </button>
        </div>

        <div className="mb-6 p-5 bg-stone-50 rounded-2xl border border-stone-100">
          <p className="text-xs text-slate-500 font-semibold mb-1">{bookingName}</p>
          <p className="text-3xl font-black text-island-volcanic">₱{amount.toLocaleString()}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 rounded-2xl border-2 border-rose-100 text-island-coral text-xs font-bold flex items-start gap-3">
            <UilExclamationCircle size="18" className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleStripePayment}
            disabled={loading}
            className="w-full bg-island-emerald text-white py-5 rounded-2xl font-bold text-sm hover:bg-island-green active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? <UilRefresh size="20" className="animate-spin" /> : <UilCreditCard size="20" />}
            Pay with Card
          </button>

          <button
            onClick={handlePaymongoPayment}
            disabled={loading}
            className="w-full bg-island-sunset text-white py-5 rounded-2xl font-bold text-sm hover:bg-amber-600 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? <UilRefresh size="20" className="animate-spin" /> : <UilCreditCard size="20" />}
            Pay with GCash / Maya
          </button>

          <p className="text-[10px] text-center text-slate-400 font-semibold pt-2">
            Powered by Stripe & PayMongo
          </p>
        </div>
      </div>
    </div>
  );
}

// ponytail: inline card element for the one-time modal use case
async function getCardElement(stripe: any) {
  const elements = stripe.elements();
  const cardElement = elements.create('card', {
    style: {
      base: {
        fontSize: '16px',
        color: '#0e1116',
        fontFamily: 'inherit',
      },
    },
  });
  return cardElement;
}
