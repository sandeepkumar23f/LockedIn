import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/src/config/firebase';
import { EventItem, CreateEventInput } from '@/src/types/event.types';
import { notificationService } from './notificationService';

const EVENTS_COLLECTION = 'events';

export const eventService = {
  // Create a new event and optionally schedule a reminder
  async createEvent(userId: string, input: CreateEventInput): Promise<EventItem> {
    let notificationId: string | undefined;

    // Schedule notification if reminder offset is specified
    if (input.reminderOffsetMinutes !== undefined) {
      const scheduledId = await notificationService.scheduleEventReminder(
        input.title,
        input.description,
        input.date,
        input.time,
        input.reminderOffsetMinutes
      );
      if (scheduledId) {
        notificationId = scheduledId;
      }
    }

    // Build document payload without any undefined values (Firestore rejects undefined)
    const newEventData: Record<string, any> = {
      userId,
      title: input.title.trim(),
      description: (input.description || '').trim(),
      date: input.date,
      time: input.time,
      isCompleted: false,
      createdAt: Timestamp.now(),
    };

    if (notificationId) {
      newEventData.notificationId = notificationId;
    }
    if (input.reminderOffsetMinutes !== undefined) {
      newEventData.reminderOffsetMinutes = input.reminderOffsetMinutes;
    }

    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), newEventData);

    return {
      id: docRef.id,
      userId,
      title: input.title.trim(),
      description: (input.description || '').trim(),
      date: input.date,
      time: input.time,
      isCompleted: false,
      notificationId: notificationId || undefined,
      reminderOffsetMinutes: input.reminderOffsetMinutes,
      createdAt: newEventData.createdAt,
    };
  },

  // Subscribe to user's events (real-time)
  subscribeToUserEvents(
    userId: string,
    callback: (events: EventItem[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, EVENTS_COLLECTION),
      where('userId', '==', userId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const events: EventItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          events.push({
            id: docSnap.id,
            userId: data.userId,
            title: data.title,
            description: data.description,
            date: data.date,
            time: data.time,
            isCompleted: data.isCompleted || false,
            notificationId: data.notificationId,
            reminderOffsetMinutes: data.reminderOffsetMinutes,
            createdAt: data.createdAt,
          });
        });

        // Sort events chronologically by date then time in memory (avoids composite index error)
        events.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

        callback(events);
      },
      (error) => {
        console.error('Error in subscribeToUserEvents:', error);
      }
    );
  },

  // Toggle completion status (and cancel reminder if completed)
  async toggleEventStatus(
    eventId: string,
    isCompleted: boolean,
    notificationId?: string
  ): Promise<void> {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(docRef, { isCompleted });

    // If marked as completed, cancel upcoming reminder alarm
    if (isCompleted && notificationId) {
      await notificationService.cancelEventReminder(notificationId);
    }
  },

  // Delete event (and cancel scheduled reminder)
  async deleteEvent(eventId: string, notificationId?: string): Promise<void> {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    await deleteDoc(docRef);

    if (notificationId) {
      await notificationService.cancelEventReminder(notificationId);
    }
  },
};