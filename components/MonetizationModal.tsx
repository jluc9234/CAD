import React, { useState, useEffect } from 'react';
import { usePremium } from '../contexts/PremiumContext';
import { SparklesIcon, getRandomGradient } from '../constants';

// Declare the paypal object on the window to satisfy TypeScript
declare global {
  interface Window {
    paypal: any;
  }
}

interface MonetizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MonetizationModal: React.FC<MonetizationModalProps> = ({ isOpen, onClose }) => {
  const { setPremium } = usePremium();

  const [iconGradient] = useState(() => getRandomGradient());
  const [titleGradient] = useState(() => getRandomGradient());
  const [loading, setLoading] = useState(false);

  // This handleApprove function is now stable and can be used in the effect
  const handleApprove = async (orderID: string) => {
    setLoading(true);
    try {
      const res = await fetch('/.netlify/functions/verify-payment', { // Corrected function name
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderID }),
      });
      const data = await res.json();
      
      // Assuming your server function returns a status field
      if (data.status === 'COMPLETED') { 
        setPremium(true);
        onClose();
        alert('Payment successful! Premium features unlocked.');
      } else {
        alert('Payment could not be verified. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while verifying payment.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Use useEffect to render the PayPal button safely
  useEffect(() => {
    // Don't do anything if the modal isn't open or if PayPal script isn't loaded yet
    if (!isOpen || !window.paypal) {
      return;
    }

    // Clear the container in case of re-renders
    const container = document.getElementById('paypal-button-container');
    if (container) container.innerHTML = '';

    window.paypal.Buttons({
      style: { layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' },
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: { value: '10.00' }
          }]
        });
      },
      // The onApprove function can now directly call your handleApprove function
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          handleApprove(details.id); // 'details.id' is the orderID
        });
      },
      onError: (err: any) => {
        console.error("PayPal Button Error:", err);
        alert("An error occurred with your payment.");
      }
    }).render('#paypal-button-container');

  }, [isOpen]); // Re-run this effect if the `isOpen` status changes

  if (!isOpen) return null;

  const features = [
    "Unlimited Recalls: Undo your last swipe.",
    "Full AI Power: Unlimited date enhancements & icebreakers.",
    "See Who Likes You: Instantly view all your admirers.",
    "Unlimited Messaging: Chat without restrictions."
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex justify-center items-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-2xl p-8 max-w-md w-full text-white transform scale-95 hover:scale-100 transition-transform duration-300" onClick={e => e.stopPropagation()}>
        <div className="text-center">
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br ${iconGradient} shadow-[0_0_20px_theme(colors.purple.500)] mb-4`}>
            <SparklesIcon className="h-8 w-8 text-white"/>
          </div>
          <h2 className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${titleGradient}`}>
            Unlock Premium
          </h2>
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
        
        {loading && <div className="text-center text-slate-300">Processing payment...</div>}

        <div className="mt-8">
          <div id="paypal-button-container"></div>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default MonetizationModal;
