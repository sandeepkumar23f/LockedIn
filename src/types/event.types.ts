export interface EventItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  isCompleted: boolean;
  notificationId?: string;
  reminderOffsetMinutes?: number;
  createdAt?: any;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  date: string;
  time: string;
  reminderOffsetMinutes?: number;
}