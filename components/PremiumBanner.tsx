import React from 'react';
import { SparklesIcon } from '../constants';

interface PremiumBannerProps {
  onDismiss: () => void;
  onUpgrade: () => void;
}

const PremiumBanner: React.FC<PremiumBannerProps> = ({ onDismiss, onUpgrade }) => {
  return (
    <div 
        className="fixed top-16 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-500 p-3 text-white text-sm z-20 flex items-center justify-between shadow-lg"
        style={{ height: '44px' }}
    >
        <div className="flex items-center gap-2 flex-grow">
            <SparklesIcon className="w-5 h-5 flex-shrink-0" />
            <p className="font-semibold hidden sm:block">
                Unlock AI, see who likes you, & more with Premium!
            </p>
            <p className="font-semibold sm:hidden">
                Go Premium for AI & more!
            </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
            <button
                onClick={onUpgrade}
                className="bg-white/20 hover:bg-white/30 font-bold py-1 px-4 rounded-full transition-colors whitespace-nowrap"
            >
                Upgrade
            </button>
            <button onClick={onDismiss} className="hover:bg-white/20 rounded-full p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    </div>
  );
};

export default PremiumBanner;
