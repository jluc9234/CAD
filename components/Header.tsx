import React, { useState } from 'react';
import { usePremium } from '../contexts/PremiumContext';
import { useAuth } from '../contexts/AuthContext';
import { PremiumIcon, getRandomGradient } from '../constants';
import { ActiveView } from '../types';
import NotificationBell from './NotificationBell';

interface HeaderProps {
    onPremiumClick: () => void;
    setActiveView: (view: ActiveView) => void;
}

const Header: React.FC<HeaderProps> = ({ onPremiumClick, setActiveView }) => {
    const { isPremium } = usePremium();
    const { currentUser } = useAuth();
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
                {!isPremium && (
                    <button 
                        onClick={handlePremiumClick} 
                        className={`flex items-center space-x-2 bg-gradient-to-r ${upgradeButtonGradient} text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg hover:shadow-orange-500/50 transform hover:scale-105 transition-all duration-300`}>
                        <PremiumIcon className="w-4 h-4" />
                        <span>Upgrade</span>
                    </button>
                )}
                 {currentUser && (
                    <>
                        <NotificationBell />
                        <button onClick={() => setActiveView('profile')} className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-600 hover:border-pink-500 transition-colors">
                            <img src={currentUser.images[0]} alt={currentUser.name} className="w-full h-full object-cover" />
                        </button>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;