import React from 'react';
import { useNotification } from '../contexts/NotificationContext';

const NotificationPage: React.FC = () => {
  const { notifications } = useNotification();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      {notifications.length === 0 ? (
        <p className="text-gray-400">No notifications yet.</p>
      ) : (
        <div className="space-y-2">
          {notifications.map(notification => (
            <div key={notification.id} className="bg-slate-800 p-3 rounded-lg">
              <p className="text-white">{notification.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
