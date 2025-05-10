import { v4 as uuidv4 } from 'uuid';
import { NotificationData } from '@/components/ui/notifications/NotificationContainer';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

type NotificationAction = {
  label: string;
  onClick: () => void;
  style?: 'primary' | 'secondary' | 'danger';
};

class NotificationService {
  /**
   * Show a notification
   */
  private show(
    type: NotificationType, 
    title: string, 
    message: string, 
    duration?: number,
    actions?: NotificationAction[]
  ): void {
    const notification: NotificationData = {
      id: uuidv4(),
      type,
      title,
      message,
      duration,
      actions
    };

    const event = new CustomEvent('notification', {
      detail: notification
    });

    window.dispatchEvent(event as Event);
  }

  /**
   * Show a success notification
   */
  success(title: string, message: string, duration?: number, actions?: NotificationAction[]): void {
    this.show('success', title, message, duration, actions);
  }

  /**
   * Show an error notification
   */
  error(title: string, message: string, duration?: number, actions?: NotificationAction[]): void {
    this.show('error', title, message, duration, actions);
  }

  /**
   * Show an info notification
   */
  info(title: string, message: string, duration?: number, actions?: NotificationAction[]): void {
    this.show('info', title, message, duration, actions);
  }

  /**
   * Show a warning notification
   */
  warning(title: string, message: string, duration?: number, actions?: NotificationAction[]): void {
    this.show('warning', title, message, duration, actions);
  }
  
  /**
   * Show a confirmation notification with yes/no actions
   */
  confirm(title: string, message: string, onConfirm: () => void, onCancel?: () => void): void {
    const actions: NotificationAction[] = [
      { 
        label: 'Cancel', 
        onClick: onCancel || (() => {}), 
        style: 'secondary' 
      },
      { 
        label: 'Confirm', 
        onClick: onConfirm, 
        style: 'primary' 
      }
    ];
    
    this.show('info', title, message, 0, actions);
  }
}

// Create a singleton instance
const notificationService = new NotificationService();

export default notificationService;