import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Smartphone,
  CreditCard,
  Wallet,
  Landmark,
  CheckCircle2,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  handler: (response: RazorpaySuccessResponse) => Promise<void> | void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const loadRazorpayScript = () => {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById('razorpay-checkout-js');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PaymentOptions: React.FC = () => {
  const t = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { totalAmount, turfName, date, rawDate, slots, turfId } = (location.state as any) || { totalAmount: 0 };

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [bookingIdentity] = useState(() => {
    const fallbackEmail = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@kicko.local`;
    const storedUserStr = localStorage.getItem('kicko_user');

    if (!storedUserStr) {
      return {
        userId: undefined as string | undefined,
        name: 'Guest User',
        email: fallbackEmail,
        phone: undefined as string | undefined,
      };
    }

    try {
      const storedUser = JSON.parse(storedUserStr) as {
        id?: string;
        name?: string;
        email?: string;
        phone?: string;
      };

      return {
        userId: storedUser.id,
        name: storedUser.name || 'Guest User',
        email: storedUser.email || fallbackEmail,
        phone: storedUser.phone,
      };
    } catch {
      return {
        userId: undefined as string | undefined,
        name: 'Guest User',
        email: fallbackEmail,
        phone: undefined as string | undefined,
      };
    }
  });

  const upiOptions = [
    { id: 'gpay', name: 'GPay', icon: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg' },
    { id: 'phonepe', name: 'PhonePe', icon: 'https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg' },
    { id: 'paytm', name: 'Paytm', icon: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Paytm_Logo_%28standalone%29.svg' },
  ];

  const walletOptions = [
    { id: 'amazonpay', name: 'Amazon Pay' },
    { id: 'mobikwik', name: 'MobiKwik' },
    { id: 'credpay', name: 'CRED Pay' },
    { id: 'olamoney', name: 'Ola Money' },
  ];

  const handleMethodSelect = (id: string) => {
    setSelectedMethod(id);
  };

  const handlePayment = async () => {
    if (!selectedMethod || isProcessing) return;

    setIsProcessing(true);

    try {
      if (!turfId || !rawDate || !Array.isArray(slots) || slots.length === 0) {
        throw new Error('Missing booking details. Please go back and select a turf and slots again.');
      }

      const orderRes = await fetch('http://localhost:5000/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          turfId,
          date: rawDate,
          slots,
          userId: bookingIdentity.userId,
          guestName: bookingIdentity.name,
          guestEmail: bookingIdentity.email,
        }),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const orderData = await orderRes.json() as {
        keyId: string;
        order: { id: string; amount: number; currency: string; receipt?: string };
      };

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Razorpay checkout failed to load');
      }

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency || 'INR',
        name: 'Kicko Turf Booking',
        description: `${turfName} booking`,
        order_id: orderData.order.id,
        prefill: {
          name: bookingIdentity.name,
          email: bookingIdentity.email,
          contact: bookingIdentity.phone,
        },
        theme: {
          color: '#3A8F73',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            const verifyRes = await fetch('http://localhost:5000/api/payments/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                turfId,
                date: rawDate,
                slots,
                userId: bookingIdentity.userId,
                guestName: bookingIdentity.name,
                guestEmail: bookingIdentity.email,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            navigate('/payment-success', {
              state: {
                bookingId: verifyData.bookings?.[0]?.id || response.razorpay_payment_id,
                totalAmount,
                turfName,
                date,
                slot: Array.isArray(slots) ? slots.join(', ') : '',
                slots,
                paymentMethod: 'RAZORPAY',
                userName: bookingIdentity.name,
              },
            });
          } catch (verifyError: any) {
            console.error(verifyError);
            alert(verifyError.message || 'Payment verification failed');
          } finally {
            setIsProcessing(false);
          }
        },
      });

      razorpay.open();
    } catch (error: any) {
      console.error(error);
      alert('Booking failed: ' + error.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="pt-24 pb-20 max-w-2xl mx-auto px-4">
      <div className="flex items-center mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-black italic tracking-tighter text-text-heading">{t.selectPayment}</h1>
      </div>

      <div className="bg-primary/5 p-6 rounded-[24px] border border-primary/10 mb-8 flex justify-between items-center">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-black text-text-description mb-1">{t.payableAmount}</p>
          <p className="text-3xl font-black text-text-heading italic">â‚¹{totalAmount}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-text-secondary">{turfName}</p>
          <p className="text-[10px] text-text-description font-bold">{date} â€¢ {slots?.length} {t.slots || 'Slots'}</p>
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="text-[10px] uppercase tracking-widest font-black text-text-description ml-4 mb-3 flex items-center">
            <Smartphone size={12} className="mr-2" /> {t.upi}
          </h3>
          <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm">
            {upiOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleMethodSelect(option.id)}
                className={`w-full p-5 flex items-center justify-between transition-all border-b border-gray-50 last:border-0 ${selectedMethod === option.id ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center p-2 shadow-sm">
                    <img src={option.icon} alt={option.name} className="w-full h-full object-contain" />
                  </div>
                  <span className="font-bold text-text-primary">{option.name}</span>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === option.id ? 'border-primary bg-primary' : 'border-gray-200'}`}>
                  {selectedMethod === option.id && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            ))}
            <button className="w-full p-5 flex items-center space-x-4 hover:bg-gray-50 transition-all border-b border-gray-50">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-text-secondary">
                <Plus size={20} />
              </div>
              <span className="font-bold text-text-secondary">{t.addNewUPI}</span>
            </button>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] uppercase tracking-widest font-black text-text-description ml-4 mb-3 flex items-center">
            <CreditCard size={12} className="mr-2" /> {t.cards}
          </h3>
          <div className="bg-white rounded-[24px] border border-gray-100 p-5 shadow-sm">
            <button
              onClick={() => setSelectedMethod('card')}
              className={`w-full group ${selectedMethod === 'card' ? '' : 'opacity-80'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-left">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-text-secondary">
                    <Plus size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">{t.newCard}</p>
                    <div className="flex space-x-2 mt-1 grayscale group-hover:grayscale-0 transition-all">
                      <span className="text-[8px] font-black border border-gray-200 px-1 rounded uppercase flex items-center justify-center h-4 w-10">Visa</span>
                      <span className="text-[8px] font-black border border-gray-200 px-1 rounded uppercase flex items-center justify-center h-4 w-10">Master</span>
                      <span className="text-[8px] font-black border border-gray-200 px-1 rounded uppercase flex items-center justify-center h-4 w-10">RuPay</span>
                    </div>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'card' ? 'border-primary bg-primary' : 'border-gray-200'}`}>
                  {selectedMethod === 'card' && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </div>

              {selectedMethod === 'card' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="pt-4 space-y-4 border-t border-gray-50"
                >
                  <input type="text" placeholder={t.cardNumber} className="w-full bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/20 transition-all font-bold text-sm" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder={t.expiry} className="bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/20 transition-all font-bold text-sm" />
                    <input type="password" placeholder={t.cvv} className="bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/20 transition-all font-bold text-sm" />
                  </div>
                  <input type="text" placeholder={t.nameOnCard} className="w-full bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/20 transition-all font-bold text-sm" />
                </motion.div>
              )}
            </button>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] uppercase tracking-widest font-black text-text-description ml-4 mb-3 flex items-center">
            <Wallet size={12} className="mr-2" /> {t.otherOptions}
          </h3>
          <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm">
            {walletOptions.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => setSelectedMethod(wallet.id)}
                className={`w-full p-5 flex items-center justify-between transition-all border-b border-gray-50 last:border-0 ${selectedMethod === wallet.id ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
              >
                <span className="font-bold text-text-primary">{wallet.name}</span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === wallet.id ? 'border-primary bg-primary' : 'border-gray-200'}`}>
                  {selectedMethod === wallet.id && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-[10px] uppercase tracking-widest font-black text-text-description ml-4 mb-3 flex items-center">
            <Landmark size={12} className="mr-2" /> {t.netBanking}
          </h3>
          <div className="bg-white rounded-[24px] border border-gray-100 p-5 shadow-sm">
            <button
              onClick={() => setSelectedMethod('netbanking')}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-text-secondary">
                  <Landmark size={20} />
                </div>
                <span className="font-bold text-text-primary">{t.selectBank}</span>
              </div>
              <ChevronRight size={20} className="text-text-secondary" />
            </button>
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 z-50">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handlePayment}
            disabled={!selectedMethod || isProcessing}
            className="w-full py-5 bg-primary hover:bg-primary-dark text-text-primary font-black rounded-3xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center group active:scale-[0.98] disabled:opacity-50 disabled:grayscale transition-all"
          >
            {isProcessing ? (
              <div className="w-6 h-6 border-4 border-text-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="mr-2 group-hover:scale-110 transition-transform" />
                {t.proceedToPay} â‚¹{totalAmount}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptions;
