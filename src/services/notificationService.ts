import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';

export const notificationService = {
  /**
   * Initialize notification handlers and Android notification channels
   */
  async initNotifications(): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      // Configure foreground notification presentation behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Android requires a notification channel for high-importance alerts
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('lockedin-reminders', {
          name: 'LockedIn Event Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4F46E5',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });
      }
    } catch (err) {
      console.warn('Error initializing notifications:', err);
    }
  },

  /**
   * Request notification permissions from user
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (err) {
      console.warn('Error requesting notification permissions:', err);
      return false;
    }
  },

  /**
   * Parse date (YYYY-MM-DD) and time (HH:mm or h:mm AM/PM) into a JavaScript Date
   */
  parseDateTime(dateStr: string, timeStr: string): Date | null {
    try {
      if (!dateStr || !timeStr) return null;

      let hours = 0;
      let minutes = 0;

      const trimmedTime = timeStr.trim();
      const isAmPm = /am|pm/i.test(trimmedTime);

      if (isAmPm) {
        const isPM = /pm/i.test(trimmedTime);
        const cleanTime = trimmedTime.replace(/am|pm/gi, '').trim();
        const parts = cleanTime.split(':').map((p) => parseInt(p, 10));
        hours = parts[0];
        minutes = parts[1] || 0;

        if (isNaN(hours) || isNaN(minutes)) return null;

        if (isPM && hours < 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;
      } else {
        const parts = trimmedTime.split(':').map((p) => parseInt(p, 10));
        hours = parts[0];
        minutes = parts[1] || 0;

        if (isNaN(hours) || isNaN(minutes)) return null;
      }

      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return null;
      }

      const [year, month, day] = dateStr.split('-').map((p) => parseInt(p, 10));
      if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

      const targetDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
      if (isNaN(targetDate.getTime())) return null;

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
      if (!hasPermission) {
        Alert.alert(
          'Notification Permission',
          'Please enable notifications in your phone settings to receive reminder alarms for scheduled events.'
        );
        return null;
      }

      const eventDate = this.parseDateTime(dateStr, timeStr);
      if (!eventDate) {
        console.warn('Invalid date or time format:', { dateStr, timeStr });
        return null;
      }

      // Calculate the trigger time by subtracting offset
      const triggerTime = new Date(eventDate.getTime() - offsetMinutes * 60 * 1000);

      // Check if trigger time is in the past
      if (triggerTime.getTime() <= Date.now()) {
        console.log('Reminder time has already passed; skipping schedule.');
        return null;
      }

      let bodyText = `Time for: ${title}`;
      if (offsetMinutes > 0) {
        bodyText = `Starting in ${offsetMinutes}m (${timeStr})`;
      }
      if (description) {
        bodyText += ` • ${description}`;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `LockedIn: ${title}`,
          body: bodyText,
          sound: 'default',
          data: { date: dateStr, time: timeStr },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerTime,
          channelId: 'lockedin-reminders',
        },
      });

      console.log(`Scheduled reminder for "${title}" at ${triggerTime.toLocaleTimeString()} (ID: ${notificationId})`);
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
      console.log(`Cancelled reminder with ID: ${notificationId}`);
    } catch (error) {
      console.warn('Failed to cancel notification:', error);
    }
  },
};
