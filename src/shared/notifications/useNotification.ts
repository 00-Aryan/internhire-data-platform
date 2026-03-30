import { useContext } from 'react';
import { NotificationContext, NotificationContextType } from '@/shared/notifications/NotificationContext';

export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }

  return context;
}