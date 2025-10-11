import React from 'react';
import { Notification } from '../types';
import { HeartIcon, InfoIcon } from '../constants';

interface NotificationPanelProps {
    notifications: Notification[];
    onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose }) => {
    const icons = {
        match: <HeartIcon className="w-6 h-6 text-pink-400 flex-shrink-0" />,
        interest: <InfoIcon className="w-6 h-6 text-cyan-400 flex-shrink-0" />,
        info: <InfoIcon className="w-6 h-6 text-slate-400 flex-shrink-0" />,
    };

    return (
        <div 
            className="fixed inset-0 z-40" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="absolute top-20 right-4 sm:right-6 md:right-8 w-full max-w-sm bg-slate-800/90 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white">Notifications</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto scrollbar-hide">
                    {notifications.length > 0 ? (
                        <ul>
                            {notifications.map(notification => (
                                <li key={notification.id} className={`p-4 flex items-start space-x-4 border-b border-slate-700/50 ${!notification.read ? 'bg-pink-500/10' : ''}`}>
                                    {icons[notification.type]}
                                    <p className="text-sm text-slate-200 flex-1">{notification.message}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-8 text-center text-slate-400">
                            <p>You have no new notifications.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationPanel;