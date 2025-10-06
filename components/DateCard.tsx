import React, { useState } from 'react';
import { DateIdea } from '../types';
import { usePremium } from '../contexts/PremiumContext';
import { MapPinIcon, getRandomGradient, PlaneIcon, CalendarIcon, CurrencyDollarIcon, TagIcon } from '../constants';
import DirectionsModal from './DirectionsModal';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface DateCardProps {
  dateIdea: DateIdea;
}

const DateCard: React.FC<DateCardProps> = ({ dateIdea }) => {
  const [interestSent, setInterestSent] = useState(false);
  const [isDirectionsModalOpen, setIsDirectionsModalOpen] = useState(false);
  const { isPremium } = usePremium();
  const [buttonGradient] = useState(() => getRandomGradient());

  const handleInterestClick = async () => {
    setInterestSent(true); // Optimistically disable
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE}/date-ideas/${dateIdea.id}/interest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        setInterestSent(false); // Re-enable if failed
        console.error('Failed to express interest');
      }
    } catch (error) {
      setInterestSent(false); // Re-enable if error
      console.error('Error expressing interest:', error);
    }
  };

  const formattedDate = dateIdea.date ? new Date(dateIdea.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null;

  return (
    <>
      <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-lg hover:border-pink-500/50 hover:shadow-pink-500/10 transition-all duration-300">
        {dateIdea.isOutOfTown && (
          <div className="absolute top-4 right-4 bg-cyan-500/80 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
            <PlaneIcon className="w-4 h-4" />
            Out of Town
          </div>
        )}
        <div className="flex items-center mb-4">
          <img src={dateIdea.authorImage} alt={dateIdea.authorName} className="w-10 h-10 rounded-full mr-4 border-2 border-slate-600" />
          <div>
            <h3 className="font-bold text-lg text-white">{dateIdea.title}</h3>
            <p className="text-sm text-slate-400">by {dateIdea.authorName}</p>
          </div>
        </div>

        {dateIdea.location && (
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
            <MapPinIcon className="w-4 h-4" />
            <span>{dateIdea.location}</span>
          </div>
        )}

        <p className="text-slate-300 mb-4 text-sm">{dateIdea.description}</p>
        
        <div className="border-t border-slate-700/50 my-4"></div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400 mb-4">
            {formattedDate && (
              <div className="flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-slate-500" />
                  <span>{formattedDate}</span>
              </div>
            )}
            {dateIdea.budget && dateIdea.budget !== 'Not Set' && (
              <div className="flex items-center gap-1.5">
                  <CurrencyDollarIcon className="w-4 h-4 text-slate-500" />
                  <span>{dateIdea.budget}</span>
              </div>
            )}
            {dateIdea.dressCode && dateIdea.dressCode !== 'Not Set' && (
              <div className="flex items-center gap-1.5">
                  <TagIcon className="w-4 h-4 text-slate-500" />
                  <span>{dateIdea.dressCode}</span>
              </div>
            )}
        </div>

        <div className="flex justify-between items-center flex-wrap gap-2">
          <span className="text-xs font-semibold bg-pink-500/20 text-pink-300 px-3 py-1 rounded-full">{dateIdea.category}</span>
          <div className="flex items-center gap-2">
            {isPremium && dateIdea.location && (
                <button 
                    onClick={() => setIsDirectionsModalOpen(true)}
                    className="bg-cyan-500/20 text-cyan-300 font-semibold px-4 py-2 rounded-lg hover:bg-cyan-500/40 transform hover:-translate-y-0.5 transition-all duration-300 text-sm flex items-center gap-1"
                >
                    <MapPinIcon className="w-4 h-4" />
                    Directions
                </button>
            )}
            <button 
              onClick={handleInterestClick}
              disabled={interestSent}
              className={`bg-gradient-to-r ${buttonGradient} text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-purple-500/40 transform hover:-translate-y-0.5 transition-all duration-300 text-sm disabled:opacity-60 disabled:transform-none disabled:shadow-none`}
            >
              {interestSent ? "Interest Sent ✓" : "I'm Interested"}
            </button>
          </div>
        </div>
      </div>
      {dateIdea.location && (
          <DirectionsModal 
              isOpen={isDirectionsModalOpen}
              onClose={() => setIsDirectionsModalOpen(false)}
              location={dateIdea.location}
          />
      )}
    </>
  );
};

export default DateCard;