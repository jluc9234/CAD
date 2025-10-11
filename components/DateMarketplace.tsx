import React, { useState } from 'react';
import { DateIdea, DateCategory } from '../types';
import DateCard from './DateCard';
import { DATE_CATEGORIES, getRandomGradient } from '../constants';

interface DateMarketplaceProps {
  onCreateDate: () => void;
  dateIdeas: DateIdea[];
  isLoading: boolean;
}

const DateMarketplace: React.FC<DateMarketplaceProps> = ({ onCreateDate, dateIdeas, isLoading }) => {
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
    <div className="px-4 text-white h-full overflow-y-auto scrollbar-hide pt-20 pb-24">
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
      
      {isLoading ? (
         <div className="flex items-center justify-center h-40">
            <svg className="animate-spin h-8 w-8 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
      ) : (
        <div className="space-y-4">
            {filteredIdeas.length > 0 ? (
                filteredIdeas.map(idea => (
                    <DateCard key={idea.id} dateIdea={idea} />
                ))
            ) : (
                <div className="text-center py-10">
                    <p className="text-slate-400">No date ideas in this category yet!</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default DateMarketplace;
