import React, { useState, useEffect } from 'react';
import { ActiveView, DateIdea, Match, PersistentNotification } from './types';
import { useAuth } from './contexts/AuthContext';

import SwipeDeck from './components/SwipeDeck';
import DateMarketplace from './components/DateMarketplace';
import ChatWindow from './components/ChatWindow';
import Header from './components/Header';
import LoginScreen from './components/LoginScreen';
import Matches from './components/Matches';
import MonetizationModal from './components/MonetizationModal';
import NotificationToast from './components/NotificationToast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

import BottomNav from './components/BottomNav';
import CreateDate from './components/CreateDate';
import ProfileScreen from './components/ProfileScreen';
import Notifications from './components/Notifications';

import { useNotification } from './contexts/NotificationContext';

const App: React.FC = () => {
    const { currentUser } = useAuth();
    const { notifications } = useNotification();
    const [activeView, setActiveView] = useState<ActiveView>('swipe');
    const [isMonetizationModalOpen, setMonetizationModalOpen] = useState(false);
    const [isCreateDateVisible, setCreateDateVisible] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [dateIdeas, setDateIdeas] = useState<DateIdea[]>([]);
    const [persistentNotifications, setPersistentNotifications] = useState<PersistentNotification[]>([]);
    const handleInterestUpdate = (dateIdeaId: number, hasInterested: boolean, interestCount: number) => {
        setDateIdeas(prev => prev.map(idea =>
            idea.id === dateIdeaId ? { ...idea, hasInterested, interestCount } : idea
        ));
    };

    const handlePostDate = async (newDate: DateIdea) => {
        const token = localStorage.getItem('token');
        console.log('Posting date idea:', newDate);
        console.log('Token exists:', !!token);
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
            console.log('Response status:', response.status);
            if (response.ok) {
                const savedDate = await response.json();
                console.log('Saved date:', savedDate);
                const normalizedDate: DateIdea = {
                    ...savedDate,
                    interestCount: savedDate.interestCount ?? 0,
                    hasInterested: Boolean(savedDate.hasInterested),
                };
                setDateIdeas(prev => [normalizedDate, ...prev]);
                setCreateDateVisible(false);
                setActiveView('dates');
            } else {
                const errorText = await response.text();
                console.error('Failed to save date idea:', response.status, errorText);
                alert('Failed to save date idea. Please try again.');
            }
        } catch (error) {
            console.error('Error posting date:', error);
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
            } else {
                console.error('Failed to fetch date ideas');
            }
        } catch (error) {
            console.error('Error fetching date ideas:', error);
        }
    };

    const fetchNotifications = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE}/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const notifs = await response.json();
                setPersistentNotifications(notifs);
            } else {
                console.error('Failed to fetch notifications');
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchDateIdeas();
            fetchNotifications();
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
                return (
                    <DateMarketplace 
                        dateIdeas={dateIdeas} 
                        onCreateDate={() => setCreateDateVisible(true)}
                    />
                );
            case 'matches':
                return <Matches onSelectMatch={setSelectedMatch} />;
            case 'notifications':
                return <Notifications notifications={persistentNotifications} onBack={() => setActiveView('swipe')} />;
            case 'profile':
                return <ProfileScreen onPremiumClick={() => setMonetizationModalOpen(true)} />;
            default:
                return <SwipeDeck />;
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
            <Header onPremiumClick={() => setMonetizationModalOpen(true)} setActiveView={setActiveView} notificationsCount={persistentNotifications.length} />

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