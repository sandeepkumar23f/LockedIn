import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/src/config/firebase';
import { EventItem, CreateEventInput } from '@/src/types/event.types';

const EVENTS_COLLECTION = 'events';

export const eventService = {
  // Create a new event
  async createEvent(userId: string, input: CreateEventInput): Promise<EventItem> {
    const newEvent = {
      userId,
      title: input.title,
      description: input.description || '',
      date: input.date,
      time: input.time,
      isCompleted: false,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), newEvent);
    return { id: docRef.id, ...newEvent };
  },

  // Subscribe to user's events (real-time)
  subscribeToUserEvents(
    userId: string,
    callback: (events: EventItem[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, EVENTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('date', 'asc'),
      orderBy('time', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const events: EventItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          userId: data.userId,
          title: data.title,
          description: data.description,
          date: data.date,
          time: data.time,
          isCompleted: data.isCompleted || false,
          createdAt: data.createdAt,
        });
      });
      callback(events);
    });
  },

  // Toggle completion status
  async toggleEventStatus(eventId: string, isCompleted: boolean): Promise<void> {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(docRef, { isCompleted });
  },

  // Delete event
  async deleteEvent(eventId: string): Promise<void> {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    await deleteDoc(docRef);
  },
};