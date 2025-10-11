import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Notification, NotificationType } from '../types';

interface NotificationContextType {
  addNotification: (message: string, type: NotificationType) => void;
  notifications: Notification[];
  toastQueue: Notification[];
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toastQueue, setToastQueue] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: NotificationType) => {
    const id = Date.now();
    const newNotification: Notification = { id, message, type, read: false };
    
    // Add to persistent list for the bell, newest first
    setNotifications(prev => [newNotification, ...prev]);

    // Add to temporary queue for toasts
    setToastQueue(prev => [...prev, newNotification]);
    setTimeout(() => {
      setToastQueue(prev => prev.filter(n => n.id !== id));
    }, 5000); // Auto-dismiss toast from queue after 5 seconds
  }, []);
  
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => n.read ? n : { ...n, read: true }));
  }, []);


  return (
    <NotificationContext.Provider value={{ notifications, toastQueue, addNotification, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};