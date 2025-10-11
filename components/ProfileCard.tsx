import React from 'react';
import { User } from '../types';
import { usePremium } from '../contexts/PremiumContext';
import { PremiumIcon } from '../constants';

interface ProfileCardProps {
  user: User;
  onSwipe: (direction: 'left' | 'right') => void;
  matchPercentage: number;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, onSwipe, matchPercentage }) => {
  const { isPremium } = usePremium();

  return (
    <div className="absolute h-full w-full" style={{ perspective: '1000px' }}>
      {/* This inner div is the visual card and clips the image */}
      <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500">
        <img src={user.images[0]} alt={user.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 text-white w-full">
          <div className="flex justify-between items-start">
            <h2 className="text-4xl font-bold drop-shadow-lg">{user.name}, {user.age}</h2>
            {isPremium ? (
                <div className="text-center">
                    <div className="font-bold text-2xl text-green-300 drop-shadow-lg">{matchPercentage}%</div>
                    <div className="text-xs text-green-200">Match</div>
                </div>
            ) : (
                <div className="text-center backdrop-blur-sm bg-black/20 p-2 rounded-lg">
                    <div className="font-bold text-2xl text-slate-300 blur-sm select-none">??%</div>
                    <div className="text-xs text-yellow-400 flex items-center gap-1"><PremiumIcon className="w-3 h-3"/> Match</div>
                </div>
            )}
          </div>
          <p className="mt-2 text-slate-200 drop-shadow-md">{user.bio}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {user.interests.map(interest => (
              <span key={interest} className="bg-white/20 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full">{interest}</span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Buttons are outside the clipping container, so they are fully visible */}
      <div className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 flex items-center space-x-8">
        <button onClick={() => onSwipe('left')} className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-red-400 border-2 border-red-400 shadow-lg transform hover:scale-110 hover:bg-red-400/30 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <button onClick={() => onSwipe('right')} className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-green-400 border-2 border-green-400 shadow-lg transform hover:scale-110 hover:bg-green-400/30 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;