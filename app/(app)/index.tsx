import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { useEvents } from '../../src/hooks/useEvents';
import { EventCard } from '../../src/components/events/EventCard';
import { CreateEventModal } from '../../src/components/events/CreateEventModal';

type FilterType = 'all' | 'today' | 'upcoming' | 'completed';

export default function HomeScreen() {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const { events, loading, createEvent, toggleEvent, deleteEvent } = useEvents();

  // Modal & Form State
  const [modalVisible, setModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const todayString = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Formatted display date for header (e.g., "Tuesday, September 8")
  const headerDateString = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = event.title.toLowerCase().includes(q);
        const descMatch = (event.description || '').toLowerCase().includes(q);
        if (!titleMatch && !descMatch) return false;
      }

      // 2. Tab Filter
      if (activeFilter === 'today') {
        return event.date === todayString;
      }
      if (activeFilter === 'upcoming') {
        return event.date > todayString && !event.isCompleted;
      }
      if (activeFilter === 'completed') {
        return event.isCompleted;
      }
      return true; // 'all'
    });
  }, [events, searchQuery, activeFilter, todayString]);

  // Counts for Badges
  const counts = useMemo(() => {
    const total = events.length;
    const completed = events.filter((e) => e.isCompleted).length;
    const pending = total - completed;
    const today = events.filter((e) => e.date === todayString).length;
    const upcoming = events.filter((e) => e.date > todayString && !e.isCompleted).length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, today, upcoming, progressPercent };
  }, [events, todayString]);

  // Create Event Handler
  const handleCreateEvent = async (
    title: string,
    description: string,
    date: string,
    time: string,
    reminderOffsetMinutes?: number
  ) => {
    setIsCreating(true);
    try {
      const result = await createEvent({
        title,
        description,
        date,
        time,
        reminderOffsetMinutes,
      });
      if (result) {
        setModalVisible(false);
      } else {
        Alert.alert('Error', 'Failed to create event. Please check your connection.');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to create event');
    } finally {
      setIsCreating(false);
    }
  };

  // Delete Event Handler
  const handleDeleteEvent = (eventId: string, notificationId?: string) => {
    const executeDelete = async () => {
      const success = await deleteEvent(eventId, notificationId);
      if (!success) {
        Alert.alert('Error', 'Failed to delete event. Please check your connection.');
      }
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Are you sure you want to delete this event?')) {
        executeDelete();
      }
      return;
    }

    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: executeDelete },
      ]
    );
  };

  // Safe Logout with Confirmation
  const handleConfirmLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of LockedIn?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          setProfileModalVisible(false);
          await logout();
        },
      },
    ]);
  };

  // User Initials
  const userInitials = useMemo(() => {
    if (!user?.name) return 'U';
    const parts = user.name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  }, [user?.name]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50/50" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View className="flex-row items-center justify-between mb-5">
          <View className="flex-1 pr-3">
            <Text className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">
              {headerDateString}
            </Text>
            <Text className="text-2xl font-black text-gray-950 mt-0.5 tracking-tight" numberOfLines={1}>
              Welcome, {user?.name ? user.name.split(' ')[0] : 'Friend'} 👋
            </Text>
          </View>

          {/* Profile Avatar Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            className="w-11 h-11 rounded-full bg-indigo-600 items-center justify-center shadow-sm"
            onPress={() => setProfileModalVisible(true)}
          >
            <Text className="text-white font-bold text-sm tracking-wide">{userInitials}</Text>
          </TouchableOpacity>
        </View>

        {/* Progress & Focus Card */}
        <View className="bg-white rounded-3xl p-5 mb-5 border border-gray-100 shadow-sm">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-xl bg-indigo-50 items-center justify-center mr-2.5">
                <Ionicons name="flash" size={16} color="#4F46E5" />
              </View>
              <View>
                <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Daily Focus
                </Text>
                <Text className="text-base font-bold text-gray-900">
                  {counts.completed} of {counts.total} Tasks Completed
                </Text>
              </View>
            </View>
            <View className="bg-indigo-50 px-2.5 py-1 rounded-full">
              <Text className="text-xs font-bold text-indigo-600">{counts.progressPercent}%</Text>
            </View>
          </View>

          {/* Linear Progress Bar */}
          <View className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
            <View
              className="h-full bg-indigo-600 rounded-full"
              style={{ width: `${counts.progressPercent}%` }}
            />
          </View>

          {/* Quick Metrics Bar */}
          <View className="flex-row gap-2 pt-2 border-t border-gray-100">
            <View className="flex-1 bg-gray-50 rounded-xl p-2.5 items-center">
              <Text className="text-[11px] font-medium text-gray-500">Total</Text>
              <Text className="text-lg font-black text-gray-900 mt-0.5">{counts.total}</Text>
            </View>
            <View className="flex-1 bg-amber-50/60 rounded-xl p-2.5 items-center border border-amber-100/50">
              <Text className="text-[11px] font-medium text-amber-700">Pending</Text>
              <Text className="text-lg font-black text-amber-900 mt-0.5">{counts.pending}</Text>
            </View>
            <View className="flex-1 bg-emerald-50/60 rounded-xl p-2.5 items-center border border-emerald-100/50">
              <Text className="text-[11px] font-medium text-emerald-700">Done</Text>
              <Text className="text-lg font-black text-emerald-900 mt-0.5">{counts.completed}</Text>
            </View>
          </View>
        </View>

        {/* Live Search Bar */}
        <View className="flex-row items-center bg-white rounded-2xl px-3.5 py-2.5 mb-4 border border-gray-200/70 shadow-xs">
          <Ionicons name="search-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput
            className="flex-1 text-sm text-gray-900"
            placeholder="Search events, notes..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {Boolean(searchQuery) && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs / Chips */}
        <View className="flex-row gap-2 mb-5">
          <TouchableOpacity
            activeOpacity={0.7}
            className={`px-3.5 py-2 rounded-xl border ${
              activeFilter === 'all'
                ? 'bg-gray-900 border-gray-900'
                : 'bg-white border-gray-200'
            }`}
            onPress={() => setActiveFilter('all')}
          >
            <Text
              className={`text-xs font-semibold ${
                activeFilter === 'all' ? 'text-white' : 'text-gray-600'
              }`}
            >
              All ({counts.total})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            className={`px-3.5 py-2 rounded-xl border ${
              activeFilter === 'today'
                ? 'bg-gray-900 border-gray-900'
                : 'bg-white border-gray-200'
            }`}
            onPress={() => setActiveFilter('today')}
          >
            <Text
              className={`text-xs font-semibold ${
                activeFilter === 'today' ? 'text-white' : 'text-gray-600'
              }`}
            >
              Today ({counts.today})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            className={`px-3.5 py-2 rounded-xl border ${
              activeFilter === 'upcoming'
                ? 'bg-gray-900 border-gray-900'
                : 'bg-white border-gray-200'
            }`}
            onPress={() => setActiveFilter('upcoming')}
          >
            <Text
              className={`text-xs font-semibold ${
                activeFilter === 'upcoming' ? 'text-white' : 'text-gray-600'
              }`}
            >
              Upcoming ({counts.upcoming})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            className={`px-3.5 py-2 rounded-xl border ${
              activeFilter === 'completed'
                ? 'bg-gray-900 border-gray-900'
                : 'bg-white border-gray-200'
            }`}
            onPress={() => setActiveFilter('completed')}
          >
            <Text
              className={`text-xs font-semibold ${
                activeFilter === 'completed' ? 'text-white' : 'text-gray-600'
              }`}
            >
              Done ({counts.completed})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section Title */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            {activeFilter === 'all'
              ? 'All Scheduled Events'
              : activeFilter === 'today'
              ? "Today's Schedule"
              : activeFilter === 'upcoming'
              ? 'Upcoming Plans'
              : 'Completed Tasks'}
          </Text>
          <Text className="text-xs text-gray-400 font-medium">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'task' : 'tasks'}
          </Text>
        </View>

        {/* Events List */}
        {loading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text className="text-xs text-gray-400 font-medium mt-2.5">Syncing events...</Text>
          </View>
        ) : filteredEvents.length === 0 ? (
          /* Contextual Empty States */
          <View className="bg-white rounded-3xl p-8 items-center border border-gray-100 mt-1">
            <View className="w-14 h-14 rounded-2xl bg-indigo-50 items-center justify-center mb-3">
              <Ionicons
                name={
                  searchQuery
                    ? 'search-outline'
                    : activeFilter === 'completed'
                    ? 'checkmark-done-circle-outline'
                    : 'calendar-outline'
                }
                size={28}
                color="#4F46E5"
              />
            </View>
            <Text className="text-base font-bold text-gray-900 text-center">
              {searchQuery
                ? 'No matching events found'
                : activeFilter === 'today'
                ? 'No events scheduled for today'
                : activeFilter === 'completed'
                ? 'No completed tasks yet'
                : activeFilter === 'upcoming'
                ? 'No upcoming tasks'
                : 'Your schedule is clear!'}
            </Text>
            <Text className="text-xs text-gray-500 text-center mt-1 max-w-[240px] leading-relaxed">
              {searchQuery
                ? `No events matching "${searchQuery}". Try a different keyword.`
                : activeFilter === 'completed'
                ? 'Mark your tasks as completed to track your achievements here.'
                : 'Tap "+ New Event" to lock in your next productivity session.'}
            </Text>
            {Boolean(searchQuery) && (
              <TouchableOpacity
                className="mt-4 px-4 py-2 rounded-xl bg-gray-100"
                onPress={() => setSearchQuery('')}
              >
                <Text className="text-xs font-semibold text-gray-700">Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onToggle={toggleEvent}
              onDelete={handleDeleteEvent}
            />
          ))
        )}
      </ScrollView>

      {/* Floating Action Button (+ New Event) */}
      <View
        className="absolute bottom-6 right-5 left-5 pointer-events-box-none items-end"
        pointerEvents="box-none"
      >
        <TouchableOpacity
          activeOpacity={0.85}
          className="flex-row items-center bg-indigo-600 px-5 py-3.5 rounded-full shadow-lg"
          style={{
            shadowColor: '#4F46E5',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 6,
          }}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={20} color="white" style={{ marginRight: 6 }} />
          <Text className="text-white font-bold text-sm tracking-wide">New Event</Text>
        </TouchableOpacity>
      </View>

      {/* Profile & Account Sheet Modal */}
      <Modal
        visible={profileModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-xl">
            {/* User Header */}
            <View className="items-center mb-5">
              <View className="w-16 h-16 rounded-full bg-indigo-600 items-center justify-center mb-3">
                <Text className="text-white font-black text-xl tracking-wider">{userInitials}</Text>
              </View>
              <Text className="text-xl font-bold text-gray-900">{user?.name || 'LockedIn User'}</Text>
              <Text className="text-xs text-gray-500 mt-0.5">{user?.email || 'user@example.com'}</Text>
            </View>

            {/* Account Info Details */}
            <View className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100">
              <View className="flex-row justify-between items-center py-1">
                <Text className="text-xs text-gray-500 font-medium">Session Status</Text>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                  <Text className="text-xs font-semibold text-emerald-700">Active</Text>
                </View>
              </View>
              <View className="flex-row justify-between items-center py-1 border-t border-gray-200/50 mt-2 pt-2">
                <Text className="text-xs text-gray-500 font-medium">Cloud Database</Text>
                <Text className="text-xs font-semibold text-gray-700">Firestore Sync</Text>
              </View>
            </View>

            {/* Actions */}
            <View className="gap-2.5">
              <TouchableOpacity
                className="w-full bg-red-50 py-3 rounded-xl items-center border border-red-200/70"
                onPress={handleConfirmLogout}
                disabled={isAuthLoading}
              >
                {isAuthLoading ? (
                  <ActivityIndicator color="#EF4444" size="small" />
                ) : (
                  <Text className="text-red-600 font-bold text-sm">Log Out of LockedIn</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="w-full bg-gray-100 py-3 rounded-xl items-center"
                onPress={() => setProfileModalVisible(false)}
              >
                <Text className="text-gray-700 font-semibold text-sm">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Event Modal */}
      <CreateEventModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={handleCreateEvent}
        isLoading={isCreating}
      />
    </SafeAreaView>
  );
}