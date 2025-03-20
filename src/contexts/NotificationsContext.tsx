
import React, { createContext, useContext } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

// Create the context with the return type of useNotifications
const NotificationsContext = createContext<ReturnType<typeof useNotifications> | undefined>(undefined);

// Export the provider component
export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const notificationsData = useNotifications();
  
  return (
    <NotificationsContext.Provider value={notificationsData}>
      {children}
    </NotificationsContext.Provider>
  );
};

// Export a hook to use the notifications context
export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);
  
  if (context === undefined) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider');
  }
  
  return context;
};
