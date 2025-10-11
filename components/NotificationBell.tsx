import React, { useState, useMemo } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { BellIcon } from '../constants';
import NotificationPanel from './NotificationPanel';

const NotificationBell: React.FC = () => {
    const { notifications, markAllAsRead } = useNotification();
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const unreadCount = useMemo(() => {
        // Only count 'match' notifications as unread for the purpose of the red dot indicator.
        return notifications.filter(n => !n.read && n.type === 'match').length;
    }, [notifications]);

    const handleTogglePanel = () => {
        if (!isPanelOpen) {
            markAllAsRead();
        }
        setIsPanelOpen(prev => !prev);
    };

    return (
        <>
            <button 
                onClick={handleTogglePanel}
                className="relative text-slate-300 hover:text-white transition-colors"
                aria-label={`View notifications. ${unreadCount} unread.`}
            >
                <BellIcon className="w-7 h-7" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-pink-500 ring-2 ring-slate-900 shadow-md">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    </span>
                )}
            </button>
            {isPanelOpen && (
                <NotificationPanel 
                    notifications={notifications}
                    onClose={() => setIsPanelOpen(false)}
                />
            )}
        </>
    );
};

export default NotificationBell;