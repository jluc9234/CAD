/// <reference types="vite/client" />

import React, { useState, useEffect } from 'react';
import { ActiveView, DateIdea, Match } from './types';
import { useAuth } from './contexts/AuthContext';
import { useNotification } from './contexts/NotificationContext';
import { MOCK_DATE_IDEAS } from './data/mockData';

// Components
import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import SwipeDeck from './components/SwipeDeck';
import DateMarketplace from './components/DateMarketplace';
import CreateDate from './components/CreateDate';
import Matches from './components/Matches';
import ChatWindow from './components/ChatWindow';
import ProfileScreen from './components/ProfileScreen';
import MonetizationModal from './components/MonetizationModal';
import NotificationToast from './components/NotificationToast';
import NotificationPage from './components/NotificationPage';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const App: React.FC = () => {
    const { currentUser } = useAuth();
    const { notifications } = useNotification();

    const [activeView, setActiveView] = useState<ActiveView>('swipe');
    const [isMonetizationModalOpen, setMonetizationModalOpen] = useState(false);
    const [isCreateDateVisible, setCreateDateVisible] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [dateIdeas, setDateIdeas] = useState<DateIdea[]>(MOCK_DATE_IDEAS);

    const handlePostDate = async (newDate: DateIdea) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE}/date-ideas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: newDate.title,
                    description: newDate.description,
                    category: newDate.category,
                    location: newDate.location,
                    date: newDate.date,
                    budget: newDate.budget,
                    dressCode: newDate.dressCode
                })
            });
            if (response.ok) {
                const savedDate = await response.json();
                setDateIdeas(prev => [savedDate, ...prev]);
                setCreateDateVisible(false);
                setActiveView('dates');
            } else {
                alert('Failed to save date idea. Please try again.');
            }
        } catch (error) {
            alert('Error posting date. Please check your connection and try again.');
        }
    };

    const fetchDateIdeas = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE}/date-ideas`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const ideas = await response.json();
                setDateIdeas(ideas);
            }
        } catch (error) {
            console.error('Error fetching date ideas:', error);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchDateIdeas();
        }
    }, [currentUser]);

    if (!currentUser) {
        return <LoginScreen />;
    }

    const renderActiveView = () => {
        switch (activeView) {
            case 'swipe':
                return <SwipeDeck />;
            case 'dates':
                return <DateMarketplace dateIdeas={dateIdeas} onCreateDate={() => setCreateDateVisible(true)} />;
            case 'matches':
                return <Matches onSelectMatch={setSelectedMatch} />;
            case 'profile':
                return <ProfileScreen onPremiumClick={() => setMonetizationModalOpen(true)} />;
            case 'notifications':
                return <NotificationPage />;
            default:
                return <SwipeDeck />;
        }
    };
    
    const appStyle: React.CSSProperties = currentUser?.background
        ? {
            backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.7), rgba(0, 0, 0, 0.9)), url(${currentUser.background})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        }
        : {};


    return (
        <div className="bg-gradient-to-br from-slate-900 via-black to-slate-900 h-screen w-screen overflow-hidden text-white font-sans transition-all duration-500" style={appStyle}>
            <Header onPremiumClick={() => setMonetizationModalOpen(true)} setActiveView={setActiveView} />

            <main className="h-full w-full">
                {renderActiveView()}
            </main>
            
            <BottomNav activeView={activeView} setActiveView={setActiveView} />

            {/* Modals and Overlays */}
            {isCreateDateVisible && (
                <CreateDate 
                    onBack={() => setCreateDateVisible(false)} 
                    onPostDate={handlePostDate} 
                    onPremiumClick={() => setMonetizationModalOpen(true)}
                />
            )}
            {selectedMatch && (
                <ChatWindow match={selectedMatch} onBack={() => setSelectedMatch(null)} />
            )}
            <MonetizationModal 
                isOpen={isMonetizationModalOpen}
                onClose={() => setMonetizationModalOpen(false)}
            />

            {/* Notification Container */}
            <div aria-live="polite" aria-atomic="true" className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 space-y-2 z-50 pointer-events-none">
                {notifications.map(notification => (
                    <NotificationToast key={notification.id} notification={notification} />
                ))}
            </div>
        </div>
    );
};

export default App;