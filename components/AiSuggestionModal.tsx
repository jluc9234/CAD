import React from 'react';
import { SparklesIcon, getRandomGradient } from '../constants';

interface AiSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
}

const AiSuggestionModal: React.FC<AiSuggestionModalProps> = ({ isOpen, onClose, isLoading, suggestions, onSelectSuggestion }) => {
  if (!isOpen) return null;

  const [titleGradient] = React.useState(() => getRandomGradient());

  const handleSuggestionClick = (suggestion: string) => {
    onSelectSuggestion(suggestion);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex justify-center items-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-sm w-full text-white transform scale-95 hover:scale-100 transition-transform duration-300" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-4">
          <h2 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${titleGradient} flex items-center justify-center gap-2`}>
            <SparklesIcon className="w-6 h-6" />
            AI Buddy Suggestions
          </h2>
          <p className="text-slate-400 mt-1 text-sm">Tap a suggestion to use it.</p>
        </div>

        <div className="space-y-3 min-h-[150px] flex flex-col justify-center">
          {isLoading ? (
            <div className="flex justify-center items-center">
              <svg className="animate-spin h-8 w-8 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors duration-200"
              >
                <p className="text-slate-200">{suggestion}</p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AiSuggestionModal;