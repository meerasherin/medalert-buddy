
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export interface ScheduleNotificationOptions {
  id: number;
  title: string;
  body: string;
  scheduleAt: Date;
  sound?: string;
  largeBody?: string;
  summaryText?: string;
  reminderId: string;
}

class MobileNotificationService {
  private isInitialized = false;

  async initialize() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Not on native platform, mobile notifications not available');
      return false;
    }

    try {
      // Request permissions
      const permission = await LocalNotifications.requestPermissions();
      
      if (permission.display === 'granted') {
        // Listen for notification actions
        await LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
          console.log('Notification action performed:', notification);
          
          // Handle "Take Now" action
          if (notification.actionId === 'take') {
            this.handleTakeAction(notification.notification.extra?.reminderId);
          }
          // Handle "Snooze" action
          else if (notification.actionId === 'snooze') {
            this.handleSnoozeAction(notification.notification.extra?.reminderId);
          }
        });

        this.isInitialized = true;
        return true;
      } else {
        console.log('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error initializing mobile notifications:', error);
      return false;
    }
  }

  async scheduleNotification(options: ScheduleNotificationOptions) {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) return false;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: options.title,
            body: options.body,
            id: options.id,
            schedule: { at: options.scheduleAt },
            sound: options.sound || 'beep.wav',
            attachments: undefined,
            actionTypeId: 'MEDICINE_REMINDER',
            extra: {
              reminderId: options.reminderId
            }
          }
        ]
      });

      console.log(`Scheduled notification for ${options.scheduleAt}`);
      return true;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return false;
    }
  }

  async cancelNotification(id: number) {
    try {
      await LocalNotifications.cancel({
        notifications: [{ id }]
      });
      console.log(`Cancelled notification ${id}`);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  async cancelAllNotifications() {
    try {
      await LocalNotifications.cancel({
        notifications: []
      });
      console.log('Cancelled all notifications');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  async triggerHapticFeedback() {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.error('Error triggering haptic feedback:', error);
    }
  }

  private handleTakeAction(reminderId: string) {
    // Dispatch custom event that the reminder context can listen to
    window.dispatchEvent(new CustomEvent('medicineActionTaken', {
      detail: { reminderId, action: 'take' }
    }));
  }

  private handleSnoozeAction(reminderId: string) {
    // Dispatch custom event that the reminder context can listen to
    window.dispatchEvent(new CustomEvent('medicineActionTaken', {
      detail: { reminderId, action: 'snooze' }
    }));
  }

  async setupNotificationCategories() {
    if (!this.isInitialized) return;

    try {
      await LocalNotifications.registerActionTypes({
        types: [
          {
            id: 'MEDICINE_REMINDER',
            actions: [
              {
                id: 'take',
                title: 'Take Now',
                requiresAuthentication: false,
                foreground: false,
                destructive: false,
              },
              {
                id: 'snooze',
                title: 'Snooze 10 min',
                requiresAuthentication: false,
                foreground: false,
                destructive: false,
              }
            ]
          }
        ]
      });
    } catch (error) {
      console.error('Error setting up notification categories:', error);
    }
  }
}

export const mobileNotificationService = new MobileNotificationService();
