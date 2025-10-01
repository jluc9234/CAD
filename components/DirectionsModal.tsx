import React, { useState } from 'react';
import { MapPinIcon, getRandomGradient } from '../constants';

interface DirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: string;
}

const DirectionsModal: React.FC<DirectionsModalProps> = ({ isOpen, onClose, location }) => {
  const [iconGradient] = useState(() => getRandomGradient());
  const [titleGradient] = useState(() => getRandomGradient());
  const [buttonGradient, setButtonGradient] = useState(() => getRandomGradient());

  if (!isOpen) return null;

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setButtonGradient(getRandomGradient());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex justify-center items-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-white transform scale-95 hover:scale-100 transition-transform duration-300 text-center" onClick={e => e.stopPropagation()}>
        <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br ${iconGradient} shadow-[0_0_20px_theme(colors.blue.500)] mb-4 animate-pulse`}>
            <MapPinIcon className="h-8 w-8 text-white"/>
        </div>
        <h2 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${titleGradient}`}>
          Adventure Awaits!
        </h2>
        <p className="text-slate-300 mt-2 mb-6">Ready to find your way to <span className="font-bold text-white">{location}</span>?</p>
        
        <button 
          onClick={handleGetDirections}
          className={`w-full bg-gradient-to-r ${buttonGradient} text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-cyan-400/50 transform hover:-translate-y-1 transition-all duration-300`}
        >
          Let's Go!
        </button>

        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default DirectionsModal;