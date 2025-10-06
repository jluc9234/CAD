import React, { useState, useEffect } from 'react';
import { Match, User, Message } from '../types';
import { MOCK_MATCHES } from '../data/mockData';

interface MatchesProps {
    onSelectMatch: (match: Match) => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const Matches: React.FC<MatchesProps> = ({ onSelectMatch }) => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE}/matches`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const matchesData = await response.json();
                
                // Transform API response to Match format
                const transformedMatches: Match[] = await Promise.all(
                    matchesData.map(async (matchData: any) => {
                        // Create User object from API response
                        const user: User = {
                            id: matchData.userid,
                            name: matchData.name,
                            age: matchData.age,
                            email: '', // Not needed for display
                            bio: matchData.bio || '',
                            images: Array.isArray(matchData.images) ? matchData.images : [],
                            interests: Array.isArray(matchData.interests) ? matchData.interests : []
                        };

                        // Fetch messages for this match
                        const messages = await fetchMessages(matchData.id);
                        
                        return {
                            id: matchData.id,
                            user,
                            messages
                        };
                    })
                );
                
                setMatches(transformedMatches);
            } else {
                console.error('Failed to fetch matches');
                // Fallback to mock data if API fails
                setMatches(MOCK_MATCHES);
            }
        } catch (error) {
            console.error('Error fetching matches:', error);
            // Fallback to mock data if API fails
            setMatches(MOCK_MATCHES);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (matchId: number): Promise<Message[]> => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE}/messages/${matchId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const messagesData = await response.json();
                return messagesData.map((msg: any) => ({
                    id: msg.id,
                    senderId: msg.sender_id,
                    text: msg.text,
                    timestamp: new Date(msg.timestamp).toLocaleString()
                }));
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
        return [];
    };

    if (loading) {
        return (
            <div className="pt-20 pb-24 px-4 text-white">
                <h1 className="text-3xl font-bold mb-2">Your Matches</h1>
                <p className="text-slate-400 mb-6">Loading...</p>
            </div>
        );
    }

    return (
        <div className="pt-20 pb-24 px-4 text-white">
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
                            src={match.user.images[0] || 'https://picsum.photos/seed/default/100/100'} 
                            alt={match.user.name} 
                            className="w-16 h-16 rounded-full object-cover border-2 border-slate-600"
                        />
                        <div className="ml-4 flex-grow">
                            <h3 className="font-bold text-lg text-white">{match.user.name}</h3>
                            <p className="text-sm text-slate-400 truncate">
                                {match.messages.length > 0 
                                    ? match.messages[match.messages.length - 1].text 
                                    : "Say hello! 👋"
                                }
                            </p>
                        </div>
                    </div>
                ))}
                
                {matches.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-slate-400">No matches yet. Keep swiping! 💕</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Matches;
