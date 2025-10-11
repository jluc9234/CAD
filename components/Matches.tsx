import React from 'react';
import { Match } from '../types';
import { useMatch } from '../contexts/MatchContext';
import { CalendarIcon } from '../constants';

interface MatchesProps {
    onSelectMatch: (match: Match) => void;
}

const getTimeLeft = (expiry: string) => {
    const total = Date.parse(expiry) - Date.now();
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);

    if (days > 0) return `${days}d left`;
    if (hours > 0) return `${hours}h left`;
    return `Expires soon`;
}

const Matches: React.FC<MatchesProps> = ({ onSelectMatch }) => {
    const { matches } = useMatch();

    if (!matches || matches.length === 0) {
        return (
            <div className="pt-20 pb-24 px-4 text-white text-center h-full flex flex-col justify-center">
                <h1 className="text-3xl font-bold mb-2">Your Matches</h1>
                <p className="text-slate-400 mb-6">No matches yet. Keep swiping to find your connection!</p>
            </div>
        );
    }

    return (
        <div className="px-4 text-white h-full overflow-y-auto scrollbar-hide pt-20 pb-24">
            <h1 className="text-3xl font-bold mb-2">Your Matches</h1>
            <p className="text-slate-400 mb-6">Start a conversation with someone new.</p>

            <div className="space-y-3">
                {matches.map(match => (
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
                        <div className="ml-4 flex-grow overflow-hidden">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg text-white">{match.user.name}</h3>
                                {match.interestType === 'date' && <CalendarIcon className="w-4 h-4 text-cyan-400" />}
                            </div>
                            <p className="text-sm text-slate-400 truncate">
                                {match.messages.length > 0
                                    ? match.messages[match.messages.length - 1].text
                                    : `You matched! Start the conversation.`}
                            </p>
                        </div>
                        {match.interestType === 'date' && match.interestExpiresAt && new Date(match.interestExpiresAt) > new Date() && (
                            <div className="text-xs text-yellow-400 font-semibold bg-yellow-400/10 px-2 py-1 rounded-full whitespace-nowrap">
                                {getTimeLeft(match.interestExpiresAt)}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Matches;
