import React, { useState } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { useEvents } from '../../src/hooks/useEvents';
import { Button } from '../../src/components/ui/Button';
import { EventCard } from '../../src/components/events/EventCard';
import { CreateEventModal } from '../../src/components/events/CreateEventModal';

export default function HomeScreen() {
  const { user, logout, isLoading } = useAuth();
  const { events, loading, createEvent, toggleEvent, deleteEvent } = useEvents();
  const [modalVisible, setModalVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateEvent = async (title: string, description: string, date: string, time: string) => {
    setIsCreating(true);
    try {
      const result = await createEvent({ title, description, date, time });
      if (result) {
        setModalVisible(false);
      } else {
        Alert.alert('Error', 'Failed to create event');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create event');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteEvent(eventId) },
      ]
    );
  };

  // Calculate stats
  const totalEvents = events.length;
  const completedEvents = events.filter(e => e.isCompleted).length;
  const pendingEvents = totalEvents - completedEvents;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {/* Top Bar */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">
              Dashboard
            </Text>
            <Text className="text-2xl font-extrabold text-gray-900 mt-0.5">
              Welcome, {user?.name || 'Friend'}! 👋
            </Text>
          </View>
          <TouchableOpacity
            className="w-12 h-12 bg-indigo-100 rounded-full items-center justify-center border-2 border-indigo-200"
            onPress={logout}
          >
            <Ionicons name="person" size={24} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View className="flex-row space-x-3 mb-6">
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Text className="text-gray-500 text-xs">Total Events</Text>
            <Text className="text-2xl font-bold text-indigo-600">{totalEvents}</Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Text className="text-gray-500 text-xs">Completed</Text>
            <Text className="text-2xl font-bold text-green-600">{completedEvents}</Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Text className="text-gray-500 text-xs">Pending</Text>
            <Text className="text-2xl font-bold text-orange-500">{pendingEvents}</Text>
          </View>
        </View>

        {/* Events Section Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-800">My Events</Text>
          <TouchableOpacity
            className="bg-indigo-600 px-4 py-2 rounded-lg flex-row items-center"
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-semibold ml-1">Add</Text>
          </TouchableOpacity>
        </View>

        {/* Events List */}
        {loading ? (
          <View className="items-center justify-center py-8">
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text className="text-gray-500 mt-2">Loading events...</Text>
          </View>
        ) : events.length === 0 ? (
          <View className="bg-white rounded-xl p-8 items-center border border-gray-100">
            <View className="bg-indigo-50 rounded-full p-4 mb-3">
              <Ionicons name="calendar-outline" size={40} color="#4F46E5" />
            </View>
            <Text className="text-gray-800 font-semibold text-base">No Events Yet</Text>
            <Text className="text-gray-500 text-sm text-center mt-1">
              Tap the "Add" button to create your first event!
            </Text>
          </View>
        ) : (
          events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onToggle={toggleEvent}
              onDelete={handleDeleteEvent}
            />
          ))
        )}

        {/* Status Card */}
        <View className="bg-indigo-600 rounded-2xl p-6 shadow-md mt-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white/80 font-medium text-sm">
              Authentication Status
            </Text>
            <View className="bg-emerald-400/20 px-2.5 py-1 rounded-full flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5" />
              <Text className="text-emerald-200 text-xs font-semibold">
                Active Session
              </Text>
            </View>
          </View>

          <Text className="text-white text-2xl font-bold mb-1">
            {user?.name || 'LockedIn User'}
          </Text>
          <Text className="text-indigo-200 text-sm mb-4">
            {user?.email || 'user@example.com'}
          </Text>

          <View className="pt-4 border-t border-indigo-500/50 flex-row justify-between items-center">
            <Text className="text-indigo-200 text-xs">
              Firebase + Firestore
            </Text>
            <Text className="text-white text-xs font-semibold">
              Real-time Sync
            </Text>
          </View>
        </View>

        {/* Log Out Button */}
        <View className="mt-4">
          <Button
            title="Log Out"
            variant="outline"
            loading={isLoading}
            onPress={logout}
          />
        </View>
      </ScrollView>

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