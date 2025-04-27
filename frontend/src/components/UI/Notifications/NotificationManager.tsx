import React from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import './NotificationManager.css';

const NotificationManager: React.FC = () => {
  const { notifications, hideNotification } = useNotification();
  
  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div 
          key={notification.id} 
          className={`notification notification-${notification.type}`}
        >
          <div className="notification-content">
            {notification.type === 'success' && <i className="fas fa-check-circle"></i>}
            {notification.type === 'error' && <i className="fas fa-exclamation-circle"></i>}
            {notification.type === 'info' && <i className="fas fa-info-circle"></i>}
            {notification.type === 'warning' && <i className="fas fa-exclamation-triangle"></i>}
            <span>{notification.message}</span>
          </div>
          <button 
            className="notification-close" 
            onClick={() => hideNotification(notification.id)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationManager;
