import React, { useState } from 'react';
import { DateIdea, DateCategory } from '../types';
import DateCard from './DateCard';
import { MOCK_DATE_IDEAS } from '../data/mockData';
import { DATE_CATEGORIES, getRandomGradient } from '../constants';

interface DateMarketplaceProps {
  onCreateDate: () => void;
  dateIdeas: DateIdea[];
  onInterestUpdate: (dateIdeaId: number, hasInterested: boolean, interestCount: number) => void;
}

const DateMarketplace: React.FC<DateMarketplaceProps> = ({ onCreateDate, dateIdeas, onInterestUpdate }) => {
  const [selectedCategory, setSelectedCategory] = useState<DateCategory | 'All'>('All');
  const [buttonGradient, setButtonGradient] = useState(() => getRandomGradient());

  const filteredIdeas = selectedCategory === 'All'
    ? dateIdeas
    : dateIdeas.filter(idea => idea.category === selectedCategory);

  const handleCreateClick = () => {
    onCreateDate();
    setButtonGradient(getRandomGradient());
  };

  return (
    <div className="pt-20 pb-24 px-4 text-white h-full overflow-y-auto scrollbar-hide">
      <h1 className="text-3xl font-bold mb-2">Date Marketplace</h1>
      <p className="text-slate-400 mb-6">Discover unique date ideas posted by others.</p>

      <div className="mb-6">
        <button 
          onClick={handleCreateClick} 
          className={`w-full bg-gradient-to-r ${buttonGradient} text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-purple-500/50 transform hover:-translate-y-1 transition-all duration-300`}
        >
          Create-A-Date
        </button>
      </div>

      <div className="flex overflow-x-auto space-x-3 pb-4 mb-6 scrollbar-hide">
        <button 
          onClick={() => setSelectedCategory('All')}
          className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${selectedCategory === 'All' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' : 'bg-slate-800/70 text-slate-300'}`}
        >
          All
        </button>
        {DATE_CATEGORIES.map(category => (
          <button 
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${selectedCategory === category ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' : 'bg-slate-800/70 text-slate-300'}`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredIdeas.map(idea => (
          <DateCard key={idea.id} dateIdea={idea} onInterestUpdate={onInterestUpdate} />
        ))}
      </div>
    </div>
  );
};

export default DateMarketplace;