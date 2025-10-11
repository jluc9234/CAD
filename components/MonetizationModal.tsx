import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SparklesIcon, getRandomGradient } from '../constants';
import { useNotification } from '../contexts/NotificationContext';
import { apiService } from '../services/apiService';

interface MonetizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MonetizationModal: React.FC<MonetizationModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, refetchUser } = useAuth();
  const { addNotification } = useNotification();
  const [iconGradient] = useState(() => getRandomGradient());
  const [titleGradient] = useState(() => getRandomGradient());
  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && paypalRef.current && currentUser && (window as any).paypal) {
        // Clear any previous buttons
        if(paypalRef.current.innerHTML) {
            paypalRef.current.innerHTML = '';
        }

        (window as any).paypal.Buttons({
            createOrder: (_data: any, actions: any) => {
                return actions.order.create({
                    purchase_units: [{
                        description: "Create-A-Date Premium (One-Time)",
                        amount: {
                            value: '10.00',
                            currency_code: 'USD'
                        },
                        // IMPORTANT: We attach the user's ID here.
                        // The backend webhook will use this to identify who made the purchase.
                        custom_id: currentUser.id 
                    }]
                });
            },
            onApprove: async (_data: any, actions: any) => {
                const order = await actions.order.capture();
                console.log("Payment successful:", order);
                addNotification("Payment successful! Your premium status is being updated...", 'info');
                
                onClose(); // Close modal immediately

                // Poll for status update in the background
                let attempts = 0;
                const intervalId = setInterval(async () => {
                    attempts++;
                    const updatedUser = await apiService.getCurrentUserProfile();
                    // Stop polling if the user is now premium or after 10 attempts (30 seconds)
                    if (updatedUser?.isPremium || attempts >= 10) {
                        clearInterval(intervalId);
                        await refetchUser(); // Update global auth context state
                        if (updatedUser?.isPremium) {
                            addNotification("Welcome to Premium! All features are now unlocked.", 'info');
                        } else {
                            addNotification("Could not confirm premium status automatically. Please refresh the page.", 'info');
                        }
                    }
                }, 3000);
            },
            onError: (err: any) => {
                console.error("PayPal Error:", err);
                addNotification("An error occurred with your payment. Please try again.", 'info');
            }
        }).render(paypalRef.current);
    }
  }, [isOpen, currentUser, addNotification, onClose, refetchUser]);


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
          <p className="text-slate-300 mt-2">One-time payment for lifetime access.</p>
        </div>

        <div className="my-6 space-y-3 text-slate-200">
            {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-green-500/80 shadow-[0_0_10px_theme(colors.green.500)] flex-shrink-0"></div>
                    <span>{feature}</span>
                </div>
            ))}
        </div>

        <div className="mt-8">
            <div ref={paypalRef}></div>
            <p className="text-xs text-slate-400 mt-4 text-center">
                Your premium status will be updated automatically after payment.
            </p>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default MonetizationModal;