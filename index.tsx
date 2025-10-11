import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { PremiumProvider } from './contexts/PremiumContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { DateInteractionProvider } from './contexts/DateInteractionContext';
import { MatchProvider } from './contexts/MatchContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {/* FIX: Corrected self-closing provider components. Providers must wrap their children to pass down context, so they are now correctly nested. */}
    <AuthProvider>
      <PremiumProvider>
        <NotificationProvider>
          <MatchProvider>
            <DateInteractionProvider>
              <App />
            </DateInteractionProvider>
          </MatchProvider>
        </NotificationProvider>
      </PremiumProvider>
    </AuthProvider>
  </React.StrictMode>
);