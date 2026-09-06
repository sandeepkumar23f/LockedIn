import { useState, useEffect, useCallback } from 'react';
import { eventService } from '@/src/services/eventService';
import { useAuth } from '@/src/hooks/useAuth';
import { EventItem, CreateEventInput } from '@/src/types/event.types';

export const useEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = eventService.subscribeToUserEvents(user.id, (updatedEvents) => {
      setEvents(updatedEvents);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createEvent = useCallback(async (input: CreateEventInput) => {
    if (!user) return null;
    try {
      return await eventService.createEvent(user.id, input);
    } catch (error) {
      console.error('Error creating event:', error);
      return null;
    }
  }, [user]);

  const toggleEvent = useCallback(async (eventId: string, isCompleted: boolean) => {
    try {
      await eventService.toggleEventStatus(eventId, isCompleted);
      return true;
    } catch (error) {
      console.error('Error toggling event:', error);
      return false;
    }
  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      await eventService.deleteEvent(eventId);
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }, []);

  return {
    events,
    loading,
    createEvent,
    toggleEvent,
    deleteEvent,
  };
};