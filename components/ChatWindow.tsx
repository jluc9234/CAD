import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Match, Message } from '../types';
import { usePremium } from '../contexts/PremiumContext';
import { useAuth } from '../contexts/AuthContext';
import { getConversationSuggestions } from '../services/geminiService';
import { SparklesIcon, InfoIcon } from '../constants';
import { apiService } from '../services/apiService';
import AiSuggestionModal from './AiSuggestionModal';

interface ChatWindowProps {
  match: Match;
  onBack: () => void;
  onPremiumClick: () => void;
}

const getTimeRemaining = (expiry: string): string => {
    const total = Date.parse(expiry) - Date.now();
    if (total <= 0) return "Expired";
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
    return "Expires soon";
}

const ChatWindow: React.FC<ChatWindowProps> = ({ match: initialMatch, onBack, onPremiumClick }) => {
    const [match, setMatch] = useState(initialMatch);
    const [messages, setMessages] = useState<Message[]>(match.messages);
    const [inputText, setInputText] = useState('');
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
    const { isPremium } = usePremium();
    const { currentUser } = useAuth();
    const endOfMessagesRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    // Derived state for chat logic
    const { isDateInterest, isExpired, isCurrentUserAuthor, isInputDisabled, bannerMessage } = useMemo(() => {
        const isDateInterest = match.interestType === 'date';
        if (!isDateInterest || !currentUser) {
            return { isDateInterest: false, isExpired: false, isCurrentUserAuthor: false, isInputDisabled: false, bannerMessage: null };
        }

        const isExpired = match.interestExpiresAt ? new Date(match.interestExpiresAt) < new Date() : false;
        const isCurrentUserAuthor = currentUser.id === match.dateAuthorId;
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

        let isInputDisabled = false;
        let bannerMessage = null;

        if (isExpired) {
            if (isCurrentUserAuthor) {
                isInputDisabled = false;
                bannerMessage = "Initial chat window expired. Send a message to re-engage.";
            } else { // Interested user
                isInputDisabled = lastMessage?.senderId !== match.dateAuthorId;
                bannerMessage = `Chat expired. Respond to ${match.user.name} to continue the conversation.`;
            }
        } else if (match.interestExpiresAt) {
            isInputDisabled = false;
            bannerMessage = `This chat is open for a limited time: ${getTimeRemaining(match.interestExpiresAt)}`;
        }

        return { isDateInterest, isExpired, isCurrentUserAuthor, isInputDisabled, bannerMessage };
    }, [match, messages, currentUser]);


    const handleSend = async () => {
        if (inputText.trim() === '' || !currentUser) return;
        
        const newMessage = await apiService.sendMessage(match.id, currentUser.id, inputText);
        setMessages(prev => [...prev, newMessage]);
        setInputText('');

        if (isExpired && !isCurrentUserAuthor) {
            setMatch(prev => ({...prev, interestExpiresAt: null}));
        }
    };
    
    const handleAiBuddyClick = async () => {
        if (!isPremium) {
            onPremiumClick();
            return;
        }

        setIsSuggestionModalOpen(true);
        setIsLoadingSuggestions(true);
        setSuggestions([]);

        try {
            if (!currentUser) throw new Error("User not found");
            const newSuggestions = await getConversationSuggestions(messages, currentUser, match.user);
            setSuggestions(newSuggestions);
        } catch (error) {
            console.error("Failed to get AI suggestions", error);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };
    
    const handleSelectSuggestion = (suggestion: string) => {
        setInputText(suggestion);
    };

    return (
        <div className="fixed inset-0 bg-slate-900 z-40 flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center p-4 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
                <button onClick={onBack} className="text-slate-300 mr-4">&larr;</button>
                <img src={match.user.images[0]} alt={match.user.name} className="w-10 h-10 rounded-full object-cover" />
                <h2 className="ml-3 text-lg font-bold text-white">{match.user.name}</h2>
            </div>
            
            {/* Messages */}
            <div className="flex-grow p-4 overflow-y-auto flex flex-col">
                <div className="space-y-4 mt-auto">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-end ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.senderId === currentUser?.id ? 'bg-pink-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={endOfMessagesRef} />
                </div>
            </div>
            
            {/* Banner */}
            {bannerMessage && (
                <div className="flex-shrink-0 px-4 py-2 bg-slate-800/70 text-center text-xs text-yellow-300 flex items-center justify-center gap-2">
                    <InfoIcon className="w-4 h-4" />
                    {bannerMessage}
                </div>
            )}

            {/* Input */}
            <div className="flex-shrink-0 p-4 bg-slate-900/80 backdrop-blur-lg border-t border-slate-800">
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={handleAiBuddyClick}
                        disabled={isLoadingSuggestions || isInputDisabled}
                        className="p-2 bg-purple-600 rounded-full text-white disabled:opacity-50 transition-all hover:bg-purple-500"
                        title={isPremium ? "Get AI conversation suggestions" : "Upgrade to Premium for AI Buddy"}
                        >
                       <SparklesIcon className="w-6 h-6"/>
                    </button>
                    <input 
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isInputDisabled ? "Waiting for a response..." : "Type a message..."}
                        className="flex-grow bg-slate-800 border border-slate-700 rounded-full px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-60"
                        disabled={isInputDisabled}
                    />
                    <button onClick={handleSend} disabled={isInputDisabled} className="bg-pink-600 text-white rounded-full p-3 disabled:opacity-60">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                </div>
            </div>
             <AiSuggestionModal 
                isOpen={isSuggestionModalOpen}
                onClose={() => setIsSuggestionModalOpen(false)}
                isLoading={isLoadingSuggestions}
                suggestions={suggestions}
                onSelectSuggestion={handleSelectSuggestion}
            />
        </div>
    );
};

export default ChatWindow;