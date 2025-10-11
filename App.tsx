import React, { useState, useEffect } from 'react';
import { ActiveView, DateIdea, Match } from './types';
import { useAuth } from './contexts/AuthContext';
import { useNotification } from './contexts/NotificationContext';
import { apiService } from './services/apiService';

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

const App: React.FC = () => {
    const { currentUser } = useAuth();
    const { toastQueue } = useNotification();

    const [activeView, setActiveView] = useState<ActiveView>('swipe');
    const [isMonetizationModalOpen, setMonetizationModalOpen] = useState(false);
    const [isCreateDateVisible, setCreateDateVisible] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [dateIdeas, setDateIdeas] = useState<DateIdea[]>([]);
    const [isLoadingDates, setIsLoadingDates] = useState(true);

    useEffect(() => {
        const fetchDates = async () => {
            setIsLoadingDates(true);
            const ideas = await apiService.getDateIdeas();
            setDateIdeas(ideas);
            setIsLoadingDates(false);
        };
        if(currentUser) {
            fetchDates();
        }
    }, [currentUser]);

    const handlePostDate = (newDate: Omit<DateIdea, 'id'>) => {
        apiService.createDateIdea(newDate).then(createdDate => {
             setDateIdeas(prev => [createdDate, ...prev]);
             setCreateDateVisible(false);
             setActiveView('dates');
        });
    };

    if (!currentUser) {
        return <LoginScreen />;
    }

    const renderActiveView = () => {
        switch (activeView) {
            case 'swipe':
                return <SwipeDeck />;
            case 'dates':
                return <DateMarketplace dateIdeas={dateIdeas} isLoading={isLoadingDates} onCreateDate={() => setCreateDateVisible(true)} />;
            case 'matches':
                return <Matches onSelectMatch={setSelectedMatch} />;
            case 'profile':
                return <ProfileScreen onPremiumClick={() => setMonetizationModalOpen(true)} />;
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
                <ChatWindow 
                    match={selectedMatch} 
                    onBack={() => setSelectedMatch(null)} 
                    onPremiumClick={() => setMonetizationModalOpen(true)}
                />
            )}
            <MonetizationModal 
                isOpen={isMonetizationModalOpen}
                onClose={() => setMonetizationModalOpen(false)}
            />

            {/* Notification Container */}
            <div aria-live="polite" aria-atomic="true" className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 space-y-2 z-50 pointer-events-none">
                {toastQueue.map(notification => (
                    <NotificationToast key={notification.id} notification={notification} />
                ))}
            </div>
        </div>
    );
};

export default App;
