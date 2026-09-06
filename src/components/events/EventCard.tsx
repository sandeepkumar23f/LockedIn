import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventItem } from '@/src/types/event.types';

interface EventCardProps {
  event: EventItem;
  onToggle: (id: string, isCompleted: boolean) => void;
  onDelete: (id: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onToggle, onDelete }) => {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <View className={`bg-white rounded-xl p-4 mb-3 shadow-sm ${event.isCompleted ? 'opacity-70' : ''}`}>
      <View className="flex-row items-center">
        {/* Time Badge */}
        <View className={`w-16 h-16 rounded-lg items-center justify-center mr-3 ${event.isCompleted ? 'bg-green-100' : 'bg-indigo-100'}`}>
          <Text className={`text-sm font-bold ${event.isCompleted ? 'text-green-500' : 'text-indigo-600'}`}>
            {formatTime(event.time)}
          </Text>
        </View>

        {/* Event Details */}
        <View className="flex-1">
          <Text className={`text-base font-semibold ${event.isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
            {event.title}
          </Text>
          {event.description && (
            <Text className="text-sm text-gray-600 mt-0.5" numberOfLines={1}>
              {event.description}
            </Text>
          )}
          <Text className="text-xs text-gray-400 mt-1">{event.date}</Text>
        </View>

        {/* Actions */}
        <View className="flex-row">
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center"
            onPress={() => onToggle(event.id, !event.isCompleted)}
          >
            <Ionicons
              name={event.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
              size={28}
              color={event.isCompleted ? '#22C55E' : '#9CA3AF'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center"
            onPress={() => onDelete(event.id)}
          >
            <Ionicons name="trash-outline" size={22} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};