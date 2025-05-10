import React, { useState, useEffect } from 'react';
import Notification from './Notification';
import { createPortal } from 'react-dom';

type NotificationAction = {
  label: string;
  onClick: () => void;
  style?: 'primary' | 'secondary' | 'danger';
};

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
}

interface NotificationContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxNotifications?: number;
}

const positionStyles = {
  'top-right': 'top-0 right-0',
  'top-left': 'top-0 left-0',
  'bottom-right': 'bottom-0 right-0',
  'bottom-left': 'bottom-0 left-0',
};

const NotificationContainer: React.FC<NotificationContainerProps> = ({
  position = 'top-right',
  maxNotifications = 5,
}) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create container element if it doesn't exist
    let element = document.getElementById('notification-container');
    if (!element) {
      element = document.createElement('div');
      element.id = 'notification-container';
      document.body.appendChild(element);
    }
    setContainer(element);

    // Add event listener for notification events
    const handleNotification = (event: CustomEvent<NotificationData>) => {
      addNotification(event.detail);
    };

    window.addEventListener('notification' as any, handleNotification as EventListener);

    return () => {
      window.removeEventListener('notification' as any, handleNotification as EventListener);
      if (element && document.body.contains(element)) {
        document.body.removeChild(element);
      }
    };
  }, []);

  const addNotification = (notification: NotificationData) => {
    setNotifications(prev => {
      // Add new notification and limit to maxNotifications
      const updated = [notification, ...prev].slice(0, maxNotifications);
      return updated;
    });
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  if (!container) return null;

  return createPortal(
    <div
      className={`fixed z-50 m-4 flex flex-col gap-2 ${positionStyles[position]}`}
      style={{ maxWidth: "24rem" }}
    >
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          id={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          duration={notification.duration}
          actions={notification.actions}
          onClose={removeNotification}
        />
      ))}
    </div>,
    container
  );
};

export default NotificationContainer;