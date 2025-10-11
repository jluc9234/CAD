import React from 'react';
import { HeartIcon, CalendarIcon, ChatIcon, UserIcon } from '../constants';
import { ActiveView } from '../types';

interface BottomNavProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const NavItem = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => {
    return (
        <button onClick={onClick} className={`flex flex-col items-center justify-center w-1/4 transition-all duration-300 transform ${isActive ? 'scale-110' : 'scale-90 opacity-60'}`}>
            <div className={`transition-colors duration-300 ${isActive ? 'text-pink-400' : 'text-slate-400'}`}>
                {icon}
            </div>
            <span className={`text-xs mt-1 font-bold transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400'}`}>{label}</span>
            {isActive && <div className="h-1 w-8 bg-pink-500 rounded-full mt-1 shadow-[0_0_10px_theme(colors.pink.500)]"></div>}
        </button>
    );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around z-30">
        <NavItem 
            icon={<HeartIcon className="w-7 h-7" />} 
            label="Discover"
            isActive={activeView === 'swipe'}
            onClick={() => setActiveView('swipe')}
        />
        <NavItem 
            icon={<CalendarIcon className="w-7 h-7" />} 
            label="Dates"
            isActive={activeView === 'dates'}
            onClick={() => setActiveView('dates')}
        />
        <NavItem 
            icon={<ChatIcon className="w-7 h-7" />} 
            label="Matches"
            isActive={activeView === 'matches'}
            onClick={() => setActiveView('matches')}
        />
        <NavItem 
            icon={<UserIcon className="w-7 h-7" />} 
            label="Profile"
            isActive={activeView === 'profile'}
            onClick={() => setActiveView('profile')}
        />
    </nav>
  );
};

export default BottomNav;