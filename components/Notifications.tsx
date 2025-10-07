import React from 'react';
import { PersistentNotification } from '../types';

interface NotificationsProps {
  notifications: PersistentNotification[];
  onBack: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, onBack }) => {
  return (
    <div className="pt-20 pb-24 px-4 text-white h-full overflow-y-auto scrollbar-hide">
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="mr-4 p-2 text-slate-400 hover:text-white transition-colors"
        >
          ←
        </button>
        <h1 className="text-3xl font-bold">Notifications</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center text-slate-400 mt-12">
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-4 rounded-2xl border ${
                notification.isRead 
                  ? 'bg-slate-800/50 border-slate-700' 
                  : 'bg-pink-500/10 border-pink-500/30'
              }`}
            >
              <p className="text-white">{notification.message}</p>
              <p className="text-xs text-slate-400 mt-2">
                {new Date(notification.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
