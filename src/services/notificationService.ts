import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const notificationService = {
  /**
   * Initialize notification handlers and Android notification channels
   */
  async initNotifications(): Promise<void> {
    if (Platform.OS === 'web') return;

    // Configure foreground notification behavior (alert, sound)
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Android requires a notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('lockedin-reminders', {
        name: 'LockedIn Event Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4F46E5',
        sound: 'default',
      });
    }
  },

  /**
   * Request notification permissions from user
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  },

  /**
   * Parse date (YYYY-MM-DD) and time (HH:mm or h:mm AM/PM) into a JavaScript Date
   */
  parseDateTime(dateStr: string, timeStr: string): Date | null {
    try {
      let hours = 0;
      let minutes = 0;

      const isAmPm = timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm');
      if (isAmPm) {
        const isPM = timeStr.toLowerCase().includes('pm');
        const cleanTime = timeStr.replace(/am|pm/gi, '').trim();
        const [h, m = '0'] = cleanTime.split(':');
        hours = parseInt(h, 10);
        minutes = parseInt(m, 10);
        if (isPM && hours < 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;
      } else {
        const [h, m = '0'] = timeStr.split(':');
        hours = parseInt(h, 10);
        minutes = parseInt(m, 10);
      }

      const [year, month, day] = dateStr.split('-').map(Number);
      // month is 0-indexed in JS Date
      const targetDate = new Date(year, month - 1, day, hours, minutes, 0);
      return targetDate;
    } catch {
      return null;
    }
  },

  /**
   * Schedule a local notification for an upcoming event
   */
  async scheduleEventReminder(
    title: string,
    description: string | undefined,
    dateStr: string,
    timeStr: string,
    offsetMinutes: number = 0
  ): Promise<string | null> {
    if (Platform.OS === 'web') return null;

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const eventDate = this.parseDateTime(dateStr, timeStr);
      if (!eventDate) return null;

      // Calculate the trigger time by subtracting offset
      const triggerTime = new Date(eventDate.getTime() - offsetMinutes * 60 * 1000);

      // If trigger time is in the past, do not schedule
      if (triggerTime.getTime() <= Date.now()) {
        return null;
      }

      let reminderText = `Scheduled for ${timeStr}`;
      if (offsetMinutes > 0) {
        reminderText = `Starting in ${offsetMinutes} minutes (${timeStr})`;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `LockedIn: ${title}`,
          body: description ? `${reminderText} • ${description}` : reminderText,
          sound: 'default',
          data: { date: dateStr, time: timeStr },
        },
        trigger: {
          date: triggerTime,
          channelId: 'lockedin-reminders',
        },
      });

      return notificationId;
    } catch (error) {
      console.warn('Failed to schedule notification:', error);
      return null;
    }
  },

  /**
   * Cancel a previously scheduled notification
   */
  async cancelEventReminder(notificationId: string | undefined): Promise<void> {
    if (!notificationId || Platform.OS === 'web') return;

    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.warn('Failed to cancel notification:', error);
    }
  },
};

