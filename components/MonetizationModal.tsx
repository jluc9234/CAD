import React, { useState } from 'react';
import { SparklesIcon, getRandomGradient } from '../constants';

interface MonetizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MonetizationModal: React.FC<MonetizationModalProps> = ({ isOpen, onClose }) => {
  const [iconGradient] = useState(() => getRandomGradient());
  const [titleGradient] = useState(() => getRandomGradient());
  const [buttonGradient, setButtonGradient] = useState(() => getRandomGradient());

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

        <div className="mt-8">
            <a 
              href="https://paypal.me/jluc92/10.00" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => setButtonGradient(getRandomGradient())}
              className={`block w-full text-center bg-gradient-to-r ${buttonGradient} text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-cyan-400/50 transform hover:-translate-y-1 transition-all duration-300 text-lg`}
            >
              Upgrade for $10.00
            </a>
            <p className="text-xs text-slate-400 mt-4 text-center">
                After payment, your premium status will be updated automatically. This may take a few moments.
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