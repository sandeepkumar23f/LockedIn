import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (
    title: string,
    description: string,
    date: string,
    time: string,
    reminderOffsetMinutes?: number
  ) => Promise<void>;
  isLoading: boolean;
}

const REMINDER_OPTIONS: { label: string; value: number | undefined }[] = [
  { label: 'No Reminder', value: undefined },
  { label: 'At Event Time', value: 0 },
  { label: '5m Before', value: 5 },
  { label: '15m Before', value: 15 },
  { label: '30m Before', value: 30 },
];

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  visible,
  onClose,
  onCreate,
  isLoading,
}) => {
  const getTodayDate = () => new Date();
  const formatDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTimeString = (d: Date) => {
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 15); // Default to 15 mins in future
    return d;
  });
  const [date, setDate] = useState(() => formatDateString(new Date()));
  const [time, setTime] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 15);
    return formatTimeString(d);
  });
  const [reminderOffset, setReminderOffset] = useState<number | undefined>(0);

  // Picker visibility
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const resetForm = () => {
    const nextTime = new Date();
    nextTime.setMinutes(nextTime.getMinutes() + 15);
    setTitle('');
    setDescription('');
    setSelectedDate(nextTime);
    setDate(formatDateString(new Date()));
    setTime(formatTimeString(nextTime));
    setReminderOffset(0);
    setShowTimePicker(false);
    setShowDatePicker(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Handle native time change
  const handleTimeChange = (event: DateTimePickerEvent, newDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (event.type === 'set' && newDate) {
      const updated = new Date(selectedDate);
      updated.setHours(newDate.getHours(), newDate.getMinutes());
      setSelectedDate(updated);
      setTime(formatTimeString(updated));
    }
  };

  // Handle native date change
  const handleDateChange = (event: DateTimePickerEvent, newDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'set' && newDate) {
      const updated = new Date(selectedDate);
      updated.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
      setSelectedDate(updated);
      setDate(formatDateString(updated));
    }
  };

  // Quick preset adder (e.g. +5 mins, +15 mins, +1 hour)
  const applyTimeOffset = (minutesToAdd: number) => {
    const target = new Date();
    target.setMinutes(target.getMinutes() + minutesToAdd);
    setSelectedDate(target);
    setDate(formatDateString(target));
    setTime(formatTimeString(target));
  };

  // Display formatted time (e.g., 01:30 PM)
  const formatDisplayTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hoursStr, minutesStr = '00'] = timeStr.split(':');
    const h = parseInt(hoursStr, 10);
    if (isNaN(h)) return timeStr;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12.toString().padStart(2, '0')}:${minutesStr.padStart(2, '0')} ${ampm}`;
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter an event title');
      return;
    }

    if (!time.trim()) {
      Alert.alert('Missing Time', 'Please specify a time for this event');
      return;
    }

    await onCreate(title.trim(), description.trim(), date, time.trim(), reminderOffset);
    resetForm();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10 max-h-[90%]">
          {/* Handle Bar */}
          <View className="w-12 h-1.5 bg-gray-300 rounded-full self-center mb-4" />

          {/* Header */}
          <View className="flex-row justify-between items-center mb-5">
            <View>
              <Text className="text-2xl font-bold text-gray-900">Create Event</Text>
              <Text className="text-xs text-gray-500 mt-0.5">Plan what you want to lock in</Text>
            </View>
            <TouchableOpacity
              className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
              onPress={handleClose}
            >
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Title Input */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold text-sm mb-1.5">
                  Event Title *
                </Text>
                <TextInput
                  className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 text-base text-gray-900"
                  placeholder="e.g., At 1 PM I will study React Native"
                  placeholderTextColor="#9CA3AF"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              {/* Time & Date Row */}
              <View className="flex-row gap-3 mb-4">
                {/* Time Picker Card */}
                <View className="flex-1">
                  <Text className="text-gray-700 font-semibold text-sm mb-1.5">
                    Time *
                  </Text>
                  <TouchableOpacity
                    className="flex-row items-center bg-indigo-50 border border-indigo-200 rounded-xl px-3.5 py-3"
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        setShowTimePicker(true);
                      }
                    }}
                  >
                    <Ionicons name="time" size={18} color="#4F46E5" style={{ marginRight: 8 }} />
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-indigo-900">
                        {formatDisplayTime(time)}
                      </Text>
                      <Text className="text-[10px] text-indigo-500">
                        {Platform.OS === 'web' ? 'Use presets or type below' : 'Tap to pick'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {Platform.OS === 'web' && (
                    <TextInput
                      className="bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200 text-xs text-gray-800 mt-1.5"
                      value={time}
                      onChangeText={setTime}
                      placeholder="HH:mm (e.g. 13:00)"
                      placeholderTextColor="#9CA3AF"
                    />
                  )}
                </View>

                {/* Date Picker Card */}
                <View className="flex-1">
                  <Text className="text-gray-700 font-semibold text-sm mb-1.5">
                    Date *
                  </Text>
                  <TouchableOpacity
                    className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3"
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        setShowDatePicker(true);
                      }
                    }}
                  >
                    <Ionicons name="calendar-outline" size={18} color="#6B7280" style={{ marginRight: 8 }} />
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-800">
                        {date}
                      </Text>
                      <Text className="text-[10px] text-gray-400">
                        {Platform.OS === 'web' ? 'Type date below' : 'Tap to change'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {Platform.OS === 'web' && (
                    <TextInput
                      className="bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200 text-xs text-gray-800 mt-1.5"
                      value={date}
                      onChangeText={setDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#9CA3AF"
                    />
                  )}
                </View>
              </View>

              {/* Quick Time Presets (Perfect for testing & fast creation) */}
              <View className="mb-4">
                <Text className="text-gray-500 text-xs font-medium mb-1.5">
                  Quick Presets
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  <TouchableOpacity
                    className="bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200"
                    onPress={() => applyTimeOffset(5)}
                  >
                    <Text className="text-xs font-semibold text-gray-700">+5 mins</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200"
                    onPress={() => applyTimeOffset(15)}
                  >
                    <Text className="text-xs font-semibold text-gray-700">+15 mins</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200"
                    onPress={() => applyTimeOffset(30)}
                  >
                    <Text className="text-xs font-semibold text-gray-700">+30 mins</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200"
                    onPress={() => applyTimeOffset(60)}
                  >
                    <Text className="text-xs font-semibold text-gray-700">+1 hour</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200"
                    onPress={() => {
                      const t = new Date();
                      t.setHours(13, 0, 0, 0);
                      setSelectedDate(t);
                      setTime('13:00');
                    }}
                  >
                    <Text className="text-xs font-semibold text-gray-700">1:00 PM</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Native Date & Time Pickers */}
              {showTimePicker && Platform.OS !== 'web' && (
                <DateTimePicker
                  value={selectedDate}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                />
              )}

              {showDatePicker && Platform.OS !== 'web' && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                />
              )}

              {/* Reminder Notification Selection */}
              <View className="mb-4">
                <View className="flex-row items-center mb-1.5">
                  <Ionicons name="notifications-outline" size={16} color="#4F46E5" style={{ marginRight: 6 }} />
                  <Text className="text-gray-700 font-semibold text-sm">
                    Reminder Notification
                  </Text>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  {REMINDER_OPTIONS.map((option, idx) => {
                    const isSelected = reminderOffset === option.value;
                    return (
                      <TouchableOpacity
                        key={idx}
                        className={`px-3 py-2 rounded-lg border ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-600'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                        onPress={() => setReminderOffset(option.value)}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            isSelected ? 'text-indigo-600 font-bold' : 'text-gray-600'
                          }`}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Notes / Description */}
              <View className="mb-6">
                <Text className="text-gray-700 font-semibold text-sm mb-1.5">
                  Notes (Optional)
                </Text>
                <TextInput
                  className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 text-sm text-gray-900 min-h-[70px]"
                  placeholder="Add details, goals, or reminders..."
                  placeholderTextColor="#9CA3AF"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              {/* Create Button */}
              <TouchableOpacity
                className={`bg-indigo-600 rounded-xl py-3.5 items-center ${
                  isLoading || !title.trim() ? 'opacity-60' : ''
                }`}
                onPress={handleCreate}
                disabled={isLoading || !title.trim()}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Save Event & Set Reminder
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
};