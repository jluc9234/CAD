import React, { useState, useEffect } from 'react';
import { usePremium } from '../contexts/PremiumContext';
import { SparklesIcon, getRandomGradient } from '../constants';

interface MonetizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MonetizationModal: React.FC<MonetizationModalProps> = ({ isOpen, onClose }) => {
  const { setPremium } = usePremium();

  const [iconGradient] = useState(() => getRandomGradient());
  const [titleGradient] = useState(() => getRandomGradient());
  const [buttonGradient, setButtonGradient] = useState(() => getRandomGradient());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const features = [
    "Unlimited Recalls: Undo your last swipe.",
    "Full AI Power: Unlimited date enhancements & icebreakers.",
    "See Who Likes You: Instantly view all your admirers.",
    "Unlimited Messaging: Chat without restrictions."
  ];

  useEffect(() => {
    if (!isOpen) return;

    // @ts-ignore
    if (window.paypal) {
      // Render PayPal Buttons
      // @ts-ignore
      window.paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: { value: '10.00' }
            }]
          });
        },
        onApprove: async (data: any, actions: any) => {
          setLoading(true);
          setError("");

          try {
            // Capture payment
            const order = await actions.order.capture();

            // Verify with backend
            const res = await fetch(`/.netlify/functions/verifyPayment?orderID=${order.id}`);
            const result = await res.json();

            if (result.paid) {
              setPremium(true);
              onClose();
            } else {
              setError("Payment not verified. Please try again.");
            }
          } catch (err: any) {
            setError(err.message || "Error verifying payment.");
          } finally {
            setLoading(false);
          }
        },
        onError: (err: any) => {
          console.error("PayPal error:", err);
          setError("Payment could not be processed. Try again later.");
        }
      }).render('#paypal-button-container');
    }
  }, [isOpen, setPremium, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-2xl p-8 max-w-md w-full text-white" onClick={e => e.stopPropagation()}>
        
        <div className="text-center">
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br ${iconGradient} shadow-[0_0_20px_theme(colors.purple.500)] mb-4`}>
            <SparklesIcon className="h-8 w-8 text-white"/>
          </div>
          <h2 className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${titleGradient}`}>Unlock Premium</h2>
          <p className="text-slate-300 mt-2">One-time payment. Endless possibilities.</p>
        </div>

        <div className="my-6 space-y-3 text-slate-200">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-green-500/80 shadow-[0_0_10px_theme(colors.green.500)] flex-shrink-0"></div>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <div className="mt-8">
          <div id="paypal-button-container"></div>
          {loading && <p className="text-center mt-2 text-slate-300">Verifying payment...</p>}
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </div>
  );
};

export default MonetizationModal;
