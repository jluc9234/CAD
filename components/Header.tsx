import React, { useState } from 'react';
import { usePremium } from '../contexts/PremiumContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { PremiumIcon, getRandomGradient } from '../constants';
import { ActiveView } from '../types';

interface HeaderProps {
    onPremiumClick: () => void;
    setActiveView: (view: ActiveView) => void;
}

const Header: React.FC<HeaderProps> = ({ onPremiumClick, setActiveView }) => {
    const { isPremium } = usePremium();
    const { currentUser } = useAuth();
    const { notifications } = useNotification();
    const [logoGradient] = useState(() => getRandomGradient());
    const [upgradeButtonGradient, setUpgradeButtonGradient] = useState(() => getRandomGradient());

    const handlePremiumClick = () => {
        onPremiumClick();
        setUpgradeButtonGradient(getRandomGradient());
    }

    return (
        <header className="fixed top-0 left-0 right-0 bg-slate-900/50 backdrop-blur-lg z-30 h-16 flex items-center justify-between px-4 border-b border-slate-800">
            <div className="text-2xl font-extrabold tracking-tighter">
                <span className={`bg-clip-text text-transparent bg-gradient-to-r ${logoGradient}`}>
                    Create-A-Date
                </span>
            </div>
            <div className="flex items-center space-x-4">
                {currentUser && (
                    <button onClick={() => setActiveView('notifications')} className="relative p-2 text-white hover:text-pink-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 17H9a6 6 0 01-6-6V9a2 2 0 012-2h10a2 2 0 012 2v2a6 6 0 01-6 6zM9 9V3a1 1 0 011-1h4a1 1 0 011 1v6" />
                        </svg>
                        {notifications.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {notifications.length}
                            </span>
                        )}
                    </button>
                )}
                {!isPremium && (
                    <button 
                        onClick={handlePremiumClick} 
                        className={`flex items-center space-x-2 bg-gradient-to-r ${upgradeButtonGradient} text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg hover:shadow-orange-500/50 transform hover:scale-105 transition-all duration-300`}>
                        <PremiumIcon className="w-4 h-4" />
                        <span>Upgrade</span>
                    </button>
                )}
                 {currentUser && (
                    <button onClick={() => setActiveView('profile')} className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-600 hover:border-pink-500 transition-colors">
                        <img src={currentUser.images[0]} alt={currentUser.name} className="w-full h-full object-cover" />
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;