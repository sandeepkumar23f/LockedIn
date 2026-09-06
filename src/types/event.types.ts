export interface EventItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  isCompleted: boolean;
  createdAt?: any;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  date: string;
  time: string;
}