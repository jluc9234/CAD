import React from 'react';
import { Match, User } from '../types';
import { MOCK_MATCHES } from '../data/mockData';

interface MatchesProps {
    onSelectMatch: (match: Match) => void;
}

const Matches: React.FC<MatchesProps> = ({ onSelectMatch }) => {
    return (
        <div className="pt-20 pb-24 px-4 text-white">
            <h1 className="text-3xl font-bold mb-2">Your Matches</h1>
            <p className="text-slate-400 mb-6">Start a conversation with someone new.</p>

            <div className="space-y-3">
                {MOCK_MATCHES.map(match => (
                    <div 
                        key={match.id}
                        onClick={() => onSelectMatch(match)}
                        className="flex items-center p-3 bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl cursor-pointer hover:border-pink-500/50 transition-colors duration-300"
                    >
                        <img 
                            src={match.user.images[0]} 
                            alt={match.user.name} 
                            className="w-16 h-16 rounded-full object-cover border-2 border-slate-600"
                        />
                        <div className="ml-4 flex-grow">
                            <h3 className="font-bold text-lg text-white">{match.user.name}</h3>
                            <p className="text-sm text-slate-400 truncate">
                                {match.messages[match.messages.length - 1].text}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Matches;
