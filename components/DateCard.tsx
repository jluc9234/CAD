import React, { useEffect, useState } from 'react';
import { DateIdea, DateInterestUpdate } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { usePremium } from '../contexts/PremiumContext';
import { MapPinIcon, getRandomGradient, PlaneIcon, CalendarIcon, CurrencyDollarIcon, TagIcon } from '../constants';
import DirectionsModal from './DirectionsModal';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface DateCardProps {
  dateIdea: DateIdea;
  onInterestUpdate: (dateIdeaId: number, hasInterested: boolean, interestCount: number) => void;
}

const DateCard: React.FC<DateCardProps> = ({ dateIdea, onInterestUpdate }) => {
  const [hasInterested, setHasInterested] = useState(Boolean(dateIdea.hasInterested));
  const [interestCount, setInterestCount] = useState<number>(dateIdea.interestCount ?? 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirectionsModalOpen, setIsDirectionsModalOpen] = useState(false);
  const { currentUser } = useAuth();
  const { isPremium } = usePremium();
  const [buttonGradient] = useState(() => getRandomGradient());

  useEffect(() => {
    setHasInterested(Boolean(dateIdea.hasInterested));
    setInterestCount(dateIdea.interestCount ?? 0);
  }, [dateIdea.hasInterested, dateIdea.interestCount]);

  const handleInterestClick = async () => {
    console.log('Interest button clicked for date:', dateIdea.id);
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    // Optimistically update UI
    setHasInterested(true);
    setInterestCount(prev => prev + 1);
    onInterestUpdate(dateIdea.id, true, (dateIdea.interestCount ?? 0) + 1);
    setIsSubmitting(false);
    try {
      console.log('Calling API:', `${API_BASE}/date-ideas/${dateIdea.id}/interest`);
      const response = await fetch(`${API_BASE}/date-ideas/${dateIdea.id}/interest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('API response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error:', errorText);
        // Revert on failure
        setHasInterested(Boolean(dateIdea.hasInterested));
        setInterestCount(dateIdea.interestCount ?? 0);
        onInterestUpdate(dateIdea.id, Boolean(dateIdea.hasInterested), dateIdea.interestCount ?? 0);
        return;
      }
      const data: DateInterestUpdate = await response.json();
      console.log('API response data:', data);
      // Update with real data
      setHasInterested(data.hasInterested);
      setInterestCount(data.interestCount);
      onInterestUpdate(dateIdea.id, data.hasInterested, data.interestCount);
      console.log('Interest updated successfully');
    } catch (error) {
      console.error('Error expressing interest:', error);
      // Revert on error
      setHasInterested(Boolean(dateIdea.hasInterested));
      setInterestCount(dateIdea.interestCount ?? 0);
      onInterestUpdate(dateIdea.id, Boolean(dateIdea.hasInterested), dateIdea.interestCount ?? 0);
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
              disabled={hasInterested || isSubmitting}
              className={`bg-gradient-to-r ${buttonGradient} text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-purple-500/40 transform hover:-translate-y-0.5 transition-all duration-300 text-sm disabled:opacity-60 disabled:transform-none disabled:shadow-none`}
            >
              {hasInterested ? "Interest Sent ✓" : isSubmitting ? "Sending..." : "I'm Interested"}
            </button>
            <span className="text-sm text-slate-400">
              {interestCount} interested
            </span>
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