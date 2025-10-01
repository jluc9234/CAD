import React, { useState, useEffect } from 'react';
import { Notification } from '../types';
import { HeartIcon, InfoIcon } from '../constants';

interface NotificationToastProps {
    notification: Notification;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Animate in
        const timer = setTimeout(() => setShow(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const icons = {
        match: <HeartIcon className="w-6 h-6 text-pink-400" />,
        interest: <InfoIcon className="w-6 h-6 text-cyan-400" />,
        info: <InfoIcon className="w-6 h-6 text-slate-400" />,
    };

    return (
        <div 
            className={`w-full max-w-sm p-4 bg-slate-800/80 backdrop-blur-lg border border-slate-700 rounded-xl shadow-2xl flex items-center space-x-4 transition-all duration-300 ease-out ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
        >
            {icons[notification.type]}
            <p className="text-sm text-slate-200 flex-1">{notification.message}</p>
        </div>
    );
};

export default NotificationToast;
