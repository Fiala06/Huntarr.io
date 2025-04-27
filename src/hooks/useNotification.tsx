// A simple hook for displaying notifications
// Re-exports the useNotification hook from NotificationContext
import { useContext } from 'react';
import { NotificationContext, NotificationContextType } from '../contexts/NotificationContext';

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
};

export default useNotification;