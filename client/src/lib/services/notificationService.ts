import { v4 as uuidv4 } from 'uuid';
import { NotificationData } from '@/components/ui/notifications/NotificationContainer';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

class NotificationService {
  /**
   * Show a notification
   */
  private show(type: NotificationType, title: string, message: string, duration?: number): void {
    const notification: NotificationData = {
      id: uuidv4(),
      type,
      title,
      message,
      duration
    };

    const event = new CustomEvent('notification', {
      detail: notification
    });

    window.dispatchEvent(event as Event);
  }

  /**
   * Show a success notification
   */
  success(title: string, message: string, duration?: number): void {
    this.show('success', title, message, duration);
  }

  /**
   * Show an error notification
   */
  error(title: string, message: string, duration?: number): void {
    this.show('error', title, message, duration);
  }

  /**
   * Show an info notification
   */
  info(title: string, message: string, duration?: number): void {
    this.show('info', title, message, duration);
  }

  /**
   * Show a warning notification
   */
  warning(title: string, message: string, duration?: number): void {
    this.show('warning', title, message, duration);
  }
}

// Create a singleton instance
const notificationService = new NotificationService();

export default notificationService;