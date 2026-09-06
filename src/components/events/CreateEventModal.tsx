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

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string, date: string, time: string) => Promise<void>;
  isLoading: boolean;
}

const QUICK_TIMES = [
  { label: '09:00 AM', value: '09:00' },
  { label: '11:00 AM', value: '11:00' },
  { label: '01:00 PM', value: '13:00' },
  { label: '03:00 PM', value: '15:00' },
  { label: '06:00 PM', value: '18:00' },
  { label: '08:00 PM', value: '20:00' },
];

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  visible,
  onClose,
  onCreate,
  isLoading,
}) => {
  const getTodayString = () => new Date().toISOString().split('T')[0];
  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [time, setTime] = useState('13:00'); // Default to 1:00 PM

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate(getTodayString());
    setTime('13:00');
  };

  const handleClose = () => {
    resetForm();
    onClose();
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

    await onCreate(title.trim(), description.trim(), date, time.trim());
    resetForm();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10 max-h-[85%]">
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
              {/* Title */}
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

              {/* Quick Time Selector */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold text-sm mb-1.5">
                  Select Time *
                </Text>
                <View className="flex-row flex-wrap gap-2 mb-2">
                  {QUICK_TIMES.map((item) => (
                    <TouchableOpacity
                      key={item.value}
                      className={`px-3 py-2 rounded-lg border ${
                        time === item.value
                          ? 'bg-indigo-600 border-indigo-600'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                      onPress={() => setTime(item.value)}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          time === item.value ? 'text-white' : 'text-gray-700'
                        }`}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Custom Time Input */}
                <View className="flex-row items-center bg-gray-50 rounded-xl px-3.5 py-2.5 border border-gray-200">
                  <Ionicons name="time-outline" size={18} color="#6B7280" style={{ marginRight: 8 }} />
                  <TextInput
                    className="flex-1 text-sm text-gray-900"
                    placeholder="Or type time (e.g., 13:00 or 1:00 PM)"
                    placeholderTextColor="#9CA3AF"
                    value={time}
                    onChangeText={setTime}
                  />
                </View>
              </View>

              {/* Date Selector */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold text-sm mb-1.5">
                  Date
                </Text>
                <View className="flex-row gap-2 mb-2">
                  <TouchableOpacity
                    className={`flex-1 py-2 rounded-lg border items-center ${
                      date === getTodayString()
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                    onPress={() => setDate(getTodayString())}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        date === getTodayString() ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      Today
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`flex-1 py-2 rounded-lg border items-center ${
                      date === getTomorrowString()
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                    onPress={() => setDate(getTomorrowString())}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        date === getTomorrowString() ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      Tomorrow
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-row items-center bg-gray-50 rounded-xl px-3.5 py-2.5 border border-gray-200">
                  <Ionicons name="calendar-outline" size={18} color="#6B7280" style={{ marginRight: 8 }} />
                  <TextInput
                    className="flex-1 text-sm text-gray-900"
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                    value={date}
                    onChangeText={setDate}
                  />
                </View>
              </View>

              {/* Description */}
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
                    Save Event
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