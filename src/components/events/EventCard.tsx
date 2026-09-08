import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventItem } from '@/src/types/event.types';

interface EventCardProps {
  event: EventItem;
  onToggle: (id: string, isCompleted: boolean, notificationId?: string) => void;
  onDelete: (id: string, notificationId?: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onToggle, onDelete }) => {
  // Format 24h to 12h AM/PM
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
      return timeStr;
    }
    const [hours, minutes = '00'] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    if (isNaN(hour)) return timeStr;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes.padStart(2, '0')} ${ampm}`;
  };

  // Human-friendly relative date (Today, Tomorrow, or Mon, Sep 8)
  const formatRelativeDate = (dateStr: string) => {
    if (!dateStr) return '';
    const today = new Date().toISOString().split('T')[0];

    const tomorrowObj = new Date();
    tomorrowObj.setDate(tomorrowObj.getDate() + 1);
    const tomorrow = tomorrowObj.toISOString().split('T')[0];

    if (dateStr === today) return 'Today';
    if (dateStr === tomorrow) return 'Tomorrow';

    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const target = new Date(y, m - 1, d);
      return target.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getReminderLabel = () => {
    if (event.reminderOffsetMinutes === undefined || event.reminderOffsetMinutes === null) {
      return null;
    }
    if (event.reminderOffsetMinutes === 0) return 'At time';
    return `${event.reminderOffsetMinutes}m before`;
  };

  const reminderLabel = getReminderLabel();
  const dateLabel = formatRelativeDate(event.date);
  const timeLabel = formatTime(event.time);

  return (
    <View
      className={`relative bg-white rounded-2xl p-4 mb-3 border ${
        event.isCompleted
          ? 'border-gray-200/80 bg-gray-50/70'
          : 'border-gray-100 shadow-sm'
      }`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: event.isCompleted ? 0 : 1,
      }}
    >
      {/* Left Active Accent Indicator */}
      <View
        className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${
          event.isCompleted ? 'bg-gray-300' : 'bg-indigo-600'
        }`}
      />

      <View className="flex-row items-start pl-2">
        {/* Circular Checkbox Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          className="mr-3.5 mt-0.5"
          onPress={() => onToggle(event.id, !event.isCompleted, event.notificationId)}
        >
          {event.isCompleted ? (
            <View className="w-6 h-6 rounded-full bg-emerald-500 items-center justify-center">
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          ) : (
            <View className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white items-center justify-center" />
          )}
        </TouchableOpacity>

        {/* Content Body */}
        <View className="flex-1 pr-2">
          {/* Title */}
          <Text
            className={`text-base font-semibold leading-snug ${
              event.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'
            }`}
          >
            {event.title}
          </Text>

          {/* Description (if present) */}
          {Boolean(event.description) && (
            <Text
              className={`text-xs mt-1 leading-relaxed ${
                event.isCompleted ? 'text-gray-400' : 'text-gray-500'
              }`}
              numberOfLines={2}
            >
              {event.description}
            </Text>
          )}

          {/* Metadata Badges: Date/Time Pill & Reminder Pill */}
          <View className="flex-row items-center flex-wrap gap-2 mt-2.5">
            {/* Date & Time Chip */}
            <View
              className={`flex-row items-center px-2.5 py-1 rounded-full ${
                event.isCompleted
                  ? 'bg-gray-100'
                  : dateLabel === 'Today'
                  ? 'bg-indigo-50 border border-indigo-100'
                  : 'bg-gray-100'
              }`}
            >
              <Ionicons
                name="time-outline"
                size={12}
                color={event.isCompleted ? '#9CA3AF' : dateLabel === 'Today' ? '#4F46E5' : '#6B7280'}
              />
              <Text
                className={`text-[11px] font-medium ml-1.5 ${
                  event.isCompleted
                    ? 'text-gray-400'
                    : dateLabel === 'Today'
                    ? 'text-indigo-700 font-semibold'
                    : 'text-gray-600'
                }`}
              >
                {dateLabel} • {timeLabel}
              </Text>
            </View>

            {/* Reminder Badge */}
            {reminderLabel && !event.isCompleted && (
              <View className="flex-row items-center bg-amber-50 border border-amber-200/60 px-2 py-1 rounded-full">
                <Ionicons name="notifications" size={11} color="#D97706" />
                <Text className="text-[10px] text-amber-800 font-semibold ml-1">
                  {reminderLabel}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Delete Action Button */}
        <TouchableOpacity
          activeOpacity={0.6}
          className="w-8 h-8 rounded-full items-center justify-center bg-gray-50 active:bg-red-50 -mr-1"
          onPress={() => onDelete(event.id, event.notificationId)}
        >
          <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};