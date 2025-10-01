import React, { useState, useRef, useEffect } from 'react';
import { Match, Message } from '../types';
import { usePremium } from '../contexts/PremiumContext';
import { generateIcebreaker } from '../services/geminiService';
import { SparklesIcon } from '../constants';

interface ChatWindowProps {
  match: Match;
  onBack: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ match, onBack }) => {
    const [messages, setMessages] = useState<Message[]>(match.messages);
    const [inputText, setInputText] = useState('');
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const { isPremium } = usePremium();
    const endOfMessagesRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (inputText.trim() === '') return;
        const newMessage: Message = {
            id: Date.now(),
            senderId: 0, // Current user
            text: inputText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([...messages, newMessage]);
        setInputText('');
    };
    
    const handleIcebreaker = async () => {
        if(!isPremium) return;
        setIsLoadingAI(true);
        try {
            const icebreaker = await generateIcebreaker(match.user.name);
            setInputText(icebreaker);
        } catch (error) {
            console.error("Failed to generate icebreaker", error);
        } finally {
            setIsLoadingAI(false);
        }
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
            <div className="flex-grow p-4 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-end ${msg.senderId === 0 ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.senderId === 0 ? 'bg-pink-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={endOfMessagesRef} />
                </div>
            </div>

            {/* Input */}
            <div className="flex-shrink-0 p-4 bg-slate-900/80 backdrop-blur-lg border-t border-slate-800">
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={handleIcebreaker}
                        disabled={!isPremium || isLoadingAI}
                        className="p-2 bg-purple-600 rounded-full text-white disabled:opacity-50 transition-all hover:bg-purple-500"
                        title={isPremium ? "Generate AI Icebreaker" : "Available for Premium users"}
                        >
                       <SparklesIcon className="w-6 h-6"/>
                    </button>
                    <input 
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-grow bg-slate-800 border border-slate-700 rounded-full px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <button onClick={handleSend} className="bg-pink-600 text-white rounded-full p-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
